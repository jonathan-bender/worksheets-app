function GeometricConstructionsGame(gcApp) {
    this.levels = [
        {
            Name: "Level 1",
            Instructions: "Construct an equilateral triangle with a given side length.",
            InitLevel: InitLevel1,
        }
    ];

    this.solved = false;

    function InitLevel1() {

        // given
        var pointA = gcApp.createPoint(200, 400, ['given']);
        var pointB = gcApp.createPoint(400, 400, ['given']);
        var segmetAB = gcApp.createSegment(pointA, pointB, ['given', 'shown-solution']);

        // solution steps
        var circleAB = gcApp.createCircle(pointA, pointB, ['solution-step']);
        var circleBA = gcApp.createCircle(pointB, pointA, ['solution-step']);
        var intersectionCoordinates = gcApp.getIntersections(circleAB, circleBA)[1];
        var pointC = gcApp.createPoint(intersectionCoordinates.x, intersectionCoordinates.y, ['solution-step'], true);

        // solution
        var lineAC = gcApp.createLine(pointA, pointC, ['solution']);
        var lineBC = gcApp.createLine(pointB, pointC, ['solution']);

        // shown solution
        var segmentAC = gcApp.createSegment(pointA, pointC, ['shown-solution']);
        var segmentBC = gcApp.createSegment(pointB, pointC, ['shown-solution']);

        gcApp.onChange.push(function () {
            this.solved = false;

            let elements = gcApp.getElements();

            // find a line created by the player that has endpoints with the same coordinates as the endpoints of the solution lines
            let playerLineAC = elements.find(el => el.type === 'line' && compareLines(el, lineAC));
            let playerLineBC = elements.find(el => el.type === 'line' && compareLines(el, lineBC));

            if (playerLineAC === undefined || playerLineBC === undefined) return;

            var variablePoints = elements.filter(el => el.type === 'point' && el.classList.includes('movable'));

            // vary the coordinates of variable points to check if the triangle remains equilateral
            for (var i = 0; i < variablePoints.length; i++) {
                var originalX = variablePoints[i].x;
                var originalY = variablePoints[i].y;

                // Vary the point's coordinates slightly
                variablePoints[i].x += 1;
                variablePoints[i].y += 1;

                gcApp.updatePositions();

                if (playerLineAC === undefined || playerLineBC === undefined
                    || !compareLines(playerLineAC, lineAC) || !compareLines(playerLineBC, lineBC)) return;

                variablePoints[i].x = originalX;
                variablePoints[i].y = originalY;

                gcApp.updatePositions();
            }

            this.solved = true;
            console.log("Level 1 solved!");
        });
    }

    function compareLines(line1, line2) {
        return ((line1.p1.x === line2.p1.x && line1.p1.y === line2.p1.y && line1.p2.x === line2.p2.x && line1.p2.y === line2.p2.y) ||
            (line1.p1.x === line2.p2.x && line1.p1.y === line2.p2.y && line1.p2.x === line2.p1.x && line1.p2.y === line2.p1.y));
    }

}