import React from "react";
import { Sparkles } from "lucide-react";
import { getActiveSeason } from "@/lib/seasonalVideo";

// طبقة شعار الموسم فوق فيديو الهيرو — تتظهر فقط داخل النطاق الموسمي.
// الذكاء الاصطناعي يشوّه الحروف العربية داخل الفيديو، لذا نعرض الشعار كطبقة HTML.
export default function SeasonalHeroOverlay({ lang }) {
  const season = getActiveSeason();
  if (!season) return null;
  const isAr = lang === "ar";
  const small = isAr ? "اليوم الوطني السعودي ٩٦" : "Saudi National Day 96";
  const big = isAr ? "عزنا بطبعنا" : "Our Pride is Our Nature";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="absolute top-6 inset-x-0 z-[5] text-center pointer-events-none select-none"
    >
      <div className="inline-flex flex-col items-center gap-1 px-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-200/90 drop-shadow">
          <Sparkles size={13} className="text-amber-300" /> {small}
        </span>
        <span
          className="text-2xl sm:text-4xl font-extrabold leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(90deg,#F4E3A1,#E9C766,#F4E3A1)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: isAr ? "0" : "0.01em",
          }}
        >
          {big}
        </span>
      </div>
    </div>
  );
}