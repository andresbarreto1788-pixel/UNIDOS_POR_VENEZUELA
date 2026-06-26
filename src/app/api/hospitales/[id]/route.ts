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

// PATCH /api/hospitales/:id  -> actualizar datos del centro (admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, { limit: 40, windowMs: 60_000, key: "hosp-edit" });
  if (limited) return limited;
  if (!authed(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, string | null> = {};
    if (body.nombre != null) data.nombre = String(body.nombre).trim().slice(0, 120);
    if (body.ciudad != null) data.ciudad = String(body.ciudad).trim().slice(0, 80);
    if (body.direccion != null) data.direccion = String(body.direccion).slice(0, 200) || null;
    if (body.telefono != null) data.telefono = String(body.telefono).slice(0, 40) || null;
    if (body.mapsUrl != null) data.mapsUrl = String(body.mapsUrl).slice(0, 300) || null;

    const hospital = await prisma.hospital.update({ where: { id: params.id }, data });
    invalidateCache();
    return NextResponse.json({ ok: true, hospital });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo actualizar." }, { status: 400 });
  }
}

// DELETE /api/hospitales/:id  (admin) - solo si no tiene personas asociadas
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authed(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  try {
    const count = await prisma.persona.count({ where: { hospitalId: params.id } });
    if (count > 0) {
      return NextResponse.json(
        { ok: false, error: `No se puede eliminar: tiene ${count} personas asociadas.` },
        { status: 409 }
      );
    }
    await prisma.hospital.delete({ where: { id: params.id } });
    invalidateCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo eliminar." }, { status: 400 });
  }
}
