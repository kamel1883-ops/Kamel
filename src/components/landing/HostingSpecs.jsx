import React from "react";
import { Server, Cpu, HardDrive, MemoryStick, Users, ShieldCheck, Zap, Globe, Lock } from "lucide-react";

// قسم الاستضافة: يُبرز أن المنصة تعمل على سيرفر خاص (VPS) بأعلى المواصفات،
// ويثبت سعة السيرفر لعدد كبير من الموظفين دون أي تأثير على الأداء.
// يُدرج قبل قسم الباقات في صفحة الهبوط.
export default function HostingSpecs({ isAr = true }) {
  const L = isAr
    ? {
        tag: "بنية تحتية خاصة",
        title: "سيرفر خاص بأعلى المواصفات — لأداء لا يتأثر بحجم منشأتك",
        desc: "تعمل منصة «جدارة» على خادم VPS ألماني خاص (غير مشترك) بمعمارية NVMe فائقة السرعة، وتقنيات عزل وتشفير كاملة. سعة هذا السيرفر تكفي لتشغيل النظام بسلاسة تامة حتى مع نمو عدد الموظفين — دون بطء أو توقف.",
        badge: "أعلى المواصفات",
        heading: "سيرفر VPS سحابي خاص",
        savingTag: "بدونLimits",
        strikethrough: "مشترك",
        price: "100%",
        priceUnit: "أداء مخصّص",
        subtext: "سيرفر خاص لمؤسستك بالكامل — ليس استضافة مشتركة",
        specs: [
          { icon: Cpu, big: "12 vCores", small: "معالج افتراضي كامل" },
          { icon: MemoryStick, big: "24 GB", small: "ذاكرة عشوائية فائقة" },
          { icon: HardDrive, big: "720 GB", small: "تخزين NVMe فائق السرعة" },
        ],
        features: [
          "سيرفر ألماني خاص (VPS) غير مشترك مع أي عميل آخر",
          "تخزين NVMe سريع — فتح الصفحات والتقارير في أجزاء من الثانية",
          "نسخ احتياطي يومي تلقائي وحماية كاملة من فقدان البيانات",
          "تشفير كامل للبيانات أثناء التخزين والنقل (TLS / Isolation)",
          "أداء ثابت مهما كبر عدد المستخدمين أو عدد الموظفين",
          "موقع سحابي متعدّد — استمرارية 99.9% وفقاً للاتفاقية SLA",
        ],
        capacityLabel: "سعة السيرفر",
        capacityValue: "حتى 25,000 موظف",
        capacityNote: "في منشأة واحدة دون أي تأثير على السرعة",
        cta: "ابدأ تجربتك المجانية",
      }
    : {
        tag: "Private Infrastructure",
        title: "A dedicated high-spec server — performance that grows with your headcount",
        desc: "Jadara runs on a dedicated German VPS (not shared) with blazing-fast NVMe architecture and full isolation and encryption. This server is sized to keep the platform perfectly smooth even as your headcount grows — no slowdowns, no downtime.",
        badge: "Top specs",
        heading: "Dedicated cloud VPS",
        savingTag: "No Limits",
        strikethrough: "Shared",
        price: "100%",
        priceUnit: "Dedicated power",
        subtext: "A private server for your organization — not shared hosting",
        specs: [
          { icon: Cpu, big: "12 vCores", small: "Full virtual CPU" },
          { icon: MemoryStick, big: "24 GB", small: "High-speed memory" },
          { icon: HardDrive, big: "720 GB", small: "Ultra-fast NVMe storage" },
        ],
        features: [
          "Dedicated German VPS — not shared with any other client",
          "NVMe storage — pages and reports open in fractions of a second",
          "Automatic daily backups with full data-loss protection",
          "Full encryption at rest and in transit (TLS / isolation)",
          "Steady performance however large the user or employee count",
          "Multi-zone cloud — 99.9% uptime per the SLA",
        ],
        capacityLabel: "Server capacity",
        capacityValue: "Up to 25,000 employees",
        capacityNote: "In a single organization with no speed impact",
        cta: "Start your free trial",
      };

  return (
    <section id="hosting" className="max-w-[1600px] mx-auto px-4 lg:px-10 py-14">
      <div className="bg-[#f4f7f9] rounded-[2rem] p-6 sm:p-10 text-[#081232] shadow-xl shadow-black/20">
        {/* ترويسة */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {L.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-2 text-[#081232]" style={{ fontFamily: "var(--font-display)" }}>
            {isAr ? <>سيرفر خاص <span className="text-cyan-600">بأعلى المواصفات</span> — لأداء لا يتأثر بحجم منشأتك</> : <>A dedicated <span className="text-cyan-600">high-spec</span> server — performance that grows with you</>}
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed max-w-2xl mx-auto">{L.desc}</p>
        </div>

        {/* بطاقة السيرفر + المواصفات */}
        <div className="grid lg:grid-cols-[420px,1fr] gap-6 mt-10 items-stretch">
          {/* بطاقة السيرفر — على نمط المرجع */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col mx-auto max-w-md w-full">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg px-4 py-1.5 bg-[#7c3aed] text-white shadow-lg shadow-violet-500/30">
              <Server size={12} /> {L.badge}
            </span>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Server size={20} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-extrabold text-[#081232]" style={{ fontFamily: "var(--font-display)" }}>{L.heading}</h3>
            </div>

            {/* السعر */}
            <div className="mt-5">
              <span className="inline-flex items-center text-[11px] font-bold rounded-md px-2.5 py-1 bg-[#f5a623] text-[#081232]">{L.savingTag}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[#cbd5e1] line-through text-sm font-semibold">{L.strikethrough}</span>
                <span className="text-4xl font-extrabold text-[#081232]">{L.price}</span>
                <span className="text-sm font-medium text-[#4b5563]">{L.priceUnit}</span>
              </div>
              <div className="text-xs text-[#4b5563] mt-1">{L.subtext}</div>
            </div>

            {/* المواصفات */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {L.specs.map((s) => {
                const I = s.icon;
                return (
                  <div key={s.big} className="bg-[#f4f7f9] rounded-xl p-3 text-center border border-slate-100">
                    <I size={18} className="text-cyan-600 mx-auto mb-1.5" />
                    <div className="text-sm font-extrabold text-[#081232]">{s.big}</div>
                    <div className="text-[10px] text-[#6b7280] leading-tight mt-0.5">{s.small}</div>
                  </div>
                );
              })}
            </div>

            {/* سعة الموظفين */}
            <div className="mt-5 rounded-xl bg-gradient-to-r from-cyan-50 to-violet-50 border border-cyan-100 p-3 text-center">
              <div className="text-[11px] text-[#6b7280] font-semibold">{L.capacityLabel}</div>
              <div className="text-lg font-extrabold text-[#081232] mt-0.5 flex items-center justify-center gap-1.5">
                <Users size={16} className="text-cyan-600" /> {L.capacityValue}
              </div>
              <div className="text-[10.5px] text-[#6b7280] mt-0.5">{L.capacityNote}</div>
            </div>

            <div className="flex-1" />
            <button className="mt-5 w-full rounded-2xl py-3.5 text-sm font-bold text-[#081232] bg-[#00c9e5] hover:bg-[#00b6d4] shadow-lg shadow-cyan-500/30 transition inline-flex items-center justify-center gap-2">
              <Zap size={16} /> {L.cta}
            </button>
          </div>

          {/* قائمة المميزات + شارات الثقة */}
          <div className="flex flex-col gap-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {L.features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-start gap-2.5 shadow-sm">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-[#00d1e0] shrink-0" />
                  <span className="text-sm text-[#081232] leading-relaxed">{f}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              <TrustChip icon={Globe} label={isAr ? "سحابة ألمانية" : "German cloud"} />
              <TrustChip icon={Lock} label={isAr ? "تشفير كامل" : "Full encryption"} />
              <TrustChip icon={ShieldCheck} label={isAr ? "نسخ احتياطي يومي" : "Daily backup"} />
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
      <span className="text-xs font-semibold text-[#081232]">{label}</span>
    </div>
  );
}