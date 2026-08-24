import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

// طبقة كلمات الموارد البشرية العائمة فوق فيديو الهيرو.
// تُترجم وفق لغة الموقع (العربية/الإنجليزية) — بدون نقش نص داخل الفيديو.
// المواضع بـ left/top ثابتة، والنص واضح ودقيق عبر HTML.

const KEYWORDS = [
  { ar: "إدارة الرواتب", en: "Payroll", top: "16%", left: "10%", delay: 0, dur: 7, size: "text-sm" },
  { ar: "إدارة الأداء", en: "Performance", top: "36%", left: "7%", delay: 1.4, dur: 9, size: "text-sm" },
  { ar: "إدارة الموظفين", en: "Employees", top: "50%", left: "84%", delay: 0.4, dur: 7.5, size: "text-sm" },
  { ar: "حماية الأجور", en: "Wage Protection", top: "60%", left: "14%", delay: 1.8, dur: 8.5, size: "text-sm" },
  { ar: "مدد", en: "Mudad", top: "68%", left: "74%", delay: 0.2, dur: 7, size: "text-base font-bold" },
  { ar: "قوى", en: "Qiwa", top: "28%", left: "46%", delay: 1.1, dur: 9.5, size: "text-sm" },
  { ar: "مكتب العمل", en: "Labor Office", top: "74%", left: "40%", delay: 0.6, dur: 8, size: "text-sm" },
  { ar: "مقيم", en: "Muqeem", top: "54%", left: "56%", delay: 1.6, dur: 9, size: "text-sm" },
  { ar: "تم", en: "Tamm", top: "20%", left: "62%", delay: 0.2, dur: 7.5, size: "text-sm" },
  { ar: "تخطيط التعاقب", en: "Succession Planning", top: "24%", left: "80%", delay: 0.9, dur: 8.5, size: "text-sm" },
  { ar: "تخطيط القوى العاملة", en: "Workforce Planning", top: "42%", left: "18%", delay: 0.5, dur: 9, size: "text-sm" },
  { ar: "الهيكل التنظيمي", en: "Org Structure", top: "46%", left: "70%", delay: 1.2, dur: 7.8, size: "text-sm" },
  { ar: "الحضور والانصراف", en: "Attendance", top: "82%", left: "16%", delay: 0.7, dur: 8.2, size: "text-sm" },
  { ar: "تحليلات الموارد البشرية", en: "HR Analytics", top: "88%", left: "52%", delay: 1.3, dur: 9, size: "text-sm" },
];

export default function HrKeywordField() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  return (
    <div dir={isAr ? "rtl" : "ltr"} className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {KEYWORDS.map((k, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 0.9, 0.65, 0.9], y: [8, -10, 4, -10] }}
          transition={{
            duration: k.dur,
            delay: k.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: k.top, left: k.left, position: "absolute" }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 backdrop-blur-md bg-white/[0.06] border border-cyan-300/25 text-white/90 ${k.size}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_6px_2px_rgba(34,211,238,0.5)]" />
          <span className="whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{isAr ? k.ar : k.en}</span>
        </motion.span>
      ))}
    </div>
  );
}