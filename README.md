# 🎮 ARCADE VAULT — دليل التشغيل الكامل

> موقع ويب لتشغيل ألعاب الفيديو الكلاسيكية على المتصفح مباشرةً  
> يعمل محلياً على جهازك بدون إنترنت (ما عدا تحميل المحاكي لأول مرة)

---

## 📁 هيكل الملفات

```
arcade-vault/
│
├── index.html          ← الموقع كاملاً (ملف HTML واحد)
├── server.js           ← الخادم المحلي (Node.js) — موصى به
├── server.py           ← الخادم المحلي (Python) — بديل
├── start.bat           ← تشغيل على Windows بنقرة مزدوجة
├── start.sh            ← تشغيل على Linux/macOS
├── games.json          ← قائمة الألعاب (اختياري — يُولَّد تلقائياً)
│
├── roms/               ← ← ضع ملفات ROM هنا ← ←
│   ├── Super Mario.nes
│   ├── Sonic.md
│   └── ...
│
├── saves/              ← (احتياطي) ملفات الحفظ — تُخزَّن في المتصفح
└── covers/             ← (احتياطي) أغلفة مخصصة
```

---

## ⚡ التشغيل السريع

### Windows
```
انقر مزدوجاً على:  start.bat
```

### Linux / macOS
```bash
chmod +x start.sh
./start.sh
```

### Node.js مباشرة
```bash
node server.js
# أو بمنفذ مختلف:
node server.js --port=8080
# أو للشبكة المحلية (يمكن الوصول من جوال/تابلت على نفس الواي فاي):
node server.js --host=0.0.0.0
```

### Python مباشرة
```bash
python3 server.py
python3 server.py --port 8080 --host 0.0.0.0
```

### بدون أي برنامج (محدود — لا Proxy)
```bash
# إذا كان لديك PHP:
php -S localhost:3000

# أو الخادم البسيط المدمج في Python (بدون Proxy):
python3 -m http.server 3000
```

---

## 🎯 إضافة الألعاب

### الطريقة 1: ملفات محلية (الأسرع)
- اضغط زر **📂** في الشريط العلوي → اختر مجلداً يحتوي ملفات ROM
- أو **اسحب وأفلت** المجلد مباشرة على الموقع

### الطريقة 2: مجلد roms/ (عبر الخادم)
- ضع ملفات ROM في مجلد `roms/`
- الخادم يُنشئ `games.json` تلقائياً عند الفتح

### الطريقة 3: games.json مخصص
عدّل `games.json` يدوياً لإضافة سنة/تصنيف/غلاف مخصص:
```json
{
  "games": [
    {
      "file"  : "Super Mario.nes",
      "title" : "Super Mario Bros",
      "system": "nes",
      "year"  : "1985",
      "genre" : "Platform",
      "cover" : "covers/mario.png"
    }
  ]
}
```

### الطريقة 4: GitHub (للنشر العام)
في إعدادات الموقع ← GitHub:
- **Owner**: اسم حسابك على GitHub
- **Repo**: اسم المستودع
- **Branch**: main
- **مجلد**: roms

---

## 🕹 الأنظمة المدعومة

| النظام | الامتداد | الأداء |
|--------|---------|--------|
| NES | `.nes` | ⚡ خفيف |
| SNES | `.smc` `.sfc` | ⚡ خفيف |
| Game Boy / Color / Advance | `.gb` `.gbc` `.gba` | ⚡ خفيف |
| Nintendo DS | `.nds` | ⚡⚡ متوسط |
| Nintendo 64 | `.n64` `.z64` | 🔥 ثقيل |
| Sega Mega Drive | `.md` `.gen` | ⚡ خفيف |
| Sega Master System | `.sms` | ⚡ خفيف |
| PlayStation 1 | `.bin` `.iso` | ⚡⚡ متوسط |
| PSP | `.pbp` `.cso` | 🔥 ثقيل |
| Atari 2600 / 7800 | `.a26` `.a78` | ⚡ خفيف |
| PC Engine | `.pce` | ⚡ خفيف |
| Arcade (FBNeo/MAME) | `.zip` | متفاوت |
| DOS | `.exe` | ⚡ خفيف |

---

## 🖼 أغلفة الألعاب (Box Art)

الأغلفة تُجلب تلقائياً من **Libretro Thumbnails** بناءً على اسم اللعبة.

**إذا لم تظهر الأغلفة:**

1. **تأكد من تفعيل الأغلفة**: الإعدادات ← العرض ← أغلفة Box Art ✅
2. **أضف Proxy** (حل مشاكل CORS إذا فتحت الملف مباشرة):
   - في الإعدادات ← الأداء ← CORS Proxy
   - أدخل: `http://localhost:3000/proxy?url=`  *(إذا كنت تستخدم خادمنا)*
3. **تسمية الملفات**: سمّ ملفات ROM بنفس اسم اللعبة الإنجليزي الأصلي  
   مثال: `Super Mario Bros (USA).nes` أو `Super Mario Bros.nes`

---

## 💾 ملفات الحفظ (Save States)

- تُخزَّن في **LocalStorage** المتصفح تلقائياً
- **تبقى ثابتة** حتى لو نقلت الملف أو غيّرت حجمه (تحديث v2)
- ID اللعبة يعتمد الآن على: **اسم الملف + النظام** فقط
  - مثال: `Super Mario Bros.nes` ← ID: `nes_Super_Mario_Bros`
- 4 slots للحفظ لكل لعبة
- حفظ تلقائي كل 60 ثانية (قابل للإيقاف)

---

## ⚙ الإعدادات

| الإعداد | الوصف |
|---------|--------|
| EmulatorJS CDN | مصدر محرك المحاكاة — اتركه الافتراضي |
| Core Overrides | اختر نواة مختلفة لكل نظام |
| BIOS | روابط ملفات BIOS (PS1, Dreamcast, Saturn...) |
| CRT Shader | تأثيرات شاشة قديمة |
| GitHub | ربط مستودع لاستضافة ROM |
| CORS Proxy | لحل مشاكل تحميل الأغلفة |

---

## 🔧 حل المشاكل الشائعة

**اللعبة لا تفتح:**
- تأكد أن امتداد الملف صحيح ومدعوم
- بعض الألعاب تحتاج ملف BIOS (PS1، Dreamcast)
- جرّب تغيير الـ CDN في الإعدادات

**الأغلفة لا تظهر:**
- أضف `http://localhost:3000/proxy?url=` في حقل CORS Proxy
- أو افتح المتصفح بدون CORS: `chrome --disable-web-security --user-data-dir=/tmp`

**ملفات الحفظ اختفت:**
- لا تمسح بيانات المتصفح (Clear Site Data)
- ملفات الحفظ مرتبطة بـ domain — إذا غيّرت المنفذ ستحتاج إعادة ضبط

**الأداء بطيء:**
- استخدم متصفح Chrome أو Edge (أسرع WebAssembly)
- أغلق التبويبات الأخرى
- الألعاب المصنّفة 💀 (N64، PS1 كبيرة) تحتاج حاسوباً قوياً

---

## 📦 النشر على خادم حقيقي (Apache/Nginx)

### Apache — ملف `.htaccess`
```apache
Options -Indexes
AddType application/octet-stream .nes .smc .gba .gb .md .n64
Header always set Access-Control-Allow-Origin "*"
```

### Nginx
```nginx
location / {
    add_header Access-Control-Allow-Origin *;
    try_files $uri $uri/ /index.html;
}
location /roms/ {
    add_header Content-Disposition attachment;
}
```

---

## 📄 الترخيص والملاحظات

- المحاكي يعتمد على **EmulatorJS** (MIT License)
- الأغلفة من **Libretro Thumbnails** (مفتوح المصدر)
- **تنبيه قانوني**: تأكد أنك تمتلك نسخة أصلية من الألعاب قبل استخدام ROM
