import React from "react";
import { Server, Cpu, HardDrive, MemoryStick, Users, ShieldCheck, Zap, Globe, Lock, MapPin, Network } from "lucide-react";

// قسم الاستضافة: يُبرز أن منصة «جدارة» تعمل على خادم خاص داخل المملكة العربية السعودية
// (الرياض — SAIX) بما يتوافق مع الهيئة الوطنية للأمن السيبراني والتزاماً كاملاً مع سدايا (SDAIA).
// خادم واحد يستضيف اشتراكات جميع الشركات والمؤسسات على المنصة، بسعة حتى 50,000 موظف
// من مجموعة شركات مختلفة — دون أي تأثير على الأداء.
// يُدرج قبل قسم الباقات في صفحة الهبوط.
// (أصناف cyan-* وteal-* وsky-* تُرسم ذهبياً تلقائياً عبر إعداد Tailwind — هوية كحلي+ذهبي.)
const GOLD = "#7C5CE6";

export default function HostingSpecs({ isAr = true }) {
  const L = isAr
    ? {
        tag: "بنية تحتية سعودية",
        title: "سيرفر خاص بمنصة جدارة — داخل السعودية وبأعلى المواصفات",
        desc: "تعمل منصة «جدارة» على خادم خاص داخل المملكة العربية السعودية (الرياض — SAIX)، بما يتوافق مع سياسة الهيئة الوطنية للأمن السيبراني والتزاماً كاملاً مع متطلبات منصة سدايا (SDAIA). خادم واحد يستضيف اشتراكات جميع الشركات والمؤسسات على المنصة، بسعة تكفي حتى 50,000 موظف من مجموعة شركات مختلفة — دون بطء أو توقف.",
        badge: "أعلى المواصفات",
        heading: "خادم جدارة الخاص",
        savingTag: "أداء مخصّص",
        strikethrough: "استضافة مشتركة",
        price: "100%",
        priceUnit: "أداء مخصّص",
        subtext: "سيرفر خاص بمنصة جدارة — يستضيف اشتراكات جميع الشركات والمؤسسات",
        specs: [
          { icon: Cpu, big: "12 vCores", small: "AMD EPYC 4464P · 24 مسار" },
          { icon: MemoryStick, big: "48 GB", small: "ذاكرة DDR5 ECC" },
          { icon: HardDrive, big: "1 TB", small: "تخزين NVMe فائق السرعة" },
        ],
        features: [
          "خادم خاص بمنصة جدارة — يستضيف جميع اشتراكات الشركات والمؤسسات",
          "موقع سعودي (الرياض — SAIX) — التزام كامل بالهيئة الوطنية للأمن السيبراني وسدايا (SDAIA)",
          "تخزين NVMe سريع — فتح الصفحات والتقارير في أجزاء من الثانية",
          "نسخ احتياطي يومي تلقائي وحماية كاملة من فقدان البيانات",
          "تشفير كامل للبيانات أثناء التخزين والنقل (TLS / Isolation)",
          "أداء ثابت حتى مع نمو إجمالي الموظفين عبر المنشآت المختلفة",
        ],
        capacityLabel: "سعة الخادم",
        capacityValue: "حتى 50,000 موظف",
        capacityNote: "موزّعون على مجموعة شركات ومؤسسات مختلفة",
        cta: "ابدأ تجربتك المجانية",
      }
    : {
        tag: "Saudi-based infrastructure",
        title: "A dedicated Jadara server — inside Saudi Arabia, top specs",
        desc: "Jadara runs on a dedicated server inside the Kingdom of Saudi Arabia (Riyadh — SAIX), compliant with the National Cybersecurity Authority policy and fully aligned with SDAIA requirements. A single server hosts all company and institution subscriptions on the platform, sized for up to 50,000 employees across different company groups — no slowdowns, no downtime.",
        badge: "Top specs",
        heading: "Jadara dedicated server",
        savingTag: "Dedicated power",
        strikethrough: "Shared hosting",
        price: "100%",
        priceUnit: "Dedicated power",
        subtext: "A server dedicated to the Jadara platform — hosting all company and institution subscriptions",
        specs: [
          { icon: Cpu, big: "12 vCores", small: "AMD EPYC 4464P · 24 threads" },
          { icon: MemoryStick, big: "48 GB", small: "DDR5 ECC memory" },
          { icon: HardDrive, big: "1 TB", small: "Ultra-fast NVMe storage" },
        ],
        features: [
          "A server dedicated to the Jadara platform — hosting all company and institution subscriptions",
          "Saudi location (Riyadh — SAIX) — full compliance with the National Cybersecurity Authority and SDAIA",
          "NVMe storage — pages and reports open in fractions of a second",
          "Automatic daily backups with full data-loss protection",
          "Full encryption at rest and in transit (TLS / isolation)",
          "Steady performance even as total employees grow across organizations",
        ],
        capacityLabel: "Server capacity",
        capacityValue: "Up to 50,000 employees",
        capacityNote: "Across different companies and institutions",
        cta: "Start your free trial",
      };

  return (
    <section id="hosting" className="max-w-[1600px] mx-auto px-4 lg:px-10 py-14">
      <div className="bg-white rounded-[2rem] p-6 sm:p-10 text-foreground shadow-xl shadow-violet-900/10 border border-violet-100">
        {/* ترويسة */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 text-sm font-semibold rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {L.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-2 text-[#5B3FD6]" style={{ fontFamily: "var(--font-display)" }}>
            {isAr ? <>سيرفر خاص بمنصة <span className="text-cyan-600">جدارة</span> — داخل السعودية بأعلى المواصفات</> : <>A dedicated <span className="text-cyan-600">Jadara</span> server — inside Saudi Arabia, top specs</>}
          </h2>
          <p className="text-[#4b5563] text-base leading-relaxed max-w-2xl mx-auto">{L.desc}</p>
        </div>

        {/* بطاقة السيرفر + المواصفات */}
        <div className="grid lg:grid-cols-[420px,1fr] gap-6 mt-10 items-stretch">
          {/* بطاقة السيرفر — على نمط المرجع */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col mx-auto max-w-md w-full">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-sm font-bold rounded-lg px-4 py-1.5 bg-violet-600 text-white shadow-lg shadow-violet-600/30">
              <Server size={12} /> {L.badge}
            </span>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Server size={20} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-extrabold text-[#5B3FD6]" style={{ fontFamily: "var(--font-display)" }}>{L.heading}</h3>
            </div>

            {/* موقع سعودي */}
            <div className="mt-3 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 bg-emerald-50 border border-emerald-100">
              <MapPin size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{isAr ? "الرياض — المملكة العربية السعودية" : "Riyadh — Saudi Arabia"}</span>
            </div>

            {/* السعر */}
            <div className="mt-5">
              <span className="inline-flex items-center text-sm font-bold rounded-md px-2.5 py-1 bg-violet-600 text-white">{L.savingTag}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[#cbd5e1] line-through text-base font-semibold">{L.strikethrough}</span>
                <span className="text-4xl font-extrabold text-[#5B3FD6]">{L.price}</span>
                <span className="text-base font-medium text-[#4b5563]">{L.priceUnit}</span>
              </div>
              <div className="text-sm text-[#4b5563] mt-1">{L.subtext}</div>
            </div>

            {/* المواصفات */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {L.specs.map((s) => {
                const I = s.icon;
                return (
                  <div key={s.big} className="bg-[#f4f7f9] rounded-xl p-3 text-center border border-slate-100">
                    <I size={18} className="text-cyan-600 mx-auto mb-1.5" />
                    <div className="text-base font-extrabold text-[#5B3FD6]">{s.big}</div>
                    <div className="text-xs text-[#6b7280] leading-tight mt-0.5">{s.small}</div>
                  </div>
                );
              })}
            </div>

            {/* سعة الموظفين */}
            <div className="mt-5 rounded-xl bg-gradient-to-r from-cyan-50 to-violet-50 border border-cyan-100 p-3 text-center">
              <div className="text-sm text-[#6b7280] font-semibold">{L.capacityLabel}</div>
              <div className="text-lg font-extrabold text-[#5B3FD6] mt-0.5 flex items-center justify-center gap-1.5">
                <Users size={16} className="text-cyan-600" /> {L.capacityValue}
              </div>
              <div className="text-sm text-[#6b7280] mt-0.5">{L.capacityNote}</div>
            </div>

            <div className="flex-1" />
            <button className="mt-5 w-full rounded-2xl py-3.5 text-base font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/30 transition inline-flex items-center justify-center gap-2">
              <Zap size={16} /> {L.cta}
            </button>
          </div>

          {/* قائمة المميزات + شارات الثقة */}
          <div className="flex flex-col gap-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {L.features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-start gap-2.5 shadow-sm">
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: GOLD }} />
                  <span className="text-base text-[#5B3FD6] leading-relaxed">{f}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              <TrustChip icon={MapPin} label={isAr ? "موقع سعودي" : "Saudi location"} />
              <TrustChip icon={ShieldCheck} label={isAr ? "التزام سدايا" : "SDAIA compliant"} />
              <TrustChip icon={Lock} label={isAr ? "تشفير كامل" : "Full encryption"} />
              <TrustChip icon={Zap} label={isAr ? "NVMe فائق السرعة" : "Ultra-fast NVMe"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustChip({ icon: I, label }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 flex items-center gap-2 shadow-sm">
      <I size={16} className="text-cyan-600 shrink-0" />
      <span className="text-sm font-semibold text-[#5B3FD6]">{label}</span>
    </div>
  );
}