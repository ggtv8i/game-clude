/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         ARCADE VAULT — Local Server (Node.js)        ║
 * ║  يعمل على: http://localhost:3000                     ║
 * ║  يدعم: CORS + Proxy لـ Libretro Thumbnails           ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * التشغيل:
 *   node server.js
 *   node server.js --port=8080    (تغيير المنفذ)
 *   node server.js --host=0.0.0.0 (إتاحة للشبكة المحلية)
 *
 * متطلبات:
 *   Node.js 18+ (بدون حاجة npm install)
 */

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

/* ── إعدادات يمكن تغييرها ── */
const args   = Object.fromEntries(process.argv.slice(2).map(a => a.replace('--','').split('=')));
const PORT   = Number(args.port  || process.env.PORT || 3000);
const HOST   = args.host || '127.0.0.1';   // غيّر إلى 0.0.0.0 للوصول من الشبكة
const ROOT   = __dirname;                  // المجلد الجذر للموقع

/* ── MIME Types ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript',
  '.css' : 'text/css',
  '.json': 'application/json',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.ico' : 'image/x-icon',
  '.wasm': 'application/wasm',
  '.zip' : 'application/zip',
  '.nes' : 'application/octet-stream',
  '.smc' : 'application/octet-stream',
  '.sfc' : 'application/octet-stream',
  '.gba' : 'application/octet-stream',
  '.gb'  : 'application/octet-stream',
  '.gbc' : 'application/octet-stream',
  '.n64' : 'application/octet-stream',
  '.z64' : 'application/octet-stream',
  '.md'  : 'application/octet-stream',
  '.gen' : 'application/octet-stream',
  '.psx' : 'application/octet-stream',
  '.bin' : 'application/octet-stream',
};

/* ── CORS Headers لكل الردود ── */
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range');
}

/* ── Proxy endpoint: GET /proxy?url=https://... ──
   يُستخدم لجلب أغلفة Libretro حال وجود مشاكل CORS */
function handleProxy(req, res) {
  const parsed  = url.parse(req.url, true);
  const target  = parsed.query.url;

  if (!target || !target.startsWith('https://')) {
    res.writeHead(400); res.end('Bad proxy target'); return;
  }

  /* السماح فقط بـ thumbnails.libretro.com لأسباب أمنية */
  if (!target.includes('thumbnails.libretro.com')) {
    res.writeHead(403); res.end('Proxy only for libretro thumbnails'); return;
  }

  https.get(target, { headers: { 'User-Agent': 'ArcadeVault/1.0' } }, (upstream) => {
    setCORS(res);
    res.writeHead(upstream.statusCode, {
      'Content-Type'  : upstream.headers['content-type'] || 'application/octet-stream',
      'Cache-Control' : 'public, max-age=86400',
    });
    upstream.pipe(res);
  }).on('error', (e) => {
    res.writeHead(502); res.end('Proxy error: ' + e.message);
  });
}

/* ── قائمة ملفات ROM تلقائية: GET /games.json ── */
function handleGamesJson(res) {
  const romsDir = path.join(ROOT, 'roms');

  // امتدادات الألعاب المدعومة
  const EXT_MAP = {
    '.nes':'nes', '.smc':'snes', '.sfc':'snes',
    '.n64':'n64', '.z64':'n64', '.v64':'n64',
    '.gb':'gb',   '.gbc':'gbc', '.gba':'gba',
    '.nds':'nds', '.md':'md',   '.gen':'md',
    '.smd':'md',  '.sms':'sms', '.gg':'gg',
    '.gdi':'dc',  '.chd':'dc',  '.32x':'s32x',
    '.a26':'a2600','.a78':'a7800','.pce':'pce',
    '.ngp':'ngp', '.ngpc':'ngp','.ws':'ws',
    '.wsc':'ws',  '.vb':'vb',   '.lnx':'lynx',
  };

  let files = [];
  try { files = fs.readdirSync(romsDir); } catch { /* مجلد roms غير موجود */ }

  const games = files
    .filter(f => EXT_MAP[path.extname(f).toLowerCase()])
    .map(f => {
      const ext  = path.extname(f).toLowerCase();
      const sys  = EXT_MAP[ext];
      const base = path.basename(f, ext);
      const title = base.replace(/[_\-]/g, ' ').trim();
      const stat  = (() => { try { return fs.statSync(path.join(romsDir, f)); } catch { return null; } })();
      return {
        file  : f,
        title : title,
        system: sys,
        size  : stat ? stat.size : 0,
      };
    });

  const json = JSON.stringify({ games }, null, 2);
  setCORS(res);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(json);
}

/* ── خادم الملفات الثابتة ── */
function handleStatic(req, res) {
  let filePath = path.join(ROOT, url.parse(req.url).pathname || '/');

  // الملف الافتراضي
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(filePath.replace(/\/$/, ''), 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 — File not found: ' + path.basename(filePath));
      } else {
        res.writeHead(500); res.end('Server error');
      }
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    setCORS(res);
    res.writeHead(200, {
      'Content-Type'  : mime,
      'Cache-Control' : ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'Content-Length': data.length,
    });
    res.end(data);
  });
}

/* ── الخادم الرئيسي ── */
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  /* Preflight OPTIONS */
  if (req.method === 'OPTIONS') {
    setCORS(res); res.writeHead(204); res.end(); return;
  }

  /* Proxy */
  if (pathname === '/proxy' || pathname === '/proxy/') {
    handleProxy(req, res); return;
  }

  /* قائمة الألعاب التلقائية */
  if (pathname === '/games.json') {
    handleGamesJson(res); return;
  }

  /* ملفات ثابتة */
  handleStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  🎮  ARCADE VAULT Server — تشغيل ✅       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  الموقع   →  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`  Proxy   →  http://localhost:${PORT}/proxy?url=<libretro-url>`);
  console.log(`  ألعاب   →  http://localhost:${PORT}/games.json`);
  console.log('\n  ضع ملفات ROM في مجلد:  ./roms/');
  console.log('  اضغط Ctrl+C للإيقاف\n');
});

server.on('error', e => {
  if (e.code === 'EADDRINUSE')
    console.error(`❌ المنفذ ${PORT} مشغول — جرّب: node server.js --port=3001`);
  else
    console.error('❌ خطأ في الخادم:', e.message);
});
