# v0.8.1-rc1

FROM node:20-alpine AS node

RUN apk add --no-cache jemalloc python3 py3-pip uv make g++ git
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2
ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

WORKDIR /app
RUN mkdir -p /app/client/public/images /app/api/logs /app/uploads \
    && touch /app/.env

COPY package.json package-lock.json ./
COPY api/package.json ./api/package.json
COPY client/package.json ./client/package.json
COPY packages/data-provider/package.json ./packages/data-provider/package.json
COPY packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/client/package.json ./packages/client/package.json

RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 15000 \
    && npm ci --no-audit --legacy-peer-deps

COPY . .

ENV AGENTBOT_BASE=/
ENV HOST=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=3072

RUN if [ -f librechat.yaml.example ] && [ ! -f librechat.yaml ]; then \
      cp librechat.yaml.example librechat.yaml; \
    fi

# Split layers so Zeabur logs show which command is missing (exit 127).
RUN npm run build:data-provider && test -f packages/data-provider/dist/index.js
RUN npm run build:data-schemas && test -f packages/data-schemas/dist/index.cjs
RUN npm run build:api && test -f packages/api/dist/index.js
RUN npm run build:client-package && test -f packages/client/dist/index.js
RUN AGENTBOT_BASE=/ npm run build:client && test -d client/dist

# Real copies, not workspace symlinks. Do not prune.
RUN mkdir -p node_modules/@librechat \
    && rm -rf node_modules/@librechat/data-schemas node_modules/@librechat/api node_modules/librechat-data-provider \
    && mkdir -p node_modules/@librechat/data-schemas node_modules/@librechat/api node_modules/librechat-data-provider \
    && cp -a packages/data-schemas/package.json node_modules/@librechat/data-schemas/ \
    && cp -a packages/data-schemas/dist node_modules/@librechat/data-schemas/dist \
    && cp -a packages/api/package.json node_modules/@librechat/api/ \
    && cp -a packages/api/dist node_modules/@librechat/api/dist \
    && cp -a packages/data-provider/package.json node_modules/librechat-data-provider/ \
    && cp -a packages/data-provider/dist node_modules/librechat-data-provider/dist \
    && test -f node_modules/@librechat/data-schemas/dist/index.cjs \
    && test -f node_modules/@librechat/api/dist/index.js \
    && chown -R node:node /app

ENV HOST=0.0.0.0
ENV SEARCH=false
EXPOSE 3080 8080

COPY scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh
RUN chmod +x /app/scripts/docker-entrypoint.sh \
    && chown node:node /app/scripts/docker-entrypoint.sh

USER node
CMD ["/app/scripts/docker-entrypoint.sh"]
