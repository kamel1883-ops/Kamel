import React from "react";
import { motion } from "framer-motion";

// طبقة كلمات الموارد البشرية العربية العائمة فوق فيديو الهيرو.
// تُعرض بالعربية دائماً (كلمات الرواتب والأداء والموظفين والمنصات الحكومية).
// بدون نقش نص داخل الفيديو — النص واضح ودقيق عبر HTML.

const KEYWORDS = [
  { text: "إدارة الرواتب", top: "16%", left: "10%", delay: 0, dur: 7, size: "text-sm" },
  { text: "إدارة الأداء", top: "36%", left: "7%", delay: 1.4, dur: 9, size: "text-sm" },
  { text: "إدارة الموظفين", top: "50%", left: "84%", delay: 0.4, dur: 7.5, size: "text-sm" },
  { text: "حماية الأجور", top: "60%", left: "14%", delay: 1.8, dur: 8.5, size: "text-sm" },
  { text: "مدد", top: "68%", left: "74%", delay: 0.2, dur: 7, size: "text-base font-bold" },
  { text: "قوى", top: "28%", left: "46%", delay: 1.1, dur: 9.5, size: "text-sm" },
  { text: "مكتب العمل", top: "74%", left: "40%", delay: 0.6, dur: 8, size: "text-sm" },
  { text: "مقيم", top: "54%", left: "56%", delay: 1.6, dur: 9, size: "text-sm" },
  { text: "تم", top: "20%", left: "62%", delay: 0.2, dur: 7.5, size: "text-sm" },
  { text: "تخطيط التعاقب", top: "24%", left: "80%", delay: 0.9, dur: 8.5, size: "text-sm" },
  { text: "تخطيط القوى العاملة", top: "42%", left: "18%", delay: 0.5, dur: 9, size: "text-sm" },
  { text: "الهيكل التنظيمي", top: "46%", left: "70%", delay: 1.2, dur: 7.8, size: "text-sm" },
  { text: "الحضور والانصراف", top: "82%", left: "16%", delay: 0.7, dur: 8.2, size: "text-sm" },
  { text: "تحليلات الموارد البشرية", top: "88%", left: "52%", delay: 1.3, dur: 9, size: "text-sm" },
];

export default function HrKeywordField() {
  return (
    <div dir="rtl" className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
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
          <span className="whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>{k.text}</span>
        </motion.span>
      ))}
    </div>
  );
}