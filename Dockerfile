# ---- Unidos por Venezuela · imagen de producción ----
# Multi-stage: build con todas las dependencias, runtime mínimo y no-root.

FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Dependencias ----
FROM base AS deps
COPY package.json package-lock.json* ./
# --ignore-scripts evita que el postinstall (prisma generate) corra antes
# de copiar el esquema; Prisma se genera explícitamente en la etapa de build.
RUN npm ci --ignore-scripts

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- Runner (producción) ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["./docker-entrypoint.sh"]
