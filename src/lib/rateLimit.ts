// Rate limiting por IP en memoria (ventana deslizante).
// Protege la base de datos de abuso / picos / bots durante la emergencia.
// Para una sola instancia (Railway) es suficiente; si se escala a varias
// instancias, conviene mover esto a Redis.

import { NextRequest, NextResponse } from "next/server";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

// Limpieza periódica para que el Map no crezca sin control
let lastCleanup = Date.now();
function cleanup(now: number) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, b] of buckets) {
    if (b.reset < now) buckets.delete(key);
  }
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "anon";
}

/**
 * Devuelve null si está permitido, o una NextResponse 429 si se excedió.
 * @param limit  máximo de peticiones por ventana
 * @param windowMs  tamaño de la ventana en ms
 */
export function rateLimit(
  req: NextRequest,
  { limit = 60, windowMs = 10_000, key = "api" }: { limit?: number; windowMs?: number; key?: string } = {}
): NextResponse | null {
  const now = Date.now();
  cleanup(now);

  const id = `${key}:${getClientIp(req)}`;
  const b = buckets.get(id);

  if (!b || b.reset < now) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    return null;
  }

  b.count++;
  if (b.count > limit) {
    const retry = Math.ceil((b.reset - now) / 1000);
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retry),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
  return null;
}
