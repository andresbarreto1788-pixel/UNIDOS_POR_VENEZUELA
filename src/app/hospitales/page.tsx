import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hospitales" };

async function getHospitales() {
  try {
    return await prisma.hospital.findMany({
      orderBy: { nombre: "asc" },
      include: { _count: { select: { personas: true } } },
    });
  } catch {
    return [];
  }
}

export default async function HospitalesPage() {
  const hospitales = await getHospitales();

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Hospitales y puntos de atención
      </h1>
      <p className="mt-1 text-slate-500">
        Lugares donde se encuentran los lesionados. Toca uno para ver las
        personas registradas allí.
      </p>

      {hospitales.length === 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aún no hay hospitales cargados o la base de datos no está conectada.
          Ejecuta el seed (<code>npm run db:seed</code>) y revisa el README.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitales.map((h) => (
            <div
              key={h.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-slate-900">{h.nombre}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} /> {h.direccion || h.ciudad}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-marca">
                <Users size={16} /> {h._count.personas} personas registradas
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/buscar?hospital=${h.slug}`}
                  className="rounded-full bg-marca px-4 py-2 text-sm font-semibold text-white hover:bg-marca-claro"
                >
                  Ver personas
                </Link>
                {h.mapsUrl && (
                  <a
                    href={h.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Mapa <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
