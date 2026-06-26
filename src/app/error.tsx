"use client";

import { useEffect } from "react";
import Link from "next/link";

// Error boundary global: si algo falla, la app NO se cae;
// muestra una pantalla amable con opción de reintentar.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-5xl">🇻🇪</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Algo salió mal
      </h1>
      <p className="mt-2 max-w-md text-slate-500">
        Tuvimos un problema temporal. Tus datos están a salvo. Intenta de nuevo
        en unos segundos.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-marca px-6 py-3 font-semibold text-white hover:bg-marca-claro"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
