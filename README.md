# Moneta — AI Financial Coach

A demoable AI finance app built with Next.js + Gemini 2.0 Flash. Deploy to Vercel in ~10 minutes.

---

## Step 1 — Get your free Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key — you'll need it in Step 3

---

## Step 2 — Put this project on GitHub

1. Go to **https://github.com/new**
2. Create a new repo called `moneta` (keep it private if you prefer)
3. Upload all the files from this folder into the repo
   - Drag and drop the entire `finance-coach` folder contents into GitHub's upload UI
   - Make sure the folder structure matches exactly what you see here

---

## Step 3 — Deploy to Vercel

1. Go to **https://vercel.com** and sign in
2. Click **"Add New Project"**
3. Import your `moneta` GitHub repo
4. Before clicking Deploy, click **"Environment Variables"**
5. Add this variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** paste your key from Step 1
6. Click **Deploy** 🎉

Your site will be live at `https://moneta-xyz.vercel.app` (Vercel picks the URL)

---

## How to demo it

1. Go to your live URL
2. Click **"Load demo transactions"** (no CSV needed)
3. Click the **"Analyse with AI"** button on the Overview page
4. Watch Gemini generate real behavioural insights
5. Show the Insights tab to your audience

---

## File structure (for reference)
```
finance-coach/
├── pages/
│   ├── _app.js          ← App wrapper
│   ├── index.js         ← Main UI
│   └── api/
│       └── analyse.js   ← Gemini API call (runs on server)
├── styles/
│   ├── globals.css      ← Fonts, colors, base styles
│   └── Home.module.css  ← All component styles
├── package.json         ← Dependencies
└── next.config.js       ← Next.js config
```

---

## Gemini free tier limits
- 15 requests per minute
- 1,500 requests per day
- Plenty for demos and portfolio use

---

## Customise it

- **Change the budget:** In `pages/index.js`, find `const budget = 2500` and change the number
- **Change the app name:** Search for `Moneta` in `index.js` and replace it
- **Add your own mock data:** Edit the `MOCK` array in `index.js`
