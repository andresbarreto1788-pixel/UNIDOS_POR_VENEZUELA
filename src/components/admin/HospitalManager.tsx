"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Save, Trash2, Loader2 } from "lucide-react";

type Hospital = {
  id: string;
  nombre: string;
  slug: string;
  ciudad: string;
  direccion?: string | null;
  telefono?: string | null;
  mapsUrl?: string | null;
  _count?: { personas: number };
};

const NUEVO = { nombre: "", slug: "", ciudad: "Caracas", direccion: "", telefono: "", mapsUrl: "" };

export default function HospitalManager({ token }: { token: string }) {
  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [nuevo, setNuevo] = useState({ ...NUEVO });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    const res = await fetch("/api/hospitales");
    const data = await res.json();
    if (data.ok) setHospitales(data.hospitales);
  };
  useEffect(() => {
    cargar();
  }, []);

  const crear = async () => {
    if (!nuevo.nombre.trim()) return setMsg("El nombre es obligatorio.");
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/hospitales", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(nuevo),
      });
      const data = await res.json();
      if (data.ok) {
        setNuevo({ ...NUEVO });
        setMsg("✔ Centro creado");
        cargar();
      } else setMsg(data.error);
    } finally {
      setLoading(false);
    }
  };

  const guardar = async (h: Hospital) => {
    const res = await fetch(`/api/hospitales/${h.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(h),
    });
    const data = await res.json();
    setMsg(data.ok ? "✔ Guardado" : data.error);
    if (data.ok) cargar();
  };

  const eliminar = async (h: Hospital) => {
    if (!confirm(`¿Eliminar "${h.nombre}"?`)) return;
    const res = await fetch(`/api/hospitales/${h.id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });
    const data = await res.json();
    setMsg(data.ok ? "✔ Eliminado" : data.error);
    cargar();
  };

  const upd = (id: string, k: keyof Hospital, v: string) =>
    setHospitales((hs) => hs.map((h) => (h.id === id ? { ...h, [k]: v } : h)));

  const inp = "rounded-lg border border-slate-200 px-2 py-1.5 text-sm w-full";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-slate-900">
        <Building2 size={18} /> Hospitales y centros
      </h2>
      <p className="mt-1 text-sm text-slate-500">Crea nuevos centros o edita los existentes.</p>

      {/* Crear nuevo */}
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
        <p className="mb-2 text-sm font-semibold text-marca">Nuevo centro</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={inp} placeholder="Nombre *" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <input className={inp} placeholder="Slug (auto si vacío)" value={nuevo.slug} onChange={(e) => setNuevo({ ...nuevo, slug: e.target.value })} />
          <input className={inp} placeholder="Ciudad" value={nuevo.ciudad} onChange={(e) => setNuevo({ ...nuevo, ciudad: e.target.value })} />
          <input className={inp} placeholder="Teléfono" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
          <input className={`${inp} sm:col-span-2`} placeholder="Dirección" value={nuevo.direccion} onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })} />
          <input className={`${inp} sm:col-span-2`} placeholder="URL de mapa (opcional)" value={nuevo.mapsUrl} onChange={(e) => setNuevo({ ...nuevo, mapsUrl: e.target.value })} />
        </div>
        <button onClick={crear} disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-full bg-marca px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Crear centro
        </button>
      </div>

      {msg && <p className="mt-3 text-sm font-medium text-slate-600">{msg}</p>}

      {/* Lista editable */}
      <div className="mt-4 space-y-2">
        {hospitales.map((h) => (
          <div key={h.id} className="rounded-xl border border-slate-200 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inp} value={h.nombre} onChange={(e) => upd(h.id, "nombre", e.target.value)} />
              <input className={inp} value={h.ciudad} onChange={(e) => upd(h.id, "ciudad", e.target.value)} />
              <input className={`${inp} sm:col-span-2`} value={h.direccion || ""} placeholder="Dirección" onChange={(e) => upd(h.id, "direccion", e.target.value)} />
              <input className={inp} value={h.telefono || ""} placeholder="Teléfono" onChange={(e) => upd(h.id, "telefono", e.target.value)} />
              <input className={inp} value={h.mapsUrl || ""} placeholder="URL mapa" onChange={(e) => upd(h.id, "mapsUrl", e.target.value)} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">slug: {h.slug} · {h._count?.personas ?? 0} personas</span>
              <div className="flex gap-2">
                <button onClick={() => guardar(h)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <Save size={14} /> Guardar
                </button>
                <button onClick={() => eliminar(h)} className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
