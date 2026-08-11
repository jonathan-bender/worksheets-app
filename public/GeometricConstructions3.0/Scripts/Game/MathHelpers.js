function MathHelpers() {

    this.getLineLineIntersection = function (p1, p2, p3, p4) {
        const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (denom === 0) return []; // Parallel lines

        const x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;
        const y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;

        return [{ x: x, y: y }];
    }

    this.getLineCircleIntersection = function (p1, p2, center, pointOnCircumference) {
        const radius = Math.sqrt((pointOnCircumference.x - center.x) ** 2 + (pointOnCircumference.y - center.y) ** 2);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (p1.x - center.x) + dy * (p1.y - center.y));
        const c = (p1.x - center.x) * (p1.x - center.x) + (p1.y - center.y) * (p1.y - center.y) - radius * radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return []; // No intersection

        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        const points = [];
        points.push({ x: p1.x + t2 * dx, y: p1.y + t2 * dy });
        points.push({ x: p1.x + t1 * dx, y: p1.y + t1 * dy });

        return points;
    }

    this.getCircleCircleIntersection = function (c1, p1, c2, p2) {
        const r1 = Math.sqrt((p1.x - c1.x) ** 2 + (p1.y - c1.y) ** 2);
        const r2 = Math.sqrt((p2.x - c2.x) ** 2 + (p2.y - c2.y) ** 2);
        const d = Math.sqrt((c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2);
        if (d > r1 + r2 || d < Math.abs(r1 - r2)) return []; // No intersection

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);
        const x0 = c1.x + a * (c2.x - c1.x) / d;
        const y0 = c1.y + a * (c2.y - c1.y) / d;

        const rx = -(c2.y - c1.y) * (h / d);
        const ry = (c2.x - c1.x) * (h / d);

        return [
            { x: x0 + rx, y: y0 + ry },
            { x: x0 - rx, y: y0 - ry }
        ];
    }

    this.getLinePointProjection = function (line, point, segmentOnly = false) {
        const A = line.p1;
        const B = line.p2;
        const APx = point.x - A.x;
        const APy = point.y - A.y;
        const ABx = B.x - A.x;
        const ABy = B.y - A.y;
        const ab2 = ABx * ABx + ABy * ABy;
        const ap_ab = APx * ABx + APy * ABy;
        let t = ap_ab / ab2;
        if (segmentOnly) {
            if (t < 0) t = 0;
            if (t > 1) t = 1;
        }
        return { x: A.x + t * ABx, y: A.y + t * ABy };
    }

    this.getCirclePointProjection = function (circle, point) {
        const center = circle.center;
        const radius = Math.sqrt((circle.pointOnCircumference.x - center.x) ** 2 + (circle.pointOnCircumference.y - center.y) ** 2);
        const angle = Math.atan2(point.y - center.y, point.x - center.x);
        return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    }


    this.getIntersectionWithBoardEdge = function(start, end, boardWidth, boardHeight) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        if (dx === 0) { // vertical line
            return {
                start: { x: start.x, y: 0 },
                end: { x: start.x, y: boardHeight }
            };
        }

        const slope = dy / dx;
        const intercept = start.y - slope * start.x;

        let points = [];

        // Check intersection with left edge (x=0)
        let yAtLeftEdge = intercept;
        if (yAtLeftEdge >= 0 && yAtLeftEdge <= boardHeight) {
            points.push({ x: 0, y: yAtLeftEdge });
        }

        // Check intersection with right edge (x=boardWidth)
        let yAtRightEdge = slope * boardWidth + intercept;
        if (yAtRightEdge >= 0 && yAtRightEdge <= boardHeight) {
            points.push({ x: boardWidth, y: yAtRightEdge });
        }

        // Check intersection with top edge (y=0)
        let xAtTopEdge = -intercept / slope;
        if (xAtTopEdge >= 0 && xAtTopEdge <= boardWidth) {
            points.push({ x: xAtTopEdge, y: 0 });
        }

        // Check intersection with bottom edge (y=boardHeight)
        let xAtBottomEdge = (boardHeight - intercept) / slope;
        if (xAtBottomEdge >= 0 && xAtBottomEdge <= boardWidth) {
            points.push({ x: xAtBottomEdge, y: boardHeight });
        }

        if (points.length < 2) {
            return null; // No valid intersection found
        }

        return { start: points[0], end: points[1] };
    }


}