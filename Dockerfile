# v0.8.1-rc1

# Base node image
FROM node:20-alpine AS node

# Install jemalloc
RUN apk add --no-cache jemalloc
RUN apk add --no-cache python3 py3-pip uv

# Set environment variable to use jemalloc
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

# Add `uv` for extended MCP support
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

RUN mkdir -p /app && chown node:node /app
WORKDIR /app

USER node

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node client/package.json ./client/package.json
COPY --chown=node:node packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=node:node packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=node:node packages/api/package.json ./packages/api/package.json
COPY --chown=node:node packages/client/package.json ./packages/client/package.json

RUN \
    # Allow mounting of these files, which have no default
    touch .env ; \
    # Create directories for the volumes to inherit the correct permissions
    mkdir -p /app/client/public/images /app/api/logs /app/uploads ; \
    npm config set fetch-retry-maxtimeout 600000 ; \
    npm config set fetch-retries 5 ; \
    npm config set fetch-retry-mintimeout 15000 ; \
    npm ci --no-audit

COPY --chown=node:node . .

# Standalone app is served at origin root, not under /HBMP_AgentBot
ENV AGENTBOT_BASE=/
ENV HOST=0.0.0.0

# 3072 fits Zeabur 4GB builders; 8192 OOMs and used to continue via `;` so dist never landed in the image.
ENV NODE_OPTIONS=--max-old-space-size=3072

RUN set -eux; \
    if [ -f librechat.yaml.example ] && [ ! -f librechat.yaml ]; then \
      cp librechat.yaml.example librechat.yaml; \
    fi; \
    npm run build:data-provider; \
    npm run build:data-schemas; \
    npm run build:api; \
    npm run build:client-package; \
    AGENTBOT_BASE=/ npm run build:client; \
    test -f packages/data-provider/dist/index.js; \
    test -f packages/data-schemas/dist/index.cjs; \
    test -f packages/api/dist/index.js; \
    mkdir -p /tmp/lc-dist; \
    cp -a packages/data-provider/dist /tmp/lc-dist/data-provider; \
    cp -a packages/data-schemas/dist /tmp/lc-dist/data-schemas; \
    cp -a packages/api/dist /tmp/lc-dist/api; \
    cp -a client/dist /tmp/lc-dist/client; \
    npm prune --omit=dev; \
    cp -a /tmp/lc-dist/data-provider packages/data-provider/dist; \
    cp -a /tmp/lc-dist/data-schemas packages/data-schemas/dist; \
    cp -a /tmp/lc-dist/api packages/api/dist; \
    cp -a /tmp/lc-dist/client client/dist; \
    mkdir -p node_modules/@librechat; \
    ln -sfn /app/packages/data-schemas node_modules/@librechat/data-schemas; \
    ln -sfn /app/packages/api node_modules/@librechat/api; \
    ln -sfn /app/packages/data-provider node_modules/librechat-data-provider; \
    test -f node_modules/@librechat/data-schemas/dist/index.cjs; \
    test -f node_modules/@librechat/api/dist/index.js; \
    npm cache clean --force

# Node API setup
# Do not pin PORT here — Zeabur injects $PORT (often 8080). Local compose still
# passes PORT=3080. Listen on process.env.PORT in the entrypoint.
ENV HOST=0.0.0.0
ENV SEARCH=false
EXPOSE 3080 8080

COPY --chown=node:node scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh
RUN chmod +x /app/scripts/docker-entrypoint.sh

CMD ["/app/scripts/docker-entrypoint.sh"]

# Optional: for client with nginx routing
# FROM nginx:stable-alpine AS nginx-client
# WORKDIR /usr/share/nginx/html
# COPY --from=node /app/client/dist /usr/share/nginx/html
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
