const DEFAULT_RGB_DIFF = 30;

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

function setProgress(current, total) {
    getElement('progress-bar').value = current;
    getElement('progress-bar').max = total;
    getElement('progress-text').textContent = `${current}/${total}`;
}

function scrollToBottom(element, smooth = true) {
    const options = { top: element.scrollHeight };

    if (smooth) {
        options.behavior = 'smooth';
    }

    element.scroll(options);
}

function generateFileLink(filename, blob) {
    const linkElement = document.createElement('a');
    const downloadContainer = getElement('download');

    linkElement.target = '_blank';
    linkElement.href = window.URL.createObjectURL(blob);
    linkElement.download = filename;
    linkElement.textContent = filename;

    getElement('container-download').classList.remove('hidden');
    downloadContainer.append(linkElement, document.createElement('br'));

    scrollToBottom(downloadContainer);
    scrollToBottom(getElement('console'), false);
}

function enableComponents() {
    getElement('file-input').disabled = false;
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
    const dialog = getElement('dialog');
    const openDialogButton = getElement('openDialogBtn');
    const closeDialogButton = getElement('closeDialogBtn');
    const rgbDiffInput = getElement('rgb-diff');
    const duplexCheckbox = getElement('duplex-checkbox');

    const closeDialog = () => {
        dialog.classList.add('hidden');
    };

    rgbDiffInput.value = DEFAULT_RGB_DIFF;

    openDialogButton.addEventListener('click', () => {
        dialog.classList.remove('hidden');
    });
    closeDialogButton.addEventListener('click', closeDialog);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDialog();
        }
    });

    rgbDiffInput.addEventListener('change', () => {
        parseRgbDiff(rgbDiffInput);
    });

    fileInput.addEventListener('change', () => {
        const [file] = fileInput.files;
        if (!file) {
            return;
        }

        const rgbDiff = parseRgbDiff(rgbDiffInput);

        pythonWorker.postMessage({ f: 'setValue', args: ['RGBDiff', rgbDiff] });
        println(`☑RGBDiff 参数设置为 ${rgbDiff}`);

        pythonWorker.postMessage({ f: 'setValue', args: ['if_duplex', duplexCheckbox.checked] });
        println(`☑双面打印设置为 ${duplexCheckbox.checked}`);

        pythonWorker.postMessage({ f: 'processFile', args: file });
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
