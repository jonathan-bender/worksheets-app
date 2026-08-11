// Level 3: Star of David
// Construct a Star of David (hexagram) on the given segment.
//
// Given segment AB, build two equilateral triangles:
//   Triangle UP  : vertices A, B, P_up
//   Triangle DOWN: vertices L, R, P_down
// where P_up and P_down are the two intersections of circle(A,B) and circle(B,A),
// and L, R are obtained by intersecting circle(P_up,A)∩C_AB and circle(P_up,B)∩C_BA.
//
// Index map:
//   0: A, 1: B, 2: segment AB
//   3: C_AB = circle(A,B), 4: C_BA = circle(B,A)
//   5: P_up  (intersect1:3, intersect2:4, index 1) ≈ (300, 227)
//   6: P_down(intersect1:3, intersect2:4, index 0) ≈ (300, 573)
//   7: circle(P_up, A)
//   8: L = circle(P_up,A)∩C_AB index 0 ≈ (100, 227)
//   9: circle(P_up, B)
//  10: R = circle(P_up,B)∩C_BA index 1 ≈ (500, 227)
//  11-16: solution lines (6 sides of two equilateral triangles)
//  17-22: shown-solution segments

const gcLevel3 = {
    Name: 'Level 3: Star of David',
    Description: 'Construct a Star of David (hexagram). The six-pointed star is formed by two equilateral triangles built on the given segment.',
    Elements: [
        // given
        { type: "point",   x: 200, y: 400, classList: ['given'] },          // 0: A
        { type: "point",   x: 400, y: 400, classList: ['given'] },          // 1: B
        { type: "segment", p1: 0,  p2: 1,  classList: ['given'] },          // 2: AB

        // C_AB = circle(A, B)
        { type: "circle",  p1: 0,  p2: 1,  classList: ['solution-step'] },  // 3
        // C_BA = circle(B, A)
        { type: "circle",  p1: 1,  p2: 0,  classList: ['solution-step'] },  // 4

        // P_up  = C_AB ∩ C_BA, intersectIndex 1 → upper point (300, ~227)
        { type: "point", intersect1: 3, intersect2: 4, intersectIndex: 1, classList: ['solution-step'] }, // 5
        // P_down = C_AB ∩ C_BA, intersectIndex 0 → lower point (300, ~573)
        { type: "point", intersect1: 3, intersect2: 4, intersectIndex: 0, classList: ['solution-step'] }, // 6

        // circle(P_up, A) — used to find L
        { type: "circle",  p1: 5,  p2: 0,  classList: ['solution-step'] },  // 7

        // L = circle(P_up,A) ∩ C_AB, intersectIndex 0 → (~100, ~227)
        { type: "point", intersect1: 7, intersect2: 3, intersectIndex: 0, classList: ['solution-step'] }, // 8: L

        // circle(P_up, B) — used to find R
        { type: "circle",  p1: 5,  p2: 1,  classList: ['solution-step'] },  // 9

        // R = circle(P_up,B) ∩ C_BA, intersectIndex 1 → (~500, ~227)
        { type: "point", intersect1: 9, intersect2: 4, intersectIndex: 1, classList: ['solution-step'] }, // 10: R

        // solution lines: Triangle UP → A-B, B-P_up, P_up-A
        { type: "line", p1: 0,  p2: 1,  classList: ['solution'] },  // 11
        { type: "line", p1: 1,  p2: 5,  classList: ['solution'] },  // 12
        { type: "line", p1: 5,  p2: 0,  classList: ['solution'] },  // 13

        // solution lines: Triangle DOWN → L-R, R-P_down, P_down-L
        { type: "line", p1: 8,  p2: 10, classList: ['solution'] },  // 14
        { type: "line", p1: 10, p2: 6,  classList: ['solution'] },  // 15
        { type: "line", p1: 6,  p2: 8,  classList: ['solution'] },  // 16

        // shown-solution segments (revealed green on solve)
        { type: "segment", p1: 0,  p2: 1,  classList: ['shown-solution'] },
        { type: "segment", p1: 1,  p2: 5,  classList: ['shown-solution'] },
        { type: "segment", p1: 5,  p2: 0,  classList: ['shown-solution'] },
        { type: "segment", p1: 8,  p2: 10, classList: ['shown-solution'] },
        { type: "segment", p1: 10, p2: 6,  classList: ['shown-solution'] },
        { type: "segment", p1: 6,  p2: 8,  classList: ['shown-solution'] },
    ]
};
