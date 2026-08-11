let canvasElement,
    gcGame;

Init();

function Init() {
    canvasElement = document.getElementById("main-canvas");
    gcGame = new GeometricConstructionsGame(canvasElement);

    gcGame.start();

    // mouse event listeners
    canvasElement.addEventListener('click', (event) => {
        const pos = clientToCanvas(event.clientX, event.clientY);
        gcGame.click(pos.x, pos.y);
    });
    canvasElement.addEventListener('mousemove', (event) => {
        const pos = clientToCanvas(event.clientX, event.clientY);
        const dx = pos.x - (canvasElement.lastX || pos.x);
        const dy = pos.y - (canvasElement.lastY || pos.y);
        gcGame.mouseMove(pos.x, pos.y, dx, dy);
        canvasElement.lastX = pos.x;
        canvasElement.lastY = pos.y;
    });
    canvasElement.addEventListener('mousedown', (event) => {
        const pos = clientToCanvas(event.clientX, event.clientY);
        gcGame.mouseDown(pos.x, pos.y);
        canvasElement.lastX = pos.x;
        canvasElement.lastY = pos.y;
    });
    canvasElement.addEventListener('mouseup', () => { gcGame.mouseUp(); });
    canvasElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        const pos = clientToCanvas(event.clientX, event.clientY);
        gcGame.zoom(pos.x, pos.y, event.deltaY);
    }, { passive: false });

    // touch event listeners (mobile support)
    canvasElement.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const pos = clientToCanvas(touch.clientX, touch.clientY);
        gcGame.mouseDown(pos.x, pos.y);
        canvasElement.lastX = pos.x;
        canvasElement.lastY = pos.y;
        canvasElement.touchMoved = false;
    }, { passive: false });
    canvasElement.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        const pos = clientToCanvas(touch.clientX, touch.clientY);
        const dx = pos.x - (canvasElement.lastX || pos.x);
        const dy = pos.y - (canvasElement.lastY || pos.y);
        gcGame.mouseMove(pos.x, pos.y, dx, dy);
        canvasElement.lastX = pos.x;
        canvasElement.lastY = pos.y;
        canvasElement.touchMoved = true;
    }, { passive: false });
    canvasElement.addEventListener('touchend', (event) => {
        event.preventDefault();
        gcGame.mouseUp();
        if (!canvasElement.touchMoved) {
            const touch = event.changedTouches[0];
            const pos = clientToCanvas(touch.clientX, touch.clientY);
            gcGame.click(pos.x, pos.y);
        }
    }, { passive: false });
}

// Convert client coordinates to canvas internal coordinates (accounts for CSS scaling)
function clientToCanvas(clientX, clientY) {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function switchMode(mode) {
    gcGame.switchMode(mode);
    // update active button highlight
    document.querySelectorAll('#line, #circle, #move').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(mode);
    if (activeBtn) activeBtn.classList.add('active');
}

function undo() {
    gcGame.undo();
}

function redo() {
    gcGame.redo();
}

function isSolved(){
    if (gcGame.isSolved()) console.log("solved");
    else console.log("not solved");
}