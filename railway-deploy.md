# Railway Deployment Guide

## Quick Deploy (2 minutes)

### Step 1: Deploy Template
1. Click: https://railway.app/template/b5k2mn?referralCode=HI9hWz
2. Sign up with GitHub (free)
3. Click "Deploy Now"

### Step 2: Add Your API Keys
In Railway dashboard, go to Variables and add:

```
OPENAI_API_KEY=sk-your-actual-key
ANTHROPIC_API_KEY=sk-ant-your-actual-key
GOOGLE_KEY=your-google-key
```

### Step 3: Access Your App
- Railway will provide a URL like: `https://librechat-production-xxxx.up.railway.app`
- Open the URL and create your account

## What Gets Deployed
- ✅ LibreChat Frontend (React)
- ✅ LibreChat API (Node.js)
- ✅ MongoDB (Database)
- ✅ Meilisearch (Search)
- ✅ PostgreSQL + pgvector (Vector DB)
- ✅ RAG API (Document processing)

## Free Tier Limits
- 500 execution hours/month
- $5 credit monthly
- Perfect for personal use

## Alternative: Zeabur
If Railway doesn't work: https://zeabur.com/templates/0X2ZY8

## Need Help?
- Railway docs: https://docs.railway.app
- LibreChat docs: https://docs.librechat.ai