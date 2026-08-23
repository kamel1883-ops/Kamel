import React from "react";
import { Image } from "@/components/ui/image";
import { Crown, Check, Phone } from "lucide-react";

export default function EnvPoster({
  image,
  eyebrow,
  title,
  titleAccent,
  body,
  points = [],
  cta = "ابدأ تجربتك المجانية 30 يوماً",
  accent = "#E9C766",
}) {
  return (
    <div
      dir="rtl"
      className="print-poster relative w-full h-full text-white overflow-hidden"
      style={{ aspectRatio: "1 / 1.414", fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif" }}
    >
      <div className="absolute inset-0">
        <Image src={image} fittingType="fill" className="w-full h-full" alt="" />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(11,37,69,.35) 0%, rgba(11,27,48,.20) 30%, rgba(8,20,38,.88) 100%)" }}
      />
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      <div className="relative h-full flex flex-col justify-between p-[6%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent }}>
              <Crown size={18} className="text-[#0B2545]" />
            </div>
            <span className="font-extrabold text-xl" style={{ color: accent }}>جدارة</span>
          </div>
          {eyebrow && (
            <span className="text-[10px] bg-white/10 backdrop-blur border border-white/20 px-2.5 py-1 rounded-full whitespace-nowrap">
              {eyebrow}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-[clamp(1.5rem,5vw,3.05rem)] font-extrabold leading-[1.15] drop-shadow-sm">
            {title} <span style={{ color: accent }}>{titleAccent}</span>
          </h2>
          {body && (
            <p className="text-slate-100 text-[clamp(.72rem,1.7vw,.95rem)] mt-3 max-w-[90%] leading-relaxed drop-shadow-sm">
              {body}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {points.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 text-[clamp(.66rem,1.5vw,.85rem)] bg-white/10 border border-white/15 backdrop-blur px-2.5 py-1 rounded-full"
              >
                <Check size={12} style={{ color: accent }} /> {p}
              </span>
            ))}
          </div>

          <div
            className="flex items-center justify-between rounded-xl mt-4 p-3"
            style={{ background: "rgba(8,20,38,.55)", border: `1px solid ${accent}55` }}
          >
            <div>
              <div className="font-bold text-[clamp(.85rem,2vw,1.1rem)]">{cta}</div>
              <div className="text-[10px] text-slate-200">بدون رسوم تأسيس · تفعيل فوري</div>
            </div>
            <div className="text-left font-bold whitespace-nowrap" style={{ color: accent }} dir="ltr">
              <Phone size={14} className="inline ml-1" /> +966 59 470 0782
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}