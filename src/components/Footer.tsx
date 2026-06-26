import Logo from "./Logo";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="flag-strip h-1 w-full" />
      <div className="container-app py-8 grid gap-8 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500 max-w-xs">
            Iniciativa humanitaria, gratuita y sin fines de lucro para reunir
            familias tras el sismo en Venezuela.
          </p>
        </div>

        <div className="text-sm">
          <h4 className="font-semibold text-slate-900 mb-2">Enlaces</h4>
          <ul className="space-y-1.5 text-slate-600">
            <li><Link href="/buscar" className="hover:text-marca">Buscar persona</Link></li>
            <li><Link href="/desaparecidos" className="hover:text-marca">Desaparecidos</Link></li>
            <li><Link href="/reportar" className="hover:text-marca">Reportar desaparecido</Link></li>
            <li><Link href="/hospitales" className="hover:text-marca">Hospitales</Link></li>
            <li><Link href="/ayuda" className="hover:text-marca">Cómo ayudar</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <h4 className="font-semibold text-slate-900 mb-2">Emergencias</h4>
          <ul className="space-y-1.5 text-slate-600">
            <li>Protección Civil: <strong>0800-SISMO</strong></li>
            <li>Bomberos: <strong>171</strong></li>
            <li>Reportes (WhatsApp): <strong>+58 412-931-7277</strong></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4">
        <p className="container-app text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          Hecho con <Heart size={12} className="text-bandera-rojo fill-bandera-rojo" /> por y para Venezuela · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
