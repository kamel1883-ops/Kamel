import React from "react";
import { Copy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getActiveSeason } from "@/lib/seasonalVideo";

const CODE = "JADARA-HR-96";

// شريط إعلان خصم موسمي أسفل الهيدر — يظهر فقط داخل النطاق الموسمي.
export default function SeasonalDiscountBanner() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const season = getActiveSeason();
  if (!season) return null;

  const copy = () => {
    try { navigator.clipboard?.writeText(CODE); } catch (_) {}
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-20 z-30 w-full"
    >
      <div
        className="w-full text-center text-sm sm:text-base font-semibold py-2 px-3 text-white shadow-lg"
        style={{ background: "linear-gradient(90deg,#0B6B3A 0%,#138A49 50%,#0B6B3A 100%)" }}
      >
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-amber-200">🎉</span>
          <span>
            {isAr
              ? "خصم 5٪ بمناسبة اليوم الوطني السعودي 96"
              : "5% off for Saudi National Day 96"}
          </span>
          <span className="opacity-60">·</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-md bg-white/15 hover:bg-white/25 border border-white/25 px-2 py-0.5 transition"
            title={isAr ? "نسخ الكود" : "Copy code"}
          >
            <Copy size={12} />
            <span className="font-mono tracking-wide text-amber-100">{CODE}</span>
          </button>
          <span className="opacity-60">·</span>
          <span className="text-white/85 text-xs sm:text-sm">
            {isAr ? "ساري حتى 23 أكتوبر 2026" : "Valid until Oct 23, 2026"}
          </span>
        </span>
      </div>
    </div>
  );
}