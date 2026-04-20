@echo off
chcp 65001 >nul
title ARCADE VAULT Server

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║        ARCADE VAULT — Local Server       ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── تحقق من وجود Node.js ──
where node >nul 2>&1
if %errorlevel% == 0 (
    echo  [✓] Node.js موجود — تشغيل الخادم...
    echo  [→] http://localhost:3000
    echo.
    start "" "http://localhost:3000"
    node "%~dp0server.js" %*
    goto :end
)

:: ── تحقق من وجود Python ──
where python >nul 2>&1
if %errorlevel% == 0 (
    echo  [✓] Python موجود — تشغيل الخادم...
    echo  [→] http://localhost:3000
    echo.
    start "" "http://localhost:3000"
    python "%~dp0server.py" %*
    goto :end
)

where python3 >nul 2>&1
if %errorlevel% == 0 (
    echo  [✓] Python3 موجود — تشغيل الخادم...
    echo  [→] http://localhost:3000
    echo.
    start "" "http://localhost:3000"
    python3 "%~dp0server.py" %*
    goto :end
)

:: ── لا Node ولا Python — استخدم PHP ──
where php >nul 2>&1
if %errorlevel% == 0 (
    echo  [✓] PHP موجود — تشغيل خادم بسيط...
    echo  [→] http://localhost:3000
    echo  [!] ملاحظة: بدون proxy للأغلفة في وضع PHP
    echo.
    start "" "http://localhost:3000"
    php -S localhost:3000 -t "%~dp0"
    goto :end
)

echo  [✗] لم يُعثر على Node.js أو Python أو PHP
echo.
echo  يرجى تثبيت أحد البرامج التالية:
echo    - Node.js  : https://nodejs.org
echo    - Python   : https://python.org
echo.
pause

:end
