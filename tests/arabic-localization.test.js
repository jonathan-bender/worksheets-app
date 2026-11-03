/* Run from the repository root: node tests/arabic-localization.test.js */
(() => {
    'use strict';
    const read = typeof require === 'function'
        ? path => require('node:fs').readFileSync(path, 'utf8')
        : path => globalThis.localizationSources[path];
    const results = [];
    const assert = (value, message) => { if (!value) throw new Error(message); };
    const test = (name, fn) => {
        try { fn(); results.push({ name, pass: true }); }
        catch (error) { results.push({ name, pass: false, error: error.message }); }
    };
    const equal = (a, b, message) => assert(JSON.stringify(a) === JSON.stringify(b), message);
    const arabic = text => /[\u0600-\u06ff]/.test(text);
    const formulas = text => [...text.matchAll(/\$([^$]+)\$/g)].map(m => m[1]);
    const games = [
        ['Pre-function analysis', 'public/FunctionAnalysis/pre_function_analysis_game.html', 'i18n', '    let currentLang'],
        ['Advanced function analysis', 'public/FunctionAnalysis/advanced_function_analysis_game.html', 'dict', '    let currentLang'],
        ['Unit Circle Quest', 'public/UnitCircle/unit_circle_quest-2.html', 'i18n', '    // Exact Values Dictionary']
    ];
    for (const [name, path, dictionary, end] of games) {
        test(`${name}: complete Arabic dictionary and selector`, () => {
            const html = read(path);
            const source = html.slice(html.indexOf(`const ${dictionary} =`), html.indexOf(end));
            const dict = Function(`${source}; return ${dictionary};`)();
            equal(Object.keys(dict.ar).sort(), Object.keys(dict.en).sort(), 'Missing or extra translation keys');
            for (const key of Object.keys(dict.en)) {
                equal(typeof dict.ar[key], typeof dict.en[key], `Incorrect type: ${key}`);
                const value = typeof dict.ar[key] === 'function' ? dict.ar[key](2, 8) : dict.ar[key];
                assert(arabic(value), `Untranslated Arabic value: ${key}`);
            }
            assert(/<option value="ar"/.test(html), 'Missing language option');
            assert(html.includes('class="notice-ar"'), 'Missing Arabic copyright notice');
        });
    }
    const html = read('public/Trigo/trig_solver_game.html');
    const data = {};
    Function('window', read('public/Trigo/trig_solver_ar.js'))(data);
    const source = html.slice(html.indexOf('const TRANSLATIONS ='), html.indexOf('// --- STREAMING_CHUNK:KaTeX Math Parser'));
    const { TRANSLATIONS, LEVELS_EN, LEVELS_AR } = Function('window', `${source}; return { TRANSLATIONS, LEVELS_EN, LEVELS_AR };`)(data);
    test('Trig solver: complete Arabic controls', () => {
        equal(Object.keys(TRANSLATIONS.ar).sort(), Object.keys(TRANSLATIONS.en).sort(), 'Missing UI translation keys');
        for (const text of Object.values(TRANSLATIONS.ar)) assert(arabic(text), `Untranslated control: ${text}`);
        assert(html.includes('<option value="ar"'), 'Missing language option');
    });
    test('Trig solver: every lesson step translated with original answer keys and math', () => {
        equal(LEVELS_AR.length, LEVELS_EN.length, 'Incorrect level count');
        equal(data.TrigSolverArabic.levels.length, LEVELS_EN.length, 'Incorrect overlay count');
        LEVELS_EN.forEach((level, i) => {
            equal(data.TrigSolverArabic.levels[i].length, level.steps.length, `Incorrect overlay step count at level ${i + 1}`);
            level.steps.forEach((step, j) => {
                const ar = LEVELS_AR[i].steps[j], label = `Level ${i + 1}, step ${j + 1}`;
                for (const key of ['type', 'qType', 'answer']) equal(ar[key], step[key], `${label}: changed ${key}`);
                for (const key of ['text', 'label', 'explanation']) {
                    if (!step[key]) continue;
                    assert(arabic(ar[key]), `${label}: untranslated ${key}`);
                    equal(formulas(ar[key]), formulas(step[key]), `${label}: changed inline math in ${key}`);
                }
                if (step.options) {
                    equal(ar.options.length, step.options.length, `${label}: changed option count`);
                    step.options.forEach((option, k) => {
                        equal(formulas(ar.options[k]), formulas(option), `${label}: changed option formula`);
                        if (/[A-Za-z]{2}/.test(option.replace(/\$[^$]+\$/g, ''))) {
                            assert(arabic(ar.options[k]), `${label}: untranslated option`);
                        }
                    });
                }
                if (step.equation) equal(
                    ar.equation.replace(/\\text\{[^}]*\}/g, ''),
                    step.equation.replace(/\\text\{[^}]*\}/g, ''), `${label}: changed equation`
                );
            });
        });
    });
    globalThis.arabicLocalizationResults = results;
    if (typeof console !== 'undefined') console.log(JSON.stringify(results, null, 2));
    if (typeof process !== 'undefined' && results.some(r => !r.pass)) process.exitCode = 1;
})();
