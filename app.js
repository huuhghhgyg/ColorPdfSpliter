// 输出信息
function println(message) {
    print('<br>' + message)
}

function print(message) {
    document.getElementById('output').innerHTML += message;
}

// 输出错误，后期可改造处理
function printError(err_message) {
    document.getElementById('output').innerHTML += '<br>发生错误:<br><span style="color: grey;">' + err_message + '</span>';
}

// 设置下载链接
function generateFileLink(filename, blob) {
    var element = window.document.createElement('a');
    element.target = '_blank';
    element.href = window.URL.createObjectURL(blob);
    element.download = filename;
    element.innerText = filename;

    // 输出
    document.getElementById('download').innerHTML += '<br><span>下载</span>';
    document.getElementById('download').appendChild(element);
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

function setProgress(current, total){
    document.getElementById('progress-bar').value = current;
    document.getElementById('progress-bar').max = total;
    document.getElementById('progress-text').innerText = '：'+current + '/' + total;
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