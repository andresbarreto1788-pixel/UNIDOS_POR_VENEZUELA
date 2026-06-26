import { prisma } from "./prisma";

export type Stats = {
  totalPersonas: number;
  totalHospitales: number;
  noIdentificados: number;
  dadosDeAlta: number;
  disponible: boolean;
};

// Lee estadisticas de la base. Si la base no esta configurada,
// devuelve valores en cero sin romper la pagina.
export async function getStats(): Promise<Stats> {
  try {
    const [totalPersonas, totalHospitales, noIdentificados, dadosDeAlta] =
      await Promise.all([
        prisma.persona.count(),
        prisma.hospital.count(),
        prisma.persona.count({ where: { estado: "NO_IDENTIFICADO" } }),
        prisma.persona.count({ where: { estado: "DADO_DE_ALTA" } }),
      ]);
    return {
      totalPersonas,
      totalHospitales,
      noIdentificados,
      dadosDeAlta,
      disponible: true,
    };
  } catch {
    return {
      totalPersonas: 0,
      totalHospitales: 0,
      noIdentificados: 0,
      dadosDeAlta: 0,
      disponible: false,
    };
  }
}
