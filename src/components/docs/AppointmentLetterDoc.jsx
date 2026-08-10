import React from "react";

const fmt = (d) => {
  try { return new Date(d).toLocaleDateString("ar-SA-u-ca-gregory", { year: "numeric", month: "long", day: "numeric" }); } catch { return String(d || ""); }
};

export default function AppointmentLetterDoc({ applicant, job, org }) {
  const today = fmt(new Date());
  const hireDate = applicant?.hired_date || today;
  const probEnd = new Date(new Date(hireDate).getTime() + 90 * 24 * 3600 * 1000);
  return (
    <div dir="rtl" style={{ fontFamily: "Tajawal, IBM Plex Sans Arabic, sans-serif", padding: "44px", color: "#0f172a", width: "794px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #6d28d9", paddingBottom: "18px", marginBottom: "26px" }}>
        <div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#4c1d95" }}>جدارة</div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>منصة الموارد البشرية — Jadara HR</div>
        </div>
        {org?.logo_url
          ? <img src={org.logo_url} alt="logo" style={{ height: "60px", objectFit: "contain" }} />
          : <div style={{ fontSize: "13px", color: "#64748b" }}>{org?.name || ""}</div>}
      </div>

      <h1 style={{ fontSize: "21px", fontWeight: 800, textAlign: "center", marginBottom: "22px", color: "#0f172a" }}>قرار تعيين وتكليف (فترة تجربة)</h1>

      <div style={{ fontSize: "14px", color: "#334155", marginBottom: "14px" }}>تاريخ القرار: {today}</div>

      <p style={{ fontSize: "14px", lineHeight: 2, marginBottom: "14px" }}>بالإشارة إلى التقديم على الوظيفة المعلنة، تم اعتماد تعيين السيد/ة الآتي بياناته:</p>

      <table style={{ width: "100%", fontSize: "14px", marginBottom: "22px", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700, width: "30%" }}>الاسم الكامل</td><td style={{ padding: "9px 12px" }}>{applicant?.full_name}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>المسمى الوظيفي</td><td style={{ padding: "9px 12px" }}>{job?.title}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>الإدارة</td><td style={{ padding: "9px 12px" }}>{job?.department || org?.name || "—"}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>نوع العقد</td><td style={{ padding: "9px 12px" }}>{job?.job_type === "full_time" ? "دوام كامل" : job?.job_type === "part_time" ? "دوام جزئي" : "عقد محدد المدة"}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>الراتب الشهري</td><td style={{ padding: "9px 12px" }}>{job?.salary ? `${job.salary.toLocaleString()} ريال` : "حسب العقد"}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>تاريخ مباشرة العمل</td><td style={{ padding: "9px 12px" }}>{fmt(hireDate)}</td></tr>
          <tr><td style={{ padding: "9px 12px", background: "#f5f3ff", fontWeight: 700 }}>نهاية فترة التجربة (٩٠ يوماً)</td><td style={{ padding: "9px 12px" }}>{fmt(probEnd)}</td></tr>
        </tbody>
      </table>

      <p style={{ fontSize: "13px", lineHeight: 2.1, color: "#334155" }}>
        يخضع هذا التعيين لفترة تجربة مدتها تسعون (٩٠) يوماً وفق نظام العمل السعودي، يجوز خلالها إنهاء العقد من أي من الطرفين دون إخطار أو تعويض (المادة 53)، مع وجوب دفع أجور العامل عن المدة التي قضاها في العمل. يسري هذا القرار اعتباراً من تاريخ المباشرة الموضّح أعلاه، ويُستكمل تثبيت الموظف ضمن كادر المنشأة الثابت بعد اجتياز فترة التجربة واستكمال كافة بياناته.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "56px", fontSize: "13px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "8px", width: "210px", color: "#334155" }}>إعداد وتدقيق الموارد البشرية</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "8px", width: "210px", color: "#334155" }}>اعتماد صاحب العمل / المدير</div>
        </div>
      </div>

      <div style={{ marginTop: "30px", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>تم إنشاء هذا المستند آلياً عبر منصة جدارة | {today}</div>
    </div>
  );
}