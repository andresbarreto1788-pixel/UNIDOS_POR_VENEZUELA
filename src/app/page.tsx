import Hero from "@/components/Hero";
import QuickSearch from "@/components/QuickSearch";
import StatCard from "@/components/StatCard";
import InstallButton from "@/components/InstallButton";
import { getStats } from "@/lib/stats";
import { getDesaparecidosHome } from "@/lib/desaparecidos";
import MissingCard from "@/components/MissingCard";
import Link from "next/link";
import { Search, Building2, HeartHandshake, ShieldCheck, UserSearch, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, desap] = await Promise.all([getStats(), getDesaparecidosHome()]);

  return (
    <>
      <Hero />

      {/* Buscador rapido */}
      <section className="container-app -mt-8 relative z-10">
        <QuickSearch />
      </section>

      {/* Estadisticas */}
      <section className="container-app mt-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard i={0} valor={stats.totalPersonas} etiqueta="Personas registradas" color="text-marca" />
          <StatCard i={1} valor={stats.totalHospitales} etiqueta="Hospitales" color="text-bandera-azul" />
          <StatCard i={2} valor={stats.noIdentificados} etiqueta="Por identificar" color="text-amber-600" />
          <StatCard i={3} valor={stats.dadosDeAlta} etiqueta="Dados de alta" color="text-emerald-600" />
        </div>
        {!stats.disponible && (
          <p className="mt-3 text-center text-xs text-amber-600">
            ⚠️ Base de datos aún no configurada. Revisa el README para conectar PostgreSQL.
          </p>
        )}
      </section>

      {/* Personas desaparecidas */}
      <section className="container-app mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-bandera-rojo/10 px-3 py-1 text-sm font-semibold text-bandera-rojo">
              <UserSearch size={16} /> Personas desaparecidas
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Ayuda a encontrarlos
            </h2>
            <p className="text-slate-500">
              {desap.total > 0
                ? `${desap.total} ${desap.total === 1 ? "persona reportada" : "personas reportadas"} como desaparecidas.`
                : "Reporta a un familiar desaparecido para que la comunidad ayude a localizarlo."}
            </p>
          </div>
          <Link
            href="/reportar"
            className="inline-flex items-center gap-2 rounded-full bg-bandera-rojo px-5 py-3 font-semibold text-white shadow"
          >
            <Plus size={18} /> Reportar desaparecido
          </Link>
        </div>

        {desap.recientes.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {desap.recientes.map((d) => (
                <MissingCard key={d.id} d={d} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/desaparecidos" className="font-semibold text-marca hover:underline">
                Ver todas las personas desaparecidas →
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <UserSearch className="text-slate-300" size={48} />
            <p className="mt-3 max-w-sm text-slate-500">
              Aún no hay reportes. Si buscas a un familiar, publícalo con su foto y
              los datos de dónde vivía o se le vio por última vez.
            </p>
            <Link href="/reportar" className="mt-4 rounded-full bg-bandera-rojo px-5 py-2.5 text-sm font-semibold text-white">
              Reportar un desaparecido
            </Link>
          </div>
        )}
      </section>

      {/* Como funciona */}
      <section className="container-app mt-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          ¿Cómo funciona?
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Search,
              titulo: "1. Busca",
              texto:
                "Escribe el nombre, apellido o cédula de la persona que buscas. También puedes filtrar por hospital.",
            },
            {
              icon: Building2,
              titulo: "2. Ubica",
              texto:
                "Mira en qué hospital, área o sala se encuentra y cuál es su estado actual.",
            },
            {
              icon: HeartHandshake,
              titulo: "3. Reúnete",
              texto:
                "Comunícate con el hospital o repórtanos por WhatsApp para confirmar y completar la información.",
            },
          ].map((c) => (
            <div
              key={c.titulo}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-marca/10 text-marca">
                <c.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900">{c.titulo}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA descarga */}
      <section className="container-app mt-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-marca to-marca-claro p-8 text-center text-white sm:p-12">
          <ShieldCheck className="mx-auto mb-3" size={36} />
          <h2 className="text-2xl font-bold sm:text-3xl">
            Lleva la búsqueda en tu bolsillo
          </h2>
          <p className="mx-auto mt-2 max-w-md text-blue-100">
            Instala la app en tu celular y compártela. Mientras más personas la
            usen, más rápido reunimos a las familias.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <InstallButton />
            <Link
              href="/buscar"
              className="rounded-full bg-white/10 px-6 py-3 font-semibold ring-1 ring-white/30 hover:bg-white/20"
            >
              Ir al buscador
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
