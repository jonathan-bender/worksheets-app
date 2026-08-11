const gcLevel1 = {
    Name: 'Level 1: Equilateral Triangle',
    Description: 'Construct an equilateral triangle on the given segment',
    Elements: [
        // given
        { type: "point", x: 200, y: 400, classList: ['given'] },
        { type: "point", x: 400, y: 400, classList: ['given'] },
        { type: "segment", p1: 0, p2: 1, classList: ['given'] },

        // solution steps
        { type: "circle", p1: 0, p2: 1, classList: ['solution-step'] },
        { type: "circle", p1: 1, p2: 0, classList: ['solution-step'] },
        { type: "point", intersect1: 3, intersect2: 4, intersectIndex: 1, classList: ['solution-step'] },

        // solution
        { type: "line", p1: 0, p2: 5, classList: ['solution'] },
        { type: "line", p1: 1, p2: 5, classList: ['solution'] },

        // shown solution
        { type: "segment", p1: 0, p2: 5, classList: ['shown-solution'] },
        { type: "segment", p1: 1, p2: 5, classList: ['shown-solution'] },
    ]
};
