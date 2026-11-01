(() => {
    'use strict';
    const translations = {
    "he": {
        "language": "שפה",
        "gameLinks": "קישורים למשחקים",
        "activityLinks": "פעילויות נוספות",
        "eyebrow": "לומדים ומשחקים",
        "title": "פעילויות אינטראקטיביות ללימוד מתמטיקה",
        "subtitle": "בחרו אתגר וצאו לפעילות מתמטית חדשה. כאן תמצאו משחקים באלגברה, בגאומטריה, בטריגונומטריה, בטרנספורמציות ובחקירת פונקציות.",
        "games": "משחקים",
        "algebra": "אלגברה",
        "equationsTitle": "מגדלי משוואות",
        "equationsDesc": "בנו משוואות והתקדמו שלב אחר שלב באתגרי אלגברה.",
        "pelicanTitle": "השקנאי המתמטי",
        "pelicanDesc": "עזרו לשקנאי לתפוס את התשובות הנכונות במשחק של מספרים מכוונים.",
        "functions": "פונקציות",
        "preTitle": "מבוא לחקירת פונקציות",
        "preDesc": "גלו תכונות וקשרים של פונקציות, צעד אחר צעד.",
        "advancedTitle": "חקירת פונקציות מתקדמת",
        "advancedDesc": "העמיקו בחקירת פונקציות והתמודדו עם אתגרי חשיבה מתקדמים.",
        "geometry": "גאומטריה",
        "geometryTitle": "בניות גאומטריות",
        "geometryDesc": "צרו צורות גאומטריות בעזרת ישרים, מעגלים וכלי בנייה.",
        "geometry3Title": "בניות גאומטריות 3.0",
        "geometry3Desc": "התנסו בגרסה משופרת של פעילות הבניות הגאומטריות.",
        "trigonometry": "טריגונומטריה",
        "identitiesTitle": "התאמת זהויות טריגונומטריות",
        "identitiesDesc": "התאימו זהויות טריגונומטריות וחדדו את החשיבה האלגברית.",
        "solverTitle": "פתרון ביטויים טריגונומטריים",
        "solverDesc": "תרגלו פתרון ביטויים טריגונומטריים באמצעות אתגר משחקי.",
        "circle": "מעגל היחידה",
        "circleTitle": "מסע במעגל היחידה",
        "circleDesc": "חקרו את מעגל היחידה וחזקו את הבנת הזוויות והקואורדינטות.",
        "patterns": "חוקיות",
        "patternsTitle": "זיהוי חוקיות",
        "patternsDesc": "זהו והמשיכו דפוסים מספריים וגאומטריים.",
        "activities": "פעילויות לימוד נוספות",
        "transformations": "טרנספורמציות של פונקציות",
        "worksheet": "פתיחת דף העבודה",
        "licenseTitle": "שימוש חופשי למטרות לא מסחריות",
        "licenseSummary": "אפשר להשתמש, להעתיק, לשנות ולשתף את האפליקציה והקוד למטרות המותרות ברישיון. הרישיון מתיר במפורש שימוש על ידי מוסדות חינוך; שימוש מסחרי מעבר למותר בו דורש אישור נפרד.",
        "licenseNotices": "בשיתוף עותקים יש לשמור את הודעת זכויות היוצרים ולצרף את הרישיון או קישור אליו.",
        "licenseDetails": "הסבר על זכויות יוצרים ותנאי השימוש",
        "licenseFull": "לרישיון המלא (באנגלית)"
    },
    "en": {
        "language": "Language",
        "gameLinks": "Game links",
        "activityLinks": "Other activities",
        "eyebrow": "Learning Arcade",
        "title": "Math Games Hub",
        "subtitle": "Choose a challenge and jump into a new math activity. These games cover algebra, geometry, trigonometry, transformations, and function analysis.",
        "games": "Games",
        "algebra": "Algebra",
        "equationsTitle": "Equation Towers",
        "equationsDesc": "Build equations and stack your way through engaging algebra challenges.",
        "pelicanTitle": "Math Pelican",
        "pelicanDesc": "Help the pelican catch the right answers in this fun algebra game.",
        "functions": "Functions",
        "preTitle": "Pre-Function Analysis",
        "preDesc": "Begin exploring function patterns and relationships step by step.",
        "advancedTitle": "Advanced Function Analysis",
        "advancedDesc": "Take on deeper function analysis with a more advanced reasoning challenge.",
        "geometry": "Geometry",
        "geometryTitle": "Geometric Constructions",
        "geometryDesc": "Create geometric figures using lines, circles, and construction tools.",
        "geometry3Title": "Geometric Constructions 3.0",
        "geometry3Desc": "Explore a more polished version of the geometry construction activity.",
        "trigonometry": "Trigonometry",
        "identitiesTitle": "Trig Identities Matcher",
        "identitiesDesc": "Match trigonometric identities and sharpen your algebraic reasoning.",
        "solverTitle": "Trig Solver Game",
        "solverDesc": "Practice solving trig expressions through a game-based challenge.",
        "circle": "Circle",
        "circleTitle": "Unit Circle Quest",
        "circleDesc": "Use the unit circle to strengthen angle and coordinate understanding.",
        "patterns": "Patterns",
        "patternsTitle": "Pattern Recognition",
        "patternsDesc": "Identify and extend numerical and geometric patterns.",
        "activities": "Other Learning Activities",
        "transformations": "Function Transformations",
        "worksheet": "Open worksheet",
        "licenseTitle": "Free to use for noncommercial purposes",
        "licenseSummary": "You may use, copy, modify, and share the app and code for purposes allowed by the license. Educational institutions are explicitly permitted; commercial use beyond the permitted purposes requires separate permission.",
        "licenseNotices": "When sharing copies, preserve the required copyright notice and include the license or its URL.",
        "licenseDetails": "Copyright and usage explained",
        "licenseFull": "Read the full license (English)"
    }
};
    const storageKey = 'math-games-hub-language';
    const selector = document.getElementById('language-select');

    function applyLanguage(value) {
        const language = value === 'en' ? 'en' : 'he';
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
        document.title = translations[language].title;
        selector.value = language;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = translations[language][element.dataset.i18n];
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            element.setAttribute('aria-label', translations[language][element.dataset.i18nAriaLabel]);
        });
    }

    // Storage may be unavailable in private browsing or when opening local files.
    let savedLanguage = 'he';
    try { savedLanguage = localStorage.getItem(storageKey) || 'he'; } catch (_) {}
    applyLanguage(savedLanguage);
    selector.addEventListener('change', () => {
        applyLanguage(selector.value);
        try { localStorage.setItem(storageKey, selector.value); } catch (_) {}
    });
})();
