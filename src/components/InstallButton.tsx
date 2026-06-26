"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallButton({
  full = false,
}: {
  full?: boolean;
}) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Detecta si ya esta instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      // iOS / navegadores sin prompt automatico: mostramos instrucciones
      setShowHelp((v) => !v);
    }
  };

  if (installed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
        <Smartphone size={18} /> App instalada ✔
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-bandera-amarillo text-marca-oscuro font-bold shadow-lg shadow-amber-400/30 ${
          full ? "w-full px-6 py-4 text-lg" : "px-6 py-3"
        }`}
      >
        <Download size={full ? 24 : 20} />
        Descarga aquí
      </motion.button>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-30 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-700 shadow-xl"
        >
          <p className="font-semibold text-slate-900 mb-1">Instalar en tu celular</p>
          <p className="mb-2">
            <strong>Android (Chrome):</strong> menú ⋮ → “Agregar a pantalla de
            inicio / Instalar app”.
          </p>
          <p>
            <strong>iPhone (Safari):</strong> botón Compartir
            <span className="mx-1">⬆️</span> → “Agregar a inicio”.
          </p>
        </motion.div>
      )}
    </div>
  );
}
