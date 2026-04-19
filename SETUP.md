# ⚠️ SETUP REQUIRED — اقرأ هاد قبل ما تنشر

## الخطوة 1 — إعداد Firebase Realtime Database Rules

روح على: https://console.firebase.google.com/project/box0-238b3/database/rules

انسخ والصق هاد:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

اضغط **Publish** — بدون هاد الخطوة مش ممكن تكتب بيانات.

---

## الخطوة 2 — إعداد Firebase Storage Rules

روح على: https://console.firebase.google.com/project/box0-238b3/storage/rules

انسخ والصق هاد:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

اضغط **Publish**.

---

## الخطوة 3 — إعداد Firebase Storage Bucket

في Firebase Console → Storage:
1. اضغط **Get started**
2. اختار **Start in test mode**
3. اختار أقرب region (europe-west1 للشرق الأوسط)
4. اضغط **Done**

---

## الخطوة 4 — نشر الموقع على GitHub Pages

```bash
git init
git add .
git commit -m "Majd Portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

ثم في GitHub: **Settings → Pages → Source: main / root**

---

## الخطوة 5 — أو نشر على Vercel (أسرع وأسهل)

1. ارفع على GitHub
2. روح https://vercel.com
3. Import Project
4. اختار الـ repo → Deploy

**خلاص!** الموقع حيكون اونلاين.

---

## هيكل الملفات

```
majd-portfolio/
├── index.html          ← الصفحة الرئيسية (نظيفة من البيانات)
├── style.css           ← كل الستايل
├── app.js              ← كل اللوجك (الكريدنشالز مشفرة base64)
├── firebase.js         ← اتصال Firebase SDK
├── assets/
│   └── logo.png        ← اللوجو
├── database.rules.json ← قواعد Firebase (للمرجع)
└── SETUP.md            ← هاد الملف
```

## الرمز السري

اكتب `@Majd12345@` في أي خانة بحث في الموقع.
