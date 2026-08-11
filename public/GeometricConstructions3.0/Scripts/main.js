let canvasElement,
    gcGame;

Init();

function Init() {
    canvasElement = document.getElementById("main-canvas");

    // Match canvas resolution to the actual screen size so the drawing plane
    // fills the screen by extending, not stretching.
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    gcGame = new GeometricConstructionsGame(canvasElement);

    gcGame.start();

    gcGame.setOnSolved((level) => {
        showLevelModal(level.Name, level.Description, level.Image, true);
    });

    // Resize canvas to match window whenever the window is resized, then repaint.
    window.addEventListener('resize', () => {
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        gcGame.repaint();
    });

    // show level info modal on start
    const level = gcGame.getActiveLevel();
    if (level) showLevelModal(level.Name, level.Description, level.Image);

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
    let activeTouches = {};

    canvasElement.addEventListener('touchstart', (event) => {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(t => {
            activeTouches[t.identifier] = clientToCanvas(t.clientX, t.clientY);
        });

        const ids = Object.keys(activeTouches);
        if (ids.length === 1) {
            const pos = activeTouches[ids[0]];
            gcGame.mouseDown(pos.x, pos.y);
            canvasElement.lastX = pos.x;
            canvasElement.lastY = pos.y;
            canvasElement.touchMoved = false;
        }
    }, { passive: false });

    canvasElement.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const prevTouches = Object.assign({}, activeTouches);
        Array.from(event.changedTouches).forEach(t => {
            activeTouches[t.identifier] = clientToCanvas(t.clientX, t.clientY);
        });

        const ids = Object.keys(activeTouches);
        if (ids.length >= 2) {
            // Two-finger: pinch-zoom + pan regardless of active tool
            const [id0, id1] = ids;
            const cur0 = activeTouches[id0], cur1 = activeTouches[id1];
            const prev0 = prevTouches[id0] || cur0, prev1 = prevTouches[id1] || cur1;

            const prevDist = Math.hypot(prev1.x - prev0.x, prev1.y - prev0.y);
            const curDist  = Math.hypot(cur1.x  - cur0.x,  cur1.y  - cur0.y);
            const midX = (cur0.x + cur1.x) / 2;
            const midY = (cur0.y + cur1.y) / 2;
            const prevMidX = (prev0.x + prev1.x) / 2;
            const prevMidY = (prev0.y + prev1.y) / 2;

            // zoom (positive deltaY = zoom out in the board's zoom handler)
            if (prevDist > 0) {
                const deltaY = (prevDist - curDist);
                gcGame.zoom(midX, midY, deltaY);
            }
            // pan
            gcGame.pan(midX - prevMidX, midY - prevMidY);
            canvasElement.touchMoved = true;
        } else if (ids.length === 1) {
            const pos = activeTouches[ids[0]];
            const dx = pos.x - (canvasElement.lastX || pos.x);
            const dy = pos.y - (canvasElement.lastY || pos.y);
            gcGame.mouseMove(pos.x, pos.y, dx, dy);
            canvasElement.lastX = pos.x;
            canvasElement.lastY = pos.y;
            canvasElement.touchMoved = true;
        }
    }, { passive: false });

    canvasElement.addEventListener('touchend', (event) => {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(t => {
            delete activeTouches[t.identifier];
        });
        gcGame.mouseUp();
        const ids = Object.keys(activeTouches);
        if (ids.length === 0 && !canvasElement.touchMoved) {
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

// ── Modal helpers ──

function showLevelModal(name, description, imageSrc, solved) {
    document.getElementById('modal-title').textContent = name || '';
    document.getElementById('modal-desc').textContent = description || '';

    const imgWrap = document.getElementById('modal-img-wrap');
    imgWrap.innerHTML = '';
    if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = name || 'Level image';
        imgWrap.appendChild(img);
    } else {
        imgWrap.textContent = 'Image coming soon';
    }

    const startBtn = document.getElementById('modal-start-btn');
    if (solved) {
        const levels = gcGame ? gcGame.getLevels() : [];
        const idx = gcGame ? gcGame.getActiveLevelIndex() : 0;
        const hasNext = idx < levels.length - 1;
        startBtn.textContent = hasNext ? '🎉 Next Level →' : '🎉 Continue';
        startBtn.onclick = hasNext ? goToNextLevel : closeModal;
        document.getElementById('modal-solved-banner').style.display = 'block';
    } else {
        startBtn.textContent = 'Start';
        startBtn.onclick = closeModal;
        document.getElementById('modal-solved-banner').style.display = 'none';
    }

    // update level counter and nav buttons
    if (gcGame) {
        const levels = gcGame.getLevels();
        const idx = gcGame.getActiveLevelIndex();
        document.getElementById('modal-level-counter').textContent = `Level ${idx + 1} of ${levels.length}`;
        document.getElementById('modal-prev-btn').disabled = idx <= 0;
        document.getElementById('modal-next-btn').disabled = idx >= levels.length - 1;
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}

function openModal() {
    const level = gcGame && gcGame.getActiveLevel();
    if (level) showLevelModal(level.Name, level.Description, level.Image, gcGame.isSolved());
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function handleOverlayClick(event) {
    if (event.target === document.getElementById('modal-overlay')) closeModal();
}

function goToPrevLevel() {
    if (!gcGame) return;
    const idx = gcGame.getActiveLevelIndex();
    if (idx <= 0) return;
    gcGame.loadLevel(idx - 1);
    const level = gcGame.getActiveLevel();
    showLevelModal(level.Name, level.Description, level.Image, false);
}

function goToNextLevel() {
    if (!gcGame) return;
    const levels = gcGame.getLevels();
    const idx = gcGame.getActiveLevelIndex();
    if (idx >= levels.length - 1) return;
    gcGame.loadLevel(idx + 1);
    const level = gcGame.getActiveLevel();
    showLevelModal(level.Name, level.Description, level.Image, false);
}