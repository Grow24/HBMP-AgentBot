# Zeabur — HBMP AgentBot

Repo: https://github.com/Grow24/HBMP-AgentBot (`main`)

Dockerfile first line must be: `# HBMP_ZEABUR_REV=final-8080`  
Agar Settings me `ENV PATH=...node_modules/.bin` dikhe, GitHub wala file **load nahi** hua.

## Dashboard (ek baar)

1. **Settings → Dockerfile → Load from GitHub → Save**
2. Startup Command aur CMD **khali** rakho
3. Health Check **ON**, port **8080**, TCP
4. Crash restart attempts **-1**
5. Memory kam se kam **2048 Mi** (1024 se Vite/Node tight hai)
6. Networking public domain → container port **HTTP :8080** (abhi screenshot yahi hai)

## Variables (hbmp-agentbot)

`PORT` **8080** hona chahiye — `3080` mat rakho (gateway 8080 pe hai).

```bash
AGENTBOT_BASE=/
ALLOW_REGISTRATION=true
ALLOW_UNVERIFIED_EMAIL_LOGIN=true
CREDS_IV=1c5b0cc6e66da3e62fe5ce5b0c60a1fa
CREDS_KEY=b04e6efa967bb144bf56e95a147806b35f3536b1909fc4fa3b4f9dcde59c75c8
DOMAIN_CLIENT=https://hbmpagentbot.zeabur.app
DOMAIN_SERVER=https://hbmpagentbot.zeabur.app
EMAIL_FROM=grow24.ai.collaboration@gmail.com
EMAIL_PASSWORD=fcetsifsklnikmch
EMAIL_SERVICE=gmail
EMAIL_USERNAME=grow24.ai.collaboration@gmail.com
ENDPOINTS=google,agents
GOOGLE_KEY=AIzaSyBP7O-jByJfYKdQHiqPtfC4QOfAzQGZI48
GOOGLE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
HOST=0.0.0.0
JWT_REFRESH_SECRET=804cda0b893aa9ad954af847bfbb831b35ae91fd724bdcf5c796af8556d8e3ce
JWT_SECRET=d681e891b7da71441479019896248723f1dda304ed4fe2544e44cdf9f0ccfd1d
MONGO_URI=mongodb://mongo:7S8v915ZTngDN0fc3Ux4HaqciQhAWJ62@mongodb.zeabur.internal:27017/LibreChat
NODE_ENV=production
PORT=8080
SEARCH=false
SESSION_SECRET=0be245bce9e8a5dc94f3934da027988f104fe9d0bb71861293a7410017ce0bbd
TRUST_PROXY=1
```

Save → **Redeploy** (Restart nahi). Build 10–15 min.

Logs me ye dikhna chahiye:

```text
HBMP_ZEABUR_REV=final-8080 starting HOST=0.0.0.0 PORT=8080
Connected to MongoDB
Server listening on all interfaces at port 8080
```

Check: https://hbmpagentbot.zeabur.app/health → `OK`  
Phir: https://hbmpagentbot.zeabur.app/register
