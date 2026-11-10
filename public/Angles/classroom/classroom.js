/* Angle Crew: no accounts. Room and participant capabilities are temporary. */
'use strict';
const $ = id => document.getElementById(id);
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = {
 brand:['צוות הזוויות','Angle Crew'],solo:['משחק אישי ↗','Solo game ↗'],license:['רישיון ותנאי שימוש','License & terms'],
 headline:['בונים דרך. ביחד.','Build a road. Together.'],intro:['מתקנים כבישים עם זוויות — וכל כוכב מקדם את הכיתה!','Repair roads with angles. Every star moves the class forward!'],
 joinTitle:['מצטרפים לצוות','Join the crew'],createTitle:['פותחים משחק לכיתה','Host a class'],code:['קוד המשחק','Game code'],name:['השם שלך','Your name'],emoji:['בוחרים דמות','Choose an emoji'],color:['בוחרים צבע','Choose a color'],join:['יאללה, מצטרפים!','Let’s join!'],create:['יצירת משחק','Create game'],goal:['יעד הכוכבים','Star goal'],auto:['אוטומטי · 3 כוכבים לתלמיד/ה','Automatic · 3 stars per student'],testMode:['חדר ניסוי עם תלמידים מדומים','Test room with simulated students'],noAccount:['בלי חשבון ובלי סיסמה. פשוט מצטרפים.','No account or password. Just join.'],hostNote:['פתיחת המשחק יוצרת קישור ניהול פרטי. שמרו אותו כדי לחזור לעמדת המורה.','Creating a game gives you a private host link. Keep it to return to the teacher screen.'],
 lobby:['מחכים להתחלה','Waiting to start'],running:['המשחק פעיל','Playing'],paused:['הפסקה','Paused'],ended:['המשחק הסתיים','Game ended'],
 classMission:['המשימה הכיתתית','Class mission'],missionTitle:['סוללים את הדרך!','Let’s pave the way!'],goalDone:['הגענו ליעד! 🎉','We reached our goal! 🎉'],keepGoing:['אפשר להמשיך לאסוף כוכבים','Keep collecting stars together'],
 players:['הצוות שלנו','Our crew'],students:['תלמידים','students'],emptyRoster:['מחכים לצוות… שתפו את קוד המשחק או את קישור ההצטרפות.','Waiting for the crew… share the game code or join link.'],
 copyJoin:['העתקת קישור הצטרפות','Copy join link'],copied:['הקישור הועתק','Link copied'],copyHost:['שמירת קישור המורה','Save host link'],privateNote:['קישור המורה מיועד רק לכם. שיתוף קישור ההצטרפות מכניס תלמידים למשחק.','Keep the host link private. Share the join link with students.'],controls:['עמדת המורה','Teacher controls'],start:['מתחילים!','Start game!'],pause:['השהיה','Pause'],resume:['ממשיכים','Resume'],end:['סיום המשחק','End game'],lock:['נעילת הצטרפות','Lock joining'],unlock:['פתיחת הצטרפות','Unlock joining'],update:['עדכון','Update'],remove:['הוצאה מהמשחק','Remove player'],
 spotlightLabel:['זרקור על הצוות','Crew spotlight'],spotlightWaiting:['מי יעלה על הגל?','Who’s on a roll?'],spotlightExplain:['3 תיקונים רצופים ללא טעות או רמז — והדמות עולה למסך!','Repair 3 roads in a row without a mistake or hint to appear here!'],streak:['ברצף','in a row'],
 testLabel:['🧪 חדר ניסוי','🧪 Test room'],add5:['הוספת 5 תלמידים','Add 5 students'],add30:['הוספת 30 תלמידים','Add 30 students'],stopBots:['עצירת המדומים','Stop simulations'],botNote:['תלמידים מדומים פותרים דרך אותו שרת, בקצבים שונים ועם טעויות. הכוכבים נשארים בחדר הניסוי הזה.','Simulated students use the same server, with different speeds and mistakes. Their stars stay in this test room.'],bot:['מדומה','Simulated'],
 welcome:['הצוות מוכן!','You’re in the crew!'],waitTeacher:['המורה יתחיל את המשחק בקרוב.','Your teacher will start the game soon.'],pauseTitle:['עוצרים לרגע ☕','Taking a break ☕'],pauseText:['הפתרון שלך נשמר. ממשיכים כשהמורה יפתח את המשחק.','Your road is saved. Continue when your teacher resumes.'],endTitle:['כל הכבוד לצוות!','Great teamwork!'],endText:['כל תיקון עזר לכיתה להתקדם.','Every repair helped the class move forward.'],back:['חזרה למסך הראשי','Back to home'],round:['כביש','Road'],instruction:['בחרו משולש ואז לחצו על הבור המתאים, או גררו אותו. שתי הזוויות בכל קצה צריכות להשלים קו ישר: 180°.','Select a triangle, then tap a matching gap, or drag it there. At each end, the two angles must make a straight line: 180°.'],gap:['בור','Gap'],tapGap:['הניחו כאן משולש','Place a triangle'],pickPiece:['בחרו קודם משולש מהמחסן','Choose a triangle from the tray first'],tray:['מחסן המשולשים','Triangle tray'],drive:['🚗 בודקים ונוסעים!','🚗 Check & drive!'],clear:['ניקוי','Clear'],hint:['💡 רמז','💡 Hint'],fillGaps:['צריך למלא את כל הבורות לפני שיוצאים לדרך','Fill every gap before driving'],correct:['הכביש תוקן! ⭐ כוכב נוסף לכיתה','Road repaired! ⭐ One more star for the class'],wrong:['כמעט! בדקו את שני הקצוות בכל בור. אפשר לנסות שוב.','Almost! Check both ends of each gap. Try again.'],hintText:['בבור הראשון, חפשו משולש עם הזוויות','For the first gap, find a triangle with angles'],hintEnd:['כי זוויות צמודות על קו ישר משלימות ל־180°. גם עם רמז אפשר להרוויח כוכב!','because adjacent angles on a straight line add to 180°. You can still earn a star with a hint!'],reconnecting:['מתחברים מחדש…','Reconnecting…'],connected:['● מחובר','● Connected'],sending:['בודקים…','Checking…'],tryAgain:['נסו שוב','Try again'],endConfirm:['לסיים את המשחק לכל הכיתה?','End the game for the whole class?'],leaveConfirm:['לחזור למסך הראשי? אפשר לחזור לחדר מהקישור.','Return home? You can rejoin using the room link.'],
 roomNotFound:['המשחק לא נמצא או שתוקפו פג. בדקו את הקוד עם המורה.','Game not found or expired. Check the code with your teacher.'],invalidSession:['לא ניתן לחזור לדמות הזאת. הצטרפו שוב.','This session is unavailable. Please join again.'],removed:['המורה הוציא את הדמות מהמשחק.','Your teacher removed this player.'],invalidHost:['קישור המורה אינו תקין. פתחו את קישור הניהול המקורי.','Invalid host link. Open your original private host link.'],locked:['ההצטרפות נעולה כרגע. בקשו מהמורה לפתוח אותה.','Joining is locked. Ask your teacher to unlock it.'],roomFull:['החדר מלא כרגע.','This room is full.'],nameRequired:['מה השם שלכם?','Please enter your name.'],invalidCode:['הזינו קוד משחק בן 6 ספרות','Enter a 6-digit game code'],notStarted:['מחכים שהמורה יתחיל את המשחק','Waiting for your teacher to start'],noPlayers:['צרפו לפחות תלמיד אחד כדי להתחיל','At least one student must join first'],stalePuzzle:['הכביש כבר עודכן. טוענים את הכביש הבא.','This road was already updated. Loading the next one.'],tooFast:['רק רגע… ואז נסו שוב','One moment… then try again'],rateLimit:['יותר מדי בקשות. המתינו רגע ונסו שוב.','Too many requests. Wait a moment and retry.'],network:['אין חיבור כרגע. בדקו את האינטרנט ונסו שוב.','Connection unavailable. Check your internet and retry.'],serverError:['השרת לא זמין כרגע. נסו שוב בעוד רגע.','The server is unavailable. Please try again shortly.'],invalidGoal:['היעד צריך להיות מספר שלם בין 5 ל־1000','Choose a whole-number goal between 5 and 1000'],loading:['מתחברים לצוות…','Connecting to the crew…'],hostLinkLabel:['שמרו את הקישור הזה לעצמכם','Keep this link for yourself'],retrySubmission:['התגובה לא הגיעה. לחצו שוב כדי לבדוק את אותה נסיעה.','No response arrived. Tap again to check the same drive.']
};
let lang = localStorage.getItem('angleCrewLanguage') || 'he';
const t = key => words[key]?.[lang === 'he' ? 0 : 1] || words.serverError[lang === 'he' ? 0 : 1];
let state = { role: 'home', code: '', room: null, player: null, session: null, hostToken: '', selected: null, slots: [], target: 0, pending: null, busy: false, puzzleId: '', feedback: '', hint: null };
let config = { colors: ['#7451ed','#ef6587','#2d9f8c','#e59b32','#438edb','#b466d3'], emojis:['🐱','🐶','🦊','🐼','🐸','🦉','🐙','🦄','🐢','🐝','🦋','🐧'] };
let avatar = { color: config.colors[0], emoji: config.emojis[0] }, polling = false, toastTimer, spotlightIndex = 0, bots = [], botTimer, botBusy = false, animationTimer;
const uuid = () => crypto.randomUUID();
const secret = () => { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return Array.from(bytes, b => b.toString(16).padStart(2,'0')).join(''); };
const roomUrl = code => `${location.origin}${location.pathname}?room=${code}`;
const hostUrl = () => `${roomUrl(state.code)}&teacher=1#host=${state.hostToken}`;
function credentials() { return { playerId: state.session.playerId, playerToken: state.session.playerToken }; }
function store(key, value) { sessionStorage.setItem(`angleCrew:${key}`, JSON.stringify(value)); }
function restore(key) { try { return JSON.parse(sessionStorage.getItem(`angleCrew:${key}`)); } catch { return null; } }
async function api(path, body) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
        const response = await fetch(`/api/classroom${path}`, { method: body === undefined ? 'GET' : 'POST', cache: 'no-store', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
        let data; try { data = await response.json(); } catch { throw new Error('serverError'); }
        if (!response.ok || data.error) throw new Error(data.error || 'serverError');
        connection(true); return data;
    } catch (error) { if (!words[error.message]) { connection(false); throw new Error('network'); } throw error; }
    finally { clearTimeout(timer); }
}
function connection(ok) { $('connection').textContent = state.role === 'home' ? '' : t(ok ? 'connected' : 'reconnecting'); $('connection').className = ok ? '' : 'connection-lost'; }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4000); }
function translatePage() { document.documentElement.lang = lang; document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'; document.title = `${t('brand')} · Angle Crew`; $('language').textContent = lang === 'he' ? 'English' : 'עברית'; document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n)); }
function phasePill(room) { return `<span class="status-pill ${room.phase}">${t(room.phase)}</span>`; }
function roadArt(percent = 0, hero = false) {
    const x = 80 + Math.min(percent, 1) * 760;
    return `<svg viewBox="0 0 1000 235" class="shared-road" role="img" aria-label="${esc(t('classMission'))}"><path d="M0 180Q100 110 220 160T450 140T700 155T1000 130V235H0" fill="#d9eee2"/><path d="M0 180H1000" stroke="#52617b" stroke-width="48"/><path d="M0 180H1000" stroke="#a5afc1" stroke-width="3" stroke-dasharray="20 22"/><path d="M0 180H${x}" stroke="#e3b94e" stroke-width="5" stroke-dasharray="18 24"/><g transform="translate(${x} 115)"><rect x="-43" y="14" width="94" height="35" rx="13" fill="${hero ? '#7451ed' : '#eaac3b'}"/><path d="M-18 14L-6-7H23L40 14" fill="#8cd0e0" stroke="${hero ? '#7451ed' : '#eaac3b'}" stroke-width="9"/><circle cx="-21" cy="51" r="12" fill="#26334f"/><circle cx="31" cy="51" r="12" fill="#26334f"/><circle cx="-21" cy="51" r="5" fill="#fff"/><circle cx="31" cy="51" r="5" fill="#fff"/><circle cx="42" cy="25" r="4" fill="#fff4a6"/></g><path d="M913 70V158" stroke="#455472" stroke-width="6"/><path d="M916 70H973V107H916Z" fill="#7451ed"/><text x="944" y="97" text-anchor="middle" font-size="27">⭐</text><text x="120" y="64" font-size="35">☁️</text><text x="680" y="65" font-size="26">☁️</text></svg>`;
}
function triangle(piece, isGap = false, filling = null) {
    const angles = isGap ? piece.map(a => 180-a) : piece.angles;
    const ca = 1 / Math.tan(angles[0]*Math.PI/180), cb = 1 / Math.tan(angles[1]*Math.PI/180);
    let height = 200/(ca+cb), base = 200; const scale = Math.min(1, 85/height); height *= scale; base *= scale;
    const left = (280-base)/2, right = left+base, apex = left+height*ca;
    if (isGap) return `<svg viewBox="0 0 280 190" aria-hidden="true"><path d="M0 65H${left}L${apex} ${65+height}L${right} 65H280V185H0Z" fill="#5a667d"/><path d="M8 80H${left-10}M${right+10} 80H272" stroke="#eacb65" stroke-width="3" stroke-dasharray="10 8"/><text x="${left-12}" y="48" text-anchor="middle" fill="#44516b" font-size="23" font-weight="800">${piece[0]}°</text><text x="${right+12}" y="48" text-anchor="middle" fill="#44516b" font-size="23" font-weight="800">${piece[1]}°</text><path d="M${left} 65L${apex} ${65+height}L${right} 65" fill="none" stroke="#b3a3e6" stroke-width="3" stroke-dasharray="6 5"/>${filling?`<g transform="translate(0 65)">${patch(filling,280,85)}</g>`:''}</svg>`;
    return `<svg viewBox="0 0 280 145" aria-hidden="true"><g transform="translate(0 38)">${patch(piece,280,85)}</g><text x="${left-5}" y="25" text-anchor="middle" font-size="22" font-weight="800" fill="#35425c">${angles[0]}°</text><text x="${right+5}" y="25" text-anchor="middle" font-size="22" font-weight="800" fill="#35425c">${angles[1]}°</text></svg>`;
}
function patch(piece,width,maxHeight){const [a,b]=piece.angles.map(n=>n*Math.PI/180);let h=200/(1/Math.tan(a)+1/Math.tan(b)),base=200;const scale=Math.min(1,maxHeight/h);h*=scale;base*=scale;const l=(width-base)/2;return `<path d="M${l} 0L${l+h/Math.tan(a)} ${h}L${l+base} 0Z" fill="${piece.color}66" stroke="${piece.color}" stroke-width="3" stroke-linejoin="round"/>`;}
function renderHome() {
    state.role = 'home'; connection(true);
    const code = new URLSearchParams(location.search).get('room') || '';
    $('app').innerHTML = `<section class="hero"><span class="eyebrow">ANGLE CREW</span><h1>${t('headline')}</h1><p>${t('intro')}</p><div class="hero-art">${roadArt(.38,true)}</div></section><div class="home-grid"><section class="panel join"><h2>🎮 ${t('joinTitle')}</h2><form id="join-form"><label for="code">${t('code')}</label><input id="code" class="code-input" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autocomplete="off" value="${esc(/^\d{6}$/.test(code)?code:'')}"><label for="name">${t('name')}</label><input id="name" maxlength="24" required autocomplete="given-name" placeholder="${esc(t('name'))}"><label>${t('emoji')}</label><div id="avatars" class="avatars"></div><label>${t('color')}</label><div id="colors" class="colors"></div><p id="join-error" class="join-error" role="alert"></p><button class="wide" type="submit">${t('join')}</button><p class="form-note">${t('noAccount')}</p></form></section><section class="panel create"><h2>🖥️ ${t('createTitle')}</h2><form id="create-form"><label for="new-goal">${t('goal')}</label><select id="new-goal"><option value="auto">${t('auto')}</option>${[20,30,50,75,100,150,200].map(n=>`<option value="${n}">${n} ⭐</option>`).join('')}</select><label class="check"><input type="checkbox" id="test-mode">${t('testMode')}</label><button class="wide success" type="submit">${t('create')}</button><p class="form-note">${t('hostNote')}</p><p id="create-error" class="join-error" role="alert"></p></form></section></div>`;
    renderAvatars(); $('join-form').onsubmit = joinRoom; $('create-form').onsubmit = createRoom;
}
function renderAvatars() {
    $('avatars').innerHTML = config.emojis.map(e=>`<button type="button" class="avatar-option ${e===avatar.emoji?'selected':''}" aria-pressed="${e===avatar.emoji}" aria-label="${e}" data-emoji="${e}">${e}</button>`).join('');
    $('colors').innerHTML = config.colors.map(c=>`<button type="button" class="color-option ${c===avatar.color?'selected':''}" style="background:${c}" aria-pressed="${c===avatar.color}" aria-label="${c}" data-color="${c}"></button>`).join('');
    $('avatars').onclick = e => { const b=e.target.closest('[data-emoji]'); if(b){avatar.emoji=b.dataset.emoji;renderAvatars();} };
    $('colors').onclick = e => { const b=e.target.closest('[data-color]'); if(b){avatar.color=b.dataset.color;renderAvatars();} };
}
async function joinRoom(event) {
    event.preventDefault(); const code=$('code').value.replace(/\D/g,''), name=$('name').value.trim();
    if(!/^\d{6}$/.test(code)){ $('join-error').textContent=t('invalidCode'); return; }
    if(!name){$('join-error').textContent=t('nameRequired'); return;}
    const button=event.submitter; button.disabled=true; $('join-error').textContent='';
    // Generate before the request so even a lost response can be retried safely.
    let session=restore(`player:${code}`) || {playerId:uuid(),playerToken:secret()}; store(`player:${code}`,session);
    try {
        const data=await api(`/rooms/${code}/join`,{...session,name,...avatar});
        Object.assign(state,{role:'player',code,session,room:data.room,player:data.player,puzzleId:''});
        history.replaceState(null,'',`?room=${code}`); renderStudent();
    } catch(error){$('join-error').textContent=t(error.message); if(['removed','invalidSession'].includes(error.message))sessionStorage.removeItem(`angleCrew:player:${code}`);}
    finally{button.disabled=false;}
}
async function createRoom(event) {
    event.preventDefault(); const button=event.submitter; button.disabled=true;
    try {
        const value=$('new-goal').value, data=await api('/rooms',{goal:value==='auto'?'auto':Number(value),testMode:$('test-mode').checked});
        Object.assign(state,{role:'host',code:data.room.code,hostToken:data.hostToken,room:data.room}); store(`host:${state.code}`,state.hostToken);
        history.replaceState(null,'',`?room=${state.code}&teacher=1`); renderTeacher(); toast(t('hostLinkLabel'));
    }catch(error){$('create-error').textContent=t(error.message);}finally{button.disabled=false;}
}
async function copy(text) { try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch { const box=document.createElement('textarea');box.value=text;document.body.append(box);box.select();document.execCommand('copy');box.remove();toast(t('copied')); } }
function renderTeacher() {
    const room=state.room;
    $('app').innerHTML=`<section class="room-head"><div><span class="eyebrow">${t(room.testMode?'testLabel':'classMission')}</span><h1>${t('missionTitle')}</h1><span id="host-phase"></span></div><div class="room-code"><span class="small">${t('code')}</span><strong>${room.code}</strong><button id="copy-join" class="soft">${t('copyJoin')}</button></div></section><div class="teacher-grid"><div><section id="goal-card" class="panel goal-card"><div class="goal-top"><div><span class="eyebrow">${t('classMission')}</span><h2 id="goal-title">${t('missionTitle')}</h2></div><div class="star-count" id="star-count"></div></div><div class="progress" role="progressbar" id="host-progress" aria-label="${t('goal')}"><div id="host-fill"></div></div><div id="shared-road"></div></section><section class="panel spotlight" id="spotlight" aria-live="polite"></section><section class="panel roster"><div class="roster-head"><h2>${t('players')}</h2><span class="muted" id="roster-count"></span></div><div id="roster"></div></section></div><aside class="panel teacher-controls"><h3>${t('controls')}</h3><button id="start" data-action="start">${t('start')}</button><button id="pause" class="soft" data-action="pause">${t('pause')}</button><button id="resume" class="success" data-action="resume">${t('resume')}</button><button id="lock" class="soft"></button><button id="end" class="danger" data-action="end">${t('end')}</button><div class="goal-controls"><label for="host-goal">${t('goal')}</label><div class="fields"><input id="host-goal" type="number" min="5" max="1000" value="${room.goal}"><button id="update-goal" class="soft">${t('update')}</button></div></div><div class="private-note"><button id="copy-host" class="soft">🔑 ${t('copyHost')}</button><p class="form-note">${t('privateNote')}</p></div>${room.testMode?`<section class="test-panel"><strong>${t('testLabel')}</strong><p class="form-note">${t('botNote')}</p><div class="fields"><button id="bots5" class="soft">${t('add5')}</button><button id="bots30" class="soft">${t('add30')}</button></div><button id="stop-bots" class="quiet">${t('stopBots')}</button></section>`:''}</aside></div>`;
    $('copy-join').onclick=()=>copy(roomUrl(state.code)); $('copy-host').onclick=()=>copy(hostUrl());
    document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>hostAction(b.dataset.action));
    $('lock').onclick=()=>hostAction(state.room.locked?'unlock':'lock'); $('update-goal').onclick=()=>hostAction('goal',{goal:Number($('host-goal').value)});
    if(room.testMode){$('bots5').onclick=()=>addBots(5);$('bots30').onclick=()=>addBots(30);$('stop-bots').onclick=stopBots;}
    updateTeacher(true);
}
let lastRoster='',lastSpotlight='';
function updateTeacher(force=false) {
    const r=state.room;if(!$('host-phase'))return;
    $('host-phase').innerHTML=phasePill(r); $('star-count').textContent=`⭐ ${r.stars} / ${r.goal}`;
    $('host-fill').style.width=`${Math.min(100,r.stars/r.goal*100)}%`;
    $('host-progress').setAttribute('aria-valuenow',Math.min(r.stars,r.goal));$('host-progress').setAttribute('aria-valuemax',r.goal);
    $('goal-title').textContent=t(r.stars>=r.goal?'goalDone':'missionTitle');$('goal-card').classList.toggle('goal-achieved',r.stars>=r.goal);
    $('shared-road').innerHTML=roadArt(r.stars/r.goal);
    for(const phase of ['start','pause','resume'])$(phase).hidden=phase==='start'?r.phase!=='lobby':phase==='pause'?r.phase!=='running':r.phase!=='paused';
    $('end').hidden=r.phase==='ended';$('lock').textContent=t(r.locked?'unlock':'lock');
    if(document.activeElement!==$('host-goal'))$('host-goal').value=r.goal;
    $('roster-count').textContent=`${r.players.length} ${t('students')}`;
    const sig=JSON.stringify(r.players);if(force||sig!==lastRoster){lastRoster=sig;$('roster').innerHTML=r.players.length?`<div class="players">${r.players.map(p=>`<div class="player-tile ${p.online?'':'offline'}"><button class="remove" data-remove="${p.id}" aria-label="${esc(t('remove'))}">×</button><div class="bubble" style="background:${p.color}33">${p.emoji}</div><div class="player-name" title="${esc(p.name)}">${esc(p.name)}</div><span class="small">${p.streak>=3?`🔥 ${p.streak}`:'🌱'}${p.simulated?` · ${t('bot')}`:''}</span></div>`).join('')}</div>`:`<p class="muted">${t('emptyRoster')}</p>`;$('roster').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>hostAction('remove',{playerId:b.dataset.remove}));}
    updateSpotlight(force);
}
function updateSpotlight(force=false){
    if(state.role!=='host'||!$('spotlight'))return;
    const list=state.room.spotlights.filter(s=>state.room.players.some(p=>p.id===s.playerId));
    const item=list.length?list[Math.max(0,list.length-1-(spotlightIndex%list.length))]:null;
    const sig=JSON.stringify(item)+lang;if(!force&&sig===lastSpotlight)return;lastSpotlight=sig;
    $('spotlight').innerHTML=item?`<span class="big-avatar">${item.emoji}</span><div><span class="eyebrow">${t('spotlightLabel')}</span><h2>${esc(item.name)}</h2><strong>🔥 ${item.streak} ${t('streak')}</strong></div>`:`<span class="big-avatar">🌟</span><div><span class="eyebrow">${t('spotlightLabel')}</span><h2>${t('spotlightWaiting')}</h2><span class="muted">${t('spotlightExplain')}</span></div>`;
}
async function hostAction(action,extra={}) {
    if(action==='end'&&!confirm(t('endConfirm')))return;
    try{const data=await api(`/rooms/${state.code}/host`,{hostToken:state.hostToken,action,...extra});state.room=data.room;updateTeacher();if(action==='end')stopBots();}catch(e){toast(t(e.message));}
}
function renderStudent() {
    const p=state.player;
    $('app').innerHTML=`<section class="student-head"><div class="player-top"><div class="bubble" style="background:${p.color}33">${p.emoji}</div><div><h1>${esc(p.name)}</h1><span class="muted small">${t('code')} ${state.code}</span></div></div><div class="mini-stats"><span id="my-stars"></span><span id="my-streak"></span></div></section><div class="student-goal"><span>⭐ <b id="class-stars"></b></span><div class="progress" aria-label="${t('classMission')}"><div id="student-fill"></div></div><span id="class-target"></span></div><section id="student-content"></section>`;
    state.puzzleId=''; updateStudent();
}
let studentPhase='';
function updateStudent() {
    const {room:r,player:p}=state;if(!$('student-content'))return;
    $('my-stars').textContent=`⭐ ${p.stars}`;$('my-streak').textContent=`🔥 ${p.streak}`;
    $('class-stars').textContent=r.stars;$('class-target').textContent=r.goal;$('student-fill').style.width=`${Math.min(100,r.stars/r.goal*100)}%`;
    const phaseChanged=studentPhase!==r.phase;studentPhase=r.phase;
    if(r.phase==='lobby'||r.phase==='ended'){
        if(!phaseChanged&&$('waiting-state'))return;
        $('student-content').innerHTML=`<div class="panel waiting" id="waiting-state"><span class="waiting-icon">${r.phase==='lobby'?p.emoji:'🏁'}</span><h2>${t(r.phase==='lobby'?'welcome':'endTitle')}</h2><p>${t(r.phase==='lobby'?'waitTeacher':'endText')}</p>${r.phase==='ended'?`<strong>⭐ ${r.stars} / ${r.goal}</strong><br><a href="./" class="back-button quiet">${t('back')}</a>`:''}</div>`;state.puzzleId='';return;
    }
    if(state.puzzleId!==p.puzzle.id){
        const saved=restore(`road:${state.code}:${p.id}`);
        if(saved?.puzzleId===p.puzzle.id){state.slots=saved.slots;state.pending=saved.pending;state.hint=saved.hint;}
        else{state.slots=Array(p.puzzle.gaps.length).fill(null);state.pending=null;state.hint=null;}
        state.puzzleId=p.puzzle.id;state.selected=null;state.target=0;state.feedback='';renderPuzzle();
    }else if(phaseChanged)renderPuzzle();
    if($('drive'))$('drive').disabled=state.busy||r.phase!=='running';if($('hint'))$('hint').disabled=state.busy||r.phase!=='running';
}
function saveRoad(){if(state.player)store(`road:${state.code}:${state.player.id}`,{puzzleId:state.puzzleId,slots:state.slots,pending:state.pending,hint:state.hint});}
function renderPuzzle(){
    const {room:r,player:p}=state, puzzle=p.puzzle;
    $('student-content').innerHTML=`<div class="panel game-panel" id="game-panel"><div class="game-heading"><h2>🛠️ ${t('round')} ${puzzle.number}</h2>${phasePill(r)}</div>${r.phase==='paused'?`<div class="hint-box"><strong>${t('pauseTitle')}</strong><br>${t('pauseText')}</div>`:''}<p class="instructions">${t('instruction')}</p><div class="gap-grid" id="gaps" style="--gaps:${puzzle.gaps.length}"></div><h3 style="margin-top:20px;font-size:16px">${t('tray')}</h3><div class="pieces" id="pieces"></div><div class="game-actions"><button id="drive" class="drive">${t('drive')}</button><div><button id="clear" class="quiet">${t('clear')}</button><button id="hint" class="soft">${t('hint')}</button></div></div><div id="feedback" class="feedback" role="status" aria-live="polite"></div><div id="hint-box"></div></div>`;
    renderSlots();renderPieces();renderHint();if(state.feedback)$('feedback').textContent=state.feedback;
    $('drive').onclick=drive;$('clear').onclick=()=>{if(state.busy||state.pending)return;state.slots=Array(puzzle.gaps.length).fill(null);state.selected=null;renderSlots();renderPieces();saveRoad();};$('hint').onclick=getHint;
    $('drive').disabled=state.busy||r.phase!=='running';$('hint').disabled=state.busy||r.phase!=='running';
}
function renderSlots(){
    const puzzle=state.player.puzzle;
    $('gaps').innerHTML=puzzle.gaps.map((gap,i)=>{const piece=puzzle.pieces.find(p=>p.id===state.slots[i]);return `<div role="button" tabindex="0" class="gap-card ${piece?'filled':''} ${state.target===i&&state.selected?'targeted':''}" data-slot="${i}" aria-label="${esc(`${t('gap')} ${i+1}: ${gap[0]}°, ${gap[1]}°`)}"><div class="gap-caption"><span>${t('gap')} ${i+1}</span><span class="gap-value">${gap[0]}° · ${gap[1]}°</span></div>${triangle(gap,true,piece)}<div class="slot-answer">${piece?`${piece.angles[0]}° · ${piece.angles[1]}°`:`＋ ${t('tapGap')}`}</div></div>`;}).join('');
    $('gaps').querySelectorAll('[data-slot]').forEach(el=>{
        const i=Number(el.dataset.slot);el.onclick=()=>place(i);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();place(i);}};
        el.ondragover=e=>{e.preventDefault();el.classList.add('drag-over');};el.ondragleave=()=>el.classList.remove('drag-over');el.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(puzzle.pieces.some(p=>p.id===id)){state.selected=id;place(i);}};
    });
}
function renderPieces(){
    const puzzle=state.player.puzzle;
    $('pieces').innerHTML=puzzle.pieces.map(p=>`<button class="piece ${state.selected===p.id?'selected':''} ${state.slots.includes(p.id)?'used':''}" draggable="true" data-piece="${p.id}" aria-pressed="${state.selected===p.id}" aria-label="${p.angles[0]}°, ${p.angles[1]}°">${triangle(p)}<span class="piece-values">${p.angles[0]}° · ${p.angles[1]}°</span></button>`).join('');
    $('pieces').querySelectorAll('[data-piece]').forEach(el=>{el.onclick=()=>{if(state.busy||state.pending||state.room.phase!=='running')return;state.selected=state.selected===el.dataset.piece?null:el.dataset.piece;renderSlots();renderPieces();};el.ondragstart=e=>{if(state.busy||state.pending||state.room.phase!=='running'){e.preventDefault();return;}e.dataTransfer.setData('text/plain',el.dataset.piece);e.dataTransfer.effectAllowed='move';};});
}
function place(i){
    if(state.busy||state.pending||state.room.phase!=='running')return;
    if(!state.selected){if(state.slots[i]){state.slots[i]=null;renderSlots();renderPieces();saveRoad();}else{state.target=i;toast(t('pickPiece'));}return;}
    state.slots=state.slots.map(id=>id===state.selected?null:id);state.slots[i]=state.selected;state.selected=null;state.target=state.slots.indexOf(null);renderSlots();renderPieces();saveRoad();
}
async function drive(){
    if(state.busy||state.room.phase!=='running')return;
    if(state.slots.some(id=>!id)){toast(t('fillGaps'));return;}
    state.busy=true;$('drive').disabled=true;$('drive').textContent=t('sending');
    state.pending ||= {...credentials(),puzzleId:state.puzzleId,attemptId:uuid(),slots:[...state.slots]};saveRoad();
    try{
        const data=await api(`/rooms/${state.code}/submit`,state.pending);state.pending=null;saveRoad();state.room=data.room;
        $('feedback').textContent=t(data.result.correct?'correct':'wrong');$('feedback').classList.toggle('wrong',!data.result.correct);
        if(data.result.correct){
            state.player={...data.player,puzzle:state.player.puzzle};updateStudent();
            const overlay=document.createElement('div');overlay.className='drive-overlay';overlay.innerHTML='<span class="drive-car">🚗✨</span>';$('game-panel').append(overlay);
            await new Promise(resolve=>animationTimer=setTimeout(resolve,1200));state.player=data.player;state.busy=false;updateStudent();
        }else{state.player=data.player;state.feedback=t('wrong');state.busy=false;updateStudent();}
    }catch(error){
        state.busy=false;
        if(['network','serverError'].includes(error.message)){toast(t('retrySubmission'));}
        else{state.pending=null;saveRoad();toast(t(error.message));if(error.message==='stalePuzzle')await poll();}
    }finally{state.busy=false;if($('drive')){$('drive').disabled=state.room.phase!=='running';$('drive').textContent=t('drive');}}
}
async function getHint(){
    if(state.busy||state.pending)return;
    try{const data=await api(`/rooms/${state.code}/hint`,{...credentials(),puzzleId:state.puzzleId});state.room=data.room;state.player=data.player;state.hint=data.result;saveRoad();renderHint();updateStudent();}catch(e){toast(t(e.message));}
}
function renderHint(){if($('hint-box'))$('hint-box').innerHTML=state.hint?`<div class="hint-box">💡 ${t('hintText')} <b dir="ltr">${state.hint.needed[0]}° · ${state.hint.needed[1]}°</b>, ${t('hintEnd')}</div>`:'';}
async function poll(){
    if(polling||state.busy||state.role==='home')return;polling=true;
    const code=state.code, role=state.role;
    try{
        const data=await api(`/rooms/${code}${role==='player'?'/player':''}`,role==='player'?credentials():undefined);
        if(state.code!==code||state.role!==role||state.busy)return;
        state.room=data.room;if(data.player)state.player=data.player;
        if(role==='host')updateTeacher();else updateStudent();
    }catch(e){
        if(['roomNotFound','removed','invalidSession'].includes(e.message)){
            if(role==='player')sessionStorage.removeItem(`angleCrew:player:${code}`);
            state.role='home';stopBots();$('app').innerHTML=`<section class="panel waiting"><h2>${esc(t(e.message))}</h2><a href="./?room=${code}" class="quiet">${t('back')}</a></section>`;
        }else connection(false);
    }finally{polling=false;}
}
async function addBots(count){
    if(!state.room.testMode)return;
    $('bots5').disabled=$('bots30').disabled=true;
    try{
        const available=Math.min(count,80-state.room.players.length);
        for(let i=0;i<available;i++){
            const n=bots.length+1, session={playerId:uuid(),playerToken:secret()};
            const data=await api(`/rooms/${state.code}/join`,{...session,hostToken:state.hostToken,simulated:true,name:`${lang==='he'?'חבר/ה':'Crewmate'} ${n}`,color:config.colors[(n-1)%config.colors.length],emoji:config.emojis[(n-1)%config.emojis.length]});
            bots.push({...session,player:data.player,nextAt:Date.now()+2000+Math.random()*6000,roomCode:state.code});state.room=data.room;updateTeacher();
        }
        if(!botTimer)botTimer=setInterval(runBots,1000);
    }catch(e){toast(t(e.message));}finally{if($('bots5'))$('bots5').disabled=$('bots30').disabled=false;}
}
async function runBots(){
    if(botBusy||state.role!=='host'||state.room.phase!=='running')return;botBusy=true;
    try{await Promise.all(bots.filter(b=>b.nextAt<=Date.now()).map(async bot=>{
        bot.nextAt=Date.now()+4000+Math.random()*9000;
        try{
            const p=bot.player.puzzle;
            const slots=p.gaps.map(g=>p.pieces.find(piece=>piece.angles.every((a,j)=>a+g[j]===180)).id);
            if(Math.random()<.22){const other=p.pieces.find(piece=>!slots.includes(piece.id));if(other)slots[0]=other.id;}
            const data=await api(`/rooms/${bot.roomCode}/submit`,{playerId:bot.playerId,playerToken:bot.playerToken,puzzleId:p.id,attemptId:uuid(),slots});bot.player=data.player;
        }catch(e){if(e.message==='removed')bot.nextAt=Infinity;}
    }));}finally{botBusy=false;}
}
function stopBots(){clearInterval(botTimer);botTimer=null;bots=[];}
$('language').onclick=()=>{
    const pendingForm=state.role==='home'?{code:$('code')?.value,name:$('name')?.value}:null;
    lang=lang==='he'?'en':'he';localStorage.setItem('angleCrewLanguage',lang);translatePage();
    if(state.role==='home'){renderHome();if(pendingForm){$('code').value=pendingForm.code||'';$('name').value=pendingForm.name||'';}}
    else if(state.role==='host')renderTeacher();else renderStudent();
};
async function init(){
    translatePage();$('app').innerHTML=`<div class="loading">${t('loading')}</div>`;
    const params=new URLSearchParams(location.search),code=params.get('room'),host=new URLSearchParams(location.hash.slice(1)).get('host');
    if(host&&/^\d{6}$/.test(code||'')){store(`host:${code}`,host);history.replaceState(null,'',`?room=${code}&teacher=1`);}
    if(/^\d{6}$/.test(code||'')&&params.get('teacher')==='1'){
        const hostToken=restore(`host:${code}`);
        if(!hostToken){$('app').innerHTML=`<section class="panel waiting"><h2>${t('invalidHost')}</h2><a href="./">${t('back')}</a></section>`;return;}
        try{const data=await api(`/rooms/${code}/host`,{hostToken,action:'ping'});Object.assign(state,{role:'host',code,hostToken,room:data.room});renderTeacher();}catch(e){$('app').innerHTML=`<section class="panel waiting"><h2>${t(e.message)}</h2><button onclick="location.reload()">${t('tryAgain')}</button></section>`;}return;
    }
    const session=restore(`player:${code}`);
    if(session&&/^\d{6}$/.test(code||'')){
        try{const data=await api(`/rooms/${code}/player`,session);Object.assign(state,{role:'player',code,session,room:data.room,player:data.player});renderStudent();return;}
        catch(e){if(['network','serverError'].includes(e.message)){$('app').innerHTML=`<section class="panel waiting"><h2>${t(e.message)}</h2><button onclick="location.reload()">${t('tryAgain')}</button></section>`;return;}sessionStorage.removeItem(`angleCrew:player:${code}`);}
    }
    renderHome();
}
setInterval(poll,2200);setInterval(()=>{spotlightIndex++;updateSpotlight();},7000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
init();
