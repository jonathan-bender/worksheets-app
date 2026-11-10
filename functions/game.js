'use strict';
const { createHash, randomBytes, randomInt, timingSafeEqual } = require('node:crypto');
const COLORS = ['#7451ed', '#ef6587', '#2d9f8c', '#e59b32', '#438edb', '#b466d3'];
const EMOJIS = ['🐱', '🐶', '🦊', '🐼', '🐸', '🦉', '🐙', '🦄', '🐢', '🐝', '🦋', '🐧'];
const EXPIRY = 12 * 60 * 60 * 1000;
class GameError extends Error {
    constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
const hash = value => createHash('sha256').update(String(value)).digest('hex');
const token = () => randomBytes(32).toString('base64url');
function sameToken(value, expected) {
    if (typeof value !== 'string' || value.length < 32 || value.length > 128 || typeof expected !== 'string') return false;
    const a = Buffer.from(hash(value)), b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}
function checkRoom(room, now = Date.now()) {
    if (!room || room.expiresAt < now) throw new GameError('roomNotFound', 404);
}
function checkPlayer(room, id, secret) {
    const player = room.players?.[id];
    if (!player || !sameToken(secret, player.tokenHash)) throw new GameError('invalidSession', 403);
    if (player.removed) throw new GameError('removed', 403);
    return player;
}
function checkHost(room, secret) {
    if (!sameToken(secret, room.hostHash)) throw new GameError('invalidHost', 403);
}
function goalValue(value) {
    if (value === 'auto' || value == null) return null;
    if (!Number.isInteger(value) || value < 5 || value > 1000) throw new GameError('invalidGoal');
    return value;
}
function makeRoom(code, hostToken, { goal = 'auto', testMode = false } = {}, now = Date.now()) {
    const target = goalValue(goal);
    return {
        schema: 1, code, hostHash: hash(hostToken), seed: token(), createdAt: now, expiresAt: now + EXPIRY,
        phase: 'lobby', locked: false, testMode: testMode === true, goal: target || 30, autoGoal: target == null,
        stars: 0, players: {}, spotlights: [], events: [], revision: 0
    };
}
function rng(seed) {
    let n = parseInt(hash(seed).slice(0, 8), 16);
    return () => { n = (Math.imul(1664525, n) + 1013904223) >>> 0; return n / 4294967296; };
}
function puzzleFor(room, player) {
    const round = player.completed || 0;
    const random = rng(`${room.seed}:${player.id}:${round}`);
    const range = (a, b) => a + Math.floor(random() * (b - a + 1));
    const count = round < 2 ? 1 : round < 5 ? 2 : 3;
    const pairs = [], seen = new Set();
    while (pairs.length < count) {
        // Both base angles positive; their sum < 180 gives a valid triangle.
        // Early puzzles use multiples of five, followed by unrestricted integers.
        const unit = round < 5 ? 5 : 1;
        const left = range(Math.ceil(30 / unit), Math.floor(75 / unit)) * unit;
        const right = range(Math.ceil(30 / unit), Math.floor(75 / unit)) * unit;
        const key = `${left},${right}`;
        if (left + right < 150 && !seen.has(key)) { pairs.push([left, right]); seen.add(key); }
    }
    const options = pairs.map(angles => ({ angles }));
    const distractors = round < 2 ? 2 : 3;
    while (options.length < count + distractors) {
        const angles = [range(30, 80), range(30, 80)], key = angles.join(',');
        if (angles[0] + angles[1] < 160 && !seen.has(key)) { options.push({ angles }); seen.add(key); }
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = range(0, i); [options[i], options[j]] = [options[j], options[i]];
    }
    return {
        id: `${round}-${hash(`${room.seed}:${player.id}:${round}`).slice(0, 12)}`,
        number: round + 1, difficulty: count,
        gaps: pairs.map(([a, b]) => [180 - a, 180 - b]),
        pieces: options.map((piece, i) => ({ id: `piece-${i}`, angles: piece.angles, color: COLORS[i % COLORS.length] }))
    };
}
function publicRoom(room, now = Date.now()) {
    return {
        code: room.code, phase: room.phase, locked: room.locked, testMode: room.testMode,
        goal: room.goal, autoGoal: room.autoGoal, stars: room.stars,
        createdAt: room.createdAt, expiresAt: room.expiresAt, revision: room.revision,
        players: Object.values(room.players || {}).filter(p => !p.removed).map(p => ({
            id: p.id, name: p.name, color: p.color, emoji: p.emoji,
            stars: p.stars, completed: p.completed, streak: p.streak, bestStreak: p.bestStreak,
            online: now - p.lastSeen < 45000, simulated: !!p.simulated
        })),
        spotlights: (room.spotlights || []).slice(-12), events: (room.events || []).slice(-20)
    };
}
function playerView(room, player) {
    return {
        id: player.id, name: player.name, color: player.color, emoji: player.emoji,
        stars: player.stars, completed: player.completed, streak: player.streak,
        bestStreak: player.bestStreak, hintUsed: !!player.hintUsed,
        puzzle: puzzleFor(room, player)
    };
}
function join(room, input, now = Date.now()) {
    checkRoom(room, now);
    const { playerId: id, playerToken, color, emoji } = input;
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(id || '') || !/^[a-zA-Z0-9_-]{32,128}$/.test(playerToken || '')) throw new GameError('invalidSession');
    const existing = room.players?.[id];
    if (existing) { checkPlayer(room, id, playerToken); existing.lastSeen = now; return existing; }
    if (room.phase === 'ended') throw new GameError('ended', 409);
    if (room.locked) throw new GameError('locked', 409);
    if (Object.values(room.players || {}).filter(p => !p.removed).length >= 80) throw new GameError('roomFull', 409);
    const name = String(input.name || '').normalize('NFC').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 24);
    if (!name) throw new GameError('nameRequired');
    if (!COLORS.includes(color) || !EMOJIS.includes(emoji)) throw new GameError('invalidAvatar');
    if (input.simulated && (!room.testMode || !sameToken(input.hostToken, room.hostHash))) throw new GameError('invalidHost', 403);
    const player = {
        id, name, color, emoji, tokenHash: hash(playerToken), joinedAt: now, lastSeen: now,
        stars: 0, completed: 0, streak: 0, bestStreak: 0, failures: 0, hintUsed: false,
        simulated: !!input.simulated, receipts: {}, lastSubmit: 0
    };
    room.players ||= {}; room.players[id] = player; room.revision++;
    return player;
}
function submit(room, input, now = Date.now()) {
    checkRoom(room, now);
    const player = checkPlayer(room, input.playerId, input.playerToken);
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(input.attemptId || '')) throw new GameError('invalidAttempt');
    if (player.receipts?.[input.attemptId]) return player.receipts[input.attemptId];
    if (room.phase !== 'running') throw new GameError(room.phase === 'paused' ? 'paused' : room.phase === 'ended' ? 'ended' : 'notStarted', 409);
    const puzzle = puzzleFor(room, player);
    if (input.puzzleId !== puzzle.id) throw new GameError('stalePuzzle', 409);
    if (now - player.lastSubmit < 500) throw new GameError('tooFast', 429);
    if (!Array.isArray(input.slots) || input.slots.length !== puzzle.gaps.length) throw new GameError('fillGaps');
    if (new Set(input.slots).size !== input.slots.length) throw new GameError('duplicatePiece');
    const pieces = input.slots.map(id => puzzle.pieces.find(p => p.id === id));
    if (pieces.some(p => !p)) throw new GameError('invalidPiece');
    const correct = puzzle.gaps.every((gap, i) => pieces[i].angles.every((a, j) => a + gap[j] === 180));
    const previousStars = room.stars;
    player.lastSeen = player.lastSubmit = now;
    let result;
    if (correct) {
        player.stars++; player.completed++; room.stars++;
        player.streak = player.failures === 0 && !player.hintUsed ? player.streak + 1 : 0;
        player.bestStreak = Math.max(player.bestStreak, player.streak);
        player.failures = 0; player.hintUsed = false;
        if (player.streak > 0 && player.streak % 3 === 0) {
            room.spotlights ||= [];
            room.spotlights.push({ id: `${player.id}-${player.completed}`, playerId: player.id, name: player.name, emoji: player.emoji, color: player.color, streak: player.streak, at: now });
            room.spotlights = room.spotlights.slice(-30);
        }
        room.events ||= [];
        room.events.push({ id: input.attemptId, playerId: player.id, emoji: player.emoji, color: player.color, at: now });
        room.events = room.events.slice(-30);
        result = { correct: true, awarded: 1, stars: player.stars, streak: player.streak, goalReached: previousStars < room.goal && room.stars >= room.goal, completed: player.completed };
    } else {
        player.streak = 0; player.failures++;
        result = { correct: false, awarded: 0, stars: player.stars, streak: 0 };
    }
    player.receipts ||= {}; player.receipts[input.attemptId] = result;
    const receipts = Object.keys(player.receipts);
    if (receipts.length > 8) delete player.receipts[receipts[0]];
    room.revision++;
    return result;
}
function hint(room, input, now = Date.now()) {
    checkRoom(room, now);
    const player = checkPlayer(room, input.playerId, input.playerToken);
    if (room.phase !== 'running') throw new GameError(room.phase === 'paused' ? 'paused' : 'notStarted', 409);
    const puzzle = puzzleFor(room, player);
    if (input.puzzleId !== puzzle.id) throw new GameError('stalePuzzle', 409);
    player.hintUsed = true; player.streak = 0; player.lastSeen = now; room.revision++;
    return { gap: puzzle.gaps[0], needed: puzzle.gaps[0].map(a => 180 - a) };
}
function hostAction(room, input, now = Date.now()) {
    checkRoom(room, now); checkHost(room, input.hostToken);
    const count = Object.values(room.players || {}).filter(p => !p.removed).length;
    switch (input.action) {
        case 'ping': return;
        case 'start':
            if (room.phase !== 'lobby') throw new GameError('alreadyStarted', 409);
            if (!count) throw new GameError('noPlayers');
            if (room.autoGoal) room.goal = Math.max(5, count * 3);
            room.phase = 'running'; room.startedAt = now; break;
        case 'pause': if (room.phase === 'running') room.phase = 'paused'; break;
        case 'resume': if (room.phase === 'paused') room.phase = 'running'; break;
        case 'end': room.phase = 'ended'; room.endedAt = now; break;
        case 'lock': room.locked = true; break;
        case 'unlock': room.locked = false; break;
        case 'goal': {
            const goal = goalValue(input.goal);
            if (goal == null) throw new GameError('invalidGoal');
            room.goal = goal; room.autoGoal = false; break;
        }
        case 'remove':
            if (!room.players?.[input.playerId]) throw new GameError('invalidSession');
            room.players[input.playerId].removed = true; break;
        default: throw new GameError('invalidAction');
    }
    room.revision++;
}
module.exports = { COLORS, EMOJIS, EXPIRY, GameError, hash, token, sameToken, makeRoom, checkRoom, checkHost, checkPlayer, puzzleFor, publicRoom, playerView, join, submit, hint, hostAction, randomCode: () => String(randomInt(100000, 1000000)) };
