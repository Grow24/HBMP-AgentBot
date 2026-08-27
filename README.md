# HBMP AgentBot

An advanced AI agent platform for intelligent automation and conversation management.

This repository is a **standalone app**. It serves at `/` (not under a parent website path).

- Local / Docker: **[STANDALONE.md](./STANDALONE.md)**
- Zeabur: **[ZEABUR_DEPLOYMENT.md](./ZEABUR_DEPLOYMENT.md)**

## Features

- Multi-model AI (Google Gemini by default)
- Agents, file search, web search, code interpreter
- Multi-user auth
- Docker and Zeabur deployment

## Local install

```bash
git clone https://github.com/Grow24/HBMP-AgentBot.git
cd HBMP-AgentBot
npm run setup
# Edit .env — GOOGLE_KEY, DOMAIN_CLIENT / DOMAIN_SERVER, secrets
npm install
npm run standalone:dev    # API :3080 + UI :3090
# or
npm run standalone:prod   # one process on :3080
```

## Docker

```bash
npm run standalone:docker
```

App URL: `http://localhost:3080`

## Zeabur

1. Push this repo to GitHub (`Grow24/HBMP-AgentBot`)
2. Zeabur → New Project → add **MongoDB** + Git service from this repo
3. Set env vars as in [ZEABUR_DEPLOYMENT.md](./ZEABUR_DEPLOYMENT.md)

## License

See the LICENSE file.
