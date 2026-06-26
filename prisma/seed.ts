import { PrismaClient, Estado } from "@prisma/client";
import { HOSPITALES } from "../src/lib/hospitales";
import Papa from "papaparse";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const FUENTE = "datos-reales";

type Fila = {
  nombre: string;
  cedula: string;
  edad: string;
  sexo: string;
  hospital: string; // slug
  area: string;
  cama: string;
  estado: string;
  condicion: string;
  contacto: string;
  observacion: string;
  procedencia: string;
  hospital_nom: string;
  fuente: string;
};

function toEstado(v: string): Estado {
  const e = (v || "").toUpperCase().trim();
  if (e in Estado) return Estado[e as keyof typeof Estado];
  return Estado.EN_OBSERVACION;
}

async function main() {
  // 1) Hospitales (no se pierden datos: upsert por slug)
  console.log("🏥 Sembrando hospitales...");
  const hospitalMap = new Map<string, string>();
  for (const h of HOSPITALES) {
    const hospital = await prisma.hospital.upsert({
      where: { slug: h.slug },
      update: {
        nombre: h.nombre,
        ciudad: h.ciudad,
        direccion: h.direccion,
        telefono: h.telefono,
        mapsUrl: h.mapsUrl,
      },
      create: h,
    });
    hospitalMap.set(h.slug, hospital.id);
  }
  console.log(`   ✔ ${HOSPITALES.length} hospitales`);

  // 2) Cargar datos reales desde CSV (consolidado del sismo)
  const csvPath = path.join(__dirname, "datos_reales.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("⚠️  No se encontró prisma/datos_reales.csv — se omiten personas.");
    return;
  }
  const csv = fs.readFileSync(csvPath, "utf8");
  const { data } = Papa.parse<Fila>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  // Idempotente: borra solo lo cargado por este seed (no toca importaciones manuales/admin)
  const del = await prisma.persona.deleteMany({ where: { fuente: FUENTE } });
  if (del.count) console.log(`🧹 Eliminados ${del.count} registros previos de "${FUENTE}"`);

  const fechaIngreso = new Date("2026-06-25T00:00:00Z");
  let creados = 0;

  console.log("👥 Cargando personas (datos reales)...");
  for (const f of data) {
    if (!f.nombre || !f.nombre.trim()) continue;
    const edad = f.edad && /^\d+$/.test(f.edad) ? parseInt(f.edad, 10) : null;
    await prisma.persona.create({
      data: {
        nombre: f.nombre.trim(),
        cedula: f.cedula?.trim() || null,
        edad: edad,
        sexo: f.sexo?.trim() || null,
        area: f.area?.trim() || null,
        cama: f.cama?.trim() || null,
        estado: toEstado(f.estado),
        condicion: f.condicion?.trim() || null,
        contacto: f.contacto?.trim() || null,
        observacion: f.observacion?.trim() || null,
        hospitalId: hospitalMap.get(f.hospital) ?? null,
        fuente: FUENTE,
        fechaIngreso,
      },
    });
    creados++;
  }
  console.log(`   ✔ ${creados} personas cargadas`);
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
