import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata = {
  title: "Buscar persona",
};

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-16 text-center text-slate-400">
          Cargando buscador...
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
