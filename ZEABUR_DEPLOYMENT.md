# Zeabur — one-time fix

GitHub pushes **tab tab nahi** chalte jab tak Settings → Dockerfile box me **purani file** padi hai.

Aapke screenshot me abhi bhi ye line hai:

```dockerfile
ENV PATH="/app/node_modules/.bin:${PATH}"
```

Yahi **exit 127** karti hai (`npm` / `rollup` PATH toot jata hai). GitHub wali file me ye line **nahi** hai.

## 1) Dockerfile box replace karo (sabse zaroori)

`hbmp-agentbot` → **Settings** → **Dockerfile**

1. **Load from GitHub** dabao  
   **YA** poori box select karke delete karo aur [Dockerfile.hbmp-agentbot](https://github.com/Grow24/HBMP-AgentBot/blob/main/Dockerfile.hbmp-agentbot) paste karo
2. Pehli line ye honi chahiye: `# HBMP_ZEABUR_REV=final-8080`
3. `ENV PATH=...node_modules/.bin` **nahi** hona chahiye
4. Purple **Save** dabao (Load ke baad Save ke bina purani file hi build hoti hai)

## 2) Settings

- Startup Command: **khali**
- CMD: **khali**
- Health Check: **8080** TCP
- Crash restarts: **-1**
- Memory: **2048** (1024 se build/runtime tight)

`mongodb` → Settings → Startup Command **`sh` hatao** (khali rakho). `sh` Mongo ke real entrypoint ko override karta hai.

## 3) Variables — `PORT` 8080 karo

Networking 8080 hai, `PORT=3080` 502 deta hai.

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
GOOGLE_KEY=PASTE_NEW_GEMINI_KEY_FROM_AISTUDIO
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
ZBPACK_DOCKERFILE_PATH=Dockerfile.hbmp-agentbot
```

## 4) Redeploy

Overview → **Redeploy** (Restart nahi). Suspended ho to pehle unsuspend.

Logs me ye aana chahiye:

```text
HBMP_ZEABUR_REV=final-8080 starting HOST=0.0.0.0 PORT=8080
Connected to MongoDB
Server listening on all interfaces at port 8080
```

Agar log me phir `npm run build:data-provider && test -f` dikhe, Dockerfile **Save nahi** hua.

https://hbmpagentbot.zeabur.app/health → `OK`
