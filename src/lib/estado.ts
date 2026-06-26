// Mapa de estados -> etiqueta y clase de color

export const ESTADOS: Record<
  string,
  { label: string; badge: string }
> = {
  ESTABLE: { label: "Estable", badge: "badge-estable" },
  CRITICO: { label: "Crítico", badge: "badge-critico" },
  EN_OBSERVACION: { label: "En observación", badge: "badge-observacion" },
  DADO_DE_ALTA: { label: "Dado de alta", badge: "badge-alta" },
  REFERIDO: { label: "Referido", badge: "badge-referido" },
  NO_IDENTIFICADO: { label: "No identificado", badge: "badge-noid" },
  FALLECIDO: { label: "Fallecido", badge: "badge-fallecido" },
};

export function estadoInfo(estado?: string | null) {
  return (estado && ESTADOS[estado]) || ESTADOS.EN_OBSERVACION;
}
