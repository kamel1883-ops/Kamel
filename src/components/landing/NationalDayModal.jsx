import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getActiveSeason } from "@/lib/seasonalVideo";
import { Image } from "@/components/ui/image";

// نافذة عرض اليوم الوطني السعودي 96 — تظهر مرة واحدة لكل جلسة على صفحات الموقع العامة.
// تصميم مطابق للمرجع: أخضر داكن (#003323) بنقشة شبكية، رقم 96 كبير مع شعار النخلة والسيفين
// داخل الـ 6، خلفية أبراج الرياض + جدار الدرعية ونقوش سدو، كود SAUDI96 ونسبة 50٪.
const CODE = "JADARA-HR-96";
const DISCOUNT = "30%";
const PERSON_IMG =
  "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/35e1c7932_generated_image.png";
const SESSION_KEY = "jadara_nd96_closed_v1";

const MARKETING_PATHS = new Set([
  "/", "/about", "/contact", "/quote", "/brochure", "/brochure-en",
  "/hr-system", "/payroll-system", "/attendance-system", "/performance-system",
  "/qiwa-mudad", "/wps-mudad", "/eos-calculator", "/contracts", "/contract-sample",
  "/samples", "/privacy", "/refund-policy", "/affiliate-program",
  "/strategic-plan", "/ad-designs", "/app-store-screens",
]);

function isMarketingPath(path) {
  return (
    MARKETING_PATHS.has(path) ||
    path.startsWith("/blog") ||
    path.startsWith("/jobs")
  );
}

export default function NationalDayModal() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getActiveSeason()) return;
    if (!isMarketingPath(location.pathname)) return;
    const t = setTimeout(() => setOpen(true), 650);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const close = () => setOpen(false);
  const onBackdrop = (e) => { if (e.target === e.currentTarget) close(); };

  if (!open) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onBackdrop}
    >
      <div className="relative w-full max-w-[960px] rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
        {/* زر الإغلاق — مربع أزرق بـ X */}
        <button
          type="button"
          onClick={close}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="absolute top-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg transition hover:brightness-110"
          style={{ insetInlineEnd: "0.75rem", background: "#3498db" }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="grid md:grid-cols-[40%,60%]">
          {/* صورة الشخص السعودي بالثوب */}
          <div className="relative min-h-[200px] md:min-h-[540px] bg-[#0a2418] order-1">
            <Image
              src={PERSON_IMG}
              alt={isAr ? "سعودي بالثوب والشماغ يحمل جهاز لوحي" : "Saudi man in thobe holding a tablet"}
              fittingType="fill"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#003323]/35 md:to-[#003323]/75" />
          </div>

          {/* اللوحة الإعلانية الخضراء */}
          <div
            className="relative order-2 px-6 sm:px-10 py-9 sm:py-11 text-white overflow-hidden"
            style={{ background: "linear-gradient(160deg, #014a33 0%, #003323 55%, #00251a 100%)" }}
          >
            {/* نقشة شبكية */}
            <div
              className="absolute inset-0 opacity-[0.14] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
            {/* أبراج الرياض — ظل على اليمين */}
            <RiyadhSkyline />
            {/* جدار الدرعية — أسفل اليسار */}
            <DiriyahWall />
            {/* نقوش سدو أسفل */}
            <SaduTiles />

            {/* الشارة العلوية: عِزُّنا بطبعنا */}
            <div className="relative flex items-center gap-2.5 mb-5">
              <EmblemBadge />
              <div className="leading-tight">
                <div className="text-[12px] text-white font-extrabold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>عِزُّنا بطبعنا</div>
                <div className="text-[10px] text-emerald-200/80">{isAr ? "اليوم الوطني السعودي" : "Saudi National Day"}</div>
              </div>
            </div>

            {/* الترويسة */}
            <div className="relative text-center">
              <div className="text-white/90 text-xs sm:text-sm font-semibold mb-2">
                {isAr ? "عروض اليوم الوطني السعودي 96" : "Saudi National Day 96 Offers"}
              </div>

              {/* الرقم 96 مع الشعار داخل الـ 6 */}
              <div className="relative flex items-center justify-center leading-none my-1" style={{ height: "clamp(110px, 17vw, 180px)" }}>
                <span
                  className="font-black select-none"
                  style={{
                    fontSize: "clamp(110px, 17vw, 180px)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.05em",
                    backgroundImage:
                      "repeating-linear-gradient(35deg, #1f8a63 0 9px, #136a4a 9px 18px, #0a4f34 18px 27px)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextStroke: "1.5px #eafaf1",
                    filter: "drop-shadow(0 6px 18px rgba(0,0,0,.4))",
                  }}
                >
                  96
                </span>
                {/* شعار النخلة والسيفين داخل الـ 6 */}
                <div
                  className="absolute flex items-center justify-center rounded-full bg-[#00251a] ring-2 ring-emerald-300/70 shadow-xl"
                  style={{
                    width: "clamp(46px, 7.5vw, 76px)",
                    height: "clamp(46px, 7.5vw, 76px)",
                    insetInlineStart: "calc(50% + clamp(20px, 3vw, 34px))",
                    top: "calc(50% - clamp(8px, 1.2vw, 14px))",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <SaudiEmblem />
                </div>
              </div>
              <div className="text-white/85 font-bold tracking-[0.32em] text-[11px] sm:text-sm -mt-1">23 SEPTEMBER</div>

              {/* العنوان الفرعي */}
              <h3
                className="mt-3 font-extrabold leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.6vw, 34px)" }}
              >
                {isAr ? "تخفيضات شاملة حتى" : "Discounts up to"}{" "}
                <span style={{ color: "#7ff0c0" }}>{DISCOUNT}</span>
              </h3>
            </div>

            {/* الكود + الزر */}
            <div className="relative mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="text-sm text-white font-semibold whitespace-nowrap">
                {isAr ? "استخدم الكود:" : "Use code:"}
              </div>
              <div
                className="text-center font-black tracking-[0.18em] rounded-xl px-5 py-2.5 bg-white/10 border border-emerald-300/45 text-white"
                style={{ fontFamily: "ui-monospace, monospace", fontSize: "16px" }}
                dir="ltr"
              >
                {CODE}
              </div>
              <button
                type="button"
                onClick={close}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 font-extrabold text-white shadow-lg transition hover:brightness-110"
                style={{ background: "linear-gradient(90deg, #1f8a63 0%, #0a4f34 100%)" }}
              >
                {isAr ? "اكتشف العروض الحصرية" : "Discover exclusive offers"}
                <ChevronRight size={17} />
              </button>
            </div>

            <p className="relative mt-4 text-center text-[11px] text-white/55">
              {isAr ? "ساري حتى 23 أكتوبر 2026 · خصم على السنة الأولى للاشتراك السنوي" : "Valid until Oct 23, 2026 · first-year annual subscription discount"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* شارة مربعة صغيرة تحوي شعار النخلة والسيفين — ملصق «عِزُّنا بطبعنا» */
function EmblemBadge() {
  return (
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-emerald-300/40"
      style={{ background: "#00251a" }}
    >
      <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#eafaf1" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M9 39 L33 15" />
          <path d="M39 39 L15 15" />
          <circle cx="11" cy="37" r="1.6" fill="#eafaf1" stroke="none" />
          <circle cx="37" cy="37" r="1.6" fill="#eafaf1" stroke="none" />
        </g>
        <g fill="#eafaf1">
          <rect x="23" y="22" width="2" height="13" rx="1" />
          <path d="M24 22 C20 18, 18 18, 16 20 C18 19, 20 20, 22 22 Z" />
          <path d="M24 22 C28 18, 30 18, 32 20 C30 19, 28 20, 26 22 Z" />
          <path d="M24 20 C22 15, 23 12, 26 11 C25 13, 25 16, 26 19 Z" />
          <path d="M24 20 C26 15, 25 12, 22 11 C23 13, 23 16, 22 19 Z" />
          <path d="M24 19 C24 14, 24 11, 24 9 C25 12, 25 15, 25 19 Z" />
        </g>
      </svg>
    </div>
  );
}

/* شعار المملكة (نخلة وسيفان) داخل دائرة — فوق رقم 6 */
function SaudiEmblem() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#eafaf1" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M10 40 L31 18" />
        <path d="M38 40 L17 18" />
      </g>
      <g fill="#eafaf1">
        <rect x="23.2" y="20" width="1.6" height="12" rx="0.8" />
        <path d="M24 20 C20.5 16.5, 18.5 16.5, 16.5 18.3 C18.5 17.5, 20.3 18.3, 22 20 Z" />
        <path d="M24 20 C27.5 16.5, 29.5 16.5, 31.5 18.3 C29.5 17.5, 27.7 18.3, 26 20 Z" />
        <path d="M24 18.5 C22.2 14, 23 11, 25.6 10 C25 12.2, 25 14.8, 26 17.5 Z" />
        <path d="M24 18.5 C25.8 14, 25 11, 22.4 10 C23 12.2, 23 14.8, 22 17.5 Z" />
        <path d="M24 17.8 C24 13.5, 24 11, 24 9 C25 12, 25 14.5, 25 17.8 Z" />
      </g>
    </svg>
  );
}

/* ظل أبراج الرياض (كينغدوم سنتر + الفيصلية) على اليمين */
function RiyadhSkyline() {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ insetInlineEnd: 0, bottom: 0, height: "62%", width: "55%", opacity: 0.22 }}
      viewBox="0 0 300 200"
      preserveAspectRatio="xMaxYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#00ff9c">
        {/* الفيصلية بالكرة */}
        <rect x="20" y="70" width="34" height="130" />
        <circle cx="37" cy="64" r="14" />
        <rect x="33" y="20" width="8" height="44" />
        {/* برج عادي */}
        <rect x="70" y="110" width="26" height="90" />
        {/* كينغدوم سنتر بالفتحة العلوية */}
        <path d="M120 200 L120 90 L150 30 L180 90 L180 200 Z" />
        <path d="M150 30 L150 70 L120 90 L180 90 Z" fill="#003323" />
        {/* برج مزدوج */}
        <rect x="205" y="100" width="20" height="100" />
        <rect x="240" y="80" width="24" height="120" />
      </g>
    </svg>
  );
}

/* جدار الدرعية الحجري — أسفل اليسار */
function DiriyahWall() {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ insetInlineStart: 0, bottom: 0, height: "40%", width: "42%", opacity: 0.18 }}
      viewBox="0 0 300 120"
      preserveAspectRatio="xMinYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#7ff0c0">
        {/* صفوف حجارة متدرجة + برج صغير */}
        <rect x="0" y="78" width="300" height="42" />
        <rect x="24" y="58" width="250" height="20" />
        <rect x="60" y="40" width="180" height="18" />
        <rect x="120" y="18" width="40" height="22" />
        <path d="M110 18 L140 4 L170 18 Z" />
        {/* فواصل الحجر */}
        <g stroke="#003323" strokeWidth="2">
          <line x1="40" y1="78" x2="40" y2="120" />
          <line x1="80" y1="78" x2="80" y2="120" />
          <line x1="130" y1="78" x2="130" y2="120" />
          <line x1="180" y1="78" x2="180" y2="120" />
          <line x1="230" y1="78" x2="230" y2="120" />
          <line x1="60" y1="58" x2="60" y2="78" />
          <line x1="120" y1="58" x2="120" y2="78" />
          <line x1="190" y1="58" x2="190" y2="78" />
          <line x1="250" y1="58" x2="250" y2="78" />
        </g>
      </g>
    </svg>
  );
}

/* نقوش سدو هندسية متناثرة أسفل اللوحة */
function SaduTiles() {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ bottom: 0, insetInlineStart: "30%", width: "45%", height: "26%", opacity: 0.16 }}
      viewBox="0 0 240 80"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#7ff0c0">
        <g transform="translate(10 30)">
          <path d="M0 0 L24 0 L12 20 Z" />
          <path d="M0 0 L24 0 L12 -20 Z" />
        </g>
        <g transform="translate(60 50)">
          <rect x="0" y="0" width="18" height="18" transform="rotate(45 9 9)" />
        </g>
        <g transform="translate(110 30)">
          <path d="M0 0 L20 0 L10 16 Z" />
          <path d="M0 0 L20 0 L10 -16 Z" />
        </g>
        <g transform="translate(160 48)">
          <rect x="0" y="0" width="16" height="16" transform="rotate(45 8 8)" />
          <rect x="6" y="6" width="4" height="4" transform="rotate(45 8 8)" fill="#003323" />
        </g>
        <g transform="translate(200 32)">
          <path d="M0 0 L18 0 L9 14 Z" />
        </g>
      </g>
    </svg>
  );
}