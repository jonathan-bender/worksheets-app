function GeometricConstructionsGame(canvasElem) {
    const self = this;

    let levels,
        activeLevel,
        activeBoard,
        activeTool,
        onSolvedCallback = null,
        levelSolved = false;

    // public functions
    self.start = start;
    self.click = (x, y) => activeBoard.click(x, y);
    self.mouseMove = (x, y, dx, dy) => activeBoard.mouseMove(x, y, dx, dy);
    self.mouseUp = () => activeBoard.mouseUp();
    self.mouseDown = (x, y) => activeBoard.mouseDown(x, y);
    self.zoom = (x, y, factor) => activeBoard.zoom(x, y, factor);
    self.switchMode = (mode) => activeBoard.switchMode(mode);
    self.undo = () => activeBoard.undo();
    self.redo = () => activeBoard.redo();
    self.getActiveLevel = () => activeLevel;
    self.repaint = () => activeBoard && activeBoard.repaint();
    self.isSolved = isSolved;
    self.setOnSolved = (cb) => { onSolvedCallback = cb; };

    // start

    function start() {
        boardPainter = new GeometricConstructionsCanvas(canvasElem);
        activeBoard = new GeometricConstructionsBoard(boardPainter);

        levels = getLevels();
        activeLevel = levels[0];
        levelSolved = false;

        startLevel(activeLevel, activeBoard);

        activeBoard.setOnElementAdded(() => {
            if (!levelSolved && isSolved()) {
                levelSolved = true;
                revealSolution();
                if (onSolvedCallback) onSolvedCallback(activeLevel);
            }
        });
    }

    function revealSolution() {
        activeBoard.getElements().forEach(el => {
            if (el.classList.includes('shown-solution')) {
                el.classList = el.classList.filter(c => c !== 'shown-solution');
                if (!el.classList.includes('shown-solution-revealed')) {
                    el.classList.push('shown-solution-revealed');
                }
            }
        });
        activeBoard.repaint();
    }

    function startLevel(level, board) {
        let results = [];
        level.Elements.forEach(e => {
            let result;
            if (e.type == 'point') {
                // IMPORTANT: to do - include snapped point functionality
                if (e.x !== undefined)
                    result = board.createPoint(e.x, e.y, e.classList);
                else {
                    const intersectionCoordinates = board.getIntersections(results[e.intersect1], results[e.intersect2])[e.intersectIndex];
                    result = board.createPoint(intersectionCoordinates.x, intersectionCoordinates.y, e.classList, true);
                }
            }

            if (e.type == 'segment') {
                result = board.createSegment(results[e.p1], results[e.p2], e.classList);
            }

            if (e.type == 'line') {
                result = board.createLine(results[e.p1], results[e.p2], e.classList);
            }

            if (e.type == 'circle') {
                result = board.createCircle(results[e.p1], results[e.p2], e.classList);
            }
            results.push(result);

        });

        board.repaint();
    }

    function getLevels() {
        return [gcLevel1, gcLevel2];
    }

    function isSolved() {
        const solutionElements = activeBoard.getElements().filter(c => c.classList.includes('solution'));
        const playerElements = activeBoard.getVisibleElements();
        const playerSolution = solutionElements.map((c) => { return {solution: c, playerSolution: playerElements.find(e => compareElements(e, c))} });
        if (playerSolution.some(c => c.playerSolution === undefined))
            return false;

        // Perturb movable points to verify the construction is geometrically dependent,
        // not just coincidentally correct. Use try/finally to guarantee state is always restored.
        const moveablePoints = activeBoard.getElements().filter(el => el.type === 'point' && el.classList.includes('movable'));
        const savedCoords = moveablePoints.map(c => ({ point: c, x: c.x, y: c.y }));

        try {
            moveablePoints.forEach(c => { c.x += 1; c.y += 1; });
            activeBoard.updatePositions();
            return !playerSolution.some(c => !compareElements(c.solution, c.playerSolution));
        } finally {
            savedCoords.forEach(({ point, x, y }) => { point.x = x; point.y = y; });
            activeBoard.updatePositions();
        }
    }

    function compareElements(e1, e2) {
        if (e1.type !== e2.type)
            return false;

        if (e1.type === 'line')
            return compareLines(e1, e2);
    }

    function compareLines(line1, line2) {
        return ((line1.p1.x === line2.p1.x && line1.p1.y === line2.p1.y && line1.p2.x === line2.p2.x && line1.p2.y === line2.p2.y) ||
            (line1.p1.x === line2.p2.x && line1.p1.y === line2.p2.y && line1.p2.x === line2.p1.x && line1.p2.y === line2.p1.y));
    }
}