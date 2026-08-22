import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const POSTER = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/2b7843d43_image.png";

// كل مرحلة: مركز التكبير داخل الصورة (%) + النص العربي الأصيل
const scenes = [
  { x: 23, y: 27, scale: 2.4, step: "1", title: "طلب إجازة سنوية", detail: "من بوابة موظف جدارة" },
  { x: 73, y: 25, scale: 2.2, step: "2", title: "مراجعة طلب الإجازة", detail: "من بوابة الشركات — جدارة" },
  { x: 70, y: 49, scale: 2.6, step: "3", title: "تمت الموافقة على طلب الإجازة", detail: "من قِبل مسؤول الموارد البشرية" },
  { x: 16, y: 71, scale: 2.4, step: "4", title: "تم تحويل مستحقات الإجازة", detail: "ووصول إشعار من البنك" },
  { x: 50, y: 71, scale: 2.4, step: "5", title: "استمتع بإجازتك", detail: "وأنت مطمئن" },
  { x: 84, y: 71, scale: 2.4, step: "6", title: "رحلة مريحة", detail: "تبدأ براحة بال" },
  { x: 50, y: 95, scale: 1.9, step: "★", title: "جدارة… تدير أعمالك", detail: "وتصنع تجربة موظف أفضل" },
];

export default function JadaraStoryFilm() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % scenes.length), 4200);
    return () => clearInterval(id);
  }, []);
  const s = scenes[i];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0B2545]">
      <motion.img
        key={i}
        src={POSTER}
        alt="رحلة الإجازة في جدارة"
        initial={{ scale: s.scale * 0.94, opacity: 0 }}
        animate={{ scale: s.scale, opacity: 1 }}
        transition={{ duration: 4.4, ease: "easeOut", opacity: { duration: 0.9 } }}
        style={{ transformOrigin: `${s.x}% ${s.y}%` }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#0B2545]/45" />
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-10 left-6 right-6 mx-auto max-w-xl rounded-2xl border border-white/20 bg-[#0B2545]/85 p-5 text-center shadow-2xl backdrop-blur-md">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#CBA83A] to-[#B6901F] text-sm font-bold text-[#0B2545]">{s.step}</span>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{s.title}</p>
          <p className="mt-1 text-sm text-white/75">{s.detail}</p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {scenes.map((sc, idx) => <span key={sc.step} className={`h-1 rounded-full transition-all ${idx === i ? "w-7 bg-[#DBC364]" : "w-3 bg-white/30"}`} />)}
      </div>
    </div>
  );
}