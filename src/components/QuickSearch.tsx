"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function QuickSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/buscar${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={submit}
      className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg"
    >
      <Search className="ml-2 text-slate-400" size={20} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Escribe un nombre, apellido o cédula..."
        className="flex-1 bg-transparent px-1 py-2 text-slate-800 outline-none placeholder:text-slate-400"
        aria-label="Buscar persona"
      />
      <button
        type="submit"
        className="rounded-full bg-marca px-5 py-2.5 font-semibold text-white transition-colors hover:bg-marca-claro"
      >
        Buscar
      </button>
    </motion.form>
  );
}
