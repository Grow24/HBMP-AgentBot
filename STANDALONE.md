# HBMP AgentBot — standalone app

This folder is a **complete app**. Copy it off the parent website repo and run it on its own domain/port. It serves at `/` (not `/HBMP_AgentBot/`).

The parent Grow24 site can still embed this same folder under `/HBMP_AgentBot/` when you run that site. Those parent scripts set `AGENTBOT_BASE=/HBMP_AgentBot/`. Do **not** set that variable when this app is its own site.

## Copy to a server

```bash
# from the parent repo, or rsync/scp the folder
cp -a HBMP_AgentBot /opt/hbmp-agentbot
cd /opt/hbmp-agentbot
```

Needs: **Node.js 20+**, **npm 9+**, and **MongoDB** (Docker Compose starts Mongo for you).

## 1) One-time setup

```bash
npm run setup
```

This creates `.env` and `librechat.yaml` from the example files if they are missing.

Edit `.env`:

1. Set `GOOGLE_KEY` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`)
2. Replace `SESSION_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CREDS_KEY` with `openssl rand -hex 32`
3. Replace `CREDS_IV` with `openssl rand -hex 16`
4. Set the public URL of **this** app:

```env
DOMAIN_CLIENT=https://agentbot.yourdomain.com
DOMAIN_SERVER=https://agentbot.yourdomain.com
AGENTBOT_BASE=/
HOST=0.0.0.0
PORT=3080
```

## 2) Run — pick one

### A. Docker (recommended on a server)

```bash
npm run standalone:docker
# same as: npm run setup && docker compose up -d --build
```

Open `http://SERVER_IP:3080`. First image build takes several minutes.

Optional file-search / RAG:

```bash
docker compose --profile rag up -d --build
```

### B. Node production (Mongo already running)

```bash
npm ci
npm run standalone:prod
```

This builds `client/dist` if needed, then `npm start` (Express serves the UI + `/api` on port 3080).

### C. Local development (hot reload)

```bash
npm install
npm run standalone:dev
```

- API: http://localhost:3080  
- Vite UI: http://localhost:3090  

### D. Nginx in front (port 80)

```bash
docker compose -f deploy-compose.yml up -d --build
```

### E. Caddy in front of a Node process

After `npm run standalone:prod` is listening on 3080:

```bash
caddy run --config Caddyfile.standalone
```

## 3) Create the first user

```bash
npm run create-user
```

Or open `/register` if `ALLOW_REGISTRATION=true`.

## Parent website vs this app

| Mode | `AGENTBOT_BASE` | `DOMAIN_CLIENT` |
| --- | --- | --- |
| This app alone | `/` | `https://agentbot.example.com` |
| Inside Grow24 site | `/HBMP_AgentBot/` | `https://grow24.example.com/HBMP_AgentBot` |

Leave `AGENTBOT_BASE` unset or `/` for standalone. Parent `npm run dev:agentbot` still injects the subpath for the combined site.

## Health check

```bash
curl http://localhost:3080/health
```
