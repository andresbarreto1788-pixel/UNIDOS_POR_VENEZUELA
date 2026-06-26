import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Tope de filas por importación para no saturar la base en una sola petición
const MAX_FILAS = 5000;

// Normaliza texto para comparar nombres de hospital
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

const ESTADOS_VALIDOS = [
  "ESTABLE",
  "CRITICO",
  "EN_OBSERVACION",
  "DADO_DE_ALTA",
  "REFERIDO",
  "NO_IDENTIFICADO",
  "FALLECIDO",
];

function mapEstado(raw?: string) {
  if (!raw) return "EN_OBSERVACION";
  const n = norm(raw);
  if (n.includes("estab")) return "ESTABLE";
  if (n.includes("critic") || n.includes("grave")) return "CRITICO";
  if (n.includes("alta")) return "DADO_DE_ALTA";
  if (n.includes("referid") || n.includes("traslad")) return "REFERIDO";
  if (n.includes("no id") || n.includes("desconocid")) return "NO_IDENTIFICADO";
  if (n.includes("fallec") || n.includes("muert")) return "FALLECIDO";
  if (n.includes("observ")) return "EN_OBSERVACION";
  const up = (raw || "").toUpperCase();
  return ESTADOS_VALIDOS.includes(up) ? up : "EN_OBSERVACION";
}

// POST /api/import  { filas: [...] }  (requiere ADMIN_TOKEN)
// Acepta columnas flexibles: nombre, apellido, cedula, edad, sexo,
// hospital (nombre o slug), area, cama, estado, condicion, contacto, observacion
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000, key: "import" });
  if (limited) return limited;

  const token = req.headers.get("x-admin-token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let filas: Record<string, string>[];
  try {
    const body = await req.json();
    filas = body.filas;
    if (!Array.isArray(filas)) throw new Error();
  } catch {
    return NextResponse.json({ ok: false, error: "Formato inválido" }, { status: 400 });
  }

  if (filas.length > MAX_FILAS) {
    return NextResponse.json(
      { ok: false, error: `Máximo ${MAX_FILAS} filas por importación. Divide el archivo.` },
      { status: 413 }
    );
  }

  // Mapa de hospitales existentes (por slug y por nombre normalizado)
  const hospitales = await prisma.hospital.findMany();
  const porSlug = new Map(hospitales.map((h) => [h.slug, h.id]));
  const porNombre = new Map(hospitales.map((h) => [norm(h.nombre), h.id]));

  const pick = (row: Record<string, string>, ...keys: string[]) => {
    for (const k of keys) {
      const found = Object.keys(row).find((rk) => norm(rk) === norm(k));
      if (found && row[found] != null && String(row[found]).trim() !== "")
        return String(row[found]).trim();
    }
    return undefined;
  };

  let creados = 0;
  const errores: string[] = [];

  for (let i = 0; i < filas.length; i++) {
    const row = filas[i];
    const nombre = pick(row, "nombre", "nombres", "name");
    if (!nombre) {
      errores.push(`Fila ${i + 1}: sin nombre`);
      continue;
    }

    const hospRaw = pick(row, "hospital", "centro", "lugar") || "";
    const hospitalId =
      porSlug.get(hospRaw) ?? porNombre.get(norm(hospRaw)) ?? null;

    const edadRaw = pick(row, "edad", "age");

    try {
      await prisma.persona.create({
        data: {
          nombre,
          apellido: pick(row, "apellido", "apellidos") || null,
          cedula: pick(row, "cedula", "ci", "documento") || null,
          edad: edadRaw && !isNaN(Number(edadRaw)) ? Number(edadRaw) : null,
          sexo: pick(row, "sexo", "genero") || null,
          area: pick(row, "area", "sala", "piso", "ubicacion", "pabellon") || null,
          cama: pick(row, "cama") || null,
          estado: mapEstado(pick(row, "estado", "condicion clinica")) as any,
          condicion: pick(row, "condicion", "lesion", "diagnostico", "observaciones") || null,
          contacto: pick(row, "contacto", "telefono", "familiar") || null,
          hospitalId,
          fuente: pick(row, "fuente") || "import-csv",
        },
      });
      creados++;
    } catch {
      errores.push(`Fila ${i + 1}: error al guardar`);
    }
  }

  invalidateCache(); // refresca búsquedas y conteos tras la importación

  return NextResponse.json({
    ok: true,
    creados,
    totalFilas: filas.length,
    errores: errores.slice(0, 20),
  });
}
