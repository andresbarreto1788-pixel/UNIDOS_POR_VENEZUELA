import { prisma } from "./prisma";
import type { DesaparecidoItem } from "@/components/MissingCard";

export async function getDesaparecidosHome(): Promise<{
  total: number;
  recientes: DesaparecidoItem[];
}> {
  try {
    const [total, recientes] = await Promise.all([
      prisma.desaparecido.count({ where: { estadoBusqueda: "BUSCANDO" } }),
      prisma.desaparecido.findMany({
        where: { estadoBusqueda: "BUSCANDO" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);
    return { total, recientes: recientes as unknown as DesaparecidoItem[] };
  } catch {
    return { total: 0, recientes: [] };
  }
}
