// 输出信息
function println(message) {
    print('<br>' + message)
    scrollToBottom(document.getElementById('console'));
}

function print(message) {
    document.getElementById('console').innerHTML += message;
}

// 输出错误，后期可改造处理
function printError(err_message) {
    document.getElementById('console').innerHTML += '<br>⛔发生错误:<br><span style="color: grey;">' + err_message + '</span>';
}

// 显示进度
function setProgress(current, total) {
    document.getElementById('progress-bar').value = current;
    document.getElementById('progress-bar').max = total;
    document.getElementById('progress-text').innerText = current + '/' + total;
}

//滚动到底部
function scrollToBottom(element, smooth = true) {
    if (!smooth) {
        element.scroll({ top: element.scrollHeight })
        return
    }

    element.scroll({ top: element.scrollHeight, behavior: "smooth" })
}

// 设置下载链接
function generateFileLink(filename, blob) {
    var element = window.document.createElement('a');
    element.target = '_blank';
    element.href = window.URL.createObjectURL(blob);
    element.download = filename;
    element.innerText = filename;

    // 输出
    document.getElementById('container-download').classList.remove('hidden');
    // document.getElementById('download').innerHTML += '下载：';
    document.getElementById('download').appendChild(element);
    document.getElementById('download').innerHTML += '<br>';

    scrollToBottom(document.getElementById('download'));
    scrollToBottom(document.getElementById('console', false)); // 可能会缩小console的大小，所以也需要滚动到底部
}


function enableComponents() {
    document.getElementById('file-input').disabled = false;
}

function switchConsole(isOpen) {
    window.switchOutput(isOpen);
}

function initComponents() {
    // 设置上传按钮
    const fileInput = document.getElementById('file-input');
    fileInput.onchange = function () {
        pythonWorker.postMessage({ f: 'setValue', args: ['RGBDiff', parseInt(rgbDiffText.value)] }); // 设置RGBDiff
        println(`☑RGBDiff参数设置为 ${rgbDiffText.value}`)

        pythonWorker.postMessage({ f: 'processFile', args: fileInput.files[0] });
    }

    // 设置对话框
    const openDialogButton = document.getElementById('openDialogBtn');
    const dialog = document.getElementById('dialog');
    const closeDialogButton = document.getElementById('closeDialogBtn');

    openDialogButton.addEventListener('click', () => {
        dialog.classList.remove('hidden');
    });

    closeDialogButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dialog.classList.add('hidden');
        }
    }); // 按下ESC关闭对话框

    // 设置默认参数值
    const rgbDiffDefault = 30; //默认值
    const rgbDiffText = document.getElementById('rgb-diff');
    rgbDiffText.value = rgbDiffDefault;

    // 初始化参数设置文本框
    rgbDiffText.addEventListener('change', () => {
        const rgbDiff = parseInt(rgbDiffText.value);
        if (rgbDiff < 0 || rgbDiff > 255 || isNaN(rgbDiff)) {
            alert('Variance value should be in range [0, 255]');
            rgbDiffText.value = rgbDiffDefault;
        }
    });
}

// 定义worker
const pythonWorker = new Worker('worker.js')
pythonWorker.onmessage = function (e) {
    const functionName = e.data.f;
    const args = e.data.args;

    // 如果是array，则展开
    if (!Array.isArray(args)) {
        window[functionName](e.data.args);
        return;
    }
    window[functionName](...e.data.args);
};

// 页面加载完成
// 多个js文件都是用window.onload会覆盖，所以这里使用DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    initComponents();
});
