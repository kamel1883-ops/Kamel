import React from "react";
import { Crown } from "lucide-react";
import { FULL_FEATURES_AR, FULL_FEATURES_EN } from "@/lib/pricing";

const SIGNATURE_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/b430cd7cf_image.png";

// فاتورة غير ضريبية (Simplified / non-tax invoice) تُولَّد تلقائياً بعد إتمام الدفع.
// تشمل بيانات العميل، نوع الباقة (الشريحة)، السعر، وقائمة المميزات الكاملة.
export default function SubscriptionInvoiceDoc({
  company = {},
  tier = null,
  invNo = "",
  date = "",
  amount = 0,
  employeeCount = 0,
  isAr = true,
}) {
  const cDate = date || new Date().toISOString().slice(0, 10);
  const fmt = (d) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d || "—";
      return dt.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return d || "—";
    }
  };
  const feats = isAr ? FULL_FEATURES_AR : FULL_FEATURES_EN;
  const L = isAr
    ? {
        docTitle: "فاتورة غير ضريبية",
        subtitle: "Simplified Invoice — غير خاضعة لضريبة القيمة المضافة",
        invNo: "رقم الفاتورة",
        date: "التاريخ",
        billedTo: "فاتورة إلى",
        name: "اسم المنشأة",
        unified: "الرقم الوطني الموحد للمنشآت",
        contact: "جهة الاتصال",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        city: "المدينة",
        empCount: "عدد الموظفين",
        pkg: "الباقة / الشريحة",
        range: "نطاق الموظفين",
        desc: "الوصف",
        amt: "المبلغ",
        total: "الإجمالي المستحق",
        features: "تشمل الباقة جميع المميزات التالية",
        notTax: "هذه فاتورة غير ضريبية ولا تخضع لضريبة القيمة المضافة.",
        subLine: "اشتراك سنوي — منصة جدارة لإدارة الموارد البشرية",
        perYear: "/ سنوياً",
        currency: "ر.س",
        sigName: "المدير العام — كامل إسماعيل",
        contactFoot: "للاستفسار",
      }
    : {
        docTitle: "Non-Tax Invoice",
        subtitle: "Simplified Invoice — VAT exempt",
        invNo: "Invoice No.",
        date: "Date",
        billedTo: "Billed to",
        name: "Company name",
        unified: "National Unified Number",
        contact: "Contact",
        phone: "Phone",
        email: "Email",
        city: "City",
        empCount: "Employees",
        pkg: "Plan / Tier",
        range: "Headcount range",
        desc: "Description",
        amt: "Amount",
        total: "Total due",
        features: "The plan includes every feature below",
        notTax: "This is a non-tax invoice and is not subject to VAT.",
        subLine: "Annual subscription — Jadara HR platform",
        perYear: "/ year",
        currency: "SAR",
        sigName: "General Manager — Kamel Ismail",
        contactFoot: "Inquiries",
      };

  const sar = L.currency;
  const num = (n) => Number(n || 0).toLocaleString();
  const v = (x) => (x && String(x).trim() !== "" ? x : "—");

  return (
    <div dir="rtl" style={{ width: 794, minHeight: 1123, background: "#fff", color: "#0b1120", fontFamily: "var(--font-display), Tajawal, IBM Plex Sans Arabic, sans-serif", padding: "40px 44px", boxSizing: "border-box", fontSize: 13, lineHeight: 1.85 }}>
      {/* رأس الفاتورة */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #0b1120", paddingBottom: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#0b0f19,#2e2448)", boxShadow: "0 0 0 1px rgba(252,211,77,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Crown size={26} strokeWidth={1.8} style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>جدارة</div>
            <div style={{ fontSize: 11, color: "#666" }}>لإدارة الموارد البشرية · jadara-hr.com</div>
          </div>
        </div>
        <div style={{ textAlign: "left", fontSize: 12, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0b1120" }}>{L.docTitle}</div>
          <div style={{ fontSize: 10.5, color: "#666" }}>{L.subtitle}</div>
          <div style={{ marginTop: 6 }}>{L.invNo}: <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{invNo || "—"}</span></div>
          <div>{L.date}: {fmt(cDate)}</div>
        </div>
      </div>

      {/* بيانات العميل */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 8 }}>{L.billedTo}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 12.5, lineHeight: 1.8 }}>
          <KV k={L.name} vv={v(company?.name)} bold />
          <KV k={L.unified} vv={v(company?.unified_number)} mono />
          <KV k={L.contact} vv={v(company?.contact_name)} />
          <KV k={L.city} vv={v(company?.city)} />
          <KV k={L.phone} vv={v(company?.contact_phone)} ltr />
          <KV k={L.email} vv={v(company?.contact_email)} ltr />
          <KV k={L.empCount} vv={employeeCount ? String(employeeCount) : v(company?.employee_count)} bold />
          <KV k={L.pkg} vv={v(tier?.tier)} bold />
        </div>
      </div>

      {/* ملخص الباقة */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 12.5 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 20px", lineHeight: 1.8 }}>
          <KV k={L.pkg} vv={v(tier?.tier)} bold />
          <KV k={L.range} vv={v(tier?.range)} />
          <KV k={L.amt} vv={`${num(amount)} ${sar}`} bold accent />
        </div>
      </div>

      {/* جدول البنود */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 14, border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#334155" }}>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1" }}>{L.desc}</th>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>{L.range}</th>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>{L.amt}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", lineHeight: 1.7 }}>{L.subLine} — {v(tier?.tier)}</td>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{v(tier?.range)}</td>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, whiteSpace: "nowrap" }}>{num(amount)} {sar}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 800, color: "#0f172a" }}>{L.total}</td>
            <td style={{ padding: "8px 10px", fontWeight: 800, fontSize: 15, color: "#1A237E", whiteSpace: "nowrap" }}>{num(amount)} {sar}</td>
          </tr>
        </tbody>
      </table>

      {/* المميزات */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0b1120", marginBottom: 8 }}>{L.features}:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 22px", fontSize: 12, lineHeight: 1.7 }}>
          {feats.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ede9fe", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c3aed" }} />
              </span>
              <span style={{ color: "#1e293b" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* تنويه عدم الخضوع للضريبة */}
      <div style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 12px", marginBottom: 18 }}>
        {L.notTax}
      </div>

      {/* التوقيع والتذييل */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.9 }}>
          <div style={{ fontWeight: 700, color: "#334155" }}>{L.contactFoot}</div>
          <div dir="ltr">WhatsApp: +966 594700782</div>
          <div dir="ltr">info@jadara-hr.com</div>
          <div>jadara-hr.com</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <img src={SIGNATURE_URL} crossOrigin="anonymous" alt="توقيع" style={{ height: 64, objectFit: "contain", display: "block", margin: "0 auto" }} />
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, lineHeight: 1.9, minWidth: 220 }}>
            <div><b>{L.sigName}</b></div>
          </div>
          <div style={{ marginTop: -8 }}>
            <Stamp label={isAr ? "جدارة لإدارة الموارد البشرية" : "Jadara HR"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ k, vv, bold, mono, ltr, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
      <span style={{ color: "#64748b", flexShrink: 0 }}>{k}:</span>
      <span
        style={{
          fontWeight: bold ? 800 : 600,
          color: accent ? "#1A237E" : "#0f172a",
          fontFamily: mono ? "ui-monospace, monospace" : undefined,
          direction: ltr ? "ltr" : undefined,
          unicodeBidi: ltr ? "embed" : undefined,
          wordBreak: "break-word",
        }}
      >
        {vv}
      </span>
    </div>
  );
}

function Stamp({ label }) {
  return (
    <svg viewBox="0 0 200 200" width={104} height={104} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="invTop" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="#1A237E" strokeWidth="3" />
      <circle cx="100" cy="100" r="84" fill="none" stroke="#1A237E" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="46" fill="none" stroke="#1A237E" strokeWidth="1.6" />
      <text fill="#1A237E" fontSize="15" fontWeight="700" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">
        <textPath href="#invTop" startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
      <text x="100" y="98" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">جدارة</text>
      <text x="100" y="118" textAnchor="middle" fill="#1A237E" fontSize="9" fontWeight="600" fontFamily="sans-serif">JADARA HR</text>
      <text x="100" y="132" textAnchor="middle" fill="#1A237E" fontSize="14">✦</text>
    </svg>
  );
}