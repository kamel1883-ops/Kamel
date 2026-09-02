import React from "react";

// مستند الوصف الوظيفي — يُستخدم للمشاهدة والطباعة PDF في ملف الموظف ونموذج الموظف
export default function JobDescriptionDoc({ employee, text, isAr = true }) {
  const body = text ?? employee?.job_description;
  return (
    <div style={{ fontFamily: "'Tajawal','IBM Plex Sans Arabic',sans-serif", color: "#0f172a", maxWidth: 800, margin: "0 auto" }}>
      <div className="flex items-center gap-3 border-b-2 pb-3 mb-5" style={{ borderColor: "#0B2545" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl" style={{ background: "#0B2545", color: "#d4af37" }}>ج</div>
        <div>
          <div className="font-bold text-lg">جدارة</div>
          <div className="text-xs text-slate-500">{isAr ? "منصة الموارد البشرية" : "HR Platform"}</div>
        </div>
      </div>
      <h1 className="text-lg font-bold mb-2.5">{isAr ? "الوصف الوظيفي" : "Job Description"}</h1>
      <div className="flex flex-wrap gap-5 text-[13px] mb-4 px-3.5 py-3 rounded-xl border" style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#334155" }}>
        <div><b style={{ color: "#0f172a" }}>{isAr ? "الاسم:" : "Name:"}</b> {employee?.full_name || ""}</div>
        {employee?.employee_number && <div><b style={{ color: "#0f172a" }}>{isAr ? "الرقم الوظيفي:" : "Emp. No:"}</b> {employee.employee_number}</div>}
        {employee?.position && <div><b style={{ color: "#0f172a" }}>{isAr ? "المسمى:" : "Position:"}</b> {employee.position}</div>}
        {employee?.department && <div><b style={{ color: "#0f172a" }}>{isAr ? "الإدارة:" : "Department:"}</b> {employee.department}</div>}
      </div>
      <div className="text-sm whitespace-pre-line leading-relaxed">{body || "—"}</div>
    </div>
  );
}