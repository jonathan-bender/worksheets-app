    // Rendering
    const drawingRules = [
        // default lines are gray
        { condition: { type: "line" }, style: { type: "line", color: "#d3d1d1", width: 3 } },
        { condition: { type: "line" }, style: { type: "segment", color: "#969595", width: 3 } },
        { condition: { type: "circle" }, style: { type: "circle", color: "#969595", width: 3 } },
        { condition: { type: "segment" }, style: { type: "segment", color: "#969595", width: 3 } },

        // given elements are black; given always overrides visibility (given elements are never undone)
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

        // movable points are red in move mode
        { condition: { type: "point", class: "movable", gameState: "move" }, style: { type: "point-fill", color: "#e80707" } },

        // hovered points are blue
        { condition: { type: "point", class: "hovered" }, style: { type: "point-fill", color: "#3891bd" } },

        // temp points are blue
        { condition: { class: "temp" }, style: { type: "point-fill", color: "#3891bd" } },

        // hidden element classes — these must come last so they are never overridden
        { condition: { class: "undone" }, style: { visible: false } },
        { condition: { class: "solution-step" }, style: { visible: false } },
        { condition: { class: "solution" }, style: { visible: false } },
        { condition: { class: "shown-solution" }, style: { visible: false } },

        // revealed solution (shown after level is solved) — green
        { condition: { class: "shown-solution-revealed" }, style: { color: "#0fbe03", width: 3 } },
        { condition: { type: "segment", class: "shown-solution-revealed" }, style: { type: "segment", color: "#0fbe03", width: 3 } },
        { condition: { type: "line", class: "shown-solution-revealed" }, style: { type: "line", color: "#0fbe03", width: 3 } },
        { condition: { type: "line", class: "shown-solution-revealed" }, style: { type: "segment", color: "#0fbe03", width: 3 } },
    ];
