import React from "react";
import { Crown, Check, Phone, Globe } from "lucide-react";

const features = [
  "الحضور والبصمة الجغرافية",
  "الرواتب والتأمينات (مدد / قوي)",
  "نهاية الخدمة التلقائية",
  "بوابة الموظف الذاتية",
  "بوابة المالك وتجربة العميل",
  "القرارات والحوافز والإنذارات",
];

export default function JadaraPoster1() {
  return (
    <div
      dir="rtl"
      className="print-poster relative w-full h-full text-white overflow-hidden"
      style={{
        aspectRatio: "1 / 1.414",
        background:
          "radial-gradient(1200px 600px at 85% -10%, #1E3B66 0%, transparent 55%), linear-gradient(160deg, #0B2545 0%, #0E2138 60%, #0B1B30 100%)",
        fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif",
      }}
    >
      {/* زخارف ذهبية */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(182,144,31,.18), transparent 65%)" }} />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(182,144,31,.12), transparent 65%)" }} />
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, #CBA83A, transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, #CBA83A, transparent)" }} />

      <div className="relative h-full flex flex-col justify-between p-[6%]">
        {/* الترويسة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#CBA83A,#9A741E)" }}>
              <Crown size={22} className="text-[#0B2545]" />
            </div>
            <div>
              <div className="font-extrabold text-2xl tracking-tight" style={{ color: "#E9C766" }}>جدارة</div>
              <div className="text-[10px] text-slate-300 -mt-0.5">منصة الموارد البشرية والرواتب</div>
            </div>
          </div>
          <span className="text-[10px] border border-[#CBA83A]/40 text-[#E9C766] px-2.5 py-1 rounded-full">صُمّم للمملكة 2027</span>
        </div>

        {/* العنوان الرئيسي */}
        <div className="text-center my-2">
          <div className="text-[clamp(1.6rem,5.2vw,3.4rem)] font-extrabold leading-[1.15]">
            رتّب <span style={{ color: "#E9C766" }}>مواردك البشرية</span>
            <br /> باحترافية سعودية
          </div>
          <p className="text-slate-200 text-[clamp(.75rem,1.7vw,1rem)] mt-3 max-w-[78%] mx-auto leading-relaxed">
            نظام متكامل لإدارة الموظفين والرواتب والحضور والتأمينات ونهاية الخدمة —
            مُصمَّم خصيصاً لاحتياجات المنشآت السعودية وأنظمتها.
          </p>
        </div>

        {/* المميزات */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[clamp(.7rem,1.6vw,.92rem)]">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center" style={{ background: "#CBA83A" }}>
                <Check size={12} className="text-[#0B2545]" />
              </span>
              <span className="text-slate-100">{f}</span>
            </div>
          ))}
        </div>

        {/* دعوة + رابط */}
        <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: "linear-gradient(120deg, rgba(203,168,58,.18), rgba(11,37,69,.2))", border: "1px solid rgba(203,168,58,.4)" }}>
          <div>
            <div className="text-[clamp(.95rem,2.4vw,1.3rem)] font-bold text-white">جرّب المنصة 30 يوماً مجاناً</div>
            <div className="text-[11px] text-slate-200 mt-0.5">بدون رسوم تأسيس · تفعيل فوري</div>
          </div>
          <div className="text-left shrink-0">
            <div className="flex items-center gap-1.5 text-[#E9C766] font-bold" dir="ltr">
              <Phone size={14} /> +966 59 470 0782
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 text-[11px] mt-1" dir="ltr">
              <Globe size={12} /> jadara.com.sa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}