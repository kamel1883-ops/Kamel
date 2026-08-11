import React from "react";
import BrandHeader from "@/components/docs/BrandHeader";
import { leaveTypeLabel, formatCurrency } from "@/lib/hr";

export default function LeaveClearanceDoc({ employee, leave, org, balanceBefore, balanceAfter }) {
  const rows = [
    ["اسم الموظف", employee?.full_name],
    ["الرقم الوظيفي", employee?.employee_number],
    ["الهوية / الإقامة", employee?.national_id || "—"],
    ["الإدارة", employee?.department || "—"],
    ["المسمى الوظيفي", employee?.position || "—"],
    ["تاريخ المباشرة", employee?.hire_date || "—"],
    ["نوع الإجازة", leaveTypeLabel(leave?.leave_type)],
    ["من تاريخ", leave?.start_date || "—"],
    ["إلى تاريخ", leave?.end_date || "—"],
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
      <h2 style={{ textAlign: "center", fontSize: 22, margin: "4px 0 18px" }}>مخالصة تصفية إجازة</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} style={{ borderBottom: "1px solid #eceef2" }}>
              <td style={{ padding: "9px 6px", width: "42%", color: "#667085", fontWeight: 600 }}>{k}</td>
              <td style={{ padding: "9px 6px", fontWeight: 600 }}>{v || "—"}</td>
            </tr>
          ))}
          <tr style={{ background: "#f8f9fb" }}>
            <td style={{ padding: "10px 6px", color: "#667085", fontWeight: 700 }}>عدد الأيام المصفّاة</td>
            <td style={{ padding: "10px 6px", fontWeight: 800, fontSize: 15 }}>{leave?.days_count || 0} يوم</td>
          </tr>
          <tr>
            <td style={{ padding: "9px 6px", color: "#667085", fontWeight: 600 }}>رصيد الإجازات قبل التصفية</td>
            <td style={{ padding: "9px 6px", fontWeight: 700 }}>{balanceBefore ?? 0} يوم</td>
          </tr>
          <tr style={{ borderBottom: "2px solid #0b1120" }}>
            <td style={{ padding: "9px 6px", color: "#667085", fontWeight: 700 }}>رصيد الإجازات المتبقي بعد التصفية</td>
            <td style={{ padding: "9px 6px", fontWeight: 800, fontSize: 15, color: "#0b1120" }}>{balanceAfter ?? 0} يوم</td>
          </tr>
        </tbody>
      </table>

      {(() => {
        const ticket = Number(leave?.ticket_amount) || 0;
        const ded = Number(leave?.deduction_amount) || 0;
        const add = Number(leave?.addition_amount) || 0;
        const total = Number(leave?.settlement_amount) || Math.max(0, ticket + add - ded);
        if (!(ticket > 0 || ded > 0 || add > 0)) return null;
        const FinRow = ({ label, value, strong }) => (
          <tr style={{ borderBottom: "1px solid #eceef2", fontWeight: strong ? 800 : 600 }}>
            <td style={{ padding: "9px 6px", width: "62%", color: strong ? "#0b1120" : "#667085" }}>{label}</td>
            <td style={{ padding: "9px 6px", textAlign: "left", color: value < 0 ? "#b42318" : "#0b1120" }}>{formatCurrency(value)}</td>
          </tr>
        );
        return (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 18 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ textAlign: "right", padding: "9px 6px", width: "62%" }}>الملخص المالي للتصفية</th>
                <th style={{ textAlign: "left", padding: "9px 6px" }}>المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              {ticket > 0 && <FinRow label="تعويض التذكرة" value={ticket} />}
              {add > 0 && <FinRow label={`مستحقات إضافية (تُضاف للموظف)${leave?.addition_note ? " — " + leave.addition_note : ""}`} value={add} />}
              {ded > 0 && <FinRow label={`مستحقات دائنة (تُخصم)${leave?.deduction_note ? " — " + leave.deduction_note : ""}`} value={-ded} />}
              <tr style={{ borderTop: "2px solid #0b1120" }}>
                <td style={{ padding: "10px 6px", fontWeight: 800, fontSize: 15 }}>إجمالي التصفية</td>
                <td style={{ padding: "10px 6px", textAlign: "left", fontWeight: 800, fontSize: 15, color: "#0b1120" }}>{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        );
      })()}

      <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <div>تاريخ المخالصة: {new Date().toISOString().slice(0, 10)}</div>
        <div>توقيع الموارد البشرية: .................................</div>
      </div>
      <div style={{ marginTop: 28, fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
        تم إنشاء هذا المستند آلياً بواسطة نظام جدارة لإدارة الموارد البشرية
      </div>
    </div>
  );
}