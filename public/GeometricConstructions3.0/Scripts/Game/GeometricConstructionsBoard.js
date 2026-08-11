function GeometricConstructionsBoard(boardPainter) {
    const self = this,
        history = [],
        redoStack = [],
        mathHelpers = new MathHelpers(),
        snappingThreshold = 10;

    let elements = [],
        currentMode = 'line',
        draggedPoint = null,
        isDragging = false;

    // public functions

    self.click = click;
    self.mouseUp = mouseUp;
    self.mouseDown = mouseDown;
    self.mouseMove = mouseMove;
    self.zoom = zoom;
    self.undo = undo;
    self.redo = redo;
    self.switchMode = switchMode;
    self.createPoint = getOrCreatePoint;
    self.createLine = getLine;
    self.createSegment = getSegment;
    self.createCircle = getCircle;
    self.getIntersections = getIntersections;
    self.getElements = () => elements;
    self.getVisibleElements = getVisibleElements;
    self.getPoint = GetPointByCoordinates;
    self.updatePositions = updateSnappedElements;
    self.repaint = repaint;

    // player interactions
    function click(x, y) {
        if (currentMode === 'line' || currentMode === 'circle') {
            let tempPoint = elements.find(element => element.classList.includes('temp'));
            if (tempPoint === undefined) {
                tempPoint = getOrCreatePoint(x, y, ['temp'], false);
            } else {
                const newPoint = getOrCreatePoint(x, y, [], false);
                if (newPoint !== tempPoint) {
                    const newElement = currentMode === 'line' ? getLine(tempPoint, newPoint) : getCircle(tempPoint, newPoint);
                    addToHistory([newElement, newPoint, tempPoint]);
                    removeTempPoint();
                }
            }
        }

        repaint();
    }

    function mouseMove(x, y, dx, dy) {
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
            dragPlane(dx, dy);

        }
        repaint();
    }

    function mouseDown(x, y) {
        if (currentMode === 'move') {
            isDragging = true;

            const closestElements = findClosestElements(x, y, false);
            const closestPoint = closestElements.find(element => element.type === 'point');

            // Only allow dragging points that are not fixed at a two-element intersection
            if (closestPoint !== undefined && closestPoint.intersect2 === -1) {
                draggedPoint = closestPoint;
            }
        }
    }

    function mouseUp(x, y) {
        if (currentMode === 'move') {
            draggedPoint = null;
            isDragging = false;
        }
    }

    function zoom(x, y, factor) {
        const scaleFactor = factor < 0 ? 1.1 : 0.9;

        elements.forEach(element => {
            if (element.type === 'point') {
                element.x = x + (element.x - x) * scaleFactor;
                element.y = y + (element.y - y) * scaleFactor;
            }
        });

        updateSnappedElements();
        repaint();
    }

    function switchMode(mode) {
        currentMode = mode;

        removeTempPoint();
        repaint();

    }


    // class management
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

        history.push({ type: elementsAdded[0].type, elements: newElements });
        newElements.forEach(element => {
            removeClass(element, 'temp');
        });
        repaint();
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

        repaint();
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
        repaint();
    }

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

    // returns an array of the elements closest to the given coordinates, sorted by distance, filtered by snappingThreshold
    function findClosestElements(x, y, includeHidden = false) {
        const visibleElements = includeHidden ? elements : getVisibleElements();
        const distances = visibleElements.map(element => {
            let distance;
            if (element.type === 'point') {
                distance = Math.sqrt((element.x - x) ** 2 + (element.y - y) ** 2);
            } else if (element.type === 'line') {
                // Calculate distance from point to the line, not the line segment
                const projection = mathHelpers.getLinePointProjection(element, { x: x, y: y }, false);
                distance = Math.sqrt((projection.x - x) ** 2 + (projection.y - y) ** 2);

            } else if (element.type === 'segment') {
                // Calculate distance from point to the line segment
                const projection = mathHelpers.getLinePointProjection(element, { x: x, y: y }, true);
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
            points = mathHelpers.getLineLineIntersection(element1.p1, element1.p2, element2.p1, element2.p2);
        } else if (isFirstLine && element2.type === 'circle') {
            points = mathHelpers.getLineCircleIntersection(element1.p1, element1.p2, element2.center, element2.pointOnCircumference);
        } else if (element1.type === 'circle' && isSecondLine) {
            points = mathHelpers.getLineCircleIntersection(element2.p1, element2.p2, element1.center, element1.pointOnCircumference);
        } else if (element1.type === 'circle' && element2.type === 'circle') {
            points = mathHelpers.getCircleCircleIntersection(element1.center, element1.pointOnCircumference, element2.center, element2.pointOnCircumference);
        }

        if (element1.type === 'segment') {
            points = points.filter(pt => {
                return pt.x >= Math.min(element1.p1.x, element1.p2.x) && pt.x <= Math.max(element1.p1.x, element1.p2.x) &&
                       pt.y >= Math.min(element1.p1.y, element1.p2.y) && pt.y <= Math.max(element1.p1.y, element1.p2.y);
            });
        }

        if (element2.type === 'segment') {
            points = points.filter(pt => {
                return pt.x >= Math.min(element2.p1.x, element2.p2.x) && pt.x <= Math.max(element2.p1.x, element2.p2.x) &&
                       pt.y >= Math.min(element2.p1.y, element2.p2.y) && pt.y <= Math.max(element2.p1.y, element2.p2.y);
            });
        }
        return points;
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
            const projection = mathHelpers.getLinePointProjection(element, { x: x, y: y }, false);
            return [projection.x, projection.y];
        } else if (element.type === 'segment') {
            const projection = mathHelpers.getLinePointProjection(element, { x: x, y: y }, true);
            return [projection.x, projection.y];
        } else if (element.type === 'circle') {
            const circumferencePoint = mathHelpers.getCirclePointProjection(element, { x: x, y: y });
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



    function repaint() {
        boardPainter.clear();

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
                if (style.type === "line") boardPainter.DrawLine(element, style);
                else if (style.type === "segment") boardPainter.DrawLineSegment(element, style);
                else if (style.type === "circle") boardPainter.DrawCircle(element, style);
                else if (style.type === "point") boardPainter.DrawPoint(element, style);
                else if (style.type === "point-fill") boardPainter.FillPoint(element, style);
            });
        });
    }

}