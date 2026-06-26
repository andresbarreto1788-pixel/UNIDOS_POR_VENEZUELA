"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import InstallButton from "./InstallButton";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-marca-oscuro to-marca text-white">
      {/* destellos decorativos */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-bandera-amarillo/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-bandera-rojo/20 blur-3xl" />

      <div className="container-app relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        {/* Texto */}
        <div>
          <motion.span
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20"
          >
            🇻🇪 Plataforma humanitaria · Sismo 2026
          </motion.span>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl"
          >
            Encuentra a tu{" "}
            <span className="text-bandera-amarillo">ser querido</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-md text-blue-100"
          >
            Busca a familiares y personas heridas o desaparecidas en los
            hospitales de Venezuela. Información centralizada, gratuita y
            actualizada para reunir a las familias.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-marca shadow-lg transition-transform hover:scale-105"
            >
              <Search size={20} /> Buscar persona
            </Link>
            <InstallButton />
          </motion.div>

          <motion.p
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-3 text-xs text-blue-200"
          >
            “Descarga aquí” instala la app en tu celular para usarla aún con
            internet inestable.
          </motion.p>
        </div>

        {/* Imagen de Tsunami */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-3 rounded-3xl bg-bandera-amarillo/30 blur-xl" />
          <div className="relative overflow-hidden rounded-3xl ring-4 ring-white/30 shadow-2xl">
            <Image
              src="/tsunami.jpg"
              alt="Tsunami, el perrito rescatista que ha ayudado a salvar a 350 personas"
              width={640}
              height={640}
              priority
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-sm font-bold">🐶 Tsunami, héroe rescatista</p>
              <p className="text-xs text-blue-100">
                Ha ayudado a salvar a más de 350 personas con vida entre los
                escombros.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
