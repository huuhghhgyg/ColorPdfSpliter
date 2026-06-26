const MD_BREAKPOINT = 768;

document.addEventListener('DOMContentLoaded', initOutputSwitch);

function isMdViewport() {
    return window.innerWidth >= MD_BREAKPOINT;
}

function initOutputSwitch() {
    const switcher = document.getElementById('switchOutputBtn');
    const outputElement = document.getElementById('output');
    const outputTitleElement = document.getElementById('output-title');
    const homeElement = document.getElementById('home');
    let isOutputOpen = false;
    let resizeFrame = 0;

    const updateOutputPosition = () => {
        const titleHeight = Math.max(outputTitleElement.clientHeight, 36);
        const outputHeight = Math.max(outputElement.clientHeight, titleHeight);
        const hiddenHeight = Math.max(outputHeight - titleHeight, 0);

        outputElement.style.bottom = isOutputOpen ? '0' : `-${hiddenHeight}px`;
        document.documentElement.style.setProperty('--output-height', `${outputHeight}px`);
        document.documentElement.style.setProperty(
            '--output-space',
            `${isOutputOpen ? outputHeight : titleHeight}px`
        );
    };

    const switchOutput = (nextState) => {
        isOutputOpen = nextState;

        if (isMdViewport()) {
            homeElement.classList.remove('dim');
        } else {
            homeElement.classList.toggle('dim', isOutputOpen);
        }

        updateOutputPosition();
        switcher.textContent = isOutputOpen ? '🔽 收起' : '🔼 展开';
    };

    window.switchOutput = switchOutput;

    switcher.onclick = () => {
        switchOutput(!isOutputOpen);
    };

    switchOutput(isMdViewport());

    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => switchOutput(isOutputOpen));
    });
}
