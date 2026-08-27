# HBMP_ZEABUR_REV=final-8080
# If Zeabur Settings still shows ENV PATH=.../node_modules/.bin this file was NOT loaded from GitHub.

FROM node:20-alpine AS node

RUN apk add --no-cache jemalloc python3 py3-pip uv make g++ git
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

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

# Zeabur Variables NODE_ENV=production would skip rollup/rimraf during npm ci.
ENV NODE_ENV=development

RUN npm config set fetch-retry-maxtimeout 600000 \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 15000 \
    && NODE_ENV=development npm ci --no-audit --legacy-peer-deps --include=dev \
    && (NODE_ENV=development npm install --no-save @rollup/rollup-linux-x64-musl \
        || NODE_ENV=development npm install --no-save @rollup/rollup-linux-arm64-musl \
        || true)

COPY . .
RUN chmod +x /app/scripts/docker-build-packages.sh /app/scripts/docker-entrypoint.sh

ENV AGENTBOT_BASE=/
ENV HOST=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=3072

RUN if [ -f librechat.yaml.example ] && [ ! -f librechat.yaml ]; then \
      cp librechat.yaml.example librechat.yaml; \
    fi

RUN /app/scripts/docker-build-packages.sh
RUN AGENTBOT_BASE=/ npm run build:client && test -d client/dist

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

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV SEARCH=false
EXPOSE 8080 3080

USER node
CMD ["/app/scripts/docker-entrypoint.sh"]
