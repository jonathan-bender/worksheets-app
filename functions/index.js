'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { createApi } = require('./api');
initializeApp();
// A dedicated database keeps classroom data separate from other applications.
const databaseURL = process.env.CLASSROOM_DATABASE_URL || 'https://worksheets-c5d83-default-rtdb.europe-west1.firebasedatabase.app';
const cache = new Map();
function cacheRoom(code, room) {
    cache.set(code, { room: structuredClone(room), at: Date.now() });
    if (cache.size > 200) for (const [key, entry] of cache) if (Date.now() - entry.at > 60000) cache.delete(key);
}
const store = {
    async read(code) {
        const cached = cache.get(code);
        if (cached && Date.now() - cached.at < 1000) return structuredClone(cached.room);
        const room = (await getDatabase(undefined, databaseURL).ref(`rooms/${code}`).get()).val();
        cacheRoom(code, room); return room;
    },
    async change(code, mutate) {
        const ref = getDatabase(undefined, databaseURL).ref(`rooms/${code}`);
        // Keep a listener until the transaction finishes. A one-off get() does
        // not retain the SDK's transaction cache, so its first callback can see
        // null even when a room already exists on the server.
        const keepAlive = () => {};
        ref.on('value', keepAlive);
        try {
            await ref.once('value');
            let output, error;
            const transaction = await ref.transaction(room => {
                try { output = mutate(room); error = undefined; return output.room; }
                catch (e) { error = e; return; }
            }, undefined, false);
            if (error) throw error;
            if (!transaction.committed) throw new Error('Transaction did not commit');
            cacheRoom(code, transaction.snapshot.val());
            return output.value;
        } finally { ref.off('value', keepAlive); }
    }
};
const api = createApi(store);
exports.classroomApi = onRequest({ region: 'europe-west1', maxInstances: 3, minInstances: 0, concurrency: 80, memory: '256MiB', timeoutSeconds: 30 }, async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    if (req.method === 'OPTIONS') return res.status(405).end();
    if (Number(req.headers['content-length'] || 0) > 16384 || req.rawBody?.length > 16384) return res.status(413).json({ error: 'tooLarge' });
    if (req.method === 'POST' && (!req.is('application/json') || !req.body || typeof req.body !== 'object' || Array.isArray(req.body))) return res.status(400).json({ error: 'invalidRequest' });
    try { res.json(await api(req.method, req.path, req.body || {}, req.ip)); }
    catch (error) {
        if (!error.status) console.error('Classroom request failed', error.message);
        res.status(error.status || 500).json({ error: error.code || 'serverError' });
    }
});
// Rooms expire after twelve hours; remove their data in the next daily sweep.
exports.cleanupClassrooms = onSchedule({ schedule: 'every 24 hours', region: 'europe-west1', maxInstances: 1, memory: '256MiB', timeoutSeconds: 120 }, async () => {
    const ref = getDatabase(undefined, databaseURL).ref('rooms');
    const expired = await ref.orderByChild('expiresAt').endAt(Date.now()).get();
    const updates = {}; expired.forEach(child => { updates[child.key] = null; });
    if (Object.keys(updates).length) await ref.update(updates);
});
