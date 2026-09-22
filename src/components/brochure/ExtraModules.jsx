import React from "react";
import {
  Boxes, ShieldAlert, Car, ShieldCheck, Heart, CheckCircle2,
  Lock, FileText, UserCheck
} from "lucide-react";

/**
 * أقسام جديدة مشتركة بين البروشور العربي والإنجليزي:
 *  - EquipmentModule: العهد والأصول
 *  - ComplaintsModule: الشكاوى
 *  - InsuranceProvidersSection: مزوّدو التأمين (تأميني + بي كير)
 *
 * يستقبل المساعدات المشتركة (Section, Heading, FeatureBlock, MockFrame)
 * وقيم الألوان (CYAN, NAVY) من الصفحة المضيفة — مثل نمط ReportsAnalytics.
 */
const STR = {
  ar: {
    eq: {
      kicker: "العهد والأصول",
      title: "تسليم واستلام عهد الموظفين بكامل الأمانة",
      desc: "إدارة كاملة لعهد الموظفين — أجهزة (لابتوب، جوال، شريحة، تابلت)، ملابس عمل، كاميرا، عدّة وأدوات — من التسليم حتى الإرجاع، مع تسجيل الحالة وخصومات الإرجاع وسجل كامل لكل عهدة ومستند إلكتروني للعهدة.",
      pts: [
        "تسجيل عهدة لكل موظف: النوع، الوصف، الرقم التسلسلي، تاريخ التسليم",
        "حالة العهدة: سارية، مُعادة، مفقودة، تالفة — مع ملاحظات الإرجاع",
        "خصم قيمة العهدة عند الإرجاع تالفة أو ناقصة وتسجيله على الموظف",
        "سجل كامل لتسليم واستلام كل عهدة ومستند إلكتروني رسمي للعهدة"
      ],
      mockTitle: "العهد والأصول — سجل العهد",
      active: "سارية", returned: "مُعادة", damaged: "تالفة", lost: "مفقودة",
      serial: "الرقم التسلسلي", assignDate: "تاريخ التسليم"
    },
    comp: {
      kicker: "الشكاوى",
      title: "بوابة شكاوى سرّية وآمنة لكل موظف",
      desc: "قسم الشكاوى يتيح للموظف تقديم شكوى أخلاقية أو ضغط عمل أو تحرش أو تمييز أو سلامة أو بيئة عمل — بسرّية تامّة تُعالج بعيداً عن المدير المباشر عند الحاجة، مع مسار معالجة لدى الموارد البشرية وتوثيق الحلّ ومتابعة الحالة.",
      pts: [
        "أنواع شكاوى: أخلاقية، ضغط عمل، تحرّش، تمييز، سلامة، بيئة عمل",
        "سرّية كاملة — يمكن إخفاء الشكوى عن المدير المباشر ومعالجتها لدى الموارد البشرية",
        "مسار معالجة: مدير مباشر ثم موارد بشرية مع توثيق الحلّ المُقدّم",
        "سجل تاريخ كامل لكل شكوى وتاريخها وحالة المعالجة والحلّ النهائي"
      ],
      mockTitle: "الشكاوى — حالة المعالجة"
    },
    ins: {
      headingTitle: "مزوّدو التأمين المعتمدون",
      headingSub: "تكامل مع أكبر مزوّدي التأمين في المملكة — تأمين مركبات وتأمين صحي",
      vehicleLabel: "تأمين المركبات",
      healthLabel: "التأمين الصحي",
      deepLink: "روابط عميقة", manual: "دخول يدوي"
    }
  },
  en: {
    eq: {
      kicker: "Equipment & Assets",
      title: "Hand over and return employee equipment with full accountability",
      desc: "Complete management of employee equipment — devices (laptop, phone, SIM, tablet), workwear, cameras, and tools — from assignment to return, with condition tracking, return deductions, and a full log per item plus an official handover document.",
      pts: [
        "Log equipment per employee: type, description, serial number, assignment date",
        "Item status: active, returned, lost, damaged — with return notes",
        "Deduct item value on damaged or incomplete return, charged to the employee",
        "Full hand-over and return log per item, with an official electronic document"
      ],
      mockTitle: "Equipment & Assets — Handover log",
      active: "Active", returned: "Returned", damaged: "Damaged", lost: "Lost",
      serial: "Serial", assignDate: "Assigned"
    },
    comp: {
      kicker: "Complaints",
      title: "A confidential, secure complaint channel for every employee",
      desc: "The Complaints module lets employees raise ethical, work-pressure, harassment, discrimination, safety, or work-environment complaints — fully confidential when needed, processed away from the direct manager, with an HR resolution track, documented outcome, and full status history.",
      pts: [
        "Complaint types: ethical, work pressure, harassment, discrimination, safety, work environment",
        "Full confidentiality — a complaint can be hidden from the direct manager and handled by HR",
        "Resolution track: direct manager then HR, with the proposed solution documented",
        "Complete history per complaint with dates, status, and the final resolution"
      ],
      mockTitle: "Complaints — Resolution status"
    },
    ins: {
      headingTitle: "Trusted Insurance Providers",
      headingSub: "Integration with the Kingdom's largest insurance providers — vehicle and health",
      vehicleLabel: "Vehicle Insurance",
      healthLabel: "Health Insurance",
      deepLink: "Deep links", manual: "Manual entry"
    }
  }
};

export function EquipmentModule({ lang = "ar", FeatureBlock, MockFrame, CYAN, NAVY }) {
  const t = STR[lang].eq;
  const rows = lang === "ar"
    ? [
        { n: "لابتوب Dell Latitude", s: "DL-44821", st: "active", c: "#16a34a" },
        { n: "جوال Samsung A54", s: "SM-A54-77", st: "returned", c: "#94a3b8" },
        { n: "شريحة STC بيانات", s: "SIM-9012", st: "active", c: "#16a34a" },
        { n: "عدّة صيانة حقلية", s: "TOOL-339", st: "damaged", c: "#dc2626" }
      ]
    : [
        { n: "Dell Latitude Laptop", s: "DL-44821", st: "active", c: "#16a34a" },
        { n: "Samsung A54 Phone", s: "SM-A54-77", st: "returned", c: "#94a3b8" },
        { n: "STC Data SIM", s: "SIM-9012", st: "active", c: "#16a34a" },
        { n: "Field Maintenance Kit", s: "TOOL-339", st: "damaged", c: "#dc2626" }
      ];
  const label = (st) => (st === "active" ? t.active : st === "returned" ? t.returned : st === "damaged" ? t.damaged : t.lost);
  return (
    <FeatureBlock
      icon={Boxes} kicker={t.kicker} title={t.title} desc={t.desc} points={t.pts}
      mock={
        <MockFrame title={t.mockTitle}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[1.6fr,.9fr,.8fr,.8fr] gap-2 text-[10px] text-slate-400 bg-slate-50 p-2 font-bold border-b border-slate-100">
              <div>{lang === "ar" ? "العهدة" : "Item"}</div><div>{t.serial}</div><div>{lang === "ar" ? "الحالة" : "Status"}</div><div>{t.assignDate}</div>
            </div>
            {rows.map((r, k) => (
              <div key={k} className="grid grid-cols-[1.6fr,.9fr,.8fr,.8fr] gap-2 text-[11px] p-2 border-b border-slate-50 last:border-0 items-center">
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${CYAN}1A`, color: CYAN }}><Boxes size={12} /></div>{r.n}</div>
                <div className="text-slate-500" dir="ltr">{r.s}</div>
                <div><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${r.c}1A`, color: r.c }}>{label(r.st)}</span></div>
                <div className="text-slate-500" dir="ltr">{lang === "ar" ? "12/10" : "Oct 12"}</div>
              </div>
            ))}
          </div>
        </MockFrame>
      }
    />
  );
}

export function ComplaintsModule({ lang = "ar", FeatureBlock, MockFrame, CYAN, NAVY }) {
  const t = STR[lang].comp;
  const isAr = lang === "ar";
  const types = isAr
    ? ["أخلاقية", "ضغط عمل", "تحرّش", "تمييز", "سلامة", "بيئة عمل"]
    : ["Ethical", "Pressure", "Harassment", "Discrimination", "Safety", "Work env."];
  const stages = isAr
    ? [
        { s: "الموظف", v: "قُدّمت", c: "#16a34a", done: true },
        { s: "المدير المباشر", v: "أُحيلت", c: "#16a34a", done: true },
        { s: "الموارد البشرية", v: "قيد المعالجة", c: "#fbbf24", done: false },
        { s: "الحلّ", v: "—", c: "#94a3b8", done: false }
      ]
    : [
        { s: "Employee", v: "Submitted", c: "#16a34a", done: true },
        { s: "Direct manager", v: "Escalated", c: "#16a34a", done: true },
        { s: "HR", v: "In progress", c: "#fbbf24", done: false },
        { s: "Resolution", v: "—", c: "#94a3b8", done: false }
      ];
  return (
    <FeatureBlock
      dark
      icon={ShieldAlert} kicker={t.kicker} title={t.title} desc={t.desc} points={t.pts}
      mock={
        <MockFrame title={t.mockTitle}>
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${CYAN}1A`, color: CYAN }}><ShieldAlert size={14} /></div>
              <div className="text-[11px]">
                <b className="text-slate-700">{isAr ? "شكوى سرّية" : "Confidential complaint"}</b>
                <span className="text-slate-400"> · {isAr ? "بيئة عمل" : "Work environment"}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ms-auto" style={{ background: "#fbbf241A", color: "#b45309" }}>{isAr ? "سرّية" : "Confidential"}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {types.map((x, i) => (
                <span key={i} className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>{x}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {stages.map((x, k) => (
                <React.Fragment key={k}>
                  {k > 0 && <div className="flex-1 h-0.5" style={{ background: x.done ? "#16a34a" : "#e2e8f0" }} />}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${x.c}1A`, border: `1px solid ${x.c}`, color: x.c }}>
                      {x.done ? <CheckCircle2 size={12} /> : <Lock size={11} />}
                    </div>
                    <div className="text-[8px] text-center leading-tight">
                      <div className="font-bold text-slate-700">{x.s}</div>
                      <div className="text-slate-400">{x.v}</div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="rounded-lg p-2 bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 mb-1">{isAr ? "الحلّ المُقدّم من الموارد البشرية" : "Proposed HR resolution"}</div>
              <div className="text-[10px] text-slate-600 leading-relaxed">
                {isAr
                  ? "نقل الموظف لقسم آخر وإيقاف التعامل المباشر مع الجهة المُشتكى منها ومتابعة التقييم النفسي."
                  : "Reassign the employee to another unit, suspend direct contact with the accused party, and follow up on psychological assessment."}
              </div>
            </div>
          </div>
        </MockFrame>
      }
    />
  );
}

export function InsuranceProvidersSection({ lang = "ar", Section, Heading, CYAN, NAVY }) {
  const t = STR[lang].ins;
  const providers = [
    { n: isArT(lang, "تأميني", "Tameeni"), brand: "#0EA5E9", tag: t.vehicleLabel, icon: Car, deep: true },
    { n: isArT(lang, "بي كير", "Bcare"), brand: "#16A34A", tag: t.healthLabel, icon: Heart, deep: true }
  ];
  return (
    <Section tint="light" heading={<Heading icon={<ShieldCheck />} title={t.headingTitle} sub={t.headingSub} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {providers.map((p, k) => {
          const I = p.icon;
          return (
            <div key={k} className="rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm" style={{ background: "#fff", border: `2px solid ${p.brand}30` }}>
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: `${p.brand}12`, border: `1px solid ${p.brand}40`, color: p.brand }}>
                <I size={28} />
              </div>
              <div className="text-[18px] font-extrabold" style={{ color: p.brand, fontFamily: "var(--font-display)" }}>{p.n}</div>
              <div className="text-[12px] font-semibold text-slate-500">{p.tag}</div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#16a34a1a", color: "#16a34a", border: "1px solid #16a34a30" }}>
                {t.deepLink}
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function isArT(lang, ar, en) { return lang === "ar" ? ar : en; }