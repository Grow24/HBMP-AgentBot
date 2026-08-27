#!/bin/sh
# Build workspace packages with the root rollup binary (no rimraf PATH).
set -eu

ROLLUP="/app/node_modules/rollup/dist/bin/rollup"
if [ ! -f "$ROLLUP" ]; then
  echo "ERROR: rollup CLI missing at $ROLLUP"
  ls -la /app/node_modules/.bin 2>/dev/null | head -50 || true
  ls -la /app/node_modules/rollup 2>/dev/null || true
  exit 127
fi

build_pkg() {
  dir="$1"
  echo "Building ${dir} with node ${ROLLUP}"
  cd "/app/${dir}"
  rm -rf dist
  node "$ROLLUP" -c --bundleConfigAsCjs
}

build_pkg packages/data-provider
test -f /app/packages/data-provider/dist/index.js

build_pkg packages/data-schemas
test -f /app/packages/data-schemas/dist/index.cjs

build_pkg packages/api
test -f /app/packages/api/dist/index.js

build_pkg packages/client
test -f /app/packages/client/dist/index.js
