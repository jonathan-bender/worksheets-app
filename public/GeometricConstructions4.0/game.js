/* Pointer events are shared by mouse, pen, and touch. No synthetic click path. */
(() => {
    'use strict';
    const G = GC4, $ = id => document.getElementById(id);
    const words = {
        en: {
            brand: 'Geometric Constructions', help: 'How to play', language: 'Language', challenge: 'YOUR CHALLENGE',
            step1: 'Choose a line or a circle.', step2: 'Tap two points to construct it.', step3: 'Use intersections to keep building.',
            restart: 'Start over', license: 'Copyright & license', board: 'CONSTRUCTION BOARD', fit: 'Center',
            solved: 'Beautifully constructed!', solvedDetail: 'Your construction checks out.', next: 'Next challenge',
            line: 'Line', circle: 'Circle', move: 'Move', undo: 'Undo', redo: 'Redo',
            gesture: 'Drag the background to pan · Scroll or pinch with two fingers to zoom',
            welcome: 'A LITTLE SPACE FOR DISCOVERY', helpTitle: 'Two points. So many possibilities.',
            helpLine: 'Line: tap two points. Circle: tap the center, then a point on its edge.',
            helpSnap: 'Points snap to existing points, intersections, and curves. A teal marker shows where your tap will land.',
            helpMove: 'Use Move to drag free points and starting points. Intersection points follow their parent shapes and cannot be dragged independently. If an intersection stops existing, its dependent shapes are temporarily hidden and return when the intersection returns.',
            helpUndo: 'Each completed construction or point drag is one undo step. Switching challenges keeps your work. Center brings your construction back into view.',
            helpGoal: 'Build using relationships between shapes. The game checks that your construction still works when its starting points change. There is no timer or limit on attempts.',
            shortcuts: 'Keyboard: L line · C circle · M move · Ctrl/⌘ Z undo · Shift Z redo · Esc cancel first point.',
            start: 'Let’s construct', resetTitle: 'Start this challenge over?', resetText: 'This challenge’s construction will be cleared. Your other challenges will be kept.', cancel: 'Cancel',
            firstLine: 'Tap the first point of your line.', secondLine: 'Now tap a different point to finish the line.',
            firstCircle: 'Tap the center of your circle.', secondCircle: 'Now tap a point on the circle’s edge.',
            moveHint: 'Drag a point to move it, or drag the background to pan.', duplicate: 'That shape already exists, or the two points coincide.',
            missing: 'Some intersections do not exist here. Move the starting points back to restore them.',
            fixed: 'This intersection follows its parent shapes. Move their defining points instead.',
            saved: 'Work is saved on this device.', level: 'Challenge', complete: 'All six complete!',
            zoomIn: 'Zoom in', zoomOut: 'Zoom out', close: 'Close', tools: 'Drawing tools', canvas: 'Geometry drawing board. Use the line, circle, and move tools.',
            titles: ['Equilateral triangle', 'Square', 'Cut off an equal segment', 'Angle bisector', 'Median of a triangle', 'Altitude of a triangle'],
            descriptions: ['Build a triangle with three equal sides on the given segment.', 'Use the given segment as one side of a square.', 'Cut off a piece AE from the longer segment AB equal to the separate, shorter segment CD. Construct E on AB so that AE = CD. (Euclid, Book I, Proposition 3.)', 'Bisect the marked interior angle BAC: construct a line from A that divides this angle into two equal angles.', 'Construct the median from A to the marked side BC: join A to the midpoint of BC.', 'Construct the altitude from A to the marked side BC: draw a line through A perpendicular to BC. Extend BC if the foot lies outside the side.']
        },
        he: {
            brand: 'בניות גאומטריות', help: 'איך משחקים', language: 'שפה', challenge: 'האתגר שלכם',
            step1: 'בחרו ישר או מעגל.', step2: 'הקישו על שתי נקודות כדי לבנות.', step3: 'השתמשו בנקודות החיתוך להמשך הבנייה.',
            restart: 'התחלה מחדש', license: 'זכויות יוצרים ורישיון', board: 'לוח הבנייה', fit: 'מרכוז',
            solved: 'הצלחתם!', solvedDetail: 'הבנייה שלכם מדויקת.', next: 'האתגר הבא',
            line: 'ישר', circle: 'מעגל', move: 'הזזה', undo: 'ביטול', redo: 'שחזור',
            gesture: 'גררו את הרקע להזזה · גללו או צבטו בשתי אצבעות להגדלה',
            welcome: 'מקום לניסוי ולגילוי', helpTitle: 'שתי נקודות. המון אפשרויות.',
            helpLine: 'ישר: הקישו על שתי נקודות. מעגל: הקישו על המרכז, ואז על נקודה שעל ההיקף.',
            helpSnap: 'נקודות נצמדות לנקודות קיימות, לחיתוכים ולקווים. סימון בצבע טורקיז מראה לאן ההקשה תיצמד.',
            helpMove: 'בכלי ההזזה אפשר לגרור נקודות חופשיות ואת נקודות ההתחלה. נקודות חיתוך נעות עם הבנייה ולא נגררות בנפרד. אם חיתוך מפסיק להתקיים, החלקים התלויים בו מוסתרים זמנית וחוזרים כשהחיתוך חוזר.',
            helpUndo: 'כל בנייה וכל גרירה שהושלמה הן צעד אחד לביטול. מעבר בין האתגרים שומר את העבודה. מרכוז מחזיר את הבנייה לתצוגה.',
            helpGoal: 'בנו בעזרת הקשרים בין הצורות — המשחק בודק שהבנייה נשארת נכונה גם כשנקודות ההתחלה משתנות. אין שעון ואין הגבלת ניסיונות.',
            shortcuts: 'מקלדת: L ישר · C מעגל · M הזזה · Ctrl/⌘ Z ביטול · Shift Z שחזור · Esc ביטול הנקודה הראשונה.',
            start: 'בואו נבנה', resetTitle: 'להתחיל את האתגר מחדש?', resetText: 'הבנייה באתגר הזה תימחק. שאר האתגרים יישמרו.', cancel: 'ביטול',
            firstLine: 'הקישו על הנקודה הראשונה של הישר.', secondLine: 'כעת הקישו על נקודה אחרת להשלמת הישר.',
            firstCircle: 'הקישו על מרכז המעגל.', secondCircle: 'כעת הקישו על נקודה על היקף המעגל.',
            moveHint: 'גררו נקודה להזזה, או גררו את הרקע להזזת הלוח.', duplicate: 'הצורה הזאת כבר קיימת, או ששתי הנקודות באותו מקום.',
            missing: 'חלק מהחיתוכים לא קיימים כאן. הזיזו חזרה את נקודות ההתחלה כדי להחזיר אותם.',
            fixed: 'נקודת החיתוך נעה עם הצורות שלה. הזיזו את הנקודות שמגדירות אותן.',
            saved: 'העבודה נשמרת במכשיר הזה.', level: 'אתגר', complete: 'השלמתם את כל השישה!',
            zoomIn: 'הגדלה', zoomOut: 'הקטנה', close: 'סגירה', tools: 'כלי בנייה', canvas: 'לוח בנייה גאומטרית. השתמשו בכלי הישר, המעגל וההזזה.',
            titles: ['משולש שווה צלעות', 'ריבוע', 'חיתוך קטע שווה לקטע נתון', 'חוצה זווית במשולש', 'תיכון במשולש', 'גובה במשולש'],
            descriptions: ['בנו על הקטע הנתון משולש שכל צלעותיו שוות.', 'השתמשו בקטע הנתון כצלע של ריבוע.', 'חתכו מהקטע הארוך AB קטע AE השווה לקטע הקצר והנפרד CD. בנו נקודה E על AB כך שיתקיים AE = CD. (אוקלידס, ספר א׳, משפט 3.)', 'חצו את הזווית הפנימית המסומנת BAC: בנו ישר היוצא מ־A ומחלק את הזווית לשתי זוויות שוות.', 'בנו תיכון מ־A לצלע המסומנת BC: חברו את A לאמצע BC.', 'בנו גובה מ־A לצלע המסומנת BC: העבירו דרך A ישר המאונך ל־BC. האריכו את BC אם נקודת המפגש נמצאת מחוץ לצלע.']
        }
    };
    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* Private browsing remains playable. */ } }
    };
    let language = store.get('gc4-language') || store.get('math-games-hub-language') || 'he';
    if (!words[language]) language = 'he';
    const t = key => words[language][key];
    // Presentation order is independent of the geometry's stable challenge IDs.
    const levelOrder = [0, 2, 3, 4, 5, 1];
    const boards = levelOrder.map(id => new G.Board(id));
    let level = 0;
    try {
        const saved = JSON.parse(store.get('gc4-work-v3') || store.get('gc4-work-v2') || store.get('gc4-work-v1'));
        if ([1, 2, 3].includes(saved?.version)) {
            saved.boards.forEach((s, i) => {
                // Keep triangle/square work from the old four-level edition;
                // its removed levels cannot be restored into the new challenge.
                if (saved.version === 1 && i >= 2) return;
                const index = saved.version === 3 ? i : levelOrder.indexOf(i);
                if (!boards[index] || !s || !Array.isArray(s.nodes) || !Number.isInteger(s.serial)) return;
                const ids = new Set(s.nodes.map(n => n.id));
                if (ids.size !== s.nodes.length || !ids.has('A') || !ids.has('B')) return;
                // Invalid or old saves should never prevent a fresh game from opening.
                G.evaluate(s.nodes);
                boards[index].restore(s);
            });
            if (Number.isInteger(saved.level) && saved.level >= 0) {
                const index = saved.version === 3 ? saved.level
                    : saved.version === 1 && saved.level >= 2 ? 1 : levelOrder.indexOf(saved.level);
                if (index >= 0 && index < boards.length) level = index;
            }
        }
    } catch (_) { /* Start fresh if local storage is unavailable or malformed. */ }
    let board = boards[level], tool = 'line', pending = null, hover = null, notice = '', goal = null, dismissed = false;
    const canvas = $('board'), ctx = canvas.getContext('2d');
    let width = 1, height = 1, dpr = 1, frame = 0;
    const camera = { x: 0, y: 0, scale: 1 };
    const views = new Map(), pointers = new Map();
    let interaction = null;
    const world = p => ({ x: (p.x - camera.x) / camera.scale, y: (p.y - camera.y) / camera.scale });
    const screen = p => ({ x: p.x * camera.scale + camera.x, y: p.y * camera.scale + camera.y });
    const position = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function save() {
        store.set('gc4-work-v3', JSON.stringify({ version: 3, level, boards: boards.map(b => b.snapshot()) }));
    }
    function queue() { if (!frame) frame = requestAnimationFrame(draw); }
    function resize() {
        const r = canvas.getBoundingClientRect(), oldWidth = width, oldHeight = height;
        width = Math.max(1, r.width); height = Math.max(1, r.height); dpr = Math.min(devicePixelRatio || 1, 3);
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        camera.x += (width - oldWidth) / 2; camera.y += (height - oldHeight) / 2;
        queue();
    }
    function fit() {
        const values = G.evaluate(board.nodes), points = board.nodes.filter(n => n.type === 'point').map(n => values.get(n.id)).filter(Boolean);
        // Include circle extents, so centering also works after drawing a large circle.
        board.nodes.filter(n => n.type === 'circle').forEach(n => {
            const c = values.get(n.id);
            if (c) points.push({ x: c.a.x - c.r, y: c.a.y - c.r }, { x: c.a.x + c.r, y: c.a.y + c.r });
        });
        const xs = points.map(p => p.x), ys = points.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        camera.scale = Math.max(.08, Math.min(1.5, Math.max(80, width - 85) / Math.max(300, maxX - minX), Math.max(60, height - 250) / Math.max(260, maxY - minY)));
        camera.x = width / 2 - (minX + maxX) / 2 * camera.scale;
        camera.y = (height - 75) / 2 - (minY + maxY) / 2 * camera.scale;
        queue();
    }
    function zoom(p, factor) {
        const anchor = world(p), scale = Math.max(.08, Math.min(12, camera.scale * factor));
        camera.scale = scale; camera.x = p.x - anchor.x * scale; camera.y = p.y - anchor.y * scale;
        hover = null; queue();
    }
    function curves(values) { return board.nodes.filter(n => n.type !== 'point' && values.get(n.id)); }
    function candidates(values, near = null, radius = Infinity) {
        const list = curves(values).filter(n => !near || G.distance(G.at(values.get(n.id), G.parameter(values.get(n.id), near)), near) < radius);
        const result = [];
        for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
            G.intersections(values.get(list[i].id), values.get(list[j].id)).forEach((p, branch) => {
                if (p && (!near || G.distance(p, near) < radius)) result.push({ ...p, spec: { mode: 'intersection', a: list[i].id, b: list[j].id, branch } });
            });
        }
        return result;
    }
    function snap(p, touch = false) {
        const values = G.evaluate(board.nodes), radius = (touch ? 24 : 16) / camera.scale;
        const nearest = list => list.map(c => ({ ...c, distance: G.distance(c, p) })).filter(c => c.distance < radius).sort((a, b) => a.distance - b.distance)[0];
        const point = nearest(board.nodes.filter(n => n.type === 'point' && values.get(n.id)).map(n => ({ ...values.get(n.id), spec: { id: n.id } })));
        if (point) return point;
        const intersection = nearest(candidates(values, p, radius));
        if (intersection) return intersection;
        const curve = nearest(curves(values).map(n => {
            const c = values.get(n.id), parameter = G.parameter(c, p);
            return { ...G.at(c, parameter), spec: { mode: 'on', curve: n.id, t: parameter } };
        }));
        return curve || { ...p, spec: { mode: 'free', x: p.x, y: p.y } };
    }
    function pendingPosition(values) {
        if (!pending) return null;
        const spec = pending.spec;
        if (spec.id) return values.get(spec.id);
        if (spec.mode === 'intersection') return G.intersections(values.get(spec.a), values.get(spec.b))[spec.branch];
        if (spec.mode === 'on') { const c = values.get(spec.curve); return c && G.at(c, spec.t); }
        return pending;
    }
    function updateStatus() {
        $('status').textContent = t(notice || (tool === 'move' ? 'moveHint' : pending ? (tool === 'line' ? 'secondLine' : 'secondCircle') : tool === 'line' ? 'firstLine' : 'firstCircle'));
        $('undo').disabled = !pending && !board.past.length;
        $('redo').disabled = !!pending || !board.future.length;
    }
    function changed(persist = true) {
        hover = null;
        const values = G.evaluate(board.nodes);
        notice = board.nodes.some(n => !values.get(n.id)) ? 'missing' : '';
        goal = G.solution(board);
        if (!goal) dismissed = false;
        $('success').hidden = !goal || dismissed;
        $('next').hidden = level === boards.length - 1;
        updateStatus(); queue(); if (persist) save();
    }
    function setTool(value) {
        cancelInteraction(); tool = value; pending = hover = null; notice = '';
        document.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
        canvas.style.cursor = tool === 'move' ? 'grab' : 'crosshair'; updateStatus(); queue();
    }
    function tap(p, touch) {
        notice = '';
        const hit = snap(world(p), touch);
        if (!pending) { pending = hit; hover = null; updateStatus(); queue(); return; }
        const first = pending;
        if (!board.construct(tool, first.spec, hit.spec)) {
            notice = 'duplicate'; updateStatus(); queue(); return;
        }
        pending = null; changed();
    }
    function history(redo) {
        cancelInteraction();
        if (pending) { pending = hover = null; notice = ''; updateStatus(); queue(); return; }
        if (redo ? board.redo() : board.undo()) changed();
    }
    function cancelInteraction() {
        if (interaction?.before) board.restore(interaction.before);
        interaction = null;
        pointers.clear();
    }
    function switchLevel(index) {
        cancelInteraction(); views.set(level, { ...camera });
        level = index; board = boards[level]; pending = hover = null; dismissed = false;
        if (views.has(level)) Object.assign(camera, views.get(level)); else fit();
        refreshText(); changed();
    }
    function refreshText() {
        document.documentElement.lang = language; document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
        document.title = `${t('brand')} 4.0`;
        document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
        $('language').value = language;
        $('level').replaceChildren(...levelOrder.map((id, i) => new Option(`${i + 1}. ${t('titles')[id]}`, i)));
        $('level').value = String(level);
        $('goal-title').textContent = t('titles')[board.level]; $('goal-description').textContent = t('descriptions')[board.level];
        $('level-count').textContent = `${t('level')} ${level + 1} / ${boards.length}`;
        $('zoom-in').ariaLabel = t('zoomIn'); $('zoom-out').ariaLabel = t('zoomOut'); $('close-help').ariaLabel = t('close'); $('dismiss-success').ariaLabel = t('close');
        canvas.ariaLabel = t('canvas'); document.querySelector('.drawing-area').ariaLabel = t('board');
        document.querySelector('.toolbar').ariaLabel = t('tools'); document.querySelector('.brand').ariaLabel = t('brand');
        const pictures = [
            '<path d="M35 123 100 10 165 123Z"/><path class="guide" d="M35 123a65 65 0 0 1 130 0M35 123a130 130 0 0 1 65-113"/>',
            '<path d="M40 20H160V140H40Z"/><path class="guide" d="M40 32h12V20M148 140v-12h12"/>',
            '<path class="guide" d="M22 115H180"/><path d="M42 40h80M22 115h80"/><circle cx="102" cy="115" r="4" fill="#087f72"/><text x="15" y="139">A</text><text x="176" y="139">B</text><text x="38" y="26">C</text><text x="118" y="26">D</text><text x="98" y="139">E</text>',
            '<path class="guide" d="M75 15 20 140H180Z"/><path d="m75 15 18 125"/><path d="M65 38Q76 46 91 35" stroke="#b3832c"/><text x="70" y="8">A</text><text x="8" y="158">B</text><text x="180" y="158">C</text>',
            '<path class="guide" d="M20 140 75 15 180 140"/><path d="M20 140H180" stroke="#b3832c"/><path d="m75 15 25 125M57 135v10M63 135v10M137 135v10M143 135v10"/><text x="70" y="8">A</text><text x="8" y="158">B</text><text x="180" y="158">C</text>',
            '<path class="guide" d="M20 140 75 15 180 140"/><path d="M20 140H180" stroke="#b3832c"/><path d="M75 15V140m0-12h12v12"/><text x="70" y="8">A</text><text x="8" y="158">B</text><text x="180" y="158">C</text>'
        ];
        $('target-picture').innerHTML = `<svg viewBox="0 0 200 168" fill="none" stroke="#087f72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><style>.guide{stroke:#b8c9bb;stroke-dasharray:4 5;stroke-width:1}text{font:12px system-ui;fill:#697b72;stroke:none}</style>${pictures[board.level]}</svg>`;
        updateStatus(); queue();
    }
    function strokeShape(c, color, lineWidth = 1.5, dash = []) {
        if (!c) return;
        const a = screen(c.a), b = screen(c.b);
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.setLineDash(dash);
        if (c.kind === 'circle') {
            const r = c.r * camera.scale;
            if (!Number.isFinite(r) || r > 1e7) return;
            ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
        } else if (c.kind === 'segment') { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        else {
            // Clip infinite lines to the viewport before sending coordinates to Canvas.
            const dx = b.x - a.x, dy = b.y - a.y;
            let lo = -Infinity, hi = Infinity;
            for (const [origin, delta, max] of [[a.x, dx, width], [a.y, dy, height]]) {
                if (Math.abs(delta) < 1e-12) { if (origin < -5 || origin > max + 5) return; }
                else { const u = (-5 - origin) / delta, v = (max + 5 - origin) / delta; lo = Math.max(lo, Math.min(u, v)); hi = Math.min(hi, Math.max(u, v)); }
            }
            if (lo > hi || !Number.isFinite(lo) || !Number.isFinite(hi)) return;
            ctx.moveTo(a.x + dx * lo, a.y + dy * lo); ctx.lineTo(a.x + dx * hi, a.y + dy * hi);
        }
        ctx.stroke(); ctx.setLineDash([]);
    }
    function dot(p, radius, fill, stroke) {
        const s = screen(p);
        if (s.x < -30 || s.y < -30 || s.x > width + 30 || s.y > height + 30) return;
        ctx.beginPath(); ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    function draw() {
        frame = 0; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
        // Screen grid follows the camera, without becoming part of the geometry.
        const grid = 32 * 2 ** Math.floor(Math.log2(camera.scale));
        const spacing = grid < 20 ? grid * Math.ceil(20 / grid) : grid;
        ctx.fillStyle = '#dfe5dc';
        for (let x = ((camera.x % spacing) + spacing) % spacing; x < width; x += spacing)
            for (let y = ((camera.y % spacing) + spacing) % spacing; y < height; y += spacing) ctx.fillRect(x, y, 1, 1);
        const values = G.evaluate(board.nodes);
        curves(values).forEach(n => {
            const c = values.get(n.id);
            strokeShape(c, n.target ? '#b3832c' : n.given ? '#324c41' : n.type === 'line' ? '#b9c9bf' : '#9aafa3', n.target ? 3 : n.given ? 2.5 : 1.4);
            if (n.type === 'line') strokeShape({ ...c, kind: 'segment' }, '#78988a', 1.8);
        });
        if (board.level === 3 && values.get('A') && values.get('B') && values.get('C')) {
            const a = screen(values.get('A')), b = screen(values.get('B')), c = screen(values.get('C'));
            const startAngle = Math.atan2(b.y - a.y, b.x - a.x);
            let delta = Math.atan2(c.y - a.y, c.x - a.x) - startAngle;
            delta = Math.atan2(Math.sin(delta), Math.cos(delta));
            ctx.beginPath(); ctx.arc(a.x, a.y, 26, startAngle, startAngle + delta, delta < 0);
            ctx.strokeStyle = '#b3832c'; ctx.lineWidth = 2; ctx.stroke();
        }
        // Show nearby, as-yet unused intersections without adding objects/history.
        if (hover && tool !== 'move') {
            candidates(values, hover, 65 / camera.scale).forEach(p => dot(p, 3, '#fffefa', '#a8beb1'));
        }
        if (goal) goal.forEach(g => strokeShape({ ...g, kind: 'segment' }, '#087f72', 3));
        board.nodes.filter(n => n.type === 'point').forEach(n => {
            const p = values.get(n.id); if (!p) return;
            dot(p, n.given ? 5 : 4, n.mode === 'intersection' ? '#fffefa' : tool === 'move' ? '#dca365' : '#fffefa', n.target ? '#b3832c' : n.given ? '#203832' : '#668b79');
            if (n.label || (board.level === 2 && goal && G.distance(p, goal[0].b) < 1e-6)) {
                const s = screen(p); ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#324c41'; ctx.fillText(n.label || 'E', s.x, s.y + (board.level >= 3 && n.id === 'A' ? -14 : 23));
            }
        });
        const start = pendingPosition(values);
        if (start) {
            dot(start, 7, '#087f7226', '#087f72');
            if (hover && G.distance(start, hover) > 1e-9) strokeShape({ kind: tool, a: start, b: hover, r: G.distance(start, hover) }, '#087f72', 1.7, [5, 5]);
        }
        if (hover && tool !== 'move') dot(hover, 6, '#e5f2ed', '#087f72');
    }
    canvas.addEventListener('pointerdown', e => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.preventDefault(); canvas.focus({ preventScroll: true });
        const p = position(e); pointers.set(e.pointerId, p); canvas.setPointerCapture(e.pointerId);
        if (pointers.size >= 2) {
            // Roll back an in-progress point drag before a two-finger camera gesture.
            if (interaction?.before) board.restore(interaction.before);
            interaction = { type: 'multi' }; hover = null; queue(); return;
        }
        const hit = snap(world(p), e.pointerType !== 'mouse'), n = board.nodes.find(n => n.id === hit.spec.id);
        interaction = { type: 'single', id: e.pointerId, start: p, last: p, moved: false, camera: { ...camera }, touch: e.pointerType !== 'mouse' };
        if (tool === 'move' && n?.type === 'point' && n.mode !== 'intersection') {
            interaction.node = n.id; interaction.before = board.snapshot();
            interaction.offset = { x: hit.x - world(p).x, y: hit.y - world(p).y };
        } else if (tool === 'move' && n?.mode === 'intersection') notice = 'fixed';
        updateStatus();
    });
    canvas.addEventListener('pointermove', e => {
        const p = position(e);
        if (!pointers.has(e.pointerId)) {
            if (e.pointerType === 'mouse') { hover = snap(world(p)); queue(); }
            return;
        }
        const previous = new Map(pointers); pointers.set(e.pointerId, p);
        if (interaction?.type === 'multi') {
            if (pointers.size < 2) return; // Ignore the remaining finger until all are lifted.
            const ids = [...pointers.keys()].slice(0, 2), [a, b] = ids.map(id => pointers.get(id)), [oldA, oldB] = ids.map(id => previous.get(id));
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, oldMid = { x: (oldA.x + oldB.x) / 2, y: (oldA.y + oldB.y) / 2 };
            const oldDistance = G.distance(oldA, oldB);
            if (oldDistance > 2) zoom(oldMid, G.distance(a, b) / oldDistance);
            camera.x += mid.x - oldMid.x; camera.y += mid.y - oldMid.y; queue(); return;
        }
        if (!interaction || e.pointerId !== interaction.id) return;
        const s = interaction;
        if (G.distance(p, s.start) > (s.touch ? 8 : 4)) s.moved = true;
        if (!s.moved) return;
        if (s.node) {
            const n = board.nodes.find(n => n.id === s.node), target = world(p);
            target.x += s.offset.x; target.y += s.offset.y;
            if (n.mode === 'free') { n.x = target.x; n.y = target.y; }
            else { const c = G.evaluate(board.nodes).get(n.curve); if (c) n.t = G.parameter(c, target); }
            goal = null; $('success').hidden = true;
        } else {
            camera.x = s.camera.x + p.x - s.start.x; camera.y = s.camera.y + p.y - s.start.y;
        }
        hover = null; s.last = p; queue();
    });
    function finish(e, cancelled = false) {
        if (!pointers.has(e.pointerId)) return;
        const s = interaction; pointers.delete(e.pointerId);
        if (s?.type === 'multi') { if (!pointers.size) { interaction = null; changed(false); } return; }
        if (!s || s.id !== e.pointerId) return;
        interaction = null;
        if (cancelled) {
            if (s.before) board.restore(s.before);
            Object.assign(camera, s.camera); changed(false); return;
        }
        if (s.node && s.moved) { board.record(s.before); changed(); }
        else if (!s.moved && tool !== 'move') tap(position(e), s.touch);
        else { if (s.before) board.restore(s.before); changed(false); }
    }
    canvas.addEventListener('pointerup', e => finish(e));
    canvas.addEventListener('pointercancel', e => finish(e, true));
    canvas.addEventListener('lostpointercapture', e => finish(e, true));
    canvas.addEventListener('pointerleave', () => { if (!pointers.size) { hover = null; queue(); } });
    canvas.addEventListener('wheel', e => {
        e.preventDefault(); if (pointers.size) return;
        zoom(position(e), Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * .002));
    }, { passive: false });
    document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    $('undo').onclick = () => history(false); $('redo').onclick = () => history(true);
    $('fit').onclick = fit; $('zoom-in').onclick = () => zoom({ x: width / 2, y: height / 2 }, 1.25); $('zoom-out').onclick = () => zoom({ x: width / 2, y: height / 2 }, .8);
    $('level').onchange = e => switchLevel(Number(e.target.value));
    $('language').onchange = e => { cancelInteraction(); language = e.target.value; store.set('gc4-language', language); refreshText(); changed(false); };
    $('next').onclick = () => { if (level < boards.length - 1) switchLevel(level + 1); };
    $('dismiss-success').onclick = () => { dismissed = true; $('success').hidden = true; };
    $('help').onclick = () => { cancelInteraction(); changed(false); $('help-dialog').showModal(); };
    $('close-help').onclick = $('start').onclick = () => $('help-dialog').close();
    $('restart').onclick = () => { cancelInteraction(); changed(false); $('restart-dialog').showModal(); };
    $('cancel-reset').onclick = () => $('restart-dialog').close();
    $('confirm-reset').onclick = () => { board = boards[level] = new G.Board(levelOrder[level]); pending = hover = null; $('restart-dialog').close(); fit(); changed(); };
    window.addEventListener('keydown', e => {
        if (document.querySelector('dialog[open]') || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        const key = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && (key === 'z' || key === 'y')) { e.preventDefault(); history(key === 'y' || e.shiftKey); }
        else if (!e.ctrlKey && !e.metaKey && !e.altKey && ['l', 'c', 'm'].includes(key)) { e.preventDefault(); setTool({ l: 'line', c: 'circle', m: 'move' }[key]); }
        else if (key === 'escape') { cancelInteraction(); pending = hover = null; changed(false); }
    });
    window.addEventListener('blur', () => { cancelInteraction(); changed(false); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelInteraction(); save(); } });
    new ResizeObserver(resize).observe(canvas);
    resize(); fit(); refreshText(); changed(false);
})();
