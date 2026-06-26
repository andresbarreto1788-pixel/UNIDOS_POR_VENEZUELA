"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Loader2, CheckCircle2, UserSearch } from "lucide-react";
import { compressImage } from "@/lib/imageCompress";

type Form = {
  nombre: string;
  apellido: string;
  edad: string;
  sexo: string;
  descripcion: string;
  senasParticulares: string;
  ultimaUbicacion: string;
  edificio: string;
  direccion: string;
  ciudad: string;
  contactoNombre: string;
  contactoTelefono: string;
  relacion: string;
};

const EMPTY: Form = {
  nombre: "", apellido: "", edad: "", sexo: "", descripcion: "",
  senasParticulares: "", ultimaUbicacion: "", edificio: "", direccion: "",
  ciudad: "", contactoNombre: "", contactoTelefono: "", relacion: "",
};

export default function ReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [foto, setFoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setFoto(await compressImage(file));
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.contactoTelefono.trim()) {
      setError("El nombre de la persona y un teléfono de contacto son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/desaparecidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, foto }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        setTimeout(() => router.push("/desaparecidos"), 1800);
      } else {
        setError(data.error || "No se pudo enviar el reporte.");
      }
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
        <h2 className="mt-3 text-xl font-bold text-emerald-900">Reporte publicado</h2>
        <p className="mt-1 text-emerald-700">
          Gracias. La persona ya aparece en la lista de desaparecidos para que la comunidad ayude a encontrarla.
        </p>
      </motion.div>
    );
  }

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-marca";
  const label = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Foto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className={label}>Foto de la persona</p>
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt="Foto" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <UserSearch size={36} />
              </div>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-marca px-4 py-2.5 text-sm font-semibold text-white hover:bg-marca-claro">
            <Camera size={18} /> {foto ? "Cambiar foto" : "Subir foto"}
            <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">La imagen se comprime automáticamente. Opcional pero muy útil.</p>
      </div>

      {/* Identidad */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><span className={label}>Nombre *</span>
          <input className={inputCls} value={form.nombre} onChange={set("nombre")} placeholder="Nombre" required /></div>
        <div><span className={label}>Apellido</span>
          <input className={inputCls} value={form.apellido} onChange={set("apellido")} placeholder="Apellido" /></div>
        <div><span className={label}>Edad</span>
          <input className={inputCls} value={form.edad} onChange={set("edad")} placeholder="Ej: 34" inputMode="numeric" /></div>
        <div><span className={label}>Sexo</span>
          <select className={inputCls} value={form.sexo} onChange={set("sexo")}>
            <option value="">—</option><option>Femenino</option><option>Masculino</option><option>Otro</option>
          </select></div>
        <div><span className={label}>Señas particulares</span>
          <input className={inputCls} value={form.senasParticulares} onChange={set("senasParticulares")} placeholder="Tatuajes, cicatrices, lentes..." /></div>
        <div className="sm:col-span-2"><span className={label}>Descripción</span>
          <textarea className={inputCls} rows={3} value={form.descripcion} onChange={set("descripcion")} placeholder="Contextura, estatura, vestimenta cuando se le vio, etc." /></div>
      </div>

      {/* Dónde vivía / última ubicación */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 sm:grid-cols-2">
        <p className={`${label} sm:col-span-2 text-marca`}>¿Dónde vivía o dónde se le vio por última vez?</p>
        <div className="sm:col-span-2"><span className={label}>Último lugar donde se le vio</span>
          <input className={inputCls} value={form.ultimaUbicacion} onChange={set("ultimaUbicacion")} placeholder="Ej: cerca de la plaza, saliendo del trabajo..." /></div>
        <div><span className={label}>Edificio / residencia</span>
          <input className={inputCls} value={form.edificio} onChange={set("edificio")} placeholder="Ej: Edif. Residencias Caribe, piso 4" /></div>
        <div><span className={label}>Ciudad</span>
          <input className={inputCls} value={form.ciudad} onChange={set("ciudad")} placeholder="Ej: Caracas / La Guaira" /></div>
        <div className="sm:col-span-2"><span className={label}>Dirección / sector / urbanización</span>
          <input className={inputCls} value={form.direccion} onChange={set("direccion")} placeholder="Ej: Catia, sector..." /></div>
      </div>

      {/* Contacto del que reporta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 sm:grid-cols-2">
        <p className={`${label} sm:col-span-2 text-marca`}>Tus datos de contacto (para que te avisen)</p>
        <div><span className={label}>Tu nombre</span>
          <input className={inputCls} value={form.contactoNombre} onChange={set("contactoNombre")} placeholder="Quién reporta" /></div>
        <div><span className={label}>Parentesco</span>
          <input className={inputCls} value={form.relacion} onChange={set("relacion")} placeholder="Ej: madre, hermano, amigo" /></div>
        <div className="sm:col-span-2"><span className={label}>Teléfono de contacto *</span>
          <input className={inputCls} value={form.contactoTelefono} onChange={set("contactoTelefono")} placeholder="Ej: 0412-0000000" required /></div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bandera-rojo px-6 py-4 text-lg font-bold text-white shadow-lg disabled:opacity-60 sm:w-auto"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <UserSearch size={20} />}
        {loading ? "Publicando..." : "Publicar reporte de desaparecido"}
      </button>
      <p className="text-xs text-slate-400">
        Al publicar, estos datos serán visibles para que la comunidad ayude a localizar a la persona.
        No incluyas información que no quieras hacer pública.
      </p>
    </form>
  );
}
