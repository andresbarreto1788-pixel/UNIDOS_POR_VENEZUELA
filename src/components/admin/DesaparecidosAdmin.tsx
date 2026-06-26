"use client";

import { useEffect, useState } from "react";
import { UserSearch, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";

type D = {
  id: string;
  nombre: string;
  apellido?: string | null;
  foto?: string | null;
  estadoBusqueda: string;
  contactoTelefono: string;
};

export default function DesaparecidosAdmin({ token }: { token: string }) {
  const [items, setItems] = useState<D[]>([]);
  const [estado, setEstado] = useState("BUSCANDO");
  const [msg, setMsg] = useState<string | null>(null);

  const cargar = async () => {
    const res = await fetch(`/api/desaparecidos?estado=${estado}`);
    const data = await res.json();
    if (data.ok) setItems(data.desaparecidos);
  };
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const patch = async (id: string, estadoBusqueda: string) => {
    const res = await fetch(`/api/desaparecidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ estadoBusqueda }),
    });
    const data = await res.json();
    setMsg(data.ok ? "✔ Actualizado" : data.error);
    cargar();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    const res = await fetch(`/api/desaparecidos/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    const data = await res.json();
    setMsg(data.ok ? "✔ Eliminado" : data.error);
    cargar();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <UserSearch size={18} /> Reportes de desaparecidos
        </h2>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
          <option value="BUSCANDO">Se buscan</option>
          <option value="ENCONTRADO">Encontradas</option>
          <option value="">Todas</option>
        </select>
      </div>
      {msg && <p className="mt-2 text-sm font-medium text-slate-600">{msg}</p>}

      <div className="mt-3 divide-y divide-slate-100">
        {items.map((d) => (
          <div key={d.id} className="flex items-center gap-3 py-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {d.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.foto} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {[d.nombre, d.apellido].filter(Boolean).join(" ")}
              </p>
              <p className="text-xs text-slate-400">{d.contactoTelefono}</p>
            </div>
            {d.estadoBusqueda === "BUSCANDO" ? (
              <button onClick={() => patch(d.id, "ENCONTRADO")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white">
                <CheckCircle2 size={14} /> Encontrada
              </button>
            ) : (
              <button onClick={() => patch(d.id, "BUSCANDO")} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white">
                <RotateCcw size={14} /> Reabrir
              </button>
            )}
            <button onClick={() => eliminar(d.id)} className="rounded-lg bg-red-100 p-1.5 text-red-700">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="py-4 text-sm text-slate-400">Sin reportes.</p>}
      </div>
    </div>
  );
}
