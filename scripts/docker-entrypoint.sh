#!/bin/sh
set -e

# Config is gitignored; image/build may only have the example file.
if [ ! -f /app/librechat.yaml ] && [ -f /app/librechat.yaml.example ]; then
  cp /app/librechat.yaml.example /app/librechat.yaml
  echo "Created librechat.yaml from librechat.yaml.example"
fi

mkdir -p /app/uploads /app/logs /app/client/public/images /app/api/logs

# Zeabur (and most PaaS) inject PORT. Default matches local Docker.
# Start node directly — `npm run backend` needs `cross-env`, which is pruned
# from production images and would crash the container (Zeabur 502).
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-3080}"
export NODE_ENV="${NODE_ENV:-production}"
export AGENTBOT_BASE="${AGENTBOT_BASE:-/}"

exec node api/server/index.js
