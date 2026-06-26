import ReportForm from "@/components/ReportForm";
import Link from "next/link";
import { UserSearch } from "lucide-react";

export const metadata = { title: "Reportar persona desaparecida" };

export default function ReportarPage() {
  return (
    <div className="container-app py-8 max-w-3xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-bandera-rojo/10 px-3 py-1 text-sm font-semibold text-bandera-rojo">
          <UserSearch size={16} /> Reporte de desaparecido
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Reporta a una persona desaparecida
        </h1>
        <p className="mt-1 text-slate-500">
          Completa los datos y, si puedes, agrega una foto. El reporte se publica
          para que toda la comunidad ayude a localizarla.{" "}
          <Link href="/desaparecidos" className="text-marca underline">
            Ver desaparecidos
          </Link>
          .
        </p>
      </div>
      <ReportForm />
    </div>
  );
}
