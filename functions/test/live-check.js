/* Run explicitly against a deployed backend; creates and ends one isolated test room. */
'use strict';
const assert=require('node:assert/strict');
const { randomUUID,randomBytes }=require('node:crypto');
const base=process.env.CLASSROOM_API||'http://127.0.0.1:8082/api/classroom';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function request(path,body){
    const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
    const data=await response.json();if(!response.ok)throw new Error(`${path}: ${response.status}: ${data.error}`);return data;
}
(async()=>{
    assert.equal((await request('/health')).ok,true);
    const config=await request('/config'),created=await request('/rooms',{testMode:true,goal:30}),code=created.room.code;
    try{
        const sessions=Array.from({length:30},(_,i)=>({playerId:randomUUID(),playerToken:randomBytes(32).toString('base64url'),name:`Test ${i+1}`,color:config.colors[i%6],emoji:config.emojis[i%12],simulated:true,hostToken:created.hostToken}));
        const students=await Promise.all(sessions.map(s=>request(`/rooms/${code}/join`,s)));
        await request(`/rooms/${code}/host`,{hostToken:created.hostToken,action:'start'});
        const submissions=students.map((data,i)=>{const p=data.player.puzzle;return {...sessions[i],puzzleId:p.id,attemptId:randomUUID(),slots:p.gaps.map(g=>p.pieces.find(q=>q.angles.every((a,j)=>a+g[j]===180)).id)};});
        const results=await Promise.all(submissions.map(s=>request(`/rooms/${code}/submit`,s)));
        assert.ok(results.every(r=>r.result.correct));
        await Promise.all(submissions.map(s=>request(`/rooms/${code}/submit`,s)));
        let room;
        for(let i=0;i<10;i++){room=(await request(`/rooms/${code}`)).room;if(room.stars===30)break;await delay(1100);}
        assert.equal(room.stars,30);assert.equal(room.players.length,30);assert.equal(room.players.reduce((n,p)=>n+p.stars,0),30);
        assert.ok(!JSON.stringify(room).includes('tokenHash'));
        console.log(JSON.stringify({ok:true,code,simulatedStudents:30,stars:room.stars,duplicateSubmissions:30}));
    }finally{try{await request(`/rooms/${code}/host`,{hostToken:created.hostToken,action:'end'});}catch(e){console.error('Test room cleanup:',e.message);}}
})().catch(e=>{console.error(e.message);process.exitCode=1});
