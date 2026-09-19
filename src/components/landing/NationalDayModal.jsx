import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getActiveSeason } from "@/lib/seasonalVideo";
import { Image } from "@/components/ui/image";

// نافذة عرض اليوم الوطني السعودي 96 — تظهر مرة واحدة لكل جلسة على صفحات الموقع العامة.
// تصميم مطابق للمرجع: أخضر داكن بنقشة شبكية، رقم 96 كبير مع شعار النخلة والسيفين،
// كود الخصم JADARA-HR-96 ونسبة 30٪ وزر «اكتشف العروض الحصرية».
const CODE = "JADARA-HR-96";
const DISCOUNT = "30%";
const PERSON_IMG =
  "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/35e1c7932_generated_image.png";
const SESSION_KEY = "jadara_nd96_closed_v1";

// صفحات الموقع العامة (التسويقية) التي تظهر فيها النافذة — لا تظهر داخل بوابات العمل.
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
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (!getActiveSeason()) return;
    if (!isMarketingPath(location.pathname)) return;
    const t = setTimeout(() => setOpen(true), 650);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (_) {}
  };

  // إغلاق عند الضغط على الخلفية المعتمة
  const onBackdrop = (e) => { if (e.target === e.currentTarget) close(); };

  if (!open) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onBackdrop}
    >
      <div className="relative w-full max-w-[940px] rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
        {/* زر الإغلاق — مربع أزرق بأبيض X في أعلى اليمين بصرياً */}
        <button
          type="button"
          onClick={close}
          aria-label={isAr ? "إغلاق" : "Close"}
          className="absolute top-3 z-30 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg transition hover:brightness-110"
          style={{ insetInlineEnd: "0.75rem", background: "#3498db" }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="grid md:grid-cols-[42%,58%]">
          {/* اليمين بصرياً (أول في RTL): صورة الشخص بالثوب */}
          <div className="relative min-h-[220px] md:min-h-[520px] bg-[#0f2c20] order-1">
            <Image
              src={PERSON_IMG}
              alt={isAr ? "سعودي بالثوب والشماغ يحمل جهاز لوحي" : "Saudi man in thobe holding a tablet"}
              fittingType="fill"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#163d2e]/40 md:to-[#163d2e]/70" />
          </div>

          {/* الشريط الإعلاني الأخضر */}
          <div
            className="relative order-2 px-6 sm:px-9 py-8 sm:py-10 text-white"
            style={{
              background: "radial-gradient(120% 100% at 80% 0%, #1f5a44 0%, #163d2e 55%, #0f2c20 100%)",
            }}
          >
            {/* نقشة شبكية */}
            <div
              className="absolute inset-0 opacity-[0.18] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* شارة «عِزّنا بطبعنا» */}
            <div className="relative flex items-center gap-2.5 mb-5">
              <EmblemBadge />
              <div className="leading-tight">
                <div className="text-[11px] text-emerald-200/90 font-bold tracking-wide">عِزّنا بطبعنا</div>
                <div className="text-[10px] text-white/70">{isAr ? "اليوم الوطني السعودي" : "Saudi National Day"}</div>
              </div>
            </div>

            {/* ترويسة */}
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 text-emerald-200 text-xs sm:text-sm font-semibold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                {isAr ? "عروض اليوم الوطني السعودي 96" : "Saudi National Day 96 Offers"}
              </div>

              {/* الرقم 96 مع الشعار داخل الـ 9 */}
              <div className="relative flex items-center justify-center my-2">
                <span
                  className="font-black leading-none select-none"
                  style={{
                    fontSize: "clamp(96px, 16vw, 168px)",
                    fontFamily: "var(--font-display)",
                    color: "#eafaf1",
                    textShadow: "0 6px 24px rgba(0,0,0,.35)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  9
                  <span className="relative inline-block" style={{ marginInlineStart: "-0.04em" }}>
                    6
                  </span>
                </span>
                {/* شارة دائرية فوق الـ 9 */}
                <div
                  className="absolute flex items-center justify-center rounded-full bg-[#0f2c20] ring-2 ring-emerald-300/60 shadow-xl"
                  style={{
                    width: "clamp(46px, 7vw, 74px)",
                    height: "clamp(46px, 7vw, 74px)",
                    insetInlineStart: "calc(50% - clamp(96px,16vw,168px)/2 - clamp(46px,7vw,74px)/2 + 6px)",
                    top: "calc(50% - clamp(46px,7vw,74px)/2 - 6px)",
                  }}
                >
                  <SaudiEmblem />
                </div>
              </div>
              <div className="text-emerald-200/90 font-bold tracking-[0.3em] text-xs sm:text-sm -mt-1">23 SEPTEMBER</div>

              {/* العنوان الرئيسي */}
              <h3
                className="mt-4 font-extrabold leading-tight"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3.4vw, 30px)" }}
              >
                {isAr ? "تخفيضات شاملة حتى" : "Discounts up to"}{" "}
                <span className="text-emerald-300">{DISCOUNT}</span>
              </h3>
            </div>

            {/* الكود + الزر */}
            <div className="relative mt-6 flex flex-col sm:flex-row items-center gap-3">
              <div className="text-sm text-white/85 font-semibold whitespace-nowrap">
                {isAr ? "استخدم الكود:" : "Use code:"}
              </div>
              <div
                className="flex-1 min-w-0 text-center font-black tracking-wide rounded-xl px-4 py-2.5 bg-white/10 border border-emerald-300/40 text-emerald-100"
                style={{ fontFamily: "ui-monospace, monospace", fontSize: "15px", letterSpacing: "0.12em" }}
                dir="ltr"
              >
                {CODE}
              </div>
              <button
                type="button"
                onClick={close}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-bold text-[#0f2c20] shadow-lg transition hover:brightness-105"
                style={{ background: "#2ecc71" }}
              >
                {isAr ? "اكتشف العروض الحصرية" : "Discover exclusive offers"}
                <ChevronLeft size={16} className={isAr ? "" : "rotate-180"} />
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

/* شارة مربعة صغيرة تحوي شعار النخلة والسيفين — ملصق «عِزّنا بطبعنا» */
function EmblemBadge() {
  return (
    <div
      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-emerald-300/40"
      style={{ background: "#0f2c20" }}
    >
      <svg viewBox="0 0 48 48" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        {/* سيفان متقاطعان */}
        <g stroke="#eafaf1" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M9 39 L33 15" />
          <path d="M39 39 L15 15" />
          <circle cx="11" cy="37" r="1.6" fill="#eafaf1" stroke="none" />
          <circle cx="37" cy="37" r="1.6" fill="#eafaf1" stroke="none" />
        </g>
        {/* نخلة */}
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

/* شعار المملكة (نخلة وسيفان) داخل دائرة — فوق رقم 9 */
function SaudiEmblem({ size }) {
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