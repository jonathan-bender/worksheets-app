(() => {
    'use strict';
    const translations = {
        he: {
            brand: 'מתמטיקה במשחק', title: 'מתמטיקה במשחק — בחרו משחק והתחילו לגלות',
            language: 'שפה', skip: 'דלגו למשחקים', eyebrow: 'תנו לסקרנות לשחק',
            headline1: 'משחקים קצת.', headline2: 'מגלים המון.',
            subtitle: 'בחרו משחק. תנו לסקרנות להוביל.', letsPlay: 'בואו נשחק',
            featured: 'בא לכם אתגר?', playNow: 'שחקו עכשיו', allGames: 'כל המשחקים',
            all: 'הכול', algebra: 'אלגברה', geometry: 'גאומטריה', functions: 'פונקציות', trigonometry: 'טריגונומטריה', patterns: 'חוקיות',
            search: 'חיפוש משחק', searchPlaceholder: 'מצאו משחק...', filterLabel: 'סינון לפי נושא', gameLinks: 'קישורים למשחקים',
            noResults: 'לא מצאנו משחק כזה.', resetFilters: 'הציגו את כל המשחקים',
            footerNote: 'עוד משחק. עוד גילוי.', license: 'רישיון ותנאי שימוש',
            pelicanTitle: 'השקנאי המתמטי', equationsTitle: 'מגדלי משוואות', anglesTitle: 'אלוף הזוויות',
            circleTitle: 'מסע במעגל היחידה', patternsTitle: 'זיהוי חוקיות',
            geometryTitle: 'בניות גאומטריות', geometry3Title: 'בניות גאומטריות 3.0', geometry4Title: 'בניות גאומטריות 4.0',
            preTitle: 'מבוא לחקירת פונקציות', advancedTitle: 'חקירת פונקציות מתקדמת',
            identitiesTitle: 'התאמת זהויות', solverTitle: 'פתרון משוואות טריגו', transformations: 'טרנספורמציות של פונקציות',
            results: count => `${count} משחקים מוצגים`
        },
        en: {
            brand: 'MATH PLAY', title: 'Math Play — pick a game, discover something new',
            language: 'Language', skip: 'Skip to games', eyebrow: 'LET CURIOSITY PLAY',
            headline1: 'Small challenges.', headline2: 'Big discoveries.',
            subtitle: 'Pick a game. Follow your curiosity.', letsPlay: 'Let’s play',
            featured: 'UP FOR A CHALLENGE?', playNow: 'Play now', allGames: 'All games',
            all: 'All', algebra: 'Algebra', geometry: 'Geometry', functions: 'Functions', trigonometry: 'Trigonometry', patterns: 'Patterns',
            search: 'Search games', searchPlaceholder: 'Find a game...', filterLabel: 'Filter by subject', gameLinks: 'Game links',
            noResults: 'No games found. Try another search.', resetFilters: 'Show all games',
            footerNote: 'A little play. A new discovery.', license: 'License & terms',
            pelicanTitle: 'Math Pelican', equationsTitle: 'Equation Towers', anglesTitle: 'Angle Master',
            circleTitle: 'Unit Circle Quest', patternsTitle: 'Pattern Quest',
            geometryTitle: 'Geometric Constructions', geometry3Title: 'Geometric Constructions 3.0', geometry4Title: 'Geometric Constructions 4.0',
            preTitle: 'Pre-Function Analysis', advancedTitle: 'Advanced Function Analysis',
            identitiesTitle: 'Identity Match', solverTitle: 'Trig Equation Solver', transformations: 'Function Transformations',
            results: count => `${count} ${count === 1 ? 'game' : 'games'} shown`
        }
    };
    const selector = document.getElementById('language-select');
    const search = document.getElementById('game-search');
    const cards = [...document.querySelectorAll('.game-card')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    let language = 'he', category = 'all';
    const normalize = value => value.normalize('NFKD').replace(/[\u0591-\u05c7]/g, '').toLocaleLowerCase().trim();

    function filterGames() {
        const query = normalize(search.value);
        let count = 0;
        cards.forEach(card => {
            // Search both names, regardless of the currently selected language.
            const haystack = Object.values(translations).map(t => `${t[card.dataset.titleKey]} ${t[card.dataset.category]}`).join(' ');
            const visible = (category === 'all' || card.dataset.category === category) && normalize(haystack).includes(query);
            card.hidden = !visible;
            if (visible) count++;
        });
        document.getElementById('game-count').textContent = count;
        document.getElementById('empty-state').hidden = count > 0;
        document.getElementById('results-status').textContent = translations[language].results(count);
    }
    function applyLanguage(value) {
        language = value === 'en' ? 'en' : 'he';
        const t = translations[language];
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
        document.title = t.title;
        document.querySelector('meta[name="description"]').content = t.subtitle;
        selector.value = language;
        document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t[element.dataset.i18n]; });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => { element.setAttribute('aria-label', t[element.dataset.i18nAriaLabel]); });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.placeholder = t[element.dataset.i18nPlaceholder]; });
        filterGames();
    }
    filters.forEach(button => button.addEventListener('click', () => {
        category = button.dataset.filter;
        filters.forEach(filter => {
            const active = filter === button;
            filter.classList.toggle('active', active);
            filter.setAttribute('aria-pressed', String(active));
        });
        filterGames();
    }));
    search.addEventListener('input', filterGames);
    document.getElementById('clear-search').addEventListener('click', () => {
        search.value = '';
        filters[0].click();
        search.focus();
    });
    const storageKey = 'math-games-hub-language';
    let savedLanguage = 'he';
    try { savedLanguage = localStorage.getItem(storageKey) || 'he'; } catch (_) {}
    applyLanguage(savedLanguage);
    document.documentElement.classList.add('js');
    selector.addEventListener('change', () => {
        applyLanguage(selector.value);
        try { localStorage.setItem(storageKey, language); } catch (_) {}
    });
})();
