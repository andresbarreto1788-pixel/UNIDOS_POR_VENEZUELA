"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "584129317277";

export default function WhatsAppButton() {
  const mensaje = encodeURIComponent(
    "Hola, quiero reportar / actualizar información de una persona del sismo (Unidos por Venezuela)."
  );
  const href = `https://wa.me/${WHATSAPP}?text=${mensaje}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white font-semibold shadow-lg shadow-emerald-500/30"
      aria-label="Reportar o actualizar datos por WhatsApp"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
      </span>
      <MessageCircle size={20} />
      <span className="hidden sm:inline">Reportar por WhatsApp</span>
    </motion.a>
  );
}
