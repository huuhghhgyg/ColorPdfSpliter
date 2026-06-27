const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
const PYODIDE_MIRROR_URL = 'https://proxy.zhhuu.top/cdn/pyodide/v0.25.1/full/pyodide.js';
const PYMUPDF_WHEEL = 'PyMuPDF-1.24.8-cp311-none-emscripten_3_1_32_wasm32.whl';

const println = (text) => postMessage({ f: 'println', args: text });
const printError = (text) => postMessage({ f: 'printError', args: text });
const setLoadingError = (text) => postMessage({ f: 'setLoadingError', args: text });
const setLoadingMessage = (text) => postMessage({ f: 'setLoadingMessage', args: text });
const setLoadingStep = (step) => postMessage({ f: 'setLoadingStep', args: step });

let pyodideInstance;
const pyodideReady = initPyodide().catch((error) => {
    const message = getErrorMessage(error);

    setLoadingError(`请检查网络后刷新页面重试：${message}`);
    printError(message);
    throw error;
});

self.addEventListener('message', (event) => {
    const { f: action, args } = event.data ?? {};
    const handler = messageHandlers[action];

    if (typeof handler !== 'function') {
        printError(`未知操作: ${action}`);
        return;
    }

    Promise.resolve(handler(args)).catch((error) => {
        printError(getErrorMessage(error));
    });
});

async function checkJsdelivrConnectivity() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
        const response = await fetch(PYODIDE_CDN_URL, {
            method: 'HEAD',
            signal: controller.signal
        });
        return response.ok;
    } catch {
        // ponytail: probe failure only selects the mirror, no need to spam the console.
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function importPyodide() {
    const useJsdelivr = await checkJsdelivrConnectivity();
    const scriptUrl = useJsdelivr ? PYODIDE_CDN_URL : PYODIDE_MIRROR_URL;

    println(useJsdelivr ? '🔗正在通过 jsDelivr 获取 pyodide...' : '🔗正在通过镜像获取 pyodide...');
    importScripts(scriptUrl);
}

function formatPackageNames(namesText) {
    return namesText
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => {
            if (name === 'pymupdf' || name.startsWith('PyMuPDF-')) {
                return 'PyMuPDF';
            }

            if (name === 'numpy') {
                return 'NumPy';
            }

            return name;
        })
        .join('、');
}

function reportPackageProgress(message) {
    const match = /^(Loading|Loaded)\s+(.+)$/.exec(message);
    if (!match) {
        return;
    }

    const [, status, namesText] = match;
    const packageNames = formatPackageNames(namesText);

    if (status === 'Loading') {
        println(`⏳正在加载依赖：${packageNames}...`);
        return;
    }

    println(`✅依赖加载完成：${packageNames}`);
}

async function initPyodide() {
    setLoadingStep('pyodide');
    setLoadingMessage('正在加载 Pyodide');
    await importPyodide();
    pyodideInstance = await loadPyodide({
        stderr: (text) => {
            printError(text);
        }
    });

    setLoadingStep('packages');
    setLoadingMessage('正在加载 PyMuPDF / NumPy');
    await pyodideInstance.loadPackage([PYMUPDF_WHEEL, 'numpy'], {
        messageCallback: reportPackageProgress,
        errorCallback: printError
    });

    setLoadingStep('script');
    setLoadingMessage('正在加载 PDF 处理逻辑');
    pyodideInstance.runPython(`
        import sys
        print(sys.version)

        import fitz
        print(fitz.version)
    `);

    pyodideInstance.runPython(await (await fetch('./ColorPdfSpliter.py')).text());
    println('✅PDF 处理逻辑加载完成');
    setLoadingStep('done');
    setLoadingMessage('准备完成');

    postMessage({ f: 'enableComponents' });
    println('🆗准备就绪');
    postMessage({ f: 'switchConsole', args: false });
}

async function getPyodide() {
    await pyodideReady;
    return pyodideInstance;
}

function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

async function generateLink(path, filename) {
    const pyodide = await getPyodide();
    const fileExists = pyodide.runPython(`os.path.exists(${JSON.stringify(path)})`);

    if (!fileExists) {
        println(`没有 ${filename}`);
        postMessage({ f: 'markFileMissing', args: filename });
        return;
    }

    try {
        const fileContent = pyodide.FS.readFile(path, { encoding: 'binary' });
        const blob = new Blob([fileContent], { type: 'application/pdf' });

        postMessage({ f: 'generateFileLink', args: [filename, blob] });
    } catch (error) {
        printError(getErrorMessage(error));
    }
}

async function processFile(file) {
    if (!file) {
        return;
    }

    const pyodide = await getPyodide();
    const fileBuffer = new Uint8Array(await file.arrayBuffer());

    println('正在读取文件');
    pyodide.FS.writeFile(file.name, fileBuffer);

    println('正在处理文件,请稍等...');
    pyodide.globals.set('progress_display_web', (current, total, title, pageType) => {
        postMessage({ f: 'setProgress', args: [current, total, pageType ?? title] });
    });

    try {
        await pyodide.runPythonAsync(`
            splitPDF(${JSON.stringify(file.name)}, progress_display_web, duplex=if_duplex)
        `);
    } catch (error) {
        printError(getErrorMessage(error));
        println('❌文件处理失败');
        return;
    }

    println('✅文件处理完成，正在保存');

    const filename = file.name.replace(/\.pdf$/i, '');
    await generateLink(`/home/pyodide/${filename}_黑白.pdf`, `${filename}_黑白.pdf`);
    await generateLink(`/home/pyodide/${filename}_彩色.pdf`, `${filename}_彩色.pdf`);
}

async function setValue(entry) {
    if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error('setValue 参数不正确');
    }

    const pyodide = await getPyodide();
    const [key, value] = entry;

    pyodide.globals.set(key, value);
}

const messageHandlers = {
    processFile,
    setValue
};
