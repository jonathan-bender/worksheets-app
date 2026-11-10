'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createApi, MemoryStore } = require('./api');
const api = createApi(new MemoryStore());
const root = path.resolve(__dirname, '../public');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/api/classroom/')) {
            let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 16384) throw Object.assign(new Error('tooLarge'), { status: 413, code: 'tooLarge' }); }
            const output = await api(req.method, url.pathname, body ? JSON.parse(body) : {}, req.socket.remoteAddress);
            res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(output)); return;
        }
        const file = path.resolve(root, '.' + decodeURIComponent(url.pathname) + (url.pathname.endsWith('/') ? 'index.html' : ''));
        if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        const content = await fs.readFile(file); res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream'); res.end(content);
    } catch (e) { res.writeHead(e.status || (e.code === 'ENOENT' ? 404 : 500), { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: e.status ? e.code : 'serverError' })); }
});
if (require.main === module) server.listen(Number(process.env.PORT || 8082), '127.0.0.1', () => console.log('Classroom preview: http://127.0.0.1:8082/Angles/classroom/'));
module.exports = server;
