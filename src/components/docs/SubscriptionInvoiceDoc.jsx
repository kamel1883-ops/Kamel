import React from "react";
import { Crown } from "lucide-react";
import { FULL_FEATURES_AR, FULL_FEATURES_EN } from "@/lib/pricing";
import { PROVIDER } from "@/lib/providerIdentity";

const SIGNATURE_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/b430cd7cf_image.png";

// فاتورة اشتراك سنوي (Simplified / Annual Subscription Invoice). تُولَّد من بوابة المالك بعد تأكيد الاشتراك.
// تشمل بيانات العميل، نوع الخدمة (برمجيات اشتراك سنوي في منصة جدارة)، الباقة/الشريحة، فترة الاشتراك،
// الباركود الرقمي، وقيمة الضريبة (0%) مع شرح حالة الضريبة الصفرية. لا تحتوي على توقيع أو ختم — باركود فقط.
export default function SubscriptionInvoiceDoc({
  company = {},
  tier = null,
  invNo = "",
  date = "",
  startDate = "",
  endDate = "",
  amount = 0,
  employeeCount = 0,
  isAr = true,
}) {
  const cDate = date || new Date().toISOString().slice(0, 10);
  const subStart = startDate || cDate;
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
        docTitle: "فاتورة اشتراك سنوي",
        subtitle: "فاتورة اشتراك سنوي — منصة جدارة لإدارة الموارد البشرية",
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
        qty: "المدة",
        amt: "المبلغ",
        serviceType: "نوع الخدمة",
        serviceTypeValue: "برمجيات اشتراك سنوي في منصة جدارة",
        subPeriod: "فترة الاشتراك",
        subStartLabel: "بداية الاشتراك",
        subEndLabel: "نهاية الاشتراك",
        subtotal: "المبلغ الصافي",
        taxRow: "رسوم الضريبة (0%)",
        total: "الإجمالي المستحق",
        features: "تشمل الباقة جميع المميزات التالية",
        notTax: "فاتورة اشتراك سنوي — لا تخضع لضريبة القيمة المضافة. رسوم الضريبة: 0% (صفر). المبلغ الإجمالي = المبلغ الصافي.",
        subLine: "اشتراك سنوي — منصة جدارة لإدارة الموارد البشرية",
        perYear: "/ سنوياً",
        currency: "ر.س",
        sigName: "الإدارة المالية",
        contactFoot: "للاستفسار",
      }
    : {
        docTitle: "Annual Subscription Invoice",
        subtitle: "Annual Subscription Invoice — Jadara HR Platform",
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
        qty: "Term",
        amt: "Amount",
        serviceType: "Service type",
        serviceTypeValue: "Annual subscription software — Jadara platform",
        subPeriod: "Subscription period",
        subStartLabel: "Start",
        subEndLabel: "End",
        subtotal: "Net amount",
        taxRow: "Tax (0%)",
        total: "Total due",
        features: "The plan includes every feature below",
        notTax: "Annual subscription invoice — VAT exempt. Tax: 0% (zero). Total = Net amount.",
        subLine: "Annual subscription — Jadara HR platform",
        perYear: "/ year",
        currency: "SAR",
        sigName: "Finance Department",
        contactFoot: "Inquiries",
      };

  const sar = L.currency;
  const num = (n) => Number(n || 0).toLocaleString();
  const v = (x) => (x && String(x).trim() !== "" ? x : "—");
  const taxAmount = 0;

  return (
    <div dir="rtl" style={{ width: 794, minHeight: 1123, background: "#fff", color: "#0b1120", fontFamily: "var(--font-display), Tajawal, IBM Plex Sans Arabic, sans-serif", padding: "40px 44px", boxSizing: "border-box", fontSize: 13, lineHeight: 1.85, unicodeBidi: "plaintext" }}>
      {/* رأس الفاتورة */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "2px solid #0b1120", paddingBottom: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#0b0f19,#2e2448)", boxShadow: "0 0 0 1px rgba(252,211,77,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Crown size={26} strokeWidth={1.8} style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>جدارة</div>
            <div style={{ fontSize: 11, color: "#666" }}>لإدارة الموارد البشرية · jadara-hr.com</div>
            <div style={{ fontWeight: 700, fontSize: 11.5, color: "#0b1120", marginTop: 3 }}>{PROVIDER.institutionName}</div>
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

      {/* ملخص الباقة + نوع الخدمة + فترة الاشتراك */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 12.5, background: "#fbfaff" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 8 }}>{L.subPeriod}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 20px", lineHeight: 1.8, marginBottom: 10 }}>
          <KV k={L.subStartLabel} vv={fmt(subStart)} bold />
          <KV k={L.subEndLabel} vv={fmt(endDate)} bold />
          <KV k={L.range} vv={v(tier?.range)} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, borderTop: "1px dashed #cbd5e1", paddingTop: 8 }}>
          <span style={{ color: "#64748b", fontWeight: 700 }}>{L.serviceType}:</span>
          <span style={{ fontWeight: 800, color: "#1A237E", fontSize: 13.5 }}>{L.serviceTypeValue} — {v(tier?.tier)}</span>
        </div>
      </div>

      {/* جدول البنود */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 14, border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#334155" }}>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1" }}>{L.desc}</th>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>{L.qty}</th>
            <th style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap" }}>{L.amt}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", lineHeight: 1.7, unicodeBidi: "plaintext" }}>{L.serviceTypeValue} — {v(tier?.tier)} ({v(tier?.range)})</td>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{L.perYear}</td>
            <td style={{ padding: "8px 10px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, whiteSpace: "nowrap" }}>{num(amount)} {sar}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>{L.subtotal}</td>
            <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap", borderBottom: "1px solid #e2e8f0" }}>{num(amount)} {sar}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: "8px 10px", textAlign: "left", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>{L.taxRow}</td>
            <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap", color: "#16a34a", borderBottom: "1px solid #e2e8f0" }}>{num(taxAmount)} {sar}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: "10px 10px", textAlign: "left", fontWeight: 800, color: "#0b1120", background: "#f8fafc" }}>{L.total}</td>
            <td style={{ padding: "10px 10px", fontWeight: 800, fontSize: 15.5, color: "#1A237E", whiteSpace: "nowrap", background: "#eef2ff" }}>{num(amount)} {sar}</td>
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

      {/* تنويه عدم الخضوع للضريبة + الباركود */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 16 }}>
        <div style={{ flex: 1, fontSize: 11, color: "#b45309", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 12px" }}>
          {L.notTax}
        </div>
        <div style={{ textAlign: "center" }}>
          <Barcode value={invNo} />
          <div style={{ marginTop: 4, fontSize: 10.5, color: "#475569", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{invNo || "—"}</div>
        </div>
      </div>

      {/* فاتورة اشتراك سنوي — باركود فقط دون توقيع أو ختم أو اسم مُوقِّع */}
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
          color: accent ? "#1A237E" : "#0b1120",
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

// باركود مرئي مبسّط يُولّد من الأرقام في رقم الفاتورة (تبديل بسيط بأسلوب EAN-L) — مرجع بصري للرقم التسلسلي.
const EAN_L = {
  '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
  '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
  '8': '0110111', '9': '0001011',
};

function Barcode({ value, barWidth = 2, height = 46 }) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 14);
  if (!digits) return <div style={{ minHeight: height + 16 }} />;
  // 9 modules quiet zone + guard 101 + L-codes digits + guard 01010 + L-codes digits + guard 101 + 9 modules quiet
  const first = digits.slice(0, Math.ceil(digits.length / 2));
  const second = digits.slice(Math.ceil(digits.length / 2));
  let pattern = "000000000" + "101";
  for (const d of first) pattern += EAN_L[d] || "0001101";
  pattern += "01010";
  for (const d of second) pattern += EAN_L[d] || "0001101";
  pattern += "101" + "000000000";

  const bars = [];
  let x = 4;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      bars.push(<rect key={i} x={x} y={0} width={barWidth} height={height} fill="#0b1120" />);
    }
    x += barWidth;
  }
  const totalW = pattern.length * barWidth + 8;
  return (
    <svg width={totalW} height={height + 4} viewBox={`0 0 ${totalW} ${height + 4}`}>
      {bars}
    </svg>
  );
}