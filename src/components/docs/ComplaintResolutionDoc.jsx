import React from "react";
import BrandHeader from "@/components/docs/BrandHeader";

const TYPE_AR = {
  ethical: "شكوى أخلاقية",
  pressure: "ضغط من موظف/مسؤول",
  sexual_harassment: "شكوى تحرّش",
  discrimination: "شكوى تمييز",
  safety: "شكوى سلامة مهنية",
  work_environment: "بيئة عمل",
  other: "أخرى",
};

export default function ComplaintResolutionDoc({ complaint, org, employee, isAr = true }) {
  if (!complaint) return null;
  const typeLabel = complaint.complaint_type === "other"
    ? (complaint.custom_type || (isAr ? "أخرى" : "Other"))
    : (TYPE_AR[complaint.complaint_type] || complaint.complaint_type);
  return (
    <div className="print-complaint bg-white text-slate-800" dir={isAr ? "rtl" : "ltr"}>
      <BrandHeader org={org} />
      <h2 className="text-lg font-bold text-slate-800 mb-4">{isAr ? "محضر شكوى وحلّها" : "Complaint & resolution record"}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
        <Field label={isAr ? "مُقدّم الشكوى" : "Complainant"} value={employee?.full_name || complaint.employee_name} />
        <Field label={isAr ? "الهوية / الإقامة" : "National / Iqama ID"} value={employee?.national_id} />
        <Field label={isAr ? "الرقم الوظيفي" : "Employee no."} value={employee?.employee_number} />
        <Field label={isAr ? "المسمى الوظيفي" : "Position"} value={employee?.position} />
        <Field label={isAr ? "الإدارة / القسم" : "Department"} value={employee?.department || complaint.department} />
        <Field label={isAr ? "تاريخ التقديم" : "Submitted"} value={complaint.submitted_date} />
        <Field label={isAr ? "نوع الشكوى" : "Type"} value={typeLabel} />
        <Field label={isAr ? "سرية" : "Confidential"} value={complaint.is_confidential ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")} />
      </div>
      <Section title={isAr ? "تفاصيل الشكوى" : "Complaint details"}>
        <p className="whitespace-pre-wrap">{complaint.description || "—"}</p>
      </Section>
      {complaint.manager_note && (
        <Section title={isAr ? "ملاحظة المدير المباشر" : "Manager note"}>
          <p className="whitespace-pre-wrap">{complaint.manager_note}</p>
        </Section>
      )}
      <Section title={isAr ? "الحل المُقدّم من الموارد البشرية" : "HR resolution"}>
        <p className="whitespace-pre-wrap">{complaint.hr_resolution || (isAr ? "—" : "—")}</p>
        <div className="text-xs text-slate-500 mt-2">
          {isAr ? "المعتمد" : "Resolved by"}: {complaint.hr_name || "—"} {complaint.hr_date ? ` · ${complaint.hr_date}` : ""}
        </div>
      </Section>
      <div className="grid grid-cols-3 gap-4 text-sm mt-12">
        <Sign label={isAr ? "توقيع الموظف" : "Employee"} />
        <Sign label={isAr ? "المدير المباشر" : "Manager"} />
        <Sign label={isAr ? "الموارد البشرية" : "HR"} />
      </div>
      {complaint.prepared_by_name && (
        <div className="text-[11px] text-slate-500 mt-6">
          {isAr ? "أُعدّ بواسطة" : "Prepared by"}: {complaint.prepared_by_name}{complaint.prepared_by_id ? ` — ${complaint.prepared_by_id}` : ""}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value || "—"}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold text-slate-500 mb-1">{title}</div>
      <div className="text-sm leading-relaxed rounded-lg bg-slate-50 border border-slate-200 p-3">{children}</div>
    </div>
  );
}
function Sign({ label }) {
  return (
    <div>
      <div className="h-12 border-b border-slate-300" />
      <div className="text-xs text-slate-500 mt-1 text-center">{label}</div>
    </div>
  );
}