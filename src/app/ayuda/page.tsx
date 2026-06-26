import Image from "next/image";
import InstallButton from "@/components/InstallButton";
import { Share2, MessageCircle, HandHeart, Building2 } from "lucide-react";

export const metadata = { title: "Cómo ayudar" };

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "584129317277";

export default function AyudaPage() {
  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold text-slate-900">Cómo ayudar</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Cada acción cuenta para reunir a las familias. Así puedes sumarte:
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          {
            icon: MessageCircle,
            titulo: "Reporta información",
            texto:
              "¿Viste o conoces a alguien herido o desaparecido? Envíanos los datos por WhatsApp y los sumamos al sistema.",
            cta: (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Escribir por WhatsApp
              </a>
            ),
          },
          {
            icon: Share2,
            titulo: "Comparte la app",
            texto:
              "Mientras más personas la instalen, más rápido encontramos a los desaparecidos. Compártela con tus contactos.",
            cta: <div className="mt-3"><InstallButton /></div>,
          },
          {
            icon: Building2,
            titulo: "Personal de hospitales",
            texto:
              "Si trabajas en un centro de salud, ayúdanos a mantener actualizados los listados de ingresos y altas.",
          },
          {
            icon: HandHeart,
            titulo: "Voluntariado y donaciones",
            texto:
              "Súmate como voluntario o aporta insumos. Coordinamos por WhatsApp con Protección Civil y los hospitales.",
          },
        ].map((c) => (
          <div
            key={c.titulo}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-marca/10 text-marca">
              <c.icon size={22} />
            </div>
            <h2 className="font-bold text-slate-900">{c.titulo}</h2>
            <p className="mt-1 text-sm text-slate-600">{c.texto}</p>
            {c.cta}
          </div>
        ))}
      </div>

      {/* Historia de Tsunami */}
      <div className="mt-10 grid items-center gap-6 rounded-3xl bg-gradient-to-r from-marca-oscuro to-marca p-6 text-white sm:grid-cols-[200px_1fr] sm:p-8">
        <div className="overflow-hidden rounded-2xl ring-4 ring-white/20">
          <Image
            src="/tsunami.jpg"
            alt="Tsunami, el perrito rescatista"
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">🐶 La historia de Tsunami</h2>
          <p className="mt-2 text-blue-100">
            Tsunami es un perrito rescatista que ha ayudado a salvar a más de
            <strong className="text-bandera-amarillo"> 350 personas </strong>
            con vida entre los escombros. Su olfato y valentía representan el
            espíritu de toda Venezuela: no dejar a nadie atrás. Esta plataforma
            continúa esa misión, ahora ayudando a las familias a reencontrarse.
          </p>
        </div>
      </div>
    </div>
  );
}
