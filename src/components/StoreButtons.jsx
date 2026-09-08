import React from "react";
import { Apple, Play } from "lucide-react";
import { APP_STORE_LINKS } from "@/lib/appStores";

/**
 * أزرار تحميل التطبيق من متجري Apple App Store و Google Play.
 * variant: "light" (خلفية بيضاء/فاتحة) | "dark" (خلفية داكنة) | "glass" (زجاجي شفاف فوق الخلفيات الملونة)
 */
export default function StoreButtons({ variant = "light", isAr = true, className = "" }) {
  const appleLabel = isAr ? "تحميل من App Store" : "Download on the App Store";
  const googleLabel = isAr ? "حمّله من Google Play" : "Get it on Google Play";

  const styles = {
    light: "bg-white hover:bg-slate-100 text-foreground border border-black/10 shadow-lg shadow-black/10",
    dark: "bg-white hover:bg-slate-100 text-foreground border border-white/20 shadow-lg shadow-black/30",
    glass: "bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md",
  }[variant];

  const base =
    "inline-flex items-center gap-3 rounded-2xl px-5 py-3 transition-all min-w-[180px] font-semibold";

  const googleHref = APP_STORE_LINKS.google || "#";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_LINKS.apple}
        target="_blank"
        rel="noreferrer"
        aria-label={appleLabel}
        className={`${base} ${styles}`}
      >
        <Apple size={26} className="shrink-0" fill="currentColor" strokeWidth={0} />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] opacity-70">{isAr ? "متجر آبل" : "App Store"}</span>
          <span className="text-sm font-bold">{appleLabel}</span>
        </span>
      </a>
      <a
        href={googleHref}
        target="_blank"
        rel="noreferrer"
        aria-label={googleLabel}
        className={`${base} ${styles}`}
      >
        <Play size={24} className="shrink-0" fill="currentColor" strokeWidth={0} />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] opacity-70">{isAr ? "متجر جوجل" : "Google Play"}</span>
          <span className="text-sm font-bold">{googleLabel}</span>
        </span>
      </a>
    </div>
  );
}