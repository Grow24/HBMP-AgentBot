#!/bin/sh
set -e

# Config is gitignored; image/build may only have the example file.
if [ ! -f /app/librechat.yaml ] && [ -f /app/librechat.yaml.example ]; then
  cp /app/librechat.yaml.example /app/librechat.yaml
  echo "Created librechat.yaml from librechat.yaml.example"
fi

mkdir -p /app/uploads /app/logs /app/client/public/images /app/api/logs /app/node_modules/@librechat

# If prune/cache left a broken workspace link, copy built packages in place.
copy_pkg() {
  src="$1"
  dest="$2"
  file="$3"
  if [ -f "$dest/$file" ]; then
    return 0
  fi
  if [ -f "$src/$file" ]; then
    echo "Restoring $dest from $src"
    rm -rf "$dest"
    mkdir -p "$dest"
    cp -a "$src/package.json" "$dest/"
    cp -a "$src/dist" "$dest/dist"
  fi
}

copy_pkg /app/packages/data-schemas /app/node_modules/@librechat/data-schemas dist/index.cjs
copy_pkg /app/packages/api /app/node_modules/@librechat/api dist/index.js
copy_pkg /app/packages/data-provider /app/node_modules/librechat-data-provider dist/index.js

if [ ! -f /app/node_modules/@librechat/data-schemas/dist/index.cjs ]; then
  echo "Missing @librechat/data-schemas dist. packages/data-schemas:"
  ls -la /app/packages/data-schemas /app/packages/data-schemas/dist /app/node_modules/@librechat 2>&1 || true
  exit 1
fi

# Zeabur (and most PaaS) inject PORT. Default matches local Docker.
# Start node directly — `npm run backend` needs `cross-env`, which is pruned
# from production images and would crash the container (Zeabur 502).
export HOST="${HOST:-0.0.0.0}"
# Zeabur injects ZEABUR_WEB_URL. Always bind 8080 (health check + public map).
if [ -n "${ZEABUR_WEB_URL:-}" ] || [ -n "${ZEABUR_PROJECT_ID:-}" ]; then
  export PORT=8080
else
  export PORT="${PORT:-8080}"
fi
export NODE_ENV="${NODE_ENV:-production}"
export AGENTBOT_BASE="${AGENTBOT_BASE:-/}"

# Zeabur Mongo root user lives in admin; /LibreChat without authSource fails auth.
if [ -n "${MONGO_URI:-}" ] && echo "$MONGO_URI" | grep -q '@' && ! echo "$MONGO_URI" | grep -qi 'authSource='; then
  case "$MONGO_URI" in
    *\?*) export MONGO_URI="${MONGO_URI}&authSource=admin" ;;
    *) export MONGO_URI="${MONGO_URI}?authSource=admin" ;;
  esac
  echo "Appended authSource=admin to MONGO_URI"
fi

exec node api/server/index.js
