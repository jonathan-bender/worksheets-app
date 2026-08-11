let canvasElement,
    gcGame;

Init();

function Init() {
    canvasElement = document.getElementById("main-canvas");
    gcGame = new GeometricConstructionsGame(canvasElement);

    gcGame.start();

    // event listeners
    canvasElement.addEventListener('click', (event) => {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        gcGame.click(x, y);
    });
    canvasElement.addEventListener('mousemove', (event) => {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const dx = x - canvasElement.lastX;
        const dy = y - canvasElement.lastY;
        gcGame.mouseMove(x, y, dx, dy);
        canvasElement.lastX = x;
        canvasElement.lastY = y;
    });
    canvasElement.addEventListener('mousedown', (event) => {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        gcGame.mouseDown(x, y);
        canvasElement.lastX = x;
        canvasElement.lastY = y;

    });
    canvasElement.addEventListener('mouseup', (event) => { gcGame.mouseUp() });
    canvasElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rect = canvasElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        gcGame.zoom(mouseX, mouseY, event.deltaY);
    });
}

function switchMode(mode) {
    gcGame.switchMode(mode);
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