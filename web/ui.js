const MD_BREAKPOINT = 768;

document.addEventListener('DOMContentLoaded', initOutputSwitch);

function isMdViewport() {
    return window.innerWidth >= MD_BREAKPOINT;
}

function initOutputSwitch() {
    const switcher = document.getElementById('switchOutputBtn');
    const outputElement = document.getElementById('output');
    const consoleElement = document.getElementById('console');
    const homeElement = document.getElementById('home');
    let isOutputOpen = false;

    const updateOutputPosition = () => {
        outputElement.style.bottom = isOutputOpen ? '0' : `-${consoleElement.clientHeight}px`;
    };

    const switchOutput = (nextState) => {
        isOutputOpen = isMdViewport() ? true : nextState;

        if (isMdViewport()) {
            homeElement.classList.remove('dim');
        } else {
            homeElement.classList.toggle('dim', isOutputOpen);
        }

        updateOutputPosition();
        switcher.textContent = isOutputOpen ? '🔼 收起' : '🔽 展开';
    };

    window.switchOutput = switchOutput;

    switcher.addEventListener('click', () => {
        switchOutput(!isOutputOpen);
    });

    switchOutput(true);

    window.addEventListener('resize', () => {
        switchOutput(isOutputOpen);
    });
}
