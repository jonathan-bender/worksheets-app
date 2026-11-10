'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const G = require('../game');
const { createApi, MemoryStore } = require('../api');
function fixture() {
    const now=Date.now(), hostToken=G.token(), room=G.makeRoom('123456',hostToken,{},now);
    const session={playerId:randomUUID(),playerToken:G.token()};
    const player=G.join(room,{...session,name:'Dana',color:G.COLORS[0],emoji:G.EMOJIS[0]},now);
    G.hostAction(room,{hostToken,action:'start'},now);
    return {now,room,hostToken,session,player};
}
function answer(room,player,session) {
    const puzzle=G.puzzleFor(room,player);
    return {...session,puzzleId:puzzle.id,attemptId:randomUUID(),slots:puzzle.gaps.map(gap=>puzzle.pieces.find(p=>p.angles.every((a,j)=>a+gap[j]===180)).id)};
}
test('every generated puzzle has valid triangles and a unique, complete solution',()=>{
    const {room,player}=fixture();
    for(let seed=0;seed<20;seed++){
        room.seed=String(seed);
        for(let round=0;round<50;round++){
            player.completed=round;const p=G.puzzleFor(room,player);
            assert.equal(p.gaps.length,round<2?1:round<5?2:3);
            for(const piece of p.pieces){assert.ok(piece.angles.every(a=>a>0));assert.ok(piece.angles[0]+piece.angles[1]<180);}
            const ids=p.gaps.map(g=>{const matches=p.pieces.filter(q=>q.angles.every((a,j)=>a+g[j]===180));assert.equal(matches.length,1);return matches[0].id;});
            assert.equal(new Set(ids).size,ids.length);
        }
    }
});
test('correct repair awards one star, replay is idempotent even after pause',()=>{
    const {room,player,session,now,hostToken}=fixture(),input=answer(room,player,session);
    const first=G.submit(room,input,now+1000);G.hostAction(room,{hostToken,action:'pause'},now+1500);
    assert.deepEqual(G.submit(room,input,now+2000),first);assert.equal(room.stars,1);assert.equal(player.completed,1);
    assert.throws(()=>G.submit(room,{...input,attemptId:randomUUID()},now+2100),{code:'paused'});
});
test('stale puzzle cannot earn stars again with another request ID',()=>{
    const {room,player,session,now}=fixture(),input=answer(room,player,session);
    G.submit(room,input,now+1000);
    assert.throws(()=>G.submit(room,{...input,attemptId:randomUUID()},now+2000),{code:'stalePuzzle'});assert.equal(room.stars,1);
});
test('both ends must match, mistakes preserve the puzzle and allow a star on retry',()=>{
    const {room,player,session,now}=fixture(),input=answer(room,player,session),p=G.puzzleFor(room,player);
    const wrong=p.pieces.find(q=>q.id!==input.slots[0]);
    assert.equal(G.submit(room,{...input,slots:[wrong.id]},now+1000).correct,false);
    assert.equal(G.puzzleFor(room,player).id,p.id);assert.equal(room.stars,0);
    assert.equal(G.submit(room,{...input,attemptId:randomUUID()},now+2000).awarded,1);assert.equal(player.streak,0);
});
test('hints retain star eligibility but reset the first-try streak',()=>{
    const {room,player,session,now}=fixture();player.streak=2;
    G.hint(room,{...session,puzzleId:G.puzzleFor(room,player).id},now+500);
    assert.equal(G.submit(room,answer(room,player,session),now+1000).awarded,1);assert.equal(player.streak,0);assert.equal(room.spotlights.length,0);
});
test('three consecutive clean repairs create an avatar spotlight',()=>{
    const {room,player,session,now}=fixture();
    for(let i=1;i<=3;i++)G.submit(room,answer(room,player,session),now+i*1000);
    assert.equal(player.streak,3);assert.equal(room.spotlights.length,1);assert.equal(room.spotlights[0].name,'Dana');assert.equal(room.stars,3);
});
test('duplicate pieces and incomplete roads are rejected',()=>{
    const {room,player,session,now}=fixture();player.completed=2;
    const input=answer(room,player,session);
    assert.throws(()=>G.submit(room,{...input,slots:[input.slots[0],input.slots[0]]},now+1000),{code:'duplicatePiece'});
    assert.throws(()=>G.submit(room,{...input,slots:[]},now+1000),{code:'fillGaps'});assert.equal(room.stars,0);
});
test('public snapshots contain neither credentials, seeds, nor receipts',()=>{
    const {room,player,session,now}=fixture();G.submit(room,answer(room,player,session),now+1000);
    const data=JSON.stringify(G.publicRoom(room));for(const text of ['tokenHash','hostHash','seed','receipts',session.playerToken])assert.ok(!data.includes(text));
});
test('join retries return the same player; tokens cannot impersonate another player',()=>{
    const {room,session,now}=fixture();
    const player=G.join(room,{...session,name:'Other'},now+1000);assert.equal(player.name,'Dana');assert.equal(Object.keys(room.players).length,1);
    assert.throws(()=>G.checkPlayer(room,session.playerId,G.token()),{code:'invalidSession'});
});
test('host controls require the private capability; expired rooms and removed players cannot play',()=>{
    const {room,session,hostToken,now}=fixture();
    assert.throws(()=>G.hostAction(room,{hostToken:G.token(),action:'end'},now),{code:'invalidHost'});
    G.hostAction(room,{hostToken,action:'remove',playerId:session.playerId},now);
    assert.throws(()=>G.checkPlayer(room,session.playerId,session.playerToken),{code:'removed'});
    assert.throws(()=>G.checkRoom(room,now+G.EXPIRY+1),{code:'roomNotFound'});
});
test('test players are restricted to test rooms and require the host token',()=>{
    const {room,now,hostToken}=fixture(),input={playerId:randomUUID(),playerToken:G.token(),name:'Bot',color:G.COLORS[0],emoji:G.EMOJIS[0],simulated:true,hostToken};
    assert.throws(()=>G.join(room,input,now),{code:'invalidHost'});room.testMode=true;
    assert.equal(G.join(room,input,now).simulated,true);
});
test('automatic goal is set on start; a late join does not move the goal',()=>{
    const {room,hostToken,now}=fixture();assert.equal(room.goal,5);
    G.join(room,{playerId:randomUUID(),playerToken:G.token(),name:'Late',color:G.COLORS[1],emoji:G.EMOJIS[1]},now+1000);assert.equal(room.goal,5);
    G.hostAction(room,{hostToken,action:'end'},now+2000);
    assert.throws(()=>G.join(room,{playerId:randomUUID(),playerToken:G.token(),name:'Later',color:G.COLORS[1],emoji:G.EMOJIS[1]},now+3000),{code:'ended'});
});
test('API serializes 30 simultaneous students and duplicate submissions without lost or extra stars',async()=>{
    const api=createApi(new MemoryStore()),created=await api('POST','/rooms',{goal:30,testMode:true});
    const code=created.room.code,sessions=Array.from({length:30},()=>({playerId:randomUUID(),playerToken:G.token()}));
    const joined=await Promise.all(sessions.map((s,i)=>api('POST',`/rooms/${code}/join`,{...s,name:`Student ${i}`,color:G.COLORS[i%6],emoji:G.EMOJIS[i%12]})));
    await api('POST',`/rooms/${code}/host`,{hostToken:created.hostToken,action:'start'});
    const submissions=joined.map((data,i)=>{const p=data.player.puzzle;return {...sessions[i],puzzleId:p.id,attemptId:randomUUID(),slots:p.gaps.map(g=>p.pieces.find(q=>q.angles.every((a,j)=>a+g[j]===180)).id)};});
    const results=await Promise.all(submissions.flatMap(s=>[api('POST',`/rooms/${code}/submit`,s),api('POST',`/rooms/${code}/submit`,s)]));
    assert.ok(results.every(r=>r.result.correct));const latest=await api('GET',`/rooms/${code}`);assert.equal(latest.room.stars,30);assert.equal(latest.room.players.length,30);assert.equal(latest.room.players.reduce((n,p)=>n+p.stars,0),30);
});
