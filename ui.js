window.onload = function () {
    setOutputSwitch();
    // 模拟点击switchOutputBtn
}


function setOutputSwitch() {
    // 初始化组件变量
    var isOutputOpen = false;
    const switcher = document.getElementById('switchOutputBtn');
    const outputDiv = document.getElementById('output');
    const consoleDiv = document.getElementById('console');

    switcher.onclick = function () {
        switchOutput(!isOutputOpen);
    }

    function switchOutput(state) {
        if (state) {
            // 设置outputDiv为隐藏（transform: translateY(100%)）
            // outputDiv.style.transform = 'translateY(' + outputDiv.clientHeight * -1 + 'px)';
            outputDiv.style.bottom = '0';
            switcher.innerText = '🔽收起';
        } else {
            // 设置outputDiv为显示（transform: translateY(0)）
            // outputDiv.style.transform = 'translateY(' + (consoleDiv.clientHeight - outputDiv.clientHeight) + 'px)';
            outputDiv.style.bottom = '-' + consoleDiv.clientHeight + 'px';
            switcher.innerText = '🔼展开';
        }
        isOutputOpen = state;
    }

    // 默认开启
    switchOutput(true);
}