import React from "react";
import { Crown, Mail, Phone, Globe, Instagram, Linkedin, Twitter } from "lucide-react";

const NAVY = "#0B2545";
const GOLD = "#E9C766";

// وجه واحد من الكرت الشخصي (عربي أو إنجليزي) — نسبة 90×50 ملم
function Side({ isAr, name, title, phone, email, website, social }) {
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full h-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, #14396B 0%, #1B4A81 55%, #10305C 100%)` }}
    >
      <div
        className="absolute -top-10 w-40 h-40 rounded-full opacity-25"
        style={{ background: GOLD, filter: "blur(38px)", [isAr ? "left" : "right"]: "-2.5rem" }}
      />
      {/* علامة مائية: التاج الذهبي */}
      <div
        className="absolute pointer-events-none"
        style={{ opacity: 0.09, bottom: "-1.5rem", [isAr ? "left" : "right"]: "-1rem" }}
      >
        <Crown size={190} color={GOLD} />
      </div>
      <div className="absolute bottom-0 inset-x-0 h-1.5" style={{ background: GOLD }} />

      <div className="relative h-full flex flex-col justify-between p-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD }}>
            <Crown size={18} color={NAVY} />
          </div>
          <div className="leading-tight">
            <div className="text-white font-bold text-[17px]">{isAr ? "جدارة" : "Jadara"}</div>
            <div className="text-[9px] tracking-wide" style={{ color: GOLD }}>
              {isAr ? "لإدارة الموارد البشرية" : "HUMAN RESOURCES MANAGEMENT"}
            </div>
          </div>
        </div>

        <div>
          <div className="text-white font-bold text-[20px] leading-tight">{name}</div>
          <div className="text-[15px] font-semibold mt-1.5" style={{ color: GOLD }}>{title}</div>
        </div>

        <div className="space-y-1 text-[13px] text-white/90">
          <div className="flex items-center gap-1.5"><Phone size={14} style={{ color: GOLD }} /><span dir="ltr">{phone}</span></div>
          <div className="flex items-center gap-1.5"><Mail size={14} style={{ color: GOLD }} /><span dir="ltr">{email}</span></div>
          <div className="flex items-center gap-1.5"><Globe size={14} style={{ color: GOLD }} /><span dir="ltr">{website}</span></div>
          <div className="flex items-center gap-3 pt-1 text-white/80 text-[12px]">
            <span className="flex items-center gap-1"><Instagram size={12} /><span dir="ltr">{social}</span></span>
            <span className="flex items-center gap-1"><Twitter size={12} /><span dir="ltr">{social}</span></span>
            <span className="flex items-center gap-1"><Linkedin size={12} /><span dir="ltr">{social}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCard({ nameAr, nameEn, phone, email, website, social }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div style={{ aspectRatio: "9 / 5" }} className="rounded-xl overflow-hidden shadow-lg">
        <Side isAr name={nameAr} title="المدير التنفيذي" phone={phone} email={email} website={website} social={social} />
      </div>
      <div style={{ aspectRatio: "9 / 5" }} className="rounded-xl overflow-hidden shadow-lg">
        <Side isAr={false} name={nameEn} title="Chief Executive Officer" phone={phone} email={email} website={website} social={social} />
      </div>
    </div>
  );
}