"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, SearchX } from "lucide-react";
import PersonCard, { PersonaItem } from "./PersonCard";
import { ESTADOS } from "@/lib/estado";

type HospitalOpt = { id: string; slug: string; nombre: string; _count: { personas: number } };

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") || "");
  const [hospital, setHospital] = useState(params.get("hospital") || "");
  const [estado, setEstado] = useState(params.get("estado") || "");
  const [hospitales, setHospitales] = useState<HospitalOpt[]>([]);

  const [personas, setPersonas] = useState<PersonaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Cargar hospitales para el filtro
  useEffect(() => {
    fetch("/api/hospitales")
      .then((r) => r.json())
      .then((d) => d.ok && setHospitales(d.hospitales))
      .catch(() => {});
  }, []);

  const buscar = useMemo(
    () => async (qq: string, h: string, e: string) => {
      setLoading(true);
      setError(null);
      const sp = new URLSearchParams();
      if (qq) sp.set("q", qq);
      if (h) sp.set("hospital", h);
      if (e) sp.set("estado", e);
      try {
        const res = await fetch(`/api/personas?${sp.toString()}`);
        const data = await res.json();
        if (data.ok) {
          setPersonas(data.personas);
          setTotal(data.total);
        } else {
          setError(data.error || "Error en la búsqueda");
          setPersonas([]);
        }
      } catch {
        setError("No se pudo conectar. Revisa tu internet.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Buscar con debounce al cambiar filtros y reflejar en la URL
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      buscar(q, hospital, estado);
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (hospital) sp.set("hospital", hospital);
      if (estado) sp.set("estado", estado);
      router.replace(`/buscar${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, hospital, estado]);

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-slate-900">Buscar persona</h1>
      <p className="mt-1 text-slate-500">
        Busca por nombre, apellido, cédula, hospital o ubicación.
      </p>

      {/* Barra de busqueda */}
      <div className="sticky top-[57px] z-20 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search className="text-slate-400" size={20} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre, apellido o cédula..."
            className="w-full bg-transparent py-3 outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="animate-spin text-marca" size={18} />}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos los hospitales</option>
            {hospitales.map((h) => (
              <option key={h.id} value={h.slug}>
                {h.nombre} ({h._count.personas})
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Cualquier estado</option>
            {Object.entries(ESTADOS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {(q || hospital || estado) && (
            <button
              onClick={() => {
                setQ("");
                setHospital("");
                setEstado("");
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-4">
        {!loading && (
          <p className="mb-3 text-sm text-slate-500">
            {total} {total === 1 ? "resultado" : "resultados"}
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {!error && !loading && personas.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <SearchX className="text-slate-300" size={48} />
            <p className="mt-3 font-semibold text-slate-700">
              No encontramos a esta persona
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Prueba con otro nombre o repórtanos por WhatsApp para que te
              ayudemos a buscar y completar la información.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || "584129317277"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reportar por WhatsApp
            </a>
          </div>
        )}

        <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {personas.map((p) => (
              <PersonCard key={p.id} persona={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
