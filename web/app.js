const DEFAULT_RGB_DIFF = 30;
const VISIBLE_PAGE_COUNT = 2;
const OUTPUT_CARDS = {
    gray: {
        cardId: 'gray-card',
        countId: 'gray-page-count',
        label: '黑白页面',
        linkId: 'gray-download-title',
        stackId: 'gray-pages'
    },
    color: {
        cardId: 'color-card',
        countId: 'color-page-count',
        label: '彩色页面',
        linkId: 'color-download-title',
        stackId: 'color-pages'
    }
};

const fileState = {
    color: 0,
    gray: 0,
    lastProgress: 0,
    runId: 0,
    sourceTotal: 0,
    usingPlaceholderPages: false
};
const activePageAnimations = new Set();
let pageAnimationFrame = 0;

function getElement(id) {
    return document.getElementById(id);
}

function println(message) {
    const consoleElement = getElement('console');
    consoleElement.append(document.createElement('br'), document.createTextNode(message));
    scrollToBottom(consoleElement);
}

function printError(errorMessage) {
    const consoleElement = getElement('console');
    const label = document.createElement('span');
    const detail = document.createElement('span');

    label.textContent = '发生错误';
    detail.style.color = 'grey';
    detail.textContent = errorMessage;

    consoleElement.append(
        document.createElement('br'),
        label,
        document.createElement('br'),
        detail
    );
    scrollToBottom(consoleElement);
}

function setProgress(current, total, pageType) {
    getElement('progress-bar').value = current;
    getElement('progress-bar').max = total;
    getElement('progress-text').textContent = `${current}/${total}`;

    const handledPages = Math.max(0, current - fileState.lastProgress);
    fileState.lastProgress = Math.max(fileState.lastProgress, current);

    if (handledPages > 0) {
        ensureSourcePages(total);
        sortPages(getOutputKind(pageType), handledPages);
        getElement('source-file-status').textContent = `分类中 ${current}/${total}`;
    }
}

function scrollToBottom(element, smooth = true) {
    const options = { top: element.scrollHeight };

    if (smooth) {
        options.behavior = 'smooth';
    }

    element.scroll(options);
}

function getOutputKind(value) {
    const text = String(value ?? '').toLowerCase();

    if (text.includes('彩色') || text.includes('color')) {
        return 'color';
    }

    if (text.includes('黑白') || text.includes('灰色') || text.includes('gray')) {
        return 'gray';
    }

    return fileState.gray <= fileState.color ? 'gray' : 'color';
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) {
        return '';
    }

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function resetOutputCard(kind) {
    const output = OUTPUT_CARDS[kind];
    const card = getElement(output.cardId);
    const title = getElement(output.linkId);

    card.classList.remove('is-ready', 'is-empty', 'is-sorting');
    card.classList.add('is-waiting');
    title.removeAttribute('href');
    title.removeAttribute('download');
    title.removeAttribute('target');
    title.setAttribute('aria-disabled', 'true');
    title.classList.remove('is-ready');
    title.textContent = output.label;
    getElement(output.countId).textContent = '0';
}

function createStackPage(kind = '') {
    const page = document.createElement('span');

    page.className = 'stack-page';

    if (kind) {
        page.classList.add(`page-${kind}`);
    }

    for (let index = 0; index < 4; index += 1) {
        page.append(document.createElement('span'));
    }

    return page;
}

function layoutPageStack(stack) {
    const pages = Array.from(stack.children);
    const total = pages.length;

    pages.forEach((page, index) => {
        page.style.setProperty('--stack-layer', Math.min(total - index - 1, 10));
        page.style.zIndex = String(index + 1);
    });
}

function renderSourcePages(total, isPlaceholder = false) {
    const sourceStack = getElement('source-pages');
    const fragment = document.createDocumentFragment();

    sourceStack.textContent = '';

    for (let index = 0; index < VISIBLE_PAGE_COUNT; index += 1) {
        fragment.append(createStackPage());
    }

    sourceStack.append(fragment);
    layoutPageStack(sourceStack);
    fileState.sourceTotal = total;
    fileState.usingPlaceholderPages = isPlaceholder;
}

function ensureSourcePages(total) {
    const sourceStack = getElement('source-pages');

    if (sourceStack.children.length > 0 && fileState.sourceTotal === total && !fileState.usingPlaceholderPages) {
        return;
    }

    renderSourcePages(total, false);
}

function resetFileStage(file) {
    fileState.color = 0;
    fileState.gray = 0;
    fileState.lastProgress = 0;
    fileState.runId += 1;
    fileState.sourceTotal = 0;
    fileState.usingPlaceholderPages = false;

    getElement('file-stage').classList.remove('hidden', 'is-empty');
    getElement('source-file-name').textContent = file.name;
    getElement('source-file-size').textContent = formatBytes(file.size);
    getElement('source-file-status').textContent = '等待处理';
    getElement('progress-bar').value = 0;
    getElement('progress-text').textContent = '';
    getElement('gray-pages').textContent = '';
    getElement('color-pages').textContent = '';
    renderSourcePages(VISIBLE_PAGE_COUNT, true);

    resetOutputCard('gray');
    resetOutputCard('color');
}

function sortPages(kind, count) {
    const output = OUTPUT_CARDS[kind];
    const card = getElement(output.cardId);
    const sourceStack = getElement('source-pages');
    const targetStack = getElement(output.stackId);

    card.classList.add('is-sorting');
    window.setTimeout(() => card.classList.remove('is-sorting'), 360);

    const page = sourceStack.lastElementChild ?? createStackPage();

    animatePageToStack(page.cloneNode(true), targetStack, kind, count, fileState.runId);
}

function updateAnimationTarget(animation) {
    const to = animation.targetStack.getBoundingClientRect();

    animation.page.style.transform = `translate(${to.left - animation.from.left}px, ${to.top - animation.from.top}px)`;
}

function trackPageAnimations() {
    pageAnimationFrame = 0;

    for (const animation of activePageAnimations) {
        if (animation.runId !== fileState.runId || !animation.page.isConnected) {
            activePageAnimations.delete(animation);
            continue;
        }

        updateAnimationTarget(animation);
    }

    if (activePageAnimations.size > 0) {
        pageAnimationFrame = window.requestAnimationFrame(trackPageAnimations);
    }
}

function startPageAnimationTracking() {
    if (!pageAnimationFrame) {
        pageAnimationFrame = window.requestAnimationFrame(trackPageAnimations);
    }
}

function animatePageToStack(page, targetStack, kind, pageCount, runId) {
    const sourceStack = getElement('source-pages');
    const sourcePage = sourceStack.lastElementChild;
    const from = (sourcePage ?? sourceStack).getBoundingClientRect();

    page.classList.add(`page-${kind}`);
    document.body.append(page);
    const animation = { from, page, runId, targetStack };

    Object.assign(page.style, {
        height: `${from.height}px`,
        left: `${from.left}px`,
        position: 'fixed',
        top: `${from.top}px`,
        transform: 'none',
        transition: 'none',
        width: `${from.width}px`,
        zIndex: '40'
    });

    window.setTimeout(() => {
        if (runId !== fileState.runId) {
            page.remove();
            return;
        }

        activePageAnimations.add(animation);
        page.style.transition = 'transform 620ms cubic-bezier(0.2, 0.72, 0.24, 1)';
        updateAnimationTarget(animation);
        startPageAnimationTracking();
    }, 0);

    window.setTimeout(() => {
        activePageAnimations.delete(animation);

        if (runId !== fileState.runId) {
            page.remove();
            return;
        }

        for (const key of ['height', 'left', 'position', 'top', 'transition', 'width', 'zIndex']) {
            page.style[key] = '';
        }

        page.style.transform = '';
        targetStack.append(page);
        while (targetStack.children.length > VISIBLE_PAGE_COUNT) {
            targetStack.firstElementChild.remove();
        }

        fileState[kind] += pageCount;
        getElement(OUTPUT_CARDS[kind].countId).textContent = fileState[kind];
        layoutPageStack(targetStack);
    }, 680);
}

function markFileMissing(filename) {
    const kind = getOutputKind(filename);
    const output = OUTPUT_CARDS[kind];
    const card = getElement(output.cardId);
    const title = getElement(output.linkId);

    title.textContent = `${output.label}（无页面）`;
    title.setAttribute('aria-disabled', 'true');
    card.classList.remove('is-waiting', 'is-ready');
    card.classList.add('is-empty');
}

function appendHistoryLink(filename, url, kind) {
    const historyContainer = getElement('container-download');
    const linkElement = document.createElement('a');
    const nameElement = document.createElement('strong');
    const metaElement = document.createElement('span');

    linkElement.className = 'history-card';
    linkElement.target = '_blank';
    linkElement.href = url;
    linkElement.download = filename;

    nameElement.textContent = filename;
    metaElement.textContent = OUTPUT_CARDS[kind]?.label ?? '已分类文件';
    linkElement.append(nameElement, metaElement);

    const historyList = getElement('download');

    historyList.prepend(linkElement);
    historyList.scrollTo({ top: 0 });
    historyContainer.classList.remove('hidden');
}

function processPdfFile(file, rgbDiffInput, duplexCheckbox) {
    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('请选择 PDF 文件');
        return;
    }

    const rgbDiff = parseRgbDiff(rgbDiffInput);

    resetFileStage(file);
    pythonWorker.postMessage({ f: 'setValue', args: ['RGBDiff', rgbDiff] });
    println(`☑RGBDiff 参数设置为 ${rgbDiff}`);

    pythonWorker.postMessage({ f: 'setValue', args: ['if_duplex', duplexCheckbox.checked] });
    println(`☑双面打印设置为 ${duplexCheckbox.checked}`);

    pythonWorker.postMessage({ f: 'processFile', args: file });
}

function generateFileLink(filename, blob) {
    const kind = getOutputKind(filename);
    // ponytail: session-only history; use IndexedDB if results must survive reloads.
    const url = window.URL.createObjectURL(blob);

    if (kind && OUTPUT_CARDS[kind]) {
        const output = OUTPUT_CARDS[kind];
        const card = getElement(output.cardId);
        const title = getElement(output.linkId);

        title.href = url;
        title.target = '_blank';
        title.download = filename;
        title.textContent = filename;
        title.removeAttribute('aria-disabled');
        title.classList.add('is-ready');
        card.classList.remove('is-waiting', 'is-empty');
        card.classList.add('is-ready');
        getElement('source-file-status').textContent = '处理完成';
        appendHistoryLink(filename, url, kind);
        scrollToBottom(getElement('console'), false);
        return;
    }

    appendHistoryLink(filename, url);
    scrollToBottom(getElement('console'), false);
}

function enableComponents() {
    getElement('file-input').disabled = false;
    getElement('drop-zone').classList.remove('is-disabled');
    getElement('upload-hint').textContent = '支持拖拽或点击选择 .pdf';
}

function switchConsole(isOpen) {
    if (typeof window.switchOutput === 'function') {
        window.switchOutput(isOpen);
    }
}

function parseRgbDiff(inputElement) {
    const rgbDiff = Number.parseInt(inputElement.value, 10);

    if (Number.isNaN(rgbDiff) || rgbDiff < 0 || rgbDiff > 255) {
        alert('Variance value should be in range [0, 255]');
        inputElement.value = DEFAULT_RGB_DIFF;
        return DEFAULT_RGB_DIFF;
    }

    return rgbDiff;
}

function initComponents() {
    const fileInput = getElement('file-input');
    const dropZone = getElement('drop-zone');
    const settingsToggle = getElement('settingsToggle');
    const settingsPanel = getElement('settings-panel');
    const settingsState = getElement('settingsState');
    const rgbDiffInput = getElement('rgb-diff');
    const duplexCheckbox = getElement('duplex-checkbox');

    rgbDiffInput.value = DEFAULT_RGB_DIFF;

    settingsToggle.addEventListener('click', () => {
        const isOpen = settingsPanel.classList.toggle('is-closed') === false;
        settingsToggle.setAttribute('aria-expanded', String(isOpen));
        settingsState.textContent = isOpen ? '🔽 收起' : '🔼 展开';
    });

    rgbDiffInput.addEventListener('change', () => {
        parseRgbDiff(rgbDiffInput);
    });

    for (const eventName of ['dragenter', 'dragover']) {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();

            if (!fileInput.disabled) {
                dropZone.classList.add('is-dragover');
            }
        });
    }

    for (const eventName of ['dragleave', 'drop']) {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('is-dragover');
        });
    }

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();

        if (fileInput.disabled) {
            return;
        }

        processPdfFile(event.dataTransfer.files[0], rgbDiffInput, duplexCheckbox);
    });

    fileInput.addEventListener('change', () => {
        processPdfFile(fileInput.files[0], rgbDiffInput, duplexCheckbox);
        fileInput.value = '';
    });
}

const pythonWorker = new Worker('worker.js');

pythonWorker.addEventListener('message', (event) => {
    const { f: functionName, args } = event.data ?? {};
    const handler = functionName ? window[functionName] : undefined;

    if (typeof handler !== 'function') {
        console.warn(`Unknown worker callback: ${functionName}`);
        return;
    }

    if (Array.isArray(args)) {
        handler(...args);
        return;
    }

    if (args === undefined) {
        handler();
        return;
    }

    handler(args);
});

document.addEventListener('DOMContentLoaded', initComponents);
