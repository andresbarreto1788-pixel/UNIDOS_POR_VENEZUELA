import { Suspense } from "react";
import DesaparecidosClient from "@/components/DesaparecidosClient";

export const metadata = { title: "Personas desaparecidas" };

export default function DesaparecidosPage() {
  return (
    <Suspense fallback={<div className="container-app py-16 text-center text-slate-400">Cargando...</div>}>
      <DesaparecidosClient />
    </Suspense>
  );
}
