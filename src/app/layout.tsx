import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Unidos por Venezuela — Búsqueda de heridos del sismo",
    template: "%s | Unidos por Venezuela",
  },
  description:
    "Plataforma humanitaria para buscar a familiares y personas heridas o desaparecidas del sismo en los hospitales de Venezuela.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Unidos VZLA",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Unidos por Venezuela",
    description:
      "Busca a familiares y personas heridas o desaparecidas del sismo en los hospitales de Venezuela.",
    type: "website",
    locale: "es_VE",
    images: ["/tsunami.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#003DA5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-VE" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
