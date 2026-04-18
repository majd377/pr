# Majd Portfolio

## File Structure

```
majd-portfolio/
├── index.html       ← Main page (no sensitive data, imports only)
├── style.css        ← All styles
├── app.js           ← All logic + credentials (obfuscated via base64)
├── firebase.js      ← Firebase SDK + DB/Storage helpers
├── assets/
│   └── logo.png     ← Put your logo image here
└── README.md
```

## Deploy to GitHub Pages

1. Create a new repo on GitHub (can be **private** if you prefer)
2. Copy all files into it
3. Put your logo as `assets/logo.png`
4. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
5. Go to **Settings → Pages → Source: main branch / root**
6. Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Deploy to Vercel (recommended for instant HTTPS)

1. Push to GitHub first (step above)
2. Go to https://vercel.com → Import Project → Select your repo
3. Click Deploy — done. Zero config needed.

## Firebase Rules (important!)

In Firebase Console → Realtime Database → Rules, set:

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "projects": {
      ".write": false
    },
    "meta": {
      ".write": false
    }
  }
}
```

Writes are done through the Admin panel which uses your credentials — no public write access needed.

## Admin Access

- Type `@Majd12345@` in any search box on the site
- Login with your credentials
- Manage projects, logo, about text, and CV from the dashboard

## Security Notes

- No credentials appear in `index.html` (view source is clean)
- All secrets are in `app.js` encoded with base64 — not visible in plain HTML
- Firebase credentials are needed to connect but cannot write without your admin login
- For maximum security, consider setting Firebase Storage rules to allow read-only publicly
