import Image from "next/image";
import Link from "next/link";

/**
 * Brand logo. Expects the HV monogram saved at /public/images/logo.png
 * The logo art sits on a light background, so on dark (navy) bars it is
 * placed inside a white rounded badge to keep contrast clean.
 */
export default function Logo({ onBadge = true, showWordmark = true, size = 52, dark = false }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span
        className={
          onBadge
            ? "flex items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm"
            : "flex items-center justify-center"
        }
        style={{ height: size, width: size }}
      >
        <Image
          src="/images/hardvanta.png"
          alt="Hardvanta Technologies"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-xl font-extrabold tracking-tight ${
              dark ? "text-white" : "text-brand-text"
            }`}
          >
            Hard<span className={dark ? "text-brand-silver" : "text-brand-blue"}>vanta</span>
          </span>
          <span
            className={`text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.6 ${
              dark ? "text-white/70" : "text-brand-muted"
            }`}
          >
            Technologies
          </span>
        </span>
      )}
    </Link>
  );
}
