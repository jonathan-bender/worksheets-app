// i18n – Hebrew (default) / English
// Usage: i18n.t('key')  →  translated string in the active language

const i18n = (() => {
    const translations = {
        he: {
            // toolbar
            'Line':   'סרגל',
            'Circle': 'מחוגה',
            'Move':   'הזזה',
            'Undo':   'בטל',
            'Redo':   'חזור',

            // modal fixed strings
            'Level Solved!':    'שלב נפתר!',
            'Image coming soon': 'תמונה בקרוב',
            'Start':             'התחל',
            'Close':             'סגור',
            '← Prev':            '→ הקודם',
            'Next →':            'הבא ←',
            '🎉 Next Level →':   '🎉 לשלב הבא ←',
            '🎉 Continue':       '🎉 המשך',
            '🎉 Level Solved!':  '!🎉 שלב נפתר',
            'Level info':        'פרטים',

            // level counter (use template: levelCounter(idx, total))
            'levelCounter': (idx, total) => `שלב ${idx} מתוך ${total}`,

            // level names and descriptions (keyed by English name)
            'Level 1: Equilateral Triangle':
                'שלב 1: משולש שווה-צלעות',
            'Construct an equilateral triangle on the given segment':
                'בנה משולש שווה-צלעות על הקטע הנתון',

            'Level 2: Square':
                'שלב 2: ריבוע',
            'Construct a square on the given segment':
                'בנה ריבוע על הקטע הנתון',

            'Level 3: Star of David':
                'שלב 3: מגן דוד',
            'Construct a Star of David (hexagram). The six-pointed star is formed by two equilateral triangles built on the given segment.':
                'בנה מגן דוד (כוכב שש-קצוות). הכוכב מורכב משני משולשים שווי-צלעות על הקטע הנתון.',

            'Level 4: Cut a Segment (Euclid III)':
                'שלב 4: חיתוך קטע (אוקלידס, פרק א\' משפט ג\')',
            "Cut from segment AB a piece equal to segment AD. Find point E on AB such that AE = AD. (Euclid's Elements, Book I, Proposition 3.)":
                'גזור מהקטע AB חתיכה השווה לקטע AD. מצא נקודה E על AB כך ש-AE = AD. (יסודות אוקלידס, ספר א\', משפט 3.)',
        },
        en: {}  // English: fall through to original strings
    };

    let lang = 'he';

    function setLang(newLang) {
        lang = newLang;
        document.documentElement.lang = newLang;
        document.documentElement.dir  = newLang === 'he' ? 'rtl' : 'ltr';
        applyTranslations();
    }

    function getLang() { return lang; }

    function t(key) {
        const dict = translations[lang];
        if (!dict) return key;
        return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
    }

    function levelCounter(idx, total) {
        const dict = translations[lang];
        if (dict && dict['levelCounter']) return dict['levelCounter'](idx, total);
        return `Level ${idx} of ${total}`;
    }

    // Update static DOM elements that carry data-i18n attributes
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });
        // Update lang selector to show active language
        const sel = document.getElementById('lang-select');
        if (sel) sel.value = lang;
    }

    return { setLang, getLang, t, levelCounter, applyTranslations };
})();
