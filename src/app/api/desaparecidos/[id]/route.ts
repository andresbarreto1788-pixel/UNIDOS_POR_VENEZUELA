import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authed(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

// PATCH /api/desaparecidos/:id  -> marcar ENCONTRADO/BUSCANDO o editar (admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, { limit: 60, windowMs: 60_000, key: "desap-admin" });
  if (limited) return limited;
  if (!authed(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.estadoBusqueda === "ENCONTRADO" || body.estadoBusqueda === "BUSCANDO") {
      data.estadoBusqueda = body.estadoBusqueda;
    }
    const d = await prisma.desaparecido.update({ where: { id: params.id }, data });
    invalidateCache();
    return NextResponse.json({ ok: true, desaparecido: d });
  } catch {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }
}

// DELETE /api/desaparecidos/:id  (admin)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authed(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  try {
    await prisma.desaparecido.delete({ where: { id: params.id } });
    invalidateCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }
}
