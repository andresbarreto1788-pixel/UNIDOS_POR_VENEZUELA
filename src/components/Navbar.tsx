"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/buscar", label: "Buscar persona" },
  { href: "/desaparecidos", label: "Desaparecidos" },
  { href: "/reportar", label: "Reportar" },
  { href: "/hospitales", label: "Hospitales" },
  { href: "/ayuda", label: "Cómo ayudar" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flag-strip h-1 w-full" />
      <nav className="container-app flex items-center justify-between py-3">
        <Logo />

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-marca"
                    : "text-slate-600 hover:text-marca hover:bg-slate-100"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-marca"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-slate-200 bg-white"
          >
            <div className="container-app py-2 flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-2 py-3 rounded-lg text-sm font-medium ${
                    pathname === l.href
                      ? "text-marca bg-slate-100"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
