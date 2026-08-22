import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const POSTER = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/2b7843d43_image.png";

// كل مرحلة تُعرض كاملة ومستقلة: منطقة القص داخل الصورة (%) + النص العربي الأصيل
const scenes = [
  { x: 2.5, y: 2.5, w: 43, h: 51, step: "1", title: "طلب إجازة سنوية", detail: "من بوابة موظف جدارة" },
  { x: 46, y: 2.5, w: 51.5, h: 43, step: "2", title: "مراجعة طلب الإجازة", detail: "من بوابة الشركات — جدارة" },
  { x: 44, y: 45, w: 54, h: 10, step: "3", title: "تمت الموافقة على طلب الإجازة", detail: "من قِبل مسؤول الموارد البشرية" },
  { x: 2.5, y: 54.5, w: 31, h: 33.5, step: "4", title: "تم تحويل مستحقات الإجازة", detail: "ووصول إشعار من البنك" },
  { x: 34.5, y: 54.5, w: 31, h: 33.5, step: "5", title: "استمتع بإجازتك", detail: "وأنت مطمئن" },
  { x: 66.5, y: 54.5, w: 31, h: 33.5, step: "6", title: "رحلة مريحة", detail: "تبدأ براحة بال" },
  { x: 2.5, y: 88.5, w: 95, h: 10, step: "★", title: "جدارة… تدير أعمالك", detail: "وتصنع تجربة موظف أفضل" },
];

export default function JadaraStoryFilm() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % scenes.length), 4500);
    return () => clearInterval(id);
  }, []);
  const s = scenes[i];

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0B2545] px-4 py-10">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6 }} className="flex flex-col items-center gap-4">
          {/* إطار المرحلة — يعرض اللقطة كاملة بدون قص أو تشويه */}
          <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
            style={{ aspectRatio: `${s.w} / ${s.h}`, maxHeight: "56vh", maxWidth: "88vw", height: "56vh" }}>
            <img src={POSTER} alt={s.title} className="absolute max-w-none"
              style={{ width: `${(100 / s.w) * 100}%`, left: `${-(s.x / s.w) * 100}%`, top: `${-(s.y / s.h) * 100}%`, height: "auto" }} />
          </div>
          <div className="max-w-xl rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-center backdrop-blur-md">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBA83A] to-[#B6901F] text-sm font-bold text-[#0B2545]">{s.step}</span>
            <p className="mt-1.5 text-xl font-bold text-white sm:text-2xl">{s.title}</p>
            <p className="mt-0.5 text-sm text-white/75">{s.detail}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {scenes.map((sc, idx) => <span key={sc.step} className={`h-1 rounded-full transition-all ${idx === i ? "w-7 bg-[#DBC364]" : "w-3 bg-white/30"}`} />)}
      </div>
    </div>
  );
}