import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { cached, invalidateCache } from "@/lib/cache";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authed(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

// GET /api/hospitales -> lista con conteo de personas
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 60, windowMs: 10_000, key: "hospitales" });
  if (limited) return limited;

  try {
    // Esta lista cambia muy poco: caché de 60s.
    const hospitales = await cached("hospitales", 60_000, () =>
      prisma.hospital.findMany({
        orderBy: { nombre: "asc" },
        include: { _count: { select: { personas: true } } },
      })
    );
    return NextResponse.json(
      { ok: true, hospitales },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Base de datos no disponible", hospitales: [] },
      { status: 500 }
    );
  }
}

// POST /api/hospitales  -> crear hospital/centro nuevo (admin)
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowMs: 60_000, key: "hosp-write" });
  if (limited) return limited;
  if (!authed(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const nombre = String(body.nombre || "").trim().slice(0, 120);
    if (!nombre) {
      return NextResponse.json({ ok: false, error: "El nombre es obligatorio." }, { status: 400 });
    }
    const slug = (String(body.slug || "").trim() || slugify(nombre)).slice(0, 60);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Slug inválido." }, { status: 400 });
    }

    const hospital = await prisma.hospital.create({
      data: {
        nombre,
        slug,
        ciudad: String(body.ciudad || "Caracas").trim().slice(0, 80),
        direccion: body.direccion ? String(body.direccion).slice(0, 200) : null,
        telefono: body.telefono ? String(body.telefono).slice(0, 40) : null,
        mapsUrl: body.mapsUrl ? String(body.mapsUrl).slice(0, 300) : null,
      },
    });
    invalidateCache();
    return NextResponse.json({ ok: true, hospital });
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
        ? "Ya existe un centro con ese slug."
        : "No se pudo crear el centro.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
