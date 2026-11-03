# Geometric Constructions 4.0

Open `geometricConstructions.html` directly, or run the repository preview:

```sh
python3 -m http.server 8000 --directory public
```

Visit <http://localhost:8000/GeometricConstructions4.0/geometricConstructions.html>.
The hub also has a separate 4.0 card. Version 3.0 is unchanged.

## Playing

- **Line:** tap two points. **Circle:** tap the center, then its edge.
- Points snap to existing points, intersections, and curves. Tap empty space
  to create a free point. On desktop, hover to see the snap preview.
- **Move:** drag free points, given points, or points constrained to curves.
  Intersection points follow their defining shapes.
- Drag empty space to pan in any tool. Scroll, pinch, or use +/− to zoom.
  **Center** fits the construction into the available board.
- Undo/redo covers completed shapes and point drags. Undo while a first point
  is selected cancels that selection. Escape also cancels it.
- Switch between all six challenges with the selector. Work and history are
  retained while switching. Current constructions are saved locally when
  storage is available; undo history lasts for the current page session.
- Shortcuts: L / C / M, Ctrl or Cmd + Z, Shift + Ctrl or Cmd + Z, Ctrl + Y.

Hebrew and English are supported, including right-to-left layout. The six challenges are:

1. Construct an equilateral triangle.
2. Cut from a longer segment AB a piece AE equal to a separate, shorter segment
   CD (Euclid, Book I, Proposition 3). Construct the intersection point E;
   drawing over the existing baseline alone does not solve it.
3. Construct the internal bisector of angle BAC in a given triangle. The angle
   at A is marked with a gold arc.
4. Construct the median from A to the midpoint of BC. The target side BC is gold.
5. Construct the altitude from A perpendicular to BC. The target side BC is
   gold; the perpendicular may meet the extension of BC in an obtuse triangle.
6. Construct a square.

The triangle challenges begin with a scalene triangle so their target lines
are distinct. Their completion checks follow all three vertices when moved;
a line drawn by eye is insufficient. Existing saved work stays with its
challenge when the presentation order changes.

## Implementation

There are no runtime libraries, network dependencies, or build steps.

- `geometry.js`: geometry and history, independent of the browser. Objects
  refer to permanent IDs. Points are free, constrained by a curve parameter,
  or defined by an intersection and a stable branch index. Evaluation never
  writes missing coordinates back into definitions: nonexistent geometry
  evaluates to `null` and automatically returns when its parents recover.
  Degenerate lines/circles and tangencies are handled explicitly.
- `game.js`: rendering, snapping, input, localization, and local saving.
  Pending constructions do not enter the model until the second tap. Every
  completed construction/drag records one before-state. New edits discard
  redo; camera gestures never alter geometry or history.
- `game.css`: responsive layout, safe-area spacing, and touch targets.

One Pointer Events input path handles mouse, pen, and touch. Pointer capture
keeps drags working outside the canvas. A second finger rolls back an
uncommitted point drag and begins a camera gesture. Remaining fingers cannot
create stray taps. Cancellation or window blur rolls back unfinished drags.

Completion checks compare constructed lines with the target geometry, then
independently perturb movable inputs to reject shapes drawn only by eye.
Either side of the given baseline is accepted. Successful shapes are
highlighted in green; the success banner can be dismissed to keep exploring.

## Regression checks

From the repository root, with Node.js installed:

```sh
node tests/geometric-constructions4.test.js
```

Without Node, open `tests/geometric-constructions4.html` in a browser. Both run
the same engine tests: exact undo/redo restoration, history branching,
duplicate/degenerate shapes, disappearing and returning intersections,
tangency, stable branch indices, curve constraints, and all six solutions, including rotated and obtuse triangles.

Browser QA also exercised actual mouse/touch input in Chrome: solving a
triangle, undo/redo, dragging through coincident starting points, pinch/pan,
gesture cancellation, language switching, modal controls, local persistence,
and desktop/phone/landscape layouts. Physical-device Safari testing is still
recommended; browser emulation cannot reproduce every device behavior.
