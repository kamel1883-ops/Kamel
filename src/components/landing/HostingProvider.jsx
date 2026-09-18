import React from "react";
import { Server, FileLock2, ShieldCheck, MessageCircle, Mail } from "lucide-react";

// مزوّد الاستضافة والخادم لمنصة جداره — شركة إكساهوست السعودية.
// الشعار معاد تكوينه بلون العلامة الرسمي (Havelock Blue #5EA4DE) لأن ملف الشعار الأصلي
// غير متاح للربط المباشر؛ يمكن استبداله لاحقاً بملف الشعار الرسمي إن توفّر.
export const HOSTING_PROVIDER = {
  brandColor: "#5EA4DE",
  nameAr: "إكساهوست",
  nameEn: "ExaHost",
  url: "https://exahost.com",
};

// شعار هيئة الأمن السيبراني (NCA) — للمركز السيبراني السعودي
export const NCA_LOGO = "https://images.seeklogo.com/logo-png/38/1/national-cybersecurity-authority-logo-png_seeklogo-380019.png";
// شعار هيئة الذكاء الاصطناعي (SDAIA)
export const SDAIA_LOGO = "https://images.seeklogo.com/logo-png/39/1/saudi-data-ai-authority-logo-png_seeklogo-398412.png";

export const SALES_WHATSAPP = "966594700782";
export const SALES_EMAIL = "info@jadara-hr.com";
export const SALES_WA_LINK = "https://wa.me/966594700782";

// شعار إكساهوست معاد التكوين — variant "light" على الخلفيات البيضاء، "dark" على الكحلي
export function ExaHostLockup({ dark = false, isAr = true, compact = false }) {
  const blue = HOSTING_PROVIDER.brandColor;
  const name = isAr ? HOSTING_PROVIDER.nameAr : HOSTING_PROVIDER.nameEn;
  const sub = isAr ? "شركة سعودية لاستضافة وإدارة الخوادم" : "Saudi hosting & server management";
  const textColor = dark ? "#ffffff" : "#1f2d3a";
  const subColor = dark ? "rgba(255,255,255,.6)" : "#64748b";
  return (
    <a
      href={HOSTING_PROVIDER.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2.5 no-underline"
      style={{ textDecoration: "none" }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: compact ? 38 : 46,
          height: compact ? 38 : 46,
          background: dark ? "rgba(94,164,222,.16)" : blue,
          border: `1px solid ${dark ? "rgba(94,164,222,.45)" : blue}`,
        }}
      >
        <Server size={compact ? 19 : 23} style={{ color: dark ? blue : "#ffffff" }} strokeWidth={2} />
      </div>
      <div className="leading-tight">
        <div
          className="font-extrabold flex items-baseline gap-1.5"
          style={{ fontFamily: "var(--font-display)", fontSize: compact ? 16 : 19, color: textColor, letterSpacing: "-0.01em" }}
        >
          <span>{name}</span>
          <span style={{ color: dark ? "#9fd0f0" : blue, fontSize: compact ? 12 : 13, fontWeight: 700 }}>ExaHost</span>
        </div>
        <div className="text-[11px]" style={{ color: subColor }}>{sub}</div>
      </div>
    </a>
  );
}

// نص الامتثال: NCA + SDAIA + إقامة البيانات داخل السعودية
export function ComplianceNote({ dark = false, isAr = true }) {
  const text = isAr
    ? "مزوّد الخدمة ومركز البيانات حاصلان على التراخيص والاعتمادات الرسمية اللازمة، وهما متوافقان مع الأطر والمعايير ذات العلاقة بهيئة الأمن السيبراني (NCA) وسدايا (SDAIA). والبيانات مستضافة بالكامل داخل المملكة العربية السعودية (Data Residency)."
    : "The service provider and data center hold the required official licenses and accreditations, and comply with the relevant frameworks and standards of the National Cybersecurity Authority (NCA) and SDAIA. All data is hosted entirely within the Kingdom of Saudi Arabia (Data Residency).";
  const color = dark ? "rgba(255,255,255,.78)" : "#475569";
  return (
    <p className="text-[13px] leading-relaxed m-0" style={{ color }}>
      {text}
    </p>
  );
}

// شعارات الجهات الحكومية (NCA + SDAIA) — تُعرض داخل رقائق بيضاء (للبروشورات فقط)
export function GovLogos({ isAr = true }) {
  const items = [
    { src: NCA_LOGO, label: isAr ? "هيئة الأمن السيبراني (NCA)" : "National Cybersecurity Authority (NCA)" },
    { src: SDAIA_LOGO, label: isAr ? "هيئة الذكاء الاصطناعي (SDAIA)" : "Saudi Data & AI Authority (SDAIA)" },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((g) => (
        <div key={g.label} className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3 py-2">
          <img src={g.src} alt={g.label} style={{ height: 32, width: "auto", objectFit: "contain" }} />
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">{g.label}</span>
        </div>
      ))}
    </div>
  );
}

// شارة نظام حماية البيانات الشخصية (PDPL) — لصفحة الهبوط
export function PdplBadge({ isAr = true }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-50 border border-emerald-200">
      <FileLock2 size={16} className="text-emerald-600 shrink-0" />
      <span className="text-xs font-semibold text-emerald-700 leading-snug">
        {isAr
          ? "نظام حماية البيانات الشخصية (PDPL) — جداره تحمي بياناتك الشخصية وفق النظام السعودي"
          : "Personal Data Protection Law (PDPL) — Jadara protects your personal data under Saudi law"}
      </span>
    </div>
  );
}

// بطاقة «تواصل مع المبيعات» — لشريحة أكثر من 1,000 موظف
export function ContactSalesCard({ isAr = true, dark = false }) {
  const bg = dark ? "rgba(255,255,255,.05)" : "#ffffff";
  const border = dark ? "rgba(255,255,255,.12)" : "#e2e8f0";
  const title = isAr ? "أكثر من 1,000 موظف؟" : "More than 1,000 employees?";
  const desc = isAr
    ? "تواصل مع قسم المبيعات لعرض سعر مخصّص يتناسب مع حجم منشأتك."
    : "Contact our sales team for a custom quote tailored to your organization.";
  const labelColor = dark ? "#ffffff" : "#1f2d3a";
  const subColor = dark ? "rgba(255,255,255,.65)" : "#64748b";
  return (
    <div className="flex flex-col gap-2 rounded-xl px-3 py-2.5" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="text-sm font-extrabold" style={{ color: labelColor }}>{title}</div>
      <div className="text-[11px] leading-relaxed" style={{ color: subColor }}>{desc}</div>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <a
          href={SALES_WA_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
          style={{ background: "#16a34a" }}
        >
          <MessageCircle size={13} /> {isAr ? "واتساب المبيعات" : "Sales WhatsApp"}
        </a>
        <a
          href={`mailto:${SALES_EMAIL}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: subColor }}
        >
          <Mail size={13} /> {SALES_EMAIL}
        </a>
      </div>
    </div>
  );
}