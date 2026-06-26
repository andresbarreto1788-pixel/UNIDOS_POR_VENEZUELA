import Image from "next/image";
import Link from "next/link";

export default function Logo({
  showText = true,
  size = 40,
}: {
  showText?: boolean;
  size?: number;
}) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image
        src="/logo.svg"
        alt="Unidos por Venezuela"
        width={size}
        height={size}
        priority
        className="transition-transform group-hover:scale-105"
      />
      {showText && (
        <span className="leading-tight">
          <span className="block font-extrabold text-marca text-base sm:text-lg">
            Unidos por Venezuela
          </span>
          <span className="block text-[10px] sm:text-xs text-slate-500 -mt-0.5">
            Búsqueda de heridos · Sismo 2026
          </span>
        </span>
      )}
    </Link>
  );
}
