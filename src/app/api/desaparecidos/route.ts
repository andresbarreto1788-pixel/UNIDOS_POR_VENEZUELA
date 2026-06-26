import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";
import { cached, invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Tope de tamaño de la foto (data URL base64). ~900KB.
const MAX_FOTO = 900_000;

function clamp(s: unknown, max: number): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t ? t.slice(0, max) : null;
}

// GET /api/desaparecidos?q=&estado=BUSCANDO&page=1
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 60, windowMs: 10_000, key: "desap-read" });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 80);
  const estado = (searchParams.get("estado") || "BUSCANDO").slice(0, 20);
  const page = Math.min(200, Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
  const pageSize = 18;

  const and: Prisma.DesaparecidoWhereInput[] = [];
  if (estado === "BUSCANDO" || estado === "ENCONTRADO") {
    and.push({ estadoBusqueda: estado as Prisma.DesaparecidoWhereInput["estadoBusqueda"] });
  }
  if (q) {
    for (const t of q.split(/\s+/).filter(Boolean)) {
      and.push({
        OR: [
          { nombre: { contains: t, mode: "insensitive" } },
          { apellido: { contains: t, mode: "insensitive" } },
          { ultimaUbicacion: { contains: t, mode: "insensitive" } },
          { edificio: { contains: t, mode: "insensitive" } },
          { direccion: { contains: t, mode: "insensitive" } },
          { ciudad: { contains: t, mode: "insensitive" } },
        ],
      });
    }
  }
  const where: Prisma.DesaparecidoWhereInput = and.length ? { AND: and } : {};

  try {
    const data = await cached(`desap:${q}|${estado}|${page}`, 10_000, async () => {
      const [total, desaparecidos] = await Promise.all([
        prisma.desaparecido.count({ where }),
        prisma.desaparecido.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { ok: true, total, page, pageSize, totalPages: Math.ceil(total / pageSize), desaparecidos };
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Base de datos no disponible", desaparecidos: [], total: 0 },
      { status: 500 }
    );
  }
}

// POST /api/desaparecidos  (reporte PÚBLICO de un desaparecido)
export async function POST(req: NextRequest) {
  // Anti-spam: hasta 5 reportes por minuto por IP
  const limited = rateLimit(req, { limit: 5, windowMs: 60_000, key: "desap-create" });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const nombre = clamp(body.nombre, 80);
  const contactoTelefono = clamp(body.contactoTelefono, 30);
  if (!nombre || !contactoTelefono) {
    return NextResponse.json(
      { ok: false, error: "El nombre y un teléfono de contacto son obligatorios." },
      { status: 400 }
    );
  }

  const foto = typeof body.foto === "string" ? body.foto : "";
  if (foto && (foto.length > MAX_FOTO || !/^data:image\/(jpeg|png|webp);base64,/.test(foto))) {
    return NextResponse.json(
      { ok: false, error: "La foto es muy pesada o no es válida. Usa una imagen más pequeña." },
      { status: 413 }
    );
  }

  const edad = Number(body.edad);
  try {
    const d = await prisma.desaparecido.create({
      data: {
        nombre,
        apellido: clamp(body.apellido, 80),
        edad: Number.isFinite(edad) && edad > 0 && edad < 130 ? Math.floor(edad) : null,
        sexo: clamp(body.sexo, 20),
        descripcion: clamp(body.descripcion, 1000),
        senasParticulares: clamp(body.senasParticulares, 500),
        foto: foto || null,
        ultimaUbicacion: clamp(body.ultimaUbicacion, 200),
        edificio: clamp(body.edificio, 200),
        direccion: clamp(body.direccion, 300),
        ciudad: clamp(body.ciudad, 100),
        contactoNombre: clamp(body.contactoNombre, 80),
        contactoTelefono,
        relacion: clamp(body.relacion, 60),
      },
    });
    invalidateCache();
    return NextResponse.json({ ok: true, id: d.id });
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo guardar el reporte." }, { status: 500 });
  }
}
