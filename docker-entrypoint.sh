#!/bin/sh
set -e

# Wait for PostgreSQL to accept connections
echo "Waiting for PostgreSQL at ${DATABASE_URL} ..."
until npx prisma db push --skip-generate --accept-data-loss 2>/dev/null; do
  echo "PostgreSQL is not ready yet — retrying in 3s..."
  sleep 3
done

echo "PostgreSQL is ready. Schema pushed."

# Seed admin user if ADMIN_EMAIL is set
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Seeding admin user..."
  npx tsx prisma/seed.ts || true
fi

echo "Starting application..."
exec "$@"
