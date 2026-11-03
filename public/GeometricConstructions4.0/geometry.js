/* Independent of the screen: coordinates, dependencies, and undoable edits. */
(function (root) {
    'use strict';
    const EPS = 1e-9;
    const copy = value => JSON.parse(JSON.stringify(value));
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const cross = (a, b) => a.x * b.y - a.y * b.x;
    const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
    const add = (a, b, t = 1) => ({ x: a.x + b.x * t, y: a.y + b.y * t });
    const finite = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
    const linear = c => c.kind === 'line' || c.kind === 'segment';
    function parameter(c, p) {
        if (c.kind === 'circle') return Math.atan2(p.y - c.a.y, p.x - c.a.x);
        const d = sub(c.b, c.a);
        const t = ((p.x - c.a.x) * d.x + (p.y - c.a.y) * d.y) / (d.x * d.x + d.y * d.y);
        return c.kind === 'segment' ? Math.max(0, Math.min(1, t)) : t;
    }
    function at(c, t) {
        return c.kind === 'circle'
            ? { x: c.a.x + c.r * Math.cos(t), y: c.a.y + c.r * Math.sin(t) }
            : add(c.a, sub(c.b, c.a), t);
    }
    function intersections(a, b) {
        if (!a || !b) return [];
        let result;
        if (linear(a) && linear(b)) {
            const u = sub(a.b, a.a), v = sub(b.b, b.a), denominator = cross(u, v);
            if (Math.abs(denominator) < EPS * Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) return [];
            result = [add(a.a, u, cross(sub(b.a, a.a), v) / denominator)];
        } else if (linear(a) || linear(b)) {
            const line = linear(a) ? a : b, circle = linear(a) ? b : a;
            const u = sub(line.b, line.a), len = Math.hypot(u.x, u.y), unit = { x: u.x / len, y: u.y / len };
            const delta = sub(circle.a, line.a), t = delta.x * unit.x + delta.y * unit.y;
            const foot = add(line.a, unit, t), h2 = circle.r ** 2 - distance(foot, circle.a) ** 2;
            if (h2 < -EPS * Math.max(1, circle.r ** 2)) return [];
            const h = Math.sqrt(Math.max(0, h2));
            // Keep both branches at tangency, so branch 1 survives separation.
            result = [add(foot, unit, -h), add(foot, unit, h)];
        } else {
            const delta = sub(b.a, a.a), d = Math.hypot(delta.x, delta.y);
            if (d < EPS || d > a.r + b.r + EPS || d < Math.abs(a.r - b.r) - EPS) return [];
            const u = { x: delta.x / d, y: delta.y / d };
            const t = (a.r ** 2 - b.r ** 2 + d ** 2) / (2 * d);
            const h2 = a.r ** 2 - t ** 2;
            if (h2 < -EPS * Math.max(1, a.r ** 2)) return [];
            const foot = add(a.a, u, t), h = Math.sqrt(Math.max(0, h2)), normal = { x: -u.y, y: u.x };
            result = [add(foot, normal, -h), add(foot, normal, h)];
        }
        // Preserve branch positions even when a segment clips one intersection.
        return result.map(p => finite(p) && [a, b].every(c => {
            if (c.kind !== 'segment') return true;
            const t = parameter({ ...c, kind: 'line' }, p);
            return t >= -EPS && t <= 1 + EPS;
        }) ? p : null);
    }
    function evaluate(nodes, overrides = {}) {
        const definitions = new Map(nodes.map(n => [n.id, n])), values = new Map(), visiting = new Set();
        function get(id) {
            if (values.has(id)) return values.get(id);
            const n = definitions.get(id);
            if (!n || visiting.has(id)) return null;
            visiting.add(id);
            let value = null;
            if (n.type === 'point') {
                if (n.mode === 'free') value = overrides[id] || { x: n.x, y: n.y };
                if (n.mode === 'on') {
                    const curve = get(n.curve);
                    if (curve) value = at(curve, overrides[id]?.t ?? n.t);
                }
                if (n.mode === 'intersection') value = intersections(get(n.a), get(n.b))[n.branch] || null;
                if (!finite(value)) value = null;
            } else {
                const a = get(n.a), b = get(n.b);
                if (a && b && distance(a, b) > EPS) value = { kind: n.type, a, b, r: distance(a, b) };
            }
            visiting.delete(id);
            values.set(id, value);
            return value;
        }
        nodes.forEach(n => get(n.id));
        return values;
    }
    function initialNodes(level) {
        if (level >= 3 && level <= 5) return [
            { id: 'A', type: 'point', mode: 'free', x: -35, y: -100, given: true, label: 'A', target: true },
            { id: 'B', type: 'point', mode: 'free', x: -130, y: 100, given: true, label: 'B' },
            { id: 'C', type: 'point', mode: 'free', x: 140, y: 100, given: true, label: 'C' },
            { id: 'AB', type: 'segment', a: 'A', b: 'B', given: true },
            { id: 'AC', type: 'segment', a: 'A', b: 'C', given: true },
            { id: 'BC', type: 'segment', a: 'B', b: 'C', given: true, target: level >= 4 }
        ];
        const nodes = [
            { id: 'A', type: 'point', mode: 'free', x: -110, y: 55, given: true, label: 'A' },
            { id: 'B', type: 'point', mode: 'free', x: 110, y: 55, given: true, label: 'B' },
            { id: 'AB', type: 'segment', a: 'A', b: 'B', given: true }
        ];
        if (level === 2) nodes.push(
            { id: 'C', type: 'point', mode: 'free', x: -70, y: -100, given: true, label: 'C' },
            { id: 'D', type: 'point', mode: 'free', x: 50, y: -100, given: true, label: 'D' },
            { id: 'CD', type: 'segment', a: 'C', b: 'D', given: true }
        );
        return nodes;
    }
    class Board {
        constructor(level = 0) {
            this.level = level;
            this.nodes = initialNodes(level);
            this.serial = 0;
            this.past = [];
            this.future = [];
        }
        snapshot() { return copy({ nodes: this.nodes, serial: this.serial }); }
        restore(s) { this.nodes = copy(s.nodes); this.serial = s.serial; }
        record(before) {
            if (JSON.stringify(before) === JSON.stringify(this.snapshot())) return false;
            this.past.push(copy(before));
            if (this.past.length > 100) this.past.shift();
            this.future = [];
            return true;
        }
        undo() {
            if (!this.past.length) return false;
            this.future.push(this.snapshot()); this.restore(this.past.pop()); return true;
        }
        redo() {
            if (!this.future.length) return false;
            this.past.push(this.snapshot()); this.restore(this.future.pop()); return true;
        }
        add(definition) {
            const node = { ...definition, id: `n${++this.serial}` };
            this.nodes.push(node); return node.id;
        }
        point(spec) { return spec.id || this.add({ type: 'point', ...spec }); }
        construct(type, first, second) {
            const before = this.snapshot();
            const a = this.point(first), b = this.point(second), values = evaluate(this.nodes);
            if (!values.get(a) || !values.get(b) || distance(values.get(a), values.get(b)) < EPS) {
                this.restore(before); return false;
            }
            const candidate = { type, a, b };
            const ca = values.get(a), cb = values.get(b);
            const duplicate = this.nodes.some(n => {
                if (n.type !== type) return false;
                const c = values.get(n.id);
                if (!c) return false;
                return type === 'circle'
                    ? distance(c.a, ca) < EPS && Math.abs(c.r - distance(ca, cb)) < EPS
                    : sameLine(c, { a: ca, b: cb }, EPS);
            });
            if (duplicate) { this.restore(before); return false; }
            this.add(candidate);
            return this.record(before);
        }
    }
    function sameLine(line, target, tolerance) {
        const d = sub(line.b, line.a), len = Math.hypot(d.x, d.y);
        return len > EPS && [target.a, target.b].every(p => Math.abs(cross(sub(p, line.a), d)) / len < tolerance);
    }
    function targets(level, values, side = 1) {
        const a = values.get('A'), b = values.get('B');
        if (!a || !b || distance(a, b) < 1) return null;
        const d = sub(b, a), normal = { x: -d.y * side, y: d.x * side };
        if (level === 0) {
            const c = add(add(a, d, .5), normal, Math.sqrt(3) / 2);
            return [{ a, b }, { a, b: c }, { a: b, b: c }];
        }
        if (level === 1) {
            const c = add(b, normal), e = add(a, normal);
            return [{ a, b }, { a: b, b: c }, { a: c, b: e }, { a: e, b: a }];
        }
        if (level >= 3 && level <= 5) {
            const c = values.get('C');
            if (!c) return null;
            const ab = distance(a, b), ac = distance(a, c), bc = distance(b, c);
            // A collapsed triangle has no unique internal bisector or altitude.
            if (Math.min(ab, ac, bc) < EPS || Math.abs(cross(sub(b, a), sub(c, a))) < EPS * ab * ac) return null;
            let end;
            if (level === 3) end = add(b, sub(c, b), ab / (ab + ac));
            if (level === 4) end = add(b, sub(c, b), .5);
            if (level === 5) {
                const base = { kind: 'line', a: b, b: c };
                end = at(base, parameter(base, a));
            }
            return [{ a, b: end }];
        }
        if (level !== 2) return null;
        const c = values.get('C'), e = values.get('D');
        if (!c || !e) return null;
        const length = distance(c, e);
        if (length < EPS || length > distance(a, b) + EPS) return null;
        return [{ a, b: add(a, d, length / distance(a, b)) }];
    }
    function matches(board, overrides, side) {
        const values = evaluate(board.nodes, overrides), goal = targets(board.level, values, side);
        if (!goal) return false;
        const tolerance = Math.max(1, distance(values.get('A'), values.get('B'))) * 1e-6;
        const lines = board.nodes.filter(n => n.type === 'line' || n.type === 'segment').map(n => values.get(n.id)).filter(Boolean);
        if (board.level === 2) {
            const end = goal[0].b;
            // A pre-existing baseline is insufficient: actually construct the copied-length point.
            return board.nodes.some(n => n.type === 'point' && n.mode === 'intersection' && values.get(n.id) && distance(values.get(n.id), end) < tolerance);
        }
        return goal.every(g => lines.some(line => sameLine(line, g, tolerance)));
    }
    function solution(board) {
        for (const side of [-1, 1]) {
            if (!matches(board, {}, side)) continue;
            // Test independent movable inputs. Eyeballed shapes fail these checks;
            // valid constructions continue to work when their starting points change.
            let valid = true;
            for (const n of board.nodes.filter(n => n.type === 'point' && n.mode !== 'intersection')) {
                const override = n.mode === 'free' ? { x: n.x + 1.17, y: n.y - .73 } : { t: n.t + .013 };
                if (!matches(board, { [n.id]: override }, side)) { valid = false; break; }
            }
            if (valid) return targets(board.level, evaluate(board.nodes), side);
        }
        return null;
    }
    root.GC4 = { Board, evaluate, intersections, parameter, at, distance, sameLine, solution, targets };
    if (typeof module !== 'undefined') module.exports = root.GC4;
})(globalThis);
