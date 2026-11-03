/* Run with: node tests/geometric-constructions4.test.js */
(() => {
    'use strict';
    const G = typeof require === 'function' ? require('../public/GeometricConstructions4.0/geometry.js') : GC4;
    const results = [];
    const assert = (value, message = 'Assertion failed') => { if (!value) throw new Error(message); };
    const equal = (a, b) => assert(JSON.stringify(a) === JSON.stringify(b), 'Values differ');
    function test(name, run) { try { run(); results.push({ name, pass: true }); } catch (e) { results.push({ name, pass: false, error: e.message }); } }
    const ref = id => ({ id });
    const circle = (b, a, c) => b.add({ type: 'circle', a, b: c });
    const line = (b, a, c) => b.add({ type: 'line', a, b: c });
    const intersection = (b, a, c, branch) => b.add({ type: 'point', mode: 'intersection', a, b: c, branch });
    function triangle(b) {
        const ca = circle(b, 'A', 'B'), cb = circle(b, 'B', 'A');
        const top = intersection(b, ca, cb, 0);
        line(b, 'A', top); line(b, 'B', top);
        return { ca, cb, top };
    }
    test('A complete shape is one undo step; shared given points survive', () => {
        const b = new G.Board(), before = b.snapshot();
        assert(b.construct('circle', ref('A'), ref('B')));
        const after = b.snapshot(); assert(b.undo()); equal(b.snapshot(), before);
        assert(b.redo()); equal(b.snapshot(), after);
        equal(b.nodes.filter(n => n.given).map(n => n.id), ['A', 'B', 'AB']);
    });
    test('Undo then a different construction preserves dependencies and clears redo', () => {
        const b = new G.Board(); b.construct('circle', ref('A'), ref('B'));
        const c = b.nodes.at(-1).id;
        b.construct('line', ref('A'), { mode: 'on', curve: c, t: -1 });
        b.undo(); b.construct('circle', ref('B'), ref('A'));
        assert(!b.redo()); assert(b.nodes.find(n => n.id === c).type === 'circle');
        assert([...G.evaluate(b.nodes).values()].every(Boolean));
    });
    test('Duplicate and zero-length shapes do not change history or leak points', () => {
        const b = new G.Board(); b.construct('circle', ref('A'), ref('B'));
        const before = b.snapshot(), count = b.past.length;
        assert(!b.construct('circle', ref('A'), ref('B')));
        assert(!b.construct('line', { mode: 'free', x: 1, y: 1 }, { mode: 'free', x: 1, y: 1 }));
        equal(b.snapshot(), before); assert(b.past.length === count);
    });
    test('Missing intersections and their dependent shapes recover without NaN', () => {
        const b = new G.Board();
        const p = b.add({ type: 'point', mode: 'free', x: 20, y: 55 });
        const q = b.add({ type: 'point', mode: 'free', x: 100, y: 55 });
        const ca = circle(b, 'A', p), cb = circle(b, 'B', q), ip = intersection(b, ca, cb, 1), dep = line(b, 'A', ip);
        // radii 130 and 10: no intersection at separation 220.
        assert(G.evaluate(b.nodes).get(ip) === null);
        b.nodes.find(n => n.id === q).x = -20;
        assert(G.evaluate(b.nodes).get(ip)); assert(G.evaluate(b.nodes).get(dep));
        b.nodes.find(n => n.id === q).x = 110;
        assert(G.evaluate(b.nodes).get(dep) === null);
        b.nodes.find(n => n.id === q).x = -20;
        assert(G.evaluate(b.nodes).get(dep));
        assert(!JSON.stringify(b.snapshot()).includes('null'));
    });
    test('Tangency preserves both intersection branches', () => {
        const a = { kind: 'circle', a: { x: 0, y: 0 }, r: 10 }, b = { kind: 'circle', a: { x: 20, y: 0 }, r: 10 };
        assert(G.intersections(a, b).length === 2); equal(G.intersections(a, b)[0], G.intersections(a, b)[1]);
        const c = { kind: 'line', a: { x: -20, y: 10 }, b: { x: 20, y: 10 } };
        assert(G.intersections(a, c).length === 2);
    });
    test('Segment clipping does not renumber an intersection branch', () => {
        const c = { kind: 'circle', a: { x: 0, y: 0 }, r: 10 }, s = { kind: 'segment', a: { x: 0, y: 0 }, b: { x: 20, y: 0 } };
        const hits = G.intersections(c, s); assert(hits[0] === null); assert(hits[1].x === 10);
    });
    test('A degenerate parent recovers all descendants after separation', () => {
        const b = new G.Board(); const { top } = triangle(b), root = b.nodes.find(n => n.id === 'B');
        const before = { ...root }; root.x = -110; root.y = 55;
        assert(!G.evaluate(b.nodes).get(top)); Object.assign(root, before); assert(G.evaluate(b.nodes).get(top));
    });
    test('Point-on-curve constraints retain parameters across movement', () => {
        const b = new G.Board(), c = circle(b, 'A', 'B');
        const p = b.add({ type: 'point', mode: 'on', curve: c, t: Math.PI / 2 });
        b.nodes.find(n => n.id === 'A').x -= 30;
        const v = G.evaluate(b.nodes); assert(Math.abs(G.distance(v.get(p), v.get('A')) - v.get(c).r) < 1e-8);
    });
    test('Point movement is one reversible transaction', () => {
        const b = new G.Board(), before = b.snapshot();
        for (let i = 0; i < 100; i++) b.nodes[0].x = i;
        b.record(before); const after = b.snapshot();
        assert(b.past.length === 1); b.undo(); equal(b.snapshot(), before); b.redo(); equal(b.snapshot(), after);
    });
    test('Level 1 recognizes an actual construction on either side', () => {
        for (const branch of [0, 1]) {
            const b = new G.Board(), ca = circle(b, 'A', 'B'), cb = circle(b, 'B', 'A'), p = intersection(b, ca, cb, branch);
            line(b, 'A', p); line(b, 'B', p); assert(G.solution(b), 'Triangle not recognized');
        }
    });
    test('An eyeballed triangle does not count as a construction', () => {
        const b = new G.Board(), c = b.add({ type: 'point', mode: 'free', x: 0, y: 55 - 110 * Math.sqrt(3) });
        line(b, 'A', c); line(b, 'B', c); assert(!G.solution(b));
    });
    test('Level 2 recognizes a square built using circles and perpendiculars', () => {
        const b = new G.Board(1), ca = circle(b, 'A', 'B'), base = line(b, 'A', 'B');
        const opposite = intersection(b, base, ca, 0), c1 = circle(b, opposite, 'B'), c2 = circle(b, 'B', opposite);
        const top = intersection(b, c1, c2, 0), perp = line(b, 'A', top), d = intersection(b, ca, perp, 1);
        const cd = circle(b, d, 'A'), cb = circle(b, 'B', 'A'), c = intersection(b, cd, cb, 0);
        line(b, 'B', c); line(b, d, c);
        assert(G.solution(b), 'Square not recognized');
    });
    function cutSegment(b) {
        // Euclid I.2 transfers CD to A using only circles through existing
        // points; I.3 then cuts that length off AB. No radius-copy shortcut.
        const ca = circle(b, 'A', 'C'), cc = circle(b, 'C', 'A');
        const apex = intersection(b, ca, cc, 0);
        const rayC = line(b, apex, 'C'), reference = circle(b, 'C', 'D');
        const beyondC = intersection(b, rayC, reference, 1);
        const outer = circle(b, apex, beyondC), rayA = line(b, apex, 'A');
        const beyondA = intersection(b, rayA, outer, 1);
        const cut = circle(b, 'A', beyondA);
        return intersection(b, cut, 'AB', 1);
    }
    test('Level 3 starts with two separate segments, the reference strictly shorter', () => {
        const b = new G.Board(2), v = G.evaluate(b.nodes);
        assert(v.has('CD') && !v.has('AD'));
        assert(G.distance(v.get('C'), v.get('D')) < G.distance(v.get('A'), v.get('B')));
        assert(!G.solution(b));
    });
    test('Level 3 recognizes Euclid I.3 with a separately transferred reference length', () => {
        const b = new G.Board(2), e = cutSegment(b), v = G.evaluate(b.nodes);
        assert(Math.abs(G.distance(v.get('A'), v.get(e)) - G.distance(v.get('C'), v.get('D'))) < 1e-8);
        assert(G.solution(b), 'Euclid I.3 construction not recognized');
        // The construction must follow changes to either reference endpoint.
        b.nodes.find(n => n.id === 'C').y -= 20;
        b.nodes.find(n => n.id === 'D').x += 10;
        assert(G.solution(b), 'Transferred length did not follow CD');
    });
    test('Level 3 rejects copying AD instead of the independent segment CD', () => {
        const b = new G.Board(2), c = circle(b, 'A', 'D');
        intersection(b, c, 'AB', 1);
        assert(!G.solution(b));
    });
    test('Level 3 rejects an eyeballed point and a reference longer than AB', () => {
        const b = new G.Board(2);
        b.add({ type: 'point', mode: 'free', x: 10, y: 55 });
        assert(!G.solution(b));
        cutSegment(b); assert(G.solution(b));
        b.nodes.find(n => n.id === 'D').x = 500;
        assert(!G.solution(b));
    });
    function bisectAngle(b) {
        const radius = circle(b, 'A', 'B');
        const equalPoint = intersection(b, radius, 'AC', 1);
        const c1 = circle(b, 'B', equalPoint), c2 = circle(b, equalPoint, 'B');
        const apex = intersection(b, c1, c2, 0);
        line(b, 'A', apex);
    }
    function median(b) {
        const c1 = circle(b, 'B', 'C'), c2 = circle(b, 'C', 'B');
        const p = intersection(b, c1, c2, 0), q = intersection(b, c1, c2, 1);
        const perpendicular = line(b, p, q), midpoint = intersection(b, perpendicular, 'BC', 0);
        line(b, 'A', midpoint);
    }
    function altitude(b) {
        const baseline = line(b, 'B', 'C'), radius = circle(b, 'A', 'B');
        const p = intersection(b, baseline, radius, 1);
        const c1 = circle(b, 'B', p), c2 = circle(b, p, 'B');
        const q = intersection(b, c1, c2, 0), r = intersection(b, c1, c2, 1);
        line(b, q, r);
    }
    for (const [level, name, construct] of [[3, 'angle bisector', bisectAngle], [4, 'median', median], [5, 'altitude', altitude]]) {
        test(`Level ${level + 1} recognizes a constructed ${name} and follows vertex movement`, () => {
            const b = new G.Board(level); assert(!G.solution(b));
            construct(b); assert(G.solution(b), `${name} was not recognized`);
            b.nodes.find(n => n.id === 'A').x += 10;
            b.nodes.find(n => n.id === 'B').y += 8;
            b.nodes.find(n => n.id === 'C').x += 15;
            assert(G.solution(b), `${name} did not follow the triangle`);
            // Also accept the same construction after rotation and translation.
            b.nodes.filter(n => n.mode === 'free').forEach(n => {
                const { x, y } = n; n.x = .6 * x - .8 * y + 40; n.y = .8 * x + .6 * y - 25;
            });
            assert(G.solution(b), `${name} failed after rotation`);
        });
        test(`Level ${level + 1} rejects an eyeballed ${name} and given sides`, () => {
            const b = new G.Board(level); line(b, 'A', 'B'); assert(!G.solution(b));
            const end = G.targets(level, G.evaluate(b.nodes))[0].b;
            const p = b.add({ type: 'point', mode: 'free', ...end });
            line(b, 'A', p); assert(!G.solution(b), 'An unconstrained guess counted as a construction');
        });
        test(`Level ${level + 1} solution supports undo/redo and degenerate triangle recovery`, () => {
            const b = new G.Board(level), before = b.snapshot(); construct(b); b.record(before);
            const solved = b.snapshot(); assert(G.solution(b)); b.undo(); assert(!G.solution(b));
            b.redo(); equal(b.snapshot(), solved); assert(G.solution(b));
            const a = b.nodes.find(n => n.id === 'A'), saved = { ...a };
            a.x = 0; a.y = 100; assert(!G.solution(b));
            Object.assign(a, saved); assert(G.solution(b));
        });
    }
    test('Bisector, median and altitude targets are distinct on the scalene triangle', () => {
        const v = G.evaluate(new G.Board(3).nodes);
        const ends = [3, 4, 5].map(level => G.targets(level, v)[0].b);
        assert(G.distance(ends[0], ends[1]) > 1 && G.distance(ends[0], ends[2]) > 1 && G.distance(ends[1], ends[2]) > 1);
        const a = v.get('A'), b = v.get('B'), c = v.get('C');
        assert(Math.abs(G.distance(b, ends[0]) / G.distance(ends[0], c) - G.distance(a, b) / G.distance(a, c)) < 1e-8);
    });
    test('Altitude accepts a perpendicular meeting the extension of BC in an obtuse triangle', () => {
        const b = new G.Board(5); b.nodes.find(n => n.id === 'A').x = 250;
        altitude(b); const goal = G.solution(b);
        assert(goal && goal[0].b.x > G.evaluate(b.nodes).get('C').x);
    });
    test('A constructed median does not solve the bisector or altitude challenge', () => {
        const b = new G.Board(4); median(b); assert(G.solution(b));
        b.level = 3; assert(!G.solution(b)); b.level = 5; assert(!G.solution(b));
    });
    test('Hundreds of undo/redo operations restore exact stable references', () => {
        const b = new G.Board();
        for (let i = 0; i < 60; i++) b.construct('circle', ref('A'), { mode: 'free', x: i * 3 + 2, y: -i * 7 - 10 });
        const after = b.snapshot();
        for (let cycle = 0; cycle < 5; cycle++) {
            while (b.undo()) {} assert(b.nodes.length === 3);
            while (b.redo()) {} equal(b.snapshot(), after);
        }
    });
    globalThis.gc4TestResults = results;
    if (typeof console !== 'undefined') console.log(JSON.stringify(results, null, 2));
    if (typeof process !== 'undefined' && results.some(r => !r.pass)) process.exitCode = 1;
})();
