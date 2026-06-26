import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";
import { cached, invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/personas?q=...&hospital=slug&estado=ESTADO&page=1
export async function GET(req: NextRequest) {
  // Anti-abuso: hasta 50 búsquedas cada 10s por IP
  const limited = rateLimit(req, { limit: 50, windowMs: 10_000, key: "search" });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  // Limita longitud de la query para evitar consultas patológicas
  const q = (searchParams.get("q") || "").trim().slice(0, 80);
  const hospital = (searchParams.get("hospital") || "").slice(0, 40);
  const estado = (searchParams.get("estado") || "").slice(0, 20);
  const page = Math.min(500, Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
  const pageSize = 24;

  const where: Prisma.PersonaWhereInput = {};
  const and: Prisma.PersonaWhereInput[] = [];

  if (q) {
    // Busqueda por palabras: cada termino debe aparecer en algun campo
    const terminos = q.split(/\s+/).filter(Boolean);
    for (const t of terminos) {
      and.push({
        OR: [
          { nombre: { contains: t, mode: "insensitive" } },
          { apellido: { contains: t, mode: "insensitive" } },
          { cedula: { contains: t, mode: "insensitive" } },
          { area: { contains: t, mode: "insensitive" } },
          { condicion: { contains: t, mode: "insensitive" } },
          { hospital: { is: { nombre: { contains: t, mode: "insensitive" } } } },
        ],
      });
    }
  }

  if (hospital) {
    and.push({ hospital: { is: { slug: hospital } } });
  }
  if (estado) {
    and.push({ estado: estado as any });
  }
  if (and.length) where.AND = and;

  try {
    // Cache 15s por combinación de filtros: ráfagas de búsquedas idénticas
    // (mismo apellido) golpean la caché y no la base de datos.
    const cacheKey = `personas:${q}|${hospital}|${estado}|${page}`;
    const data = await cached(cacheKey, 15_000, async () => {
      const [total, personas] = await Promise.all([
        prisma.persona.count({ where }),
        prisma.persona.findMany({
          where,
          include: { hospital: { select: { nombre: true, ciudad: true } } },
          orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return {
        ok: true,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        personas,
      };
    });

    return NextResponse.json(data, {
      headers: {
        // Permite que un CDN/edge sirva respuestas y refresque en segundo plano
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "No se pudo conectar a la base de datos.", personas: [], total: 0 },
      { status: 500 }
    );
  }
}

// POST /api/personas  (crear persona - requiere ADMIN_TOKEN)
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowMs: 60_000, key: "admin-write" });
  if (limited) return limited;

  const token = req.headers.get("x-admin-token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const persona = await prisma.persona.create({
      data: {
        nombre: body.nombre,
        apellido: body.apellido || null,
        cedula: body.cedula || null,
        edad: body.edad ? Number(body.edad) : null,
        sexo: body.sexo || null,
        area: body.area || null,
        cama: body.cama || null,
        estado: body.estado || "EN_OBSERVACION",
        condicion: body.condicion || null,
        contacto: body.contacto || null,
        observacion: body.observacion || null,
        hospitalId: body.hospitalId || null,
        fuente: body.fuente || "admin",
      },
    });
    invalidateCache(); // los nuevos datos deben verse de inmediato
    return NextResponse.json({ ok: true, persona });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }
}
