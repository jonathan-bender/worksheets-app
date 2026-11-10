"""End-to-end classroom checks with isolated Chrome contexts; no Python packages beyond websocket-client."""
import base64, json, os, pathlib, subprocess, time, urllib.request
import websocket

BASE = os.environ.get('CLASSROOM_BASE', 'http://127.0.0.1:8082')
PORT = 9252
artifacts = pathlib.Path('/tmp/classroom-browser-artifacts'); artifacts.mkdir(exist_ok=True)
log = open(artifacts / 'chrome.log', 'w')
chrome = subprocess.Popen(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless','--disable-gpu','--no-first-run','--no-default-browser-check',f'--user-data-dir={artifacts}/profile',f'--remote-debugging-port={PORT}',f'--remote-allow-origins=http://localhost:{PORT}','about:blank'],stdout=log,stderr=log)

class CDP:
    def __init__(self, url):
        self.ws = websocket.create_connection(url, origin=f'http://localhost:{PORT}',timeout=35); self.seq=0; self.errors=[]
    def call(self, method, params=None):
        self.seq+=1; seq=self.seq;self.ws.send(json.dumps({'id':seq,'method':method,'params':params or {}}))
        while True:
            msg=json.loads(self.ws.recv())
            if msg.get('method')=='Runtime.exceptionThrown':self.errors.append(msg)
            if msg.get('id')==seq:
                if 'error' in msg:raise RuntimeError(msg['error'])
                return msg.get('result',{})
    def js(self, code):
        result=self.call('Runtime.evaluate',{'expression':code,'awaitPromise':True,'returnByValue':True})
        if 'exceptionDetails' in result:raise RuntimeError(result['exceptionDetails'])
        return result.get('result',{}).get('value')
    def wait(self, code, timeout=40):
        end=time.monotonic()+timeout
        while time.monotonic()<end:
            try:
                if self.js(code):return
            except RuntimeError:
                pass
            time.sleep(.15)
        raise AssertionError('Timed out: '+code)
    def click(self, selector, touch=False):
        point=self.js(f'''(()=>{{let e=document.querySelector({json.dumps(selector)});if(!e)throw Error('No element: '+{json.dumps(selector)});e.scrollIntoView({{block:'center'}});let r=e.getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}}}})()''')
        if touch:
            self.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});self.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            self.call('Input.dispatchMouseEvent',{'type':'mousePressed',**point,'button':'left','clickCount':1});self.call('Input.dispatchMouseEvent',{'type':'mouseReleased',**point,'button':'left','clickCount':1})
    def screenshot(self,name):
        self.js('scrollTo(0,0)');data=self.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True});(artifacts/name).write_bytes(base64.b64decode(data['data']))

browser=None;pages=[]
try:
    for _ in range(100):
        try: version=json.load(urllib.request.urlopen(f'http://localhost:{PORT}/json/version'));break
        except Exception:time.sleep(.1)
    else:raise RuntimeError('Chrome failed to start')
    browser=CDP(version['webSocketDebuggerUrl'])
    def page(url,mobile=False):
        context=browser.call('Target.createBrowserContext')['browserContextId'];target=browser.call('Target.createTarget',{'url':'about:blank','browserContextId':context})['targetId']
        targets=json.load(urllib.request.urlopen(f'http://localhost:{PORT}/json'));p=CDP(next(t for t in targets if t['id']==target)['webSocketDebuggerUrl']);pages.append(p)
        p.call('Page.enable');p.call('Runtime.enable');p.call('Emulation.setDeviceMetricsOverride',{'width':390 if mobile else 1280,'height':844 if mobile else 900,'deviceScaleFactor':1,'mobile':mobile})
        if mobile:p.call('Emulation.setTouchEmulationEnabled',{'enabled':True})
        p.call('Page.navigate',{'url':url});p.wait('document.readyState==="complete"');return p
    host=page(BASE+'/Angles/classroom/');host.wait('!!document.getElementById("create-form")')
    host.js('document.getElementById("test-mode").checked=true;document.getElementById("new-goal").value="20"')
    host.click('#create-form button[type=submit]');host.wait('typeof state!=="undefined" && state.role==="host"')
    code=host.js('state.code');host.screenshot('teacher-lobby.png');students=[]
    for i,name in enumerate(['נועם','Dana','Rami']):
        p=page(BASE+'/Angles/classroom/?room='+code,mobile=i==0);p.wait('!!document.getElementById("join-form")')
        p.js('document.getElementById("name").value='+json.dumps(name));p.click(f'[data-emoji="{["🐱","🦊","🐸"][i]}"]',i==0);p.click('#join-form button[type=submit]',i==0)
        p.wait('state.role==="player"');assert p.js('state.room.phase')=='lobby';students.append(p)
    host.wait('state.room.players.length===3');host.click('#start');host.wait('state.room.phase==="running"')
    for p in students:p.wait('!!document.getElementById("pieces")')
    mobile=students[0];mobile.screenshot('student-mobile.png')
    assert mobile.js('document.documentElement.scrollWidth<=innerWidth'),'Mobile overflow'
    def fill(p,touch=False):
        slots=p.js('state.player.puzzle.gaps.map(g=>state.player.puzzle.pieces.find(q=>q.angles.every((a,j)=>a+g[j]===180)).id)')
        for i,piece in enumerate(slots):p.click(f'[data-piece="{piece}"]',touch);p.click(f'[data-slot="{i}"]',touch)
        assert p.js('state.slots.every(Boolean)')
    def solve(p,touch=False):
        before=p.js('state.player.completed');fill(p,touch);p.click('#drive',touch);p.wait(f'state.player.completed==={before+1} && !state.busy && state.player.puzzle.number==={before+2}')
    # A real touch submission, three clean repairs, and the larger second-stage road.
    for _ in range(3):solve(mobile,True)
    host.wait('state.room.stars===3 && state.room.spotlights.length===1');assert host.js('state.room.spotlights[0].name')=='נועם'
    assert mobile.js('state.player.puzzle.gaps.length')==2
    mobile.screenshot('student-mobile-two-gaps.png')
    # Pause preserves placements across an actual reload.
    fill(students[1]);host.click('#pause');students[1].wait('state.room.phase==="paused"');assert students[1].js('document.getElementById("drive").disabled')
    old=students[1].js('state.slots');students[1].call('Page.reload');students[1].wait('state.role==="player" && state.room.phase==="paused"');assert students[1].js('state.slots')==old
    host.click('#resume');students[1].wait('state.room.phase==="running"')
    # Lose a response after the server accepted it; resending must not duplicate the star.
    students[1].js('window.realFetch=fetch;window.fetch=async(...args)=>{if(String(args[0]).endsWith("/submit")){window.fetch=window.realFetch;await window.realFetch(...args);throw new TypeError("Simulated lost response");}return window.realFetch(...args)}')
    students[1].click('#drive');students[1].wait('!state.busy && !!state.pending');students[1].click('#drive');students[1].wait('!state.busy && state.player.completed===1 && state.player.puzzle.number===2');host.wait('state.room.stars===4')
    # A hint still allows a star, but does not create a streak.
    students[2].click('#hint');students[2].wait('!!state.hint');solve(students[2]);assert students[2].js('state.player.streak')==0;host.wait('state.room.stars===5')
    # Simulated students join through the same public API and solve independently.
    host.click('#bots5');host.wait('state.room.players.length===8');host.wait('state.room.stars>=8',60);host.click('#stop-bots');host.screenshot('teacher-playing.png')
    # Both languages, narrow layouts, no script errors; classroom links are reachable.
    mobile.click('#language',True);assert mobile.js('document.documentElement.dir')=='ltr';assert mobile.js('document.documentElement.scrollWidth<=innerWidth');mobile.screenshot('student-mobile-english.png')
    host.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});assert host.js('document.documentElement.scrollWidth<=innerWidth');host.screenshot('teacher-mobile.png')
    for p in pages:assert not p.errors,p.errors
    # End without a modal in automation; production still asks the teacher to confirm.
    host.js('window.confirm=()=>true');host.click('#end');host.wait('state.room.phase==="ended"');mobile.wait('state.room.phase==="ended"')
    print(json.dumps({'ok':True,'room':code,'students':8,'screenshots':str(artifacts),'checks':['isolated sessions','touch controls','streak spotlight','pause and refresh','lost-response retry','hint scoring','simulated class','Hebrew and English','mobile layouts','end game']},ensure_ascii=False))
finally:
    for p in pages:p.ws.close()
    if browser:browser.ws.close()
    chrome.terminate()
    try:chrome.wait(timeout=5)
    except subprocess.TimeoutExpired:chrome.kill()
    log.close()
