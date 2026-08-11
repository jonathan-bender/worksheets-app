function GeometricConstructionsCanvas(canvasElement) {
    const ctx = canvasElement.getContext("2d");
    const mathHelpers = new MathHelpers();

    this.DrawLine = function (element, style) {
        let intersectionWithCanvasEdge = mathHelpers.getIntersectionWithBoardEdge(element.p1, element.p2, canvasElement.width, canvasElement.height);
        if (intersectionWithCanvasEdge) {
            ctx.strokeStyle = style.color || "#7d7d7d";
            ctx.lineWidth = style.width || 2;
            ctx.beginPath();
            ctx.moveTo(intersectionWithCanvasEdge.start.x, intersectionWithCanvasEdge.start.y);
            ctx.lineTo(intersectionWithCanvasEdge.end.x, intersectionWithCanvasEdge.end.y);
            ctx.stroke();
        }
    }

    this.DrawLineSegment = function (element, style) {
        ctx.strokeStyle = style.color || "#393939";
        ctx.lineWidth = style.width || 2;
        ctx.beginPath();
        ctx.moveTo(element.p1.x, element.p1.y);
        ctx.lineTo(element.p2.x, element.p2.y);
        ctx.stroke();
    }

    this.DrawCircle = function (element, style) {
        const radius = Math.sqrt((element.pointOnCircumference.x - element.center.x) ** 2 + (element.pointOnCircumference.y - element.center.y) ** 2);
        ctx.strokeStyle = style.color || "#393939";
        ctx.lineWidth = style.width || 2;
        ctx.beginPath();
        ctx.arc(element.center.x, element.center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    this.DrawPoint = function (element, style) {
        ctx.strokeStyle = style.color || "#393939";
        ctx.lineWidth = style.width || 1;
        ctx.beginPath();
        ctx.arc(element.x, element.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    }

    this.FillPoint = function (element, style) {
        ctx.fillStyle = style.color || "#ffffff";
        ctx.beginPath();
        ctx.arc(element.x, element.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    this.clear = function () {
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}