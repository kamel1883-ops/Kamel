import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { getHeroVideo, getActiveSeason } from "@/lib/seasonalVideo";

// خلفية الواجهة: صور الهوية الموسمية تتبدّل تلقائياً داخل الموسم، وفيديو جدارة الأساسي خارجه.
export default function SeasonalHero({ isAr }) {
  const season = getActiveSeason();
  const images = season?.heroImages || [];
  const shade = season ? "#07231A" : "#0B2545";
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % images.length), 6000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <>
      {images.length ? (
        <AnimatePresence mode="sync">
          <motion.div
            key={images[i]}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[i]}
              alt={isAr ? season.titleAr : season.titleEn}
              fittingType="fill"
              className="absolute inset-0 w-full h-full"
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <video
          src={getHeroVideo()}
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${shade}88, ${shade}22, ${shade}bf)` }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${shade}80, transparent, transparent)` }} />
    </>
  );
}