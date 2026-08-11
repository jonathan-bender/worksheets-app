// Level 4: Cut a Segment Equal to a Given Segment (Euclid's Elements, Book I, Prop. 3)
//
// Given:
//   A=(200,400)=C — the common start point
//   B=(500,400)   — end of the longer segment AB (length 300)
//   D=(200,250)   — end of the shorter segment AD (length 150, vertical)
//
// Task: mark point E on AB such that AE = AD.
//
// Construction:
//   1. Draw circle(A, D): radius = AD = 150                        [index 5]
//   2. Draw line through A and B                                   [index 6]
//   3. E = intersection of circle(A,D) with line AB (index 0)      [index 7]  → E=(350,400)
//   4. The line from A to E proves AE = AD                         [solution]

const gcLevel4 = {
    Name: 'Level 4: Cut a Segment (Euclid III)',
    Description: "Cut from segment AB a piece equal to segment AD. Find point E on AB such that AE = AD. (Euclid's Elements, Book I, Proposition 3.)",
    Elements: [
        // given
        { type: "point",   x: 200, y: 400, classList: ['given'] },          // 0: A (shared start)
        { type: "point",   x: 500, y: 400, classList: ['given'] },          // 1: B
        { type: "point",   x: 200, y: 250, classList: ['given'] },          // 2: D
        { type: "segment", p1: 0,  p2: 1,  classList: ['given'] },          // 3: segment AB (longer)
        { type: "segment", p1: 0,  p2: 2,  classList: ['given'] },          // 4: segment AD (shorter)

        // solution steps (hidden during play)
        { type: "circle",  p1: 0,  p2: 2,  classList: ['solution-step'] },  // 5: circle(A, D), radius=AD
        { type: "line",    p1: 0,  p2: 1,  classList: ['solution-step'] },  // 6: line through AB

        // E = circle(A,D) ∩ line(AB), intersectIndex 0 → (350, 400)
        { type: "point", intersect1: 5, intersect2: 6, intersectIndex: 0, classList: ['solution-step'] }, // 7: E

        // solution line: the player must draw line through A and the constructed point E
        { type: "line", p1: 0, p2: 7, classList: ['solution'] },            // 8

        // shown-solution segment (revealed green on solve)
        { type: "segment", p1: 0, p2: 7, classList: ['shown-solution'] },   // AE
    ]
};
