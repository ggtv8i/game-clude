#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════╗
# ║         ARCADE VAULT — Linux / macOS Launcher       ║
# ╚══════════════════════════════════════════════════════╝
# الاستخدام:
#   ./start.sh              (المنفذ الافتراضي 3000)
#   ./start.sh --port=8080
#   ./start.sh --host=0.0.0.0   (الشبكة المحلية)

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-3000}"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║        ARCADE VAULT — Local Server       ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

open_browser() {
  local url="http://localhost:${PORT}"
  sleep 1.2
  # macOS
  if command -v open &>/dev/null; then open "$url" 2>/dev/null & fi
  # Linux (freedesktop)
  if command -v xdg-open &>/dev/null; then xdg-open "$url" 2>/dev/null & fi
}

# ── Node.js ──
if command -v node &>/dev/null; then
  echo "  [✓] Node.js — تشغيل..."
  echo "  [→] http://localhost:${PORT}"
  echo ""
  open_browser &
  exec node "$DIR/server.js" "$@"
fi

# ── Python 3 ──
if command -v python3 &>/dev/null; then
  echo "  [✓] Python 3 — تشغيل..."
  echo "  [→] http://localhost:${PORT}"
  echo ""
  open_browser &
  exec python3 "$DIR/server.py" "$@"
fi

# ── Python 2 ──
if command -v python &>/dev/null; then
  PY_VER=$(python -c "import sys; print(sys.version_info[0])")
  if [ "$PY_VER" = "3" ]; then
    echo "  [✓] Python — تشغيل..."
    open_browser &
    exec python "$DIR/server.py" "$@"
  fi
fi

echo "  [✗] لم يُعثر على Node.js أو Python"
echo ""
echo "  للتثبيت:"
echo "    macOS  : brew install node"
echo "    Ubuntu : sudo apt install nodejs"
echo "    Python : https://python.org"
echo ""
exit 1
