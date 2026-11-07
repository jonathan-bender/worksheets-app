/* Run from the repository root: node tests/pelican-numbers.test.js */
(() => {
    'use strict';
    const html = typeof require === 'function'
        ? require('node:fs').readFileSync('public/NegativeNumbers/math_pelican.html', 'utf8')
        : globalThis.pelicanGameSource;
    const slice = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
    const config = slice('    const GAME_CONFIG =', '    const canvas =');
    const boxes = slice('    class MathBox {', '    class Food {');
    const generators = slice('    function getRandInRange(', '    function spawnFood()');
    const collisions = slice('    function checkCollisions()', '    function cleanupEntities()');
    let seed = 123456789;
    const math = Object.create(Math);
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    math.random = random;
    const player = { x: 150, elevation: 0, targetElevation: 0, radius: 20 };
    const state = {}, entities = { boxes: [], food: [], special: null };
    const api = Function('Math', 'canvas', 'player', 'state', 'entities', `
        ${config}
        const mapElevationToY = elevation => -elevation * 10;
        const createExplosion = () => {}, spawnFloatingText = () => {}, triggerLevelUp = () => {};
        ${boxes}
        ${generators}
        ${collisions}
        return { GAME_CONFIG, formatMath, chooseBoxSign, getBundleParts, spawnBoxPattern, checkCollisions };
    `)(math, { width: 800 }, player, state, entities);
    const results = [];
    const assert = (value, message = 'Assertion failed') => { if (!value) throw Error(message); };
    const test = (name, run) => {
        try { math.random = random; run(); results.push({ name, pass: true }); }
        catch (error) { results.push({ name, pass: false, error: error.message }); }
        finally { math.random = random; }
    };
    const evaluate = text => {
        assert(/^[\d()+\-\s×]+$/.test(text), `Unexpected expression: ${text}`);
        return Function(`return (${text.replace(/×/g, '*')});`)();
    };
    const spawn = level => {
        state.config = level; entities.boxes = []; api.spawnBoxPattern(); return entities.boxes;
    };
    test('Parenthesized notation covers all four explicit sign forms with correct values', () => {
        const seen = new Set();
        for (const value of [-70, -5, 0, 2, 30, 120]) for (const roll of [.1, .9]) {
            math.random = () => roll;
            const text = api.formatMath(value, 'all');
            assert(/^[+-]\([+-]\d+\)$/.test(text), text);
            assert(evaluate(text) === value, text);
            if (value) seen.add(text.replace(/\d+/g, 'n'));
        }
        assert(seen.size === 4, 'Some sign forms are missing');
        assert(api.formatMath(5, false) === '+5' && api.formatMath(-5, false) === '-5');
    });
    test('Level progression introduces signed forms, then colored bundles, then gray bundles', () => {
        const levels = api.GAME_CONFIG.levels;
        assert(levels.every((l, i) => l.level === i + 1));
        assert(levels[2].math.type === 'single' && levels[2].math.parenthesis === 'all' && !levels[2].math.color);
        assert(levels[4].targetCreature.name === 'Kraken' && levels[4].math.type === 'bundle' && levels[4].math.color);
        assert(levels[5].targetCreature.name === 'Cloud Ray' && levels[5].math.type === 'bundle' && !levels[5].math.color && levels[5].math.parenthesis === 'all');
        assert(JSON.stringify(levels[5].math.bundleSize) === '[2,3]');
        assert(JSON.stringify(levels[5].math.valRange) === '[60,120]');
    });
    test('Helpful probability has the correct 25% boundary and reverses across the target', () => {
        for (const roll of [0, .249999, .25, .99999]) {
            math.random = () => roll;
            const helpful = roll < .25;
            assert(api.chooseBoxSign(100, 0) === (helpful ? 1 : -1));
            assert(api.chooseBoxSign(100, 200) === (helpful ? -1 : 1));
        }
    });
    test('Every level has roughly one helpful spawn to three opposing spawns, in either direction', () => {
        for (const level of api.GAME_CONFIG.levels) for (const direction of [-1, 1]) {
            player.elevation = level.targetCreature.elevation - direction * 100;
            let helpful = 0;
            for (let i = 0; i < 1000; i++) {
                const batch = spawn(level), total = batch.reduce((sum, box) => sum + box.actualValue, 0);
                assert(total !== 0);
                if (Math.sign(total) === direction) helpful++;
            }
            assert(helpful > 190 && helpful < 310, `Level ${level.level}, direction ${direction}: ${helpful}/1000 helpful`);
        }
    });
    test('At the exact target elevation, both directions remain equally likely', () => {
        let positive = 0;
        for (let i = 0; i < 4000; i++) if (api.chooseBoxSign(50, 50) > 0) positive++;
        assert(positive > 1840 && positive < 2160, `${positive}/4000 positive`);
    });
    test('Displayed single, bundle, multiplication and complex expressions match actual values', () => {
        for (const level of api.GAME_CONFIG.levels) {
            player.elevation = 0;
            for (let i = 0; i < 150; i++) {
                const batch = spawn(level);
                for (const box of batch) {
                    assert(evaluate(box.displayText) === box.actualValue, `Level ${level.level}: ${box.displayText}`);
                    assert(box.hasColor === level.math.color);
                    if (level.math.type === 'single' && level.math.parenthesis || level.math.type === 'bundle' && level.math.parenthesis) {
                        assert(/^[+-]\([+-]\d+\)$/.test(box.displayText), box.displayText);
                    }
                }
                if (level.math.type !== 'multiplication') {
                    const magnitude = Math.abs(batch.reduce((sum, box) => sum + box.actualValue, 0));
                    assert(magnitude >= level.math.valRange[0] && magnitude <= level.math.valRange[1]);
                }
            }
        }
    });
    test('Connected boxes fit their text, touch edge-to-edge, and apply the total exactly once', () => {
        for (const level of api.GAME_CONFIG.levels.filter(l => l.math.type === 'bundle')) for (let i = 0; i < 50; i++) {
            player.elevation = 0; player.targetElevation = 123;
            const batch = spawn(level), total = batch.reduce((sum, box) => sum + box.actualValue, 0);
            assert(batch.length >= level.math.bundleSize[0] && batch.length <= level.math.bundleSize[1]);
            batch.forEach((box, i) => {
                assert(box.siblings === batch || box.siblings.every((b, j) => b === batch[j]));
                assert(box.width >= box.text.length * 15 + 10);
                if (i) assert(Math.abs(box.x - box.width / 2 - (batch[i - 1].x + batch[i - 1].width / 2)) < 1e-8);
            });
            // Only one member touches the pelican; all connected values apply.
            batch[0].x = player.x; batch[0].elevation = 0;
            api.checkCollisions();
            assert(player.targetElevation === 123 + total && batch.every(box => !box.active));
            api.checkCollisions(); assert(player.targetElevation === 123 + total);
        }
    });
    globalThis.pelicanNumberResults = results;
    if (typeof console !== 'undefined') console.log(JSON.stringify(results, null, 2));
    if (typeof process !== 'undefined' && results.some(r => !r.pass)) process.exitCode = 1;
})();
