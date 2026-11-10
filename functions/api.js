'use strict';
const G = require('./game');
class MemoryStore {
    constructor() { this.rooms = new Map(); this.locks = new Map(); }
    async read(code) { return structuredClone(this.rooms.get(code) || null); }
    async change(code, mutate) {
        const before = this.locks.get(code) || Promise.resolve();
        const next = before.catch(() => {}).then(() => {
            const room = structuredClone(this.rooms.get(code) || null);
            const output = mutate(room);
            this.rooms.set(code, output.room);
            return output.value;
        });
        this.locks.set(code, next);
        try { return await next; } finally { if (this.locks.get(code) === next) this.locks.delete(code); }
    }
}
function createApi(store) {
    const limits = new Map();
    function limit(key, max) {
        const now = Date.now(); let entry = limits.get(key);
        if (!entry || now - entry.at > 60000) { entry = { at: now, count: 0 }; limits.set(key, entry); }
        if (++entry.count > max) throw new G.GameError('rateLimit', 429);
        if (limits.size > 5000) for (const [k, v] of limits) if (now - v.at > 60000) limits.delete(k);
    }
    return async function api(method, path, input = {}, ip = 'local') {
        path = path.replace(/^\/api\/classroom/, '').replace(/\/$/, '') || '/';
        if (method === 'GET' && path === '/health') return { ok: true, version: 1 };
        if (method === 'GET' && path === '/config') return { colors: G.COLORS, emojis: G.EMOJIS };
        if (method === 'POST' && path === '/rooms') {
            limit(`create:${ip}`, 10);
            const secret = G.token();
            for (let i = 0; i < 10; i++) {
                const code = G.randomCode();
                const created = await store.change(code, existing => {
                    if (existing && existing.expiresAt > Date.now()) return { room: existing, value: null };
                    const room = G.makeRoom(code, secret, input);
                    return { room, value: G.publicRoom(room) };
                });
                if (created) return { room: created, hostToken: secret };
            }
            throw new G.GameError('busy', 503);
        }
        const match = path.match(/^\/rooms\/([0-9]{6})(?:\/(join|player|submit|hint|host))?$/);
        if (!match) throw new G.GameError('notFound', 404);
        const [, code, action] = match;
        if (method === 'GET' && !action) { const room = await store.read(code); G.checkRoom(room); return { room: G.publicRoom(room) }; }
        if (method !== 'POST' || !action) throw new G.GameError('notFound', 404);
        if (action === 'join') limit(`join:${ip}`, 150);
        if (action === 'player') {
            const room = await store.read(code); G.checkRoom(room);
            const player = G.checkPlayer(room, input.playerId, input.playerToken);
            // Most polls are reads; update presence only every twenty seconds.
            if (Date.now() - player.lastSeen < 20000) return { room: G.publicRoom(room), player: G.playerView(room, player) };
        }
        return store.change(code, room => {
            G.checkRoom(room); let result, player;
            if (action === 'join') player = G.join(room, input);
            if (action === 'player') { player = G.checkPlayer(room, input.playerId, input.playerToken); player.lastSeen = Date.now(); }
            if (action === 'submit') { result = G.submit(room, input); player = G.checkPlayer(room, input.playerId, input.playerToken); }
            if (action === 'hint') { result = G.hint(room, input); player = G.checkPlayer(room, input.playerId, input.playerToken); }
            if (action === 'host') G.hostAction(room, input);
            return { room, value: { room: G.publicRoom(room), ...(player ? { player: G.playerView(room, player) } : {}), ...(result ? { result } : {}) } };
        });
    };
}
module.exports = { createApi, MemoryStore };
