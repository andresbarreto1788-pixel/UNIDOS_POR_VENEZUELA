#!/bin/sh
set -e

echo "→ Esperando y aplicando esquema a PostgreSQL..."
npx prisma db push --skip-generate

echo "→ Cargando datos reales (seed idempotente)..."
npx prisma db seed || echo "⚠ Seed omitido (continúa de todos modos)"

echo "→ Iniciando servidor Next.js en :3000"
exec node_modules/.bin/next start -p 3000 -H 0.0.0.0
