#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║         ARCADE VAULT — Local Server (Python)         ║
║  يعمل على: http://localhost:3000                     ║
╚══════════════════════════════════════════════════════╝

التشغيل:
  python server.py
  python server.py --port 8080
  python server.py --host 0.0.0.0   (الشبكة المحلية)

متطلبات:
  Python 3.7+  (بدون حاجة pip install)
"""

import http.server
import socketserver
import urllib.parse
import urllib.request
import json
import os
import sys
import argparse
import mimetypes

# ── إعدادات ──
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=3000)
parser.add_argument('--host', default='127.0.0.1')
args = parser.parse_args()

ROOT = os.path.dirname(os.path.abspath(__file__))

EXT_MAP = {
    '.nes':'nes', '.smc':'snes', '.sfc':'snes',
    '.n64':'n64', '.z64':'n64',  '.v64':'n64',
    '.gb':'gb',   '.gbc':'gbc',  '.gba':'gba',
    '.nds':'nds', '.md':'md',    '.gen':'md',
    '.smd':'md',  '.sms':'sms',  '.gg':'gg',
    '.gdi':'dc',  '.chd':'dc',   '.32x':'s32x',
    '.a26':'a2600', '.a78':'a7800', '.pce':'pce',
    '.ngp':'ngp', '.ngpc':'ngp', '.ws':'ws',
    '.wsc':'ws',  '.vb':'vb',    '.lnx':'lynx',
}

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range',
    'Access-Control-Expose-Headers': 'Content-Length',
}

class ArcadeHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *a):
        pass  # أخفِ logs الطلبات العادية

    def send_cors(self, code, ctype='application/octet-stream', extra=None):
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        if extra:
            for k, v in extra.items():
                self.send_header(k, v)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_cors(204)

    def do_HEAD(self):
        self.do_GET(head_only=True)

    def do_GET(self, head_only=False):
        parsed  = urllib.parse.urlparse(self.path)
        path_   = parsed.path
        params  = urllib.parse.parse_qs(parsed.query)

        # ── Proxy ──
        if path_ == '/proxy':
            target = params.get('url', [''])[0]
            if not target.startswith('https://thumbnails.libretro.com'):
                self.send_cors(403, 'text/plain')
                self.wfile.write(b'Proxy only for libretro thumbnails')
                return
            try:
                req = urllib.request.Request(target, headers={'User-Agent': 'ArcadeVault/1.0'})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                    self.send_cors(200, resp.headers.get('Content-Type', 'image/png'),
                                   {'Cache-Control': 'public, max-age=86400'})
                    if not head_only:
                        self.wfile.write(data)
            except Exception as e:
                self.send_cors(502, 'text/plain')
                self.wfile.write(str(e).encode())
            return

        # ── games.json تلقائي ──
        if path_ == '/games.json':
            roms_dir = os.path.join(ROOT, 'roms')
            games = []
            if os.path.isdir(roms_dir):
                for f in sorted(os.listdir(roms_dir)):
                    ext = os.path.splitext(f)[1].lower()
                    if ext in EXT_MAP:
                        title = os.path.splitext(f)[0].replace('_', ' ').replace('-', ' ').strip()
                        size  = os.path.getsize(os.path.join(roms_dir, f))
                        games.append({'file': f, 'title': title,
                                      'system': EXT_MAP[ext], 'size': size})
            body = json.dumps({'games': games}, ensure_ascii=False, indent=2).encode('utf-8')
            self.send_cors(200, 'application/json; charset=utf-8',
                           {'Content-Length': str(len(body))})
            if not head_only:
                self.wfile.write(body)
            return

        # ── ملفات ثابتة ──
        file_path = ROOT + path_
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')

        if not os.path.isfile(file_path):
            self.send_cors(404, 'text/plain; charset=utf-8')
            self.wfile.write(f'404 — {os.path.basename(file_path)}'.encode())
            return

        mime, _ = mimetypes.guess_type(file_path)
        mime = mime or 'application/octet-stream'
        with open(file_path, 'rb') as fh:
            data = fh.read()

        cache = 'no-cache' if file_path.endswith('.html') else 'public, max-age=3600'
        self.send_cors(200, mime, {
            'Content-Length': str(len(data)),
            'Cache-Control': cache,
        })
        if not head_only:
            self.wfile.write(data)


# ── تشغيل ──
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer((args.host, args.port), ArcadeHandler) as httpd:
    display = 'localhost' if args.host == '0.0.0.0' else args.host
    print(f'\n╔══════════════════════════════════════════╗')
    print(f'║  🎮  ARCADE VAULT Server — تشغيل ✅       ║')
    print(f'╚══════════════════════════════════════════╝')
    print(f'\n  الموقع  →  http://{display}:{args.port}')
    print(f'  Proxy  →  http://localhost:{args.port}/proxy?url=<url>')
    print(f'\n  ضع ملفات ROM في مجلد: ./roms/')
    print('  اضغط Ctrl+C للإيقاف\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n⏹ الخادم أوقف.\n')
