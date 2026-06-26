"use client";

import { motion } from "framer-motion";
import { MapPin, Building2, Phone, UserSearch } from "lucide-react";

export type DesaparecidoItem = {
  id: string;
  nombre: string;
  apellido?: string | null;
  edad?: number | null;
  sexo?: string | null;
  descripcion?: string | null;
  senasParticulares?: string | null;
  foto?: string | null;
  ultimaUbicacion?: string | null;
  edificio?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  estadoBusqueda: string;
  contactoNombre?: string | null;
  contactoTelefono: string;
  relacion?: string | null;
};

function telHref(tel: string) {
  const digits = tel.replace(/\D/g, "");
  // Asume Venezuela si empieza por 0
  const intl = digits.startsWith("0") ? "58" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

export default function MissingCard({ d }: { d: DesaparecidoItem }) {
  const nombre = [d.nombre, d.apellido].filter(Boolean).join(" ");
  const encontrado = d.estadoBusqueda === "ENCONTRADO";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="relative aspect-square w-full bg-slate-100">
        {d.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.foto} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <UserSearch size={56} />
          </div>
        )}
        <span
          className={`absolute left-2 top-2 badge ${
            encontrado ? "badge-estable" : "badge-critico"
          }`}
        >
          {encontrado ? "Encontrada ✔" : "Se busca"}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-slate-900 leading-tight">{nombre}</h3>
        <p className="text-xs text-slate-500">
          {d.edad != null && `${d.edad} años`}
          {d.sexo && ` · ${d.sexo}`}
        </p>

        {d.descripcion && <p className="mt-2 text-sm text-slate-700 line-clamp-3">{d.descripcion}</p>}
        {d.senasParticulares && (
          <p className="mt-1 text-xs text-slate-500"><strong>Señas:</strong> {d.senasParticulares}</p>
        )}

        <div className="mt-3 space-y-1 text-sm">
          {d.ultimaUbicacion && (
            <p className="flex items-start gap-1.5 text-slate-600">
              <MapPin size={14} className="mt-0.5 shrink-0" /> {d.ultimaUbicacion}
            </p>
          )}
          {(d.edificio || d.direccion || d.ciudad) && (
            <p className="flex items-start gap-1.5 text-slate-600">
              <Building2 size={14} className="mt-0.5 shrink-0" />
              {[d.edificio, d.direccion, d.ciudad].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {!encontrado && (
          <a
            href={telHref(d.contactoTelefono)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
          >
            <Phone size={16} /> Tengo información
          </a>
        )}
        <p className="mt-2 text-center text-xs text-slate-400">
          Contacto: {d.contactoNombre || "familiar"} {d.relacion && `(${d.relacion})`}
        </p>
      </div>
    </motion.article>
  );
}
