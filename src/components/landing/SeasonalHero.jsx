import React from "react";
import { Image } from "@/components/ui/image";
import { getHeroVideo, getActiveSeason } from "@/lib/seasonalVideo";

// خلفية الواجهة: صورة الهوية الموسمية داخل الموسم، وفيديو جدارة الأساسي خارجه.
export default function SeasonalHero({ isAr }) {
  const season = getActiveSeason();
  const shade = season ? "#07231A" : "#0B2545";

  return (
    <>
      {season?.heroImage ? (
        <Image
          src={season.heroImage}
          alt={isAr ? season.titleAr : season.titleEn}
          fittingType="fill"
          className="absolute inset-0 w-full h-full"
        />
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