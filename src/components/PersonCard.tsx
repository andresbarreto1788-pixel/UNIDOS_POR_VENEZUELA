"use client";

import { motion } from "framer-motion";
import { MapPin, BedDouble, User, Phone } from "lucide-react";
import { estadoInfo } from "@/lib/estado";

export type PersonaItem = {
  id: string;
  nombre: string;
  apellido?: string | null;
  edad?: number | null;
  sexo?: string | null;
  cedula?: string | null;
  area?: string | null;
  cama?: string | null;
  estado: string;
  condicion?: string | null;
  contacto?: string | null;
  hospital?: { nombre: string; ciudad: string } | null;
};

export default function PersonCard({ persona }: { persona: PersonaItem }) {
  const e = estadoInfo(persona.estado);
  const nombreCompleto = [persona.nombre, persona.apellido]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">
            {nombreCompleto}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
            {persona.edad != null && (
              <span className="inline-flex items-center gap-1">
                <User size={12} /> {persona.edad} años
              </span>
            )}
            {persona.sexo && <span>· {persona.sexo}</span>}
            {persona.cedula && <span>· C.I. {persona.cedula}</span>}
          </p>
        </div>
        <span className={`badge ${e.badge} shrink-0`}>{e.label}</span>
      </div>

      {persona.condicion && (
        <p className="mt-2 text-sm text-slate-700">{persona.condicion}</p>
      )}

      <div className="mt-3 space-y-1 text-sm">
        {persona.hospital && (
          <p className="flex items-center gap-1.5 text-marca font-medium">
            <MapPin size={14} />
            {persona.hospital.nombre}
            <span className="text-slate-400 font-normal">
              · {persona.hospital.ciudad}
            </span>
          </p>
        )}
        {(persona.area || persona.cama) && (
          <p className="flex items-center gap-1.5 text-slate-600">
            <BedDouble size={14} />
            {[persona.area, persona.cama && `Cama ${persona.cama}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {persona.contacto && (
          <p className="flex items-center gap-1.5 text-slate-600">
            <Phone size={14} /> {persona.contacto}
          </p>
        )}
      </div>
    </motion.article>
  );
}
