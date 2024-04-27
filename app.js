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

function initComponents() {
    // 设置上传按钮
    const fileInput = document.getElementById('file-input');
    fileInput.onchange = function () {
        pythonWorker.postMessage({ f: 'processFile', args: fileInput.files[0] });
    }
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
window.onload = function () {
    initComponents();
}