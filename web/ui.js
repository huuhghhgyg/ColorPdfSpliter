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
    const state = window.outputConsoleState ?? { isOpen: true };
    let resizeFrame = 0;

    window.outputConsoleState = state;

    const renderOutput = () => {
        const titleHeight = Math.max(outputTitleElement.clientHeight, 36);

        outputElement.style.transform = state.isOpen ? 'translateY(0)' : `translateY(calc(100% - ${titleHeight}px))`;

        homeElement.classList.toggle('dim', state.isOpen && !isMdViewport());
        switcher.textContent = state.isOpen ? '🔽 收起' : '🔼 展开';
    };

    const switchOutput = (nextState) => {
        state.isOpen = nextState;
        renderOutput();
    };

    window.switchOutput = switchOutput;

    switcher.onclick = () => {
        switchOutput(!state.isOpen);
    };

    renderOutput();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(renderOutput);
    });
}
