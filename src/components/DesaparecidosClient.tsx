"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, UserSearch, Plus } from "lucide-react";
import MissingCard, { DesaparecidoItem } from "./MissingCard";

export default function DesaparecidosClient() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("BUSCANDO");
  const [items, setItems] = useState<DesaparecidoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        sp.set("estado", estado);
        const res = await fetch(`/api/desaparecidos?${sp}`);
        const data = await res.json();
        if (data.ok) {
          setItems(data.desaparecidos);
          setTotal(data.total);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [q, estado]);

  return (
    <div className="container-app py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personas desaparecidas</h1>
          <p className="text-slate-500">Ayuda a reunir a estas familias. Si reconoces a alguien, contáctalos.</p>
        </div>
        <Link
          href="/reportar"
          className="inline-flex items-center gap-2 rounded-full bg-bandera-rojo px-5 py-3 font-semibold text-white shadow"
        >
          <Plus size={18} /> Reportar desaparecido
        </Link>
      </div>

      <div className="sticky top-[57px] z-20 mt-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
          <Search className="text-slate-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre, edificio, sector, ciudad..."
            className="w-full bg-transparent py-2.5 outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="animate-spin text-marca" size={18} />}
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="BUSCANDO">Se buscan</option>
          <option value="ENCONTRADO">Encontradas</option>
          <option value="">Todas</option>
        </select>
      </div>

      <p className="mb-3 mt-4 text-sm text-slate-500">{total} {total === 1 ? "persona" : "personas"}</p>

      {!loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <UserSearch className="text-slate-300" size={48} />
          <p className="mt-3 font-semibold text-slate-700">No hay reportes que coincidan</p>
          <Link href="/reportar" className="mt-4 rounded-full bg-bandera-rojo px-5 py-2.5 text-sm font-semibold text-white">
            Reportar un desaparecido
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((d) => (
              <MissingCard key={d.id} d={d} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
