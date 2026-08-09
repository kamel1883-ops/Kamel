import React from "react";
import BrandHeader from "@/components/docs/BrandHeader";
import { formatCurrency } from "@/lib/hr";

export default function LoanStatementDoc({ employee, loan, org }) {
  const amount = Number(loan?.amount) || 0;
  const paid = Number(loan?.paid_amount) || 0;
  const remaining = Math.max(0, amount - paid);
  const closed = amount > 0 && paid >= amount;

  const rows = [
    ["اسم الموظف", employee?.full_name],
    ["الرقم الوظيفي", employee?.employee_number],
    ["الهوية / الإقامة", employee?.national_id || "—"],
    ["الإدارة", employee?.department || "—"],
    ["سبب السلفة", loan?.reason || "—"],
    ["عدد الأقساط الشهرية", loan?.installment_count || 1],
    ["القسط الشهري", formatCurrency(loan?.monthly_installment || 0)],
  ];

  return (
    <div
      dir="rtl"
      style={{
        width: 794,
        padding: 32,
        fontFamily: "'IBM Plex Sans Arabic','Tajawal',sans-serif",
        color: "#0b1120",
        background: "#fff",
      }}
    >
      <BrandHeader org={org} />
      <h2 style={{ textAlign: "center", fontSize: 22, margin: "4px 0 10px" }}>كشف سلفة</h2>

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 26,
            fontWeight: 800,
            color: closed ? "#dc2626" : "#0b1120",
            border: closed ? "3px solid #dc2626" : "2px solid #0b1120",
            borderRadius: 12,
            padding: "8px 26px",
            letterSpacing: "0.03em",
          }}
        >
          {closed ? "مغلقة" : "نشطة"}
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} style={{ borderBottom: "1px solid #eceef2" }}>
              <td style={{ padding: "9px 6px", width: "42%", color: "#667085", fontWeight: 600 }}>{k}</td>
              <td style={{ padding: "9px 6px", fontWeight: 600 }}>{v || "—"}</td>
            </tr>
          ))}
          <tr style={{ background: "#f8f9fb" }}>
            <td style={{ padding: "10px 6px", color: "#667085", fontWeight: 700 }}>إجمالي السلفة</td>
            <td style={{ padding: "10px 6px", fontWeight: 800, fontSize: 15 }}>{formatCurrency(amount)}</td>
          </tr>
          <tr>
            <td style={{ padding: "10px 6px", color: "#15803d", fontWeight: 700 }}>تم سداد</td>
            <td style={{ padding: "10px 6px", fontWeight: 700, color: "#15803d" }}>{formatCurrency(paid)}</td>
          </tr>
          <tr style={{ borderBottom: "2px solid #0b1120" }}>
            <td style={{ padding: "10px 6px", color: "#b45309", fontWeight: 700 }}>المتبقي</td>
            <td style={{ padding: "10px 6px", fontWeight: 800, fontSize: 15, color: "#b45309" }}>{formatCurrency(remaining)}</td>
          </tr>
        </tbody>
      </table>

      {closed ? (
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#dc2626",
            border: "2px dashed #dc2626",
            borderRadius: 10,
            padding: "10px",
          }}
        >
          هذه السلفة مغلقة — تم سداد كامل المبلغ
        </div>
      ) : null}

      <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <div>تاريخ الكشف: {new Date().toISOString().slice(0, 10)}</div>
        <div>توقيع الموارد البشرية: .................................</div>
      </div>
      <div style={{ marginTop: 24, fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
        تم إنشاء هذا المستند آلياً بواسطة نظام جدارة لإدارة الموارد البشرية
      </div>
    </div>
  );
}