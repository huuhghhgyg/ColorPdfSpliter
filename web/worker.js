// Worker 线程
onmessage = function (e) {
    self[e.data.f](e.data.args);
}

// 检查网络连接并导入Pyodide
async function importPyodide() {
    try {
        await fetch('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js', { method: 'HEAD' });
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");
        println('🔗正在通过 jsDelivr 获取 pyodide...');
    } catch (error) {
        importScripts("https://proxy.zhhuu.top/cdn/pyodide/v0.25.1/full/pyodide.js");
        println('🔗正在通过镜像获取 pyodide...');
    }
}

// Helper functions to post messages back to the main thread
println = (text) => postMessage({ f: 'println', args: text });
print = (text) => postMessage({ f: 'print', args: text });
printError = (text) => postMessage({ f: 'printError',args: text });
setProgress = (current, total) => postMessage({ f: 'setProgress', args: [current, total] });

// --- 主初始化流程 ---
async function main() {
    await importPyodide();
    self.pyodide = await loadPyodide({
        stderr: text => { printError(text); }
    });
    
    println('[1/3] 正在加载 micropip...');
    await pyodide.loadPackage("micropip");
    print('✅');
    
    println('[2/3] 正在加载 PyMuPDF...');
    await pyodide.loadPackage('PyMuPDF-1.24.8-cp311-none-emscripten_3_1_32_wasm32.whl');
    print('✅');

    println('[3/3] 正在加载 numpy...');
    await pyodide.loadPackage('numpy');
    print('✅');
    
    println('库引用完成');

    // 读取我们新的库文件
    const processorCode = await (await fetch("../src/color_pdf_spliter/processor.py")).text();
    pyodide.FS.writeFile("processor.py", processorCode);
    println('核心处理库加载完成');
    
    // 准备就绪
    postMessage({ f: "enableComponents" });
    println('🆗准备就绪');
    postMessage({ f: "switchConsole", args: false });
}

self.pyodideReadyPromise = main();

async function generateLink(filename, contentBytes) {
    try {
        const blob = new Blob([contentBytes], { type: 'application/pdf' });
        postMessage({ f: "generateFileLink", args: [filename, blob] });
    } catch (e) {
        printError(e.message);
    }
}

// --- 文件处理函数 ---
async function processFile(file) {
    await pyodideReadyPromise; // 确保pyodide已准备好

    try {
        println('正在读取文件...');
        const fileBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(fileBuffer);
        
        // 将JS回调函数注册到Python全局空间
        pyodide.globals.set('js_progress_callback', setProgress);

        // 将文件数据和参数注册到Python全局空间
        pyodide.globals.set('pdf_bytes_from_js', fileData);
        
        println('正在处理文件，请稍等...');
        
        // 异步执行Python代码
        await pyodide.runPythonAsync(`
            from processor import split_pdf_by_color
            from js import pdf_bytes_from_js, js_progress_callback, RGBDiff, duplex

            # 调用核心库函数
            results = split_pdf_by_color(
                pdf_bytes=pdf_bytes_from_js.to_py(),
                rgb_diff=RGBDiff,
                is_duplex=duplex,
                progress_callback=js_progress_callback
            )

            # 将结果存入全局，方便JS读取
            global results_from_py
            results_from_py = results
        `);

        println('✅文件处理完成，正在生成下载链接...');
        const results = pyodide.globals.get('results_from_py').toJs({dict_converter : Object.fromEntries});
        const baseName = file.name.slice(0, -4);
        
        if (results.has('bw')) {
            await generateLink(`${baseName}_黑白.pdf`, results.get('bw').get('bytes'));
        }
        if (results.has('color')) {
            await generateLink(`${baseName}_彩色.pdf`, results.get('color').get('bytes'));
        }

    } catch (e) {
        printError(e.message);
        println('❌文件处理失败');
    }
}

// --- 从主线程接收设置 ---
async function setValue(key_value) {
    await pyodideReadyPromise;
    pyodide.globals.set(key_value[0], key_value[1]);
}