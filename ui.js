document.addEventListener('DOMContentLoaded', function() {
    setOutputSwitch();
});

function ge_md() {
    // 大于尺寸md
    return window.innerWidth >= 768;
}

function setOutputSwitch() {
    // 初始化组件变量
    var isOutputOpen = false;
    const switcher = document.getElementById('switchOutputBtn');
    const outputDiv = document.getElementById('output');
    const consoleDiv = document.getElementById('console');
    const homeDiv = document.getElementById('home');

    switcher.onclick = function () {
        switchOutput(!isOutputOpen);
    }

    window.switchOutput = function (state) {
        // 如果大于尺寸md，只能展开
        if (ge_md()) {
            state = true;
        } else {
            homeDiv.classList.toggle('dim', state);
        }

        if (state) {
            // 设置outputDiv为隐藏
            outputDiv.style.bottom = '0';
            switcher.innerText = '🔽收起';
        } else {
            // 设置outputDiv为显示
            outputDiv.style.bottom = '-' + consoleDiv.clientHeight + 'px';
            switcher.innerText = '🔼展开';
        }
        isOutputOpen = state;
    }

    // 默认开启
    switchOutput(true);

    // 屏幕大小变化时，重新设置outputDiv的位置
    window.onresize = function () {
        if (ge_md()) {
            switchOutput(true);
            homeDiv.classList.remove('dim');
            return;
        }

        if (isOutputOpen) {
            outputDiv.style.bottom = '0';
        } else {
            outputDiv.style.bottom = '-' + consoleDiv.clientHeight + 'px';
        }
    }
}