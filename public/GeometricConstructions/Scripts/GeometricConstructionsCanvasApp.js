function GeometricConstructionsCanvasApp(canvasElement) {
    const ctx = canvasElement.getContext("2d"),
        canvasWidth = canvasElement.width,
        canvasHeight = canvasElement.height,
        snappingThreshold = 10,
        parallelThreshold = 1e-10; // small value to check for parallel lines; // pixels

    let currentMode = 'line',
        draggedPoint = null,
        isDragging = false,
        elements = [],
        self = this;

    // public functions
    this.switchMode = switchMode;
    this.undo = undo;
    this.redo = redo;
    this.createPoint = getOrCreatePoint;
    this.createLine = getLine;
    this.createSegment = getSegment;
    this.createCircle = getCircle;
    this.getIntersections = getIntersections;
    this.getElements = getVisibleElements;
    this.getPoint = GetPointByCoordinates;
    this.updatePositions = updateSnappedElements;
    this.onChange = [];

    // Event listeners

    canvasElement.addEventListener('click', function (event) {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (currentMode === 'line' || currentMode === 'circle') {
            let tempPoint = elements.find(element => element.classList.includes('temp'));
            if (tempPoint === undefined) {
                tempPoint = getOrCreatePoint(x, y, ['temp'], false);
            } else {
                const newPoint = getOrCreatePoint(x, y, [], false);
                if (newPoint !== tempPoint) {
                    const newElement = currentMode === 'line' ? getLine(tempPoint, newPoint) : getCircle(tempPoint, newPoint);
                    addToHistory([newElement, newPoint, tempPoint]);
                }

                removeTempPoint();
            }
        }

        refreshCanvas();
    });

    canvasElement.addEventListener('mousemove', function (event) {
        const rect = canvasElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // make all elements that are within the snapping threshold of the mouse cursor have a class of 'hovered'

        let hoveredElements;
        if (draggedPoint === null) {
            hoveredElements = findClosestElements(x, y, false);
            const closestPoint = hoveredElements.find(element => element.type === 'point');
            if (closestPoint !== undefined && closestPoint.intersect2 === -1) {
                hoveredElements = [closestPoint];
            }

        } else {
            hoveredElements = [draggedPoint];
            if (draggedPoint.intersect1 !== -1) {
                hoveredElements.push(elements[draggedPoint.intersect1]);
            }
        }

        elements.forEach(element => {
            if (hoveredElements.includes(element)) {
                if (!hasClass(element, 'hovered')) {
                    addClass(element, 'hovered');
                }
            } else {
                removeClass(element, 'hovered');
            }
        });


        if (currentMode === 'move' && draggedPoint !== null) {
            dragPoint(x, y);
        } else if (currentMode === 'move' && isDragging) {

            // move all the points by the distance the mouse has moved since the last mousemove event
            const dx = x - canvasElement.lastX;
            const dy = y - canvasElement.lastY;
            dragPlane(dx, dy);

        }
        refreshCanvas();

        canvasElement.lastX = x;
        canvasElement.lastY = y;

    });

    canvasElement.addEventListener('mousedown', function (event) {
        if (currentMode === 'move') {
            isDragging = true;
            const rect = canvasElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const closestElements = findClosestElements(x, y, false);
            const closestPoint = closestElements.find(element => element.type === 'point');

            if (closestPoint !== undefined && closestPoint.intersect2 === -1) {
                draggedPoint = closestPoint;
            }

            canvasElement.lastX = x;
            canvasElement.lastY = y;
        }
    });

    canvasElement.addEventListener('mouseup', function (event) {
        if (currentMode === 'move') {
            draggedPoint = null;
            isDragging = false;
        }
    });

    canvasElement.addEventListener('wheel', function (event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            zoom(event, 1.1);
        } else {
            zoom(event, 0.9);
        }
    });

    // geometry elements

    function getOrCreatePoint(x, y, classList = [], includeHidden = false) {
        let closestElements = findClosestElements(x, y, includeHidden);
        let closestPoint = closestElements.find(element => element.type === 'point');

        if (closestPoint !== undefined) {
            closestPoint.classList = [...new Set([...closestPoint.classList, ...classList])];;
            return closestPoint;
        } else if (closestElements[0] !== undefined && closestElements[1] !== undefined) {
            // create a new point at the intersection of the two elements
            const intersections = getIntersections(closestElements[0], closestElements[1]);
            // get the intersection point that is within the snapping threshold
            const intersection = intersections.find(pt => Math.sqrt((pt.x - x) ** 2 + (pt.y - y) ** 2) < snappingThreshold);
            const intersectionId = intersections.indexOf(intersection);
            if (intersection !== undefined) {
                const newPoint = { type: 'point', x: intersection.x, y: intersection.y, classList: classList, intersect1: elements.indexOf(closestElements[0]), intersect2: elements.indexOf(closestElements[1]), intersectionId: intersectionId };
                elements.push(newPoint);
                return newPoint;
            }
        }
        if (closestElements[0] !== undefined) {
            const intersect1 = elements.indexOf(closestElements[0]);
            [x, y] = getSnappedCoordinates(closestElements[0], x, y);
            const newPoint = { type: 'point', intersect1: intersect1, intersect2: -1, x: x, y: y, classList: classList };
            addClass(newPoint, 'movable');
            elements.push(newPoint);
            return newPoint;
        } else {
            // create a new point at the given coordinates
            const newPoint = { type: 'point', intersect1: -1, intersect2: -1, x: x, y: y, classList: classList };
            addClass(newPoint, 'movable');
            elements.push(newPoint);
            return newPoint;
        }
    }

    function getLine(point1, point2, classList = []) {
        removeClass(point1, 'temp');
        removeClass(point2, 'temp');

        const existingLine = getVisibleElements().find(element => element.type === 'line' && ((element.p1 === point1 && element.p2 === point2) || (element.p1 === point2 && element.p2 === point1)));
        if (existingLine !== undefined) {
            return existingLine; // line already exists
        }
        const line = { type: 'line', p1: point1, p2: point2, classList: classList };
        elements.push(line);
        return line;
    }

    function getSegment(point1, point2, classList = []) {
        removeClass(point1, 'temp');
        removeClass(point2, 'temp');

        const segment = { type: 'segment', p1: point1, p2: point2, classList: classList };
        elements.push(segment);
        return segment;
    }

    function getCircle(center, pointOnCircumference, classList = []) {
        removeClass(center, 'temp');
        removeClass(pointOnCircumference, 'temp');

        const existingCircle = getVisibleElements().find(element => element.type === 'circle' && element.center === center && element.pointOnCircumference === pointOnCircumference);
        if (existingCircle !== undefined) {
            return existingCircle; // circle already exists
        }

        const circle = { type: 'circle', center: center, pointOnCircumference: pointOnCircumference, classList: classList };
        elements.push(circle);
        return circle;
    }

    function updateSnappedElements() {
        elements.forEach(element => {
            if (element.type === 'point') {
                if (element.intersect1 !== -1 && element.intersect2 !== -1) {
                    const intersections = getIntersections(elements[element.intersect1], elements[element.intersect2]);
                    let intersection = intersections[element.intersectionId];
                    if (intersection !== undefined) {
                        element.x = intersection.x;
                        element.y = intersection.y;
                    } else {
                        element.x = undefined;
                        element.y = undefined;
                    }
                } else if (element.intersect1 !== -1) {
                    [element.x, element.y] = getSnappedCoordinates(elements[element.intersect1], element.x, element.y);
                }
            }
        });
    }

    function getVisibleElements() {
        const hiddenClasses = ['undone', 'solution-step', 'solution', 'shown-solution'];
        return elements.filter(element => !hiddenClasses.some(cls => hasClass(element, cls)));
    }

    function getSnappedCoordinates(element, x, y) {
        if (element.type === 'line') {
            const projection = getLinePointProjection(element, { x: x, y: y }, false);
            return [projection.x, projection.y];
        } else if (element.type === 'segment') {
            const projection = getLinePointProjection(element, { x: x, y: y }, true);
            return [projection.x, projection.y];
        } else if (element.type === 'circle') {
            const circumferencePoint = getCirclePointProjection(element, { x: x, y: y });
            return [circumferencePoint.x, circumferencePoint.y];
        }
        return [x, y];
    }

    function GetPointByCoordinates(x, y) {
        return elements.find(element => element.type === 'point' &&
            Math.abs(element.x - x) < 1e-10 && Math.abs(element.y - y) < 1e-10);
    }

    function dragPoint(x, y) {
        if (draggedPoint.intersect1 !== -1 && draggedPoint.intersect2 !== -1) {
            const intersections = getIntersections(elements[draggedPoint.intersect1], elements[draggedPoint.intersect2]);
            let intersection = intersections[draggedPoint.intersectionId];
            if (intersection !== undefined) {
                draggedPoint.x = intersection.x;
                draggedPoint.y = intersection.y;
            } else {
                draggedPoint.x = undefined;
                draggedPoint.y = undefined;
            }
        } else if (draggedPoint.intersect1 !== -1) {
            let [newX, newY] = getSnappedCoordinates(elements[draggedPoint.intersect1], x, y);
            draggedPoint.x = newX;
            draggedPoint.y = newY;
        } else {
            draggedPoint.x = x;
            draggedPoint.y = y;
        }

        updateSnappedElements();
    }

    function dragPlane(dx, dy) {
        elements.forEach(element => {
            if (element.type === 'point') {
                element.x += dx;
                element.y += dy;
            }
        });
    }

    function zoom(event, scaleFactor) {
        const rect = canvasElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        elements.forEach(element => {
            if (element.type === 'point') {
                element.x = mouseX + (element.x - mouseX) * scaleFactor;
                element.y = mouseY + (element.y - mouseY) * scaleFactor;
            }
        });

        updateSnappedElements();
        refreshCanvas();
    }

    function addClass(element, className) {
        if (!element.classList.includes(className)) {
            element.classList.push(className);
        }
    }

    function removeClass(element, className) {
        element.classList = element.classList.filter(cls => cls !== className);
    }

    function hasClass(element, className) {
        return element.classList.some(cls => cls === className);
    }

    // history management
    const history = [];
    const redoStack = [];

    function addToHistory(elementsAdded) {
        // filter out any elements that are already in the history
        const newElements = elementsAdded
            .filter(element => !history.some(action => action.elements.includes(element))
                && !hasClass(element, 'given'));
        if (newElements.length === 0) {
            return;
        }

        // Clear the redo stack when a new action is performed
        redoStack.length = 0;
        elements = elements.filter(element => !hasClass(element, 'undone'));

        history.push({ type: elementsAdded[0].type, id: elements.length - 1, elements: newElements });
        newElements.forEach(element => {
            removeClass(element, 'temp');
        });
        refreshCanvas();
    }

    function undo() {
        if (history.length === 0) {
            return;
        }

        // if there's a temp point, remove it from the elements array
        let removedTempPoint = removeTempPoint();
        if (!removedTempPoint) {
            const lastAction = history.pop();
            redoStack.push(lastAction);

            // add a class that indicates that the elements are being undone
            lastAction.elements.forEach(element => {
                addClass(element, 'undone');
            });
        }

        refreshCanvas();
    }

    function redo() {
        if (redoStack.length === 0) {
            return;
        }

        const lastUndoneAction = redoStack.pop();
        history.push(lastUndoneAction);

        // Re-add the elements from the last undone action
        lastUndoneAction.elements.forEach(element => {
            removeClass(element, 'undone');
        });

        removeTempPoint();
        refreshCanvas();
    }

    // geometry

    // returns an array of the elements closest to the given coordinates, sorted by distance, filtered by snappingThreshold
    function findClosestElements(x, y, includeHidden = false) {
        const visibleElements = includeHidden ? elements : getVisibleElements();
        const distances = visibleElements.map(element => {
            let distance;
            if (element.type === 'point') {
                distance = Math.sqrt((element.x - x) ** 2 + (element.y - y) ** 2);
            } else if (element.type === 'line') {
                // Calculate distance from point to the line, not the line segment
                const projection = getLinePointProjection(element, { x: x, y: y }, false);
                distance = Math.sqrt((projection.x - x) ** 2 + (projection.y - y) ** 2);

            } else if (element.type === 'segment') {
                // Calculate distance from point to the line segment
                const projection = getLinePointProjection(element, { x: x, y: y }, true);
                distance = Math.sqrt((projection.x - x) ** 2 + (projection.y - y) ** 2);
            }
            else if (element.type === 'circle') {
                // Calculate distance from point to circle circumference
                const center = element.center;
                const radius = Math.sqrt((element.pointOnCircumference.x - center.x) ** 2 + (element.pointOnCircumference.y - center.y) ** 2);
                const distToCenter = Math.sqrt((center.x - x) ** 2 + (center.y - y) ** 2);
                distance = Math.abs(distToCenter - radius);
            }
            return { element: element, distance: distance };
        });

        // Filter by snappingThreshold and sort by distance and return the elements themselves
        return distances.filter(d => d.distance < snappingThreshold).sort((a, b) => a.distance - b.distance).map(d => d.element);
    }

    function getIntersections(element1, element2) {
        let points = [];
        const isFirstLine = element1.type === 'line' || element1.type === 'segment';
        const isSecondLine = element2.type === 'line' || element2.type === 'segment';
        if (isFirstLine && isSecondLine) {
            points = getLineLineIntersection(element1.p1, element1.p2, element2.p1, element2.p2);
        } else if (isFirstLine && element2.type === 'circle') {
            points = getLineCircleIntersection(element1.p1, element1.p2, element2.center, element2.pointOnCircumference);
        } else if (element1.type === 'circle' && isSecondLine) {
            points = getLineCircleIntersection(element2.p1, element2.p2, element1.center, element1.pointOnCircumference);
        } else if (element1.type === 'circle' && element2.type === 'circle') {
            points = getCircleCircleIntersection(element1.center, element1.pointOnCircumference, element2.center, element2.pointOnCircumference);
        }

        if (element1.type === 'segment') {
            points = points.filter(pt => {
                return pt.x >= element1.p1.x && pt.x <= element1.p2.x && pt.y >= element1.p1.y && pt.y <= element1.p2.y;
            });
        }

        if (element2.type === 'segment') {
            points = points.filter(pt => {
                return pt.x >= element2.p1.x && pt.x <= element2.p2.x && pt.y >= element2.p1.y && pt.y <= element2.p2.y;
            });
        }
        return points;
    }

    function getLineLineIntersection(p1, p2, p3, p4) {
        const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (Math.abs(denom) < parallelThreshold) return []; // Parallel lines

        const x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;
        const y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;

        return [{ x: x, y: y }];
    }

    function getLineCircleIntersection(p1, p2, center, pointOnCircumference) {
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

    function getCircleCircleIntersection(c1, p1, c2, p2) {
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

    function getLinePointProjection(line, point, segmentOnly = false) {
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

    function getCirclePointProjection(circle, point) {
        const center = circle.center;
        const radius = Math.sqrt((circle.pointOnCircumference.x - center.x) ** 2 + (circle.pointOnCircumference.y - center.y) ** 2);
        const angle = Math.atan2(point.y - center.y, point.x - center.x);
        return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    }

    // given two points, return the intersection of the line defined by those two points with the canvas edge
    function getIntersectionWithCanvasEdge(start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        if (dx === 0) { // vertical line
            return {
                start: { x: start.x, y: 0 },
                end: { x: start.x, y: canvasHeight }
            };
        }

        const slope = dy / dx;
        const intercept = start.y - slope * start.x;

        let points = [];

        // Check intersection with left edge (x=0)
        let yAtLeftEdge = intercept;
        if (yAtLeftEdge >= 0 && yAtLeftEdge <= canvasHeight) {
            points.push({ x: 0, y: yAtLeftEdge });
        }

        // Check intersection with right edge (x=canvasWidth)
        let yAtRightEdge = slope * canvasWidth + intercept;
        if (yAtRightEdge >= 0 && yAtRightEdge <= canvasHeight) {
            points.push({ x: canvasWidth, y: yAtRightEdge });
        }

        // Check intersection with top edge (y=0)
        let xAtTopEdge = -intercept / slope;
        if (xAtTopEdge >= 0 && xAtTopEdge <= canvasWidth) {
            points.push({ x: xAtTopEdge, y: 0 });
        }

        // Check intersection with bottom edge (y=canvasHeight)
        let xAtBottomEdge = (canvasHeight - intercept) / slope;
        if (xAtBottomEdge >= 0 && xAtBottomEdge <= canvasWidth) {
            points.push({ x: xAtBottomEdge, y: canvasHeight });
        }

        if (points.length < 2) {
            return null; // No valid intersection found
        }

        return { start: points[0], end: points[1] };
    }

    // Mode functions

    function switchMode(mode) {
        currentMode = mode;

        removeTempPoint();
        refreshCanvas();
    }

    function removeTempPoint() {
        let tempPoint = elements.find(element => hasClass(element, 'temp'));
        // try to locate tempPoint in history
        let tempPointInHistory = history.find(action => action.elements.includes(tempPoint));
        if (tempPoint !== undefined && tempPointInHistory === undefined) {
            const index = elements.indexOf(tempPoint);
            if (index > -1) {
                elements.splice(index, 1);
            }
            return true;
        } else if (tempPoint !== undefined && tempPointInHistory !== undefined) {
            removeClass(tempPoint, 'temp');
            return true;

        }

        return false;
    }

    // Rendering
    const drawingRules = [
        // default lines are gray
        { condition: { type: "line" }, style: { type: "line", color: "#d3d1d1", width: 3 } },
        { condition: { type: "line" }, style: { type: "segment", color: "#969595", width: 3 } },
        { condition: { type: "circle" }, style: { type: "circle", color: "#969595", width: 3 } },
        { condition: { type: "segment" }, style: { type: "segment", color: "#969595", width: 3 } },

        // given lines are black
        { condition: { class: "given" }, style: { color: "#000000", width: 1 } },
        { condition: { type: "line", class: "given" }, style: { type: "segment", color: "#393939", width: 3 } },

        // hovered lines are blue & light blue
        { condition: { class: "hovered" }, style: { color: "#3891bd" } },
        { condition: { type: "line", class: "hovered" }, style: { type: "segment", color: "#3891bd" } },
        { condition: { type: "line", class: "hovered" }, style: { type: "line", color: "#84d6ff" } },

        // solution lines are green
        { condition: { class: "solution" }, style: { color: "#0fbe03" } },

        // points are gray
        { condition: { type: "point" }, style: { type: "point", color: "#969595", width: 4 } },

        // point fill is white
        { condition: { type: "point" }, style: { type: "point-fill", color: "#ffffff" } },

        // movable points are red
        { condition: { type: "point", class: "movable", gameState: "move" }, style: { type: "point-fill", color: "#e80707" } },

        // hovered points are blue
        { condition: { type: "point", class: "hovered" }, style: { type: "point-fill", color: "#3891bd" } },

        // undone elements are invisible
        { condition: { class: "undone" }, style: { visible: false } },

        // temp points are blue
        { condition: { class: "temp" }, style: { type: "point-fill", color: "#3891bd" } },

        // solution-step lines are invisible
        { condition: { class: "solution-step" }, style: { visible: false } },
        { condition: { class: "solution" }, style: { visible: false } },
        { condition: { class: "shown-solution" }, style: { visible: false } },
        { condition: { class: "given" }, style: { visible: true } },
    ];



    function refreshCanvas() {
        self.onChange.forEach(callback => callback());

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // draw lines & then line segments and circles & then points, duplicate elements array
        elements.slice().sort((a, b) => {
            const order = { 'line': 1, 'segment': 2, 'circle': 3, 'point': 4 };
            return order[a.type] - order[b.type];
        }).forEach(element => {
            const applicableRules = drawingRules.filter(rule => {
                return Object.keys(rule.condition).every(key => {
                    if (key === "class") {
                        return hasClass(element, rule.condition[key]);
                    } else if (key === "type") {
                        return element.type === rule.condition[key];
                    } else if (key === "gameState") {
                        return currentMode === rule.condition[key];
                    }
                    return false;
                });
            });

            // duplicate applicableRules array to avoid mutating the original drawingRules array
            const applicableRulesCopy = applicableRules.map(rule => ({ ...rule, style: { ...rule.style } }));

            // group rules by type and merge styles, with later rules overriding earlier ones
            const finalStyles = applicableRulesCopy.reduce((acc, rule) => {
                // rules without a type apply to all
                if (rule.style.type === undefined) {
                    acc.forEach(style => {
                        //append all properties from rule.style to style, overriding existing properties
                        Object.keys(rule.style).forEach(key => {
                            style[key] = rule.style[key];
                        });
                    });
                    return acc;
                }

                const existingStyleIndex = acc.findIndex(style => style.type === rule.style.type);
                if (existingStyleIndex !== -1) {
                    acc[existingStyleIndex] = { ...acc[existingStyleIndex], ...rule.style };
                } else {
                    acc.push(rule.style);
                }
                return acc;
            }, []);


            finalStyles.forEach(style => {
                if (style.visible === false) return; // skip invisible elements
                if (style.type === "line") DrawLine(element, style);
                else if (style.type === "segment") DrawLineSegment(element, style);
                else if (style.type === "circle") DrawCircle(element, style);
                else if (style.type === "point") DrawPoint(element, style);
                else if (style.type === "point-fill") FillPoint(element, style);
            });
        });

        function DrawLine(element, style) {
            let intersectionWithCanvasEdge = getIntersectionWithCanvasEdge(element.p1, element.p2);
            if (intersectionWithCanvasEdge) {
                ctx.strokeStyle = style.color || "#7d7d7d";
                ctx.lineWidth = style.width || 2;
                ctx.beginPath();
                ctx.moveTo(intersectionWithCanvasEdge.start.x, intersectionWithCanvasEdge.start.y);
                ctx.lineTo(intersectionWithCanvasEdge.end.x, intersectionWithCanvasEdge.end.y);
                ctx.stroke();
            }
        }

        function DrawLineSegment(element, style) {
            ctx.strokeStyle = style.color || "#393939";
            ctx.lineWidth = style.width || 2;
            ctx.beginPath();
            ctx.moveTo(element.p1.x, element.p1.y);
            ctx.lineTo(element.p2.x, element.p2.y);
            ctx.stroke();
        }

        function DrawCircle(element, style) {
            const radius = Math.sqrt((element.pointOnCircumference.x - element.center.x) ** 2 + (element.pointOnCircumference.y - element.center.y) ** 2);
            ctx.strokeStyle = style.color || "#393939";
            ctx.lineWidth = style.width || 2;
            ctx.beginPath();
            ctx.arc(element.center.x, element.center.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        function DrawPoint(element, style) {
            ctx.strokeStyle = style.color || "#393939";
            ctx.lineWidth = style.width || 1;
            ctx.beginPath();
            ctx.arc(element.x, element.y, 3, 0, 2 * Math.PI);
            ctx.stroke();
        }

        function FillPoint(element, style) {
            ctx.fillStyle = style.color || "#ffffff";
            ctx.beginPath();
            ctx.arc(element.x, element.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}