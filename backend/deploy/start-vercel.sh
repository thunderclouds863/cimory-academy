#!/usr/bin/env bash
# Start untuk Vercel: DB eksternal via DATABASE_URL. Migrate + seed idempotent (IF NOT EXISTS / ON CONFLICT).
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?DATABASE_URL belum di-set}"
: "${JWT_SECRET:?JWT_SECRET belum di-set}"
# Upload sampel ikut ke /tmp (filesystem container read-only di luar /tmp, dan ephemeral)
mkdir -p "$UPLOAD_DIR" && cp -rn uploads/. "$UPLOAD_DIR"/ 2>/dev/null || true
node db/migrate.js
node db/seed.js
exec node server.js
