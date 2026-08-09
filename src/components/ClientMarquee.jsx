import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const CLIENTS = [
  { name: "عيادة دكتور توم البيطرية", en: "Dr. Tom Veterinary Clinic", logo: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/5ae9d2097_Screenshot2026-08-05143830.png" },
  { name: "شركة كود الأعمال للمقاولات", en: "Business Code Co.", logo: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/d146af91b_Screenshot2026-08-09155940.png" },
  { name: "مصنع درز للخياطة الراقية", en: "Darz Tailoring Factory", logo: "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/64e527d78_Screenshot2026-08-09155842.png" },
];

export default function ClientMarquee() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const title = isAr ? "عملاؤنا" : "Our Clients";
  const sub = isAr ? "منشآت تثق بجدارة لإدارة مواردها البشرية" : "Organizations trusting Jadara for their HR";
  const loop = [...CLIENTS, ...CLIENTS];

  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3">{isAr ? "موثوق به" : "Trusted by"}</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
        <p className="text-white/55 text-sm mt-2">{sub}</p>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] py-8" dir="ltr">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b1120] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b1120] to-transparent z-10" />
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 26, ease: "linear", repeat: Infinity }}
        >
          {loop.map((c, i) => (
            <div key={i} className="shrink-0 w-[300px] h-[150px] rounded-2xl bg-white border border-white/10 flex flex-col items-center justify-center gap-3 px-4 shadow-lg">
              <img src={c.logo} alt={isAr ? c.name : c.en} className="h-24 w-32 object-contain rounded-xl" />
              <div className="text-center text-sm font-semibold text-slate-800 leading-tight" dir={isAr ? "rtl" : "ltr"}>
                {isAr ? c.name : c.en}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}