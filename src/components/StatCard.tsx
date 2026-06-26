"use client";

import { motion } from "framer-motion";

export default function StatCard({
  valor,
  etiqueta,
  color,
  i = 0,
}: {
  valor: string | number;
  etiqueta: string;
  color: string;
  i?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
    >
      <div className={`text-3xl font-extrabold ${color}`}>{valor}</div>
      <div className="mt-1 text-sm text-slate-500">{etiqueta}</div>
    </motion.div>
  );
}
