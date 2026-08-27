# Zeabur pe HBMP AgentBot deploy

Repo: [Grow24/HBMP-AgentBot](https://github.com/Grow24/HBMP-AgentBot)

Zeabur Docker Compose support nahi karta. **App Git se Dockerfile se banegi**, **MongoDB** alag service hogi.

## 1) GitHub

Code `main` branch pe hona chahiye: `https://github.com/Grow24/HBMP-AgentBot.git`

## 2) Zeabur me naya project

1. [dash.zeabur.com](https://dash.zeabur.com) → **New Project**
2. Region choose karo

### A. MongoDB

1. **Deploy New Service** → **Databases** → **MongoDB**
2. Wait until running
3. **Connections** → **Private / Internal** URI copy karo  
   App ke liye internal URI use karo (public nahi)

### B. App (Git)

1. **Deploy New Service** → **GitHub**
2. Repo: `Grow24/HBMP-AgentBot`
3. Branch: `main`
4. Root directory: repo root (empty / `.`)
5. Zeabur root `Dockerfile` detect karega (Docker icon dikhega)

Pehli build 10–15 min le sakti hai.

## 3) Environment variables

App service → **Variables**. Raw edit me ye paste karo, phir secrets replace karo.

```bash
NODE_ENV=production
HOST=0.0.0.0
AGENTBOT_BASE=/
TRUST_PROXY=1
SEARCH=false
ENDPOINTS=google,agents
GOOGLE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite

# Zeabur domain bind karne ke baad ye dono us URL se match hone chahiye
DOMAIN_CLIENT=${ZEABUR_WEB_URL}
DOMAIN_SERVER=${ZEABUR_WEB_URL}

# MongoDB service ki Internal connection string + /LibreChat
MONGO_URI=mongodb://USER:PASS@HOST:27017/LibreChat

# openssl rand -hex 32  (teen alag values)
SESSION_SECRET=
JWT_SECRET=
JWT_REFRESH_SECRET=
CREDS_KEY=

# openssl rand -hex 16
CREDS_IV=

ALLOW_REGISTRATION=true
ALLOW_UNVERIFIED_EMAIL_LOGIN=true

# Kam se kam ek AI key
GOOGLE_KEY=
```

Secrets generate:

```bash
openssl rand -hex 32
openssl rand -hex 16
```

`MONGO_URI` ke end pe database name `LibreChat` lagana.

`DOMAIN_CLIENT` / `DOMAIN_SERVER`: Domain tab se public URL add karo, phir `${ZEABUR_WEB_URL}` resolve ho jayega. Agar nahi ho, manually `https://your-app.zeabur.app` set karo (trailing slash mat do).

## 4) Port (502 ka common cause)

`PORT` variable **mat** set karo — Zeabur khud inject karta hai (aksar **8080**). App `$PORT` pe listen karti hai.

`hbmp-agentbot` → **Networking** → public domain ka container port **usi `$PORT` ke barabar** ho (usually HTTP :8080).

Agar `PORT=3080` rakha hai aur gateway 8080 pe hai, site **502** degi. `PORT` delete karke redeploy karo.

## 5) Domain

Service → **Networking / Domain** → Generate domain. Phir **Redeploy**.

Health:

```bash
curl https://YOUR-APP.zeabur.app/health
```

`OK` aana chahiye.

## 6) Pehla user

`ALLOW_REGISTRATION=true` hai → `/register` se account banao.

Ya locally (same Mongo): `npm run create-user`

## Build notes

- Dockerfile heap **3072 MB** hai taaki 4GB Zeabur plan pe OOM na ho
- Build fail / OOM aaye to service RAM **8GB** karo, cache clear, redeploy
- Settings → Dockerfile → **Load from GitHub** → Save. Dashboard me purana Dockerfile cache ho to `dist` missing rehta hai
- Settings → Health Check port **3080** (Networking ke saath match)
- Crash restart attempts: **-1**
- Meilisearch optional hai (`SEARCH=false`)
- `librechat.yaml` image start pe example se ban jati hai

## Checklist

- [ ] MongoDB service same project me running
- [ ] Internal `MONGO_URI` set
- [ ] Unique `SESSION_SECRET`, `JWT_*`, `CREDS_KEY`, `CREDS_IV`
- [ ] `GOOGLE_KEY` set
- [ ] Domain bind + `DOMAIN_CLIENT` / `DOMAIN_SERVER` us URL par
- [ ] `PORT=3080` (Networking HTTP :3080 ke saath)
- [ ] `/health` OK
- [ ] Register + Google Gemini se chat
