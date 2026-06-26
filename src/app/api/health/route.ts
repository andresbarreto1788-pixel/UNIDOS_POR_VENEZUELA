import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Health check para Docker / Railway / balanceador.
// Verifica que la app responde Y que la base de datos está accesible.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, status: "healthy", db: "up", time: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, status: "degraded", db: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
