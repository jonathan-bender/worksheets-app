const canvasElement = document.getElementById("main-canvas"),
    gcApp = new GeometricConstructionsCanvasApp(canvasElement),
    gcGame = new GeometricConstructionsGame(gcApp);

let isSolved = false;

gcGame.levels[0].InitLevel();

function switchMode(mode) {
    gcApp.switchMode(mode);
}

function undo() {
    gcApp.undo();
}

function redo() {
    gcApp.redo();
}