const gcLevel2 = {
    Name: 'Level 2: Square',
    Description: 'Construct a square on the given segment',
    Elements: [
        // given (indices 0–2)
        { type: "point", x: 200, y: 400, classList: ['given'] },          // 0: A
        { type: "point", x: 400, y: 400, classList: ['given'] },          // 1: B
        { type: "segment", p1: 0, p2: 1, classList: ['given'] },          // 2: AB

        // solution steps (hidden during play)
        { type: "circle", p1: 0, p2: 1, classList: ['solution-step'] },   // 3: C1 = circle(A, B)
        { type: "line",   p1: 0, p2: 1, classList: ['solution-step'] },   // 4: line AB (to find A')

        // A' = C1 ∩ line(AB), index 0 → (0, 400), the reflection of B through A
        { type: "point", intersect1: 3, intersect2: 4, intersectIndex: 0, classList: ['solution-step'] }, // 5: A'

        { type: "circle", p1: 5, p2: 1, classList: ['solution-step'] },   // 6: C2 = circle(A', B)
        { type: "circle", p1: 1, p2: 5, classList: ['solution-step'] },   // 7: C3 = circle(B, A')

        // P_top = C2 ∩ C3, index 1 → (200, ~54): point above AB on perpendicular through A
        { type: "point", intersect1: 6, intersect2: 7, intersectIndex: 1, classList: ['solution-step'] }, // 8: P_top

        { type: "line", p1: 0, p2: 8, classList: ['solution-step'] },     // 9: perpendicular at A

        // D = C1 ∩ perp(A), index 1 → (200, 200): top-left corner of the square
        { type: "point", intersect1: 3, intersect2: 9, intersectIndex: 1, classList: ['solution-step'] }, // 10: D

        { type: "circle", p1: 10, p2: 0, classList: ['solution-step'] },  // 11: C4 = circle(D, A)
        { type: "circle", p1: 1,  p2: 0, classList: ['solution-step'] },  // 12: C5 = circle(B, A)

        // C = C4 ∩ C5, index 1 → (400, 200): top-right corner of the square
        { type: "point", intersect1: 11, intersect2: 12, intersectIndex: 1, classList: ['solution-step'] }, // 13: C

        // solution lines (used by isSolved to verify the player's construction)
        { type: "line", p1: 0,  p2: 10, classList: ['solution'] },        // 14: line AD
        { type: "line", p1: 1,  p2: 13, classList: ['solution'] },        // 15: line BC
        { type: "line", p1: 10, p2: 13, classList: ['solution'] },        // 16: line DC

        // shown solution (revealed as green segments when the level is solved)
        { type: "segment", p1: 0,  p2: 10, classList: ['shown-solution'] }, // 17: AD
        { type: "segment", p1: 10, p2: 13, classList: ['shown-solution'] }, // 18: DC
        { type: "segment", p1: 13, p2: 1,  classList: ['shown-solution'] }, // 19: CB
    ]
};
