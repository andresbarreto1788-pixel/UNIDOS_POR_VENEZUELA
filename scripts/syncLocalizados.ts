/**
 * Sincroniza la base de "localizadosvenezuela.com" (API pública v1) hacia nuestra
 * tabla Persona, fusionando con los datos que ya tenemos.
 *
 * - Idempotente: borra solo lo cargado por esta fuente y lo vuelve a crear
 *   (mismo patrón que prisma/seed.ts). NO toca nuestros datos reales ni las
 *   importaciones manuales de /admin.
 * - Los hospitales de su API se mapean a los nuestros cuando coinciden
 *   (ver ALIAS_HOSPITAL); el resto se crean como hospitales nuevos.
 *
 * Uso:
 *   npm run sync:localizados            # importa a la base (requiere DATABASE_URL)
 *   npm run sync:localizados -- --dry   # solo descarga y valida el mapeo (sin escribir)
 */
import { PrismaClient, Estado } from "@prisma/client";

const API = "https://localizadosvenezuela.com/api/v1";
const FUENTE = "localizadosvenezuela";
const PAGE_LIMIT = 500; // registros por página al paginar la API
const CHUNK = 500; // tamaño de lote para createMany

// Cloudflare bloquea user-agents de bots; nos identificamos como navegador.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const DRY = process.argv.includes("--dry") || !process.env.DATABASE_URL;

// ---- Tipos de la API ----
type ApiLocalizado = {
  slug: string;
  nombreCompleto: string;
  edad?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
  condicion?: string;
  lugarSlug?: string;
  lugarNombre?: string;
  publicadoEn?: string;
};

// Sus slugs de recinto -> nuestros slugs de hospital existentes (src/lib/hospitales.ts).
// Lo que no esté aquí se crea como hospital nuevo con su propio slug/nombre.
const ALIAS_HOSPITAL: Record<string, string> = {
  "hospital-perez-carreno": "perez-carreno",
  "hospital-miguel-perez-carreno": "perez-carreno",
  "hospital-domingo-luciani": "luciani",
  "hospital-vargas-de-caracas": "vargas-caracas",
  "periferico-de-catia": "periferico-catia",
  "hospital-universitario-de-caracas": "universitario-caracas",
  "hospital-militar-universitario-dr-carlos-arvelo": "carlos-arvelo",
  "cruz-roja": "cruz-roja",
  "hospital-jm-de-los-rios": "jm-de-los-rios",
  "campo-de-golf-caribe-sobrevivientes-playa-los-cocos": "playa-los-cocos",
};

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

function mapEstado(condicion?: string): Estado {
  const n = norm(condicion || "");
  if (!n || n.includes("desconocid")) return Estado.EN_OBSERVACION;
  if (n.includes("fallec") || n.includes("muert")) return Estado.FALLECIDO;
  if (n.includes("critic") || n.includes("grave")) return Estado.CRITICO;
  if (n.includes("estab")) return Estado.ESTABLE;
  if (n.includes("alta")) return Estado.DADO_DE_ALTA;
  if (n.includes("referid") || n.includes("traslad")) return Estado.REFERIDO;
  if (n.includes("observ")) return Estado.EN_OBSERVACION;
  return Estado.EN_OBSERVACION;
}

async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`);
  return res.json();
}

async function fetchAllLocalizados(): Promise<ApiLocalizado[]> {
  const all: ApiLocalizado[] = [];
  const first = await apiGet(`/localizados?page=1&limit=${PAGE_LIMIT}`);
  all.push(...first.data);
  const totalPages: number = first.meta?.totalPages ?? 1;
  process.stdout.write(
    `📥 ${first.meta?.total ?? all.length} registros en ${totalPages} páginas: 1`
  );
  for (let p = 2; p <= totalPages; p++) {
    const d = await apiGet(`/localizados?page=${p}&limit=${PAGE_LIMIT}`);
    all.push(...d.data);
    process.stdout.write(`,${p}`);
  }
  process.stdout.write("\n");
  return all;
}

async function main() {
  console.log(`🔗 Sincronizando desde ${API}  ${DRY ? "(DRY-RUN, sin escribir)" : ""}`);
  const localizados = await fetchAllLocalizados();
  console.log(`   ✔ ${localizados.length} localizados descargados`);

  const prisma = DRY ? null : new PrismaClient();

  // Mapa lugarSlug -> hospitalId (de nuestra base). Se llena perezoso.
  const hospitalIdPorLugar = new Map<string, string | null>();
  const nuevosHospitales = new Map<string, string>(); // slug -> nombre (creados desde su API)

  // Recintos que NO mapean a uno nuestro y que tienen al menos una persona.
  for (const l of localizados) {
    const lugarSlug = l.lugarSlug?.trim();
    if (!lugarSlug) continue;
    if (ALIAS_HOSPITAL[lugarSlug]) continue;
    if (!nuevosHospitales.has(lugarSlug)) {
      nuevosHospitales.set(lugarSlug, l.lugarNombre?.trim() || lugarSlug);
    }
  }

  if (prisma) {
    const hospitales = await prisma.hospital.findMany();
    const porSlug = new Map(hospitales.map((h) => [h.slug, h.id]));

    // 1) Crea/actualiza los hospitales nuevos provenientes de su API.
    for (const [slug, nombre] of nuevosHospitales) {
      const h = await prisma.hospital.upsert({
        where: { slug },
        update: { nombre },
        create: { slug, nombre, ciudad: "Venezuela" },
      });
      porSlug.set(slug, h.id);
    }

    // 2) Resuelve cada lugarSlug -> hospitalId (vía alias o directo).
    const lugarSlugs = new Set(localizados.map((l) => l.lugarSlug?.trim()).filter(Boolean) as string[]);
    for (const ls of lugarSlugs) {
      const ourSlug = ALIAS_HOSPITAL[ls] ?? ls;
      hospitalIdPorLugar.set(ls, porSlug.get(ourSlug) ?? null);
    }
  }

  // Construye las filas de Persona.
  const rows = localizados
    .filter((l) => l.nombreCompleto && l.nombreCompleto.trim())
    .map((l) => {
      const edad =
        l.edad && /^\d{1,3}$/.test(l.edad.trim()) ? parseInt(l.edad, 10) : null;
      const obs = [
        l.observaciones?.trim(),
        l.direccion?.trim() && !l.observaciones?.includes(l.direccion)
          ? `Procedencia/Dirección: ${l.direccion.trim()}`
          : null,
        `Ref: localizadosvenezuela.com/${l.slug}`,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        nombre: l.nombreCompleto.trim().slice(0, 300),
        edad,
        contacto: l.telefono?.trim() || null,
        estado: mapEstado(l.condicion),
        condicion:
          l.condicion && norm(l.condicion) !== "desconocido"
            ? l.condicion.trim()
            : null,
        observacion: obs || null,
        hospitalId: hospitalIdPorLugar.get(l.lugarSlug?.trim() || "") ?? null,
        fuente: FUENTE,
        fechaIngreso: l.publicadoEn ? new Date(l.publicadoEn) : null,
      };
    });

  // Resumen por recinto (útil en dry-run).
  const porRecinto = new Map<string, number>();
  for (const l of localizados) {
    const k = l.lugarNombre?.trim() || "(sin recinto)";
    porRecinto.set(k, (porRecinto.get(k) || 0) + 1);
  }
  console.log("\n🏥 Distribución por recinto:");
  [...porRecinto.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, n]) => console.log(`   ${String(n).padStart(5)}  ${k}`));

  if (DRY || !prisma) {
    console.log(`\n🧪 DRY-RUN: ${rows.length} personas listas para importar. No se escribió nada.`);
    return;
  }

  // Idempotente: borra solo lo de esta fuente y recrea.
  const del = await prisma.persona.deleteMany({ where: { fuente: FUENTE } });
  if (del.count) console.log(`\n🧹 Eliminados ${del.count} registros previos de "${FUENTE}"`);

  let creados = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const lote = rows.slice(i, i + CHUNK);
    const r = await prisma.persona.createMany({ data: lote });
    creados += r.count;
    process.stdout.write(`\r   👥 ${creados}/${rows.length} personas...`);
  }
  console.log(`\n✅ Sincronización completa: ${creados} personas de "${FUENTE}".`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("\n❌ Error en la sincronización:", e);
  process.exit(1);
});
