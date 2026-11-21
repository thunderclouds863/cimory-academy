#!/usr/bin/env bash
# Start PostgreSQL lokal (ephemeral), migrate + seed data demo, lalu jalankan server.
set -euo pipefail
PGBIN=$(ls -d /usr/lib/postgresql/*/bin | head -1)
PGDATA=${PGDATA:-/tmp/pgdata}
PGPORT=${PGPORT:-5432}
mkdir -p "$PGDATA" && chown postgres "$PGDATA"
su postgres -c "$PGBIN/initdb -D $PGDATA -A trust -U postgres" > /dev/null
su postgres -c "$PGBIN/pg_ctl -D $PGDATA -o '-c listen_addresses=127.0.0.1 -p $PGPORT -k /tmp -c shared_buffers=32MB' -w start" > /dev/null
"$PGBIN/createdb" -h 127.0.0.1 -p "$PGPORT" -U postgres academy
export DATABASE_URL="postgres://postgres@127.0.0.1:$PGPORT/academy"
export JWT_SECRET="${JWT_SECRET:-$(head -c 32 /dev/urandom | base64)}"
cd "$(dirname "$0")/.."
node db/migrate.js
node db/seed.js
exec node server.js
