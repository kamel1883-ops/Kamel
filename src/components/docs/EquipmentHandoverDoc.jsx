import React from "react";
import BrandHeader from "@/components/docs/BrandHeader";

const TYPE_AR = {
  laptop: "لابتوب", phone: "جوال", work_phone: "جوال عمل", sim: "شريحة جوال", tablet: "جهاز لوحي",
  clothing: "ملابس عمل", camera: "كاميرا", tool: "أداة/عدة", other: "أخرى",
};

export default function EquipmentHandoverDoc({ equipment, org, isAr = true }) {
  if (!equipment) return null;
  const typeLabel = equipment.item_type === "other"
    ? (equipment.custom_type || (isAr ? "أخرى" : "Other"))
    : (TYPE_AR[equipment.item_type] || equipment.item_type);
  return (
    <div className="print-equipment bg-white text-slate-800" dir={isAr ? "rtl" : "ltr"}>
      <BrandHeader org={org} />
      <h2 className="text-lg font-bold text-slate-800 mb-4">{isAr ? "سند تسليم عهدة" : "Equipment handover voucher"}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <Field label={isAr ? "الموظف" : "Employee"} value={equipment.employee_name} />
        <Field label={isAr ? "تاريخ التسليم" : "Assigned date"} value={equipment.assigned_date} />
        <Field label={isAr ? "نوع العهدة" : "Item type"} value={typeLabel} />
        <Field label={isAr ? "البيان" : "Description"} value={equipment.item_label} />
        <Field label={isAr ? "الرقم التسلسلي" : "Serial number"} value={equipment.serial_number} />
        <Field label={isAr ? "تكلفة العهدة" : "Cost"} value={equipment.cost ? `${equipment.cost} ر.س` : "—"} />
        {equipment.return_date && <Field label={isAr ? "تاريخ الإرجاع" : "Return date"} value={equipment.return_date} />}
        {equipment.condition_note && <Field label={isAr ? "الحالة" : "Condition"} value={equipment.condition_note} />}
      </div>
      <div className="text-sm leading-relaxed mb-8">
        {isAr
          ? "أقرّ باستلامي العهدة المذكورة أعلاه بحالة جيدة وأتعهّد بالمحافظة عليها واستخدامها في مجال العمل وإرجاعها عند طلبه أو عند انتهاء الخدمة."
          : "I acknowledge receipt of the above equipment in good condition and commit to its safekeeping, work-related use, and return upon request or end of service."}
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm mt-12">
        <Sign label={isAr ? "توقيع الموظف" : "Employee"} />
        <Sign label={isAr ? "الموارد البشرية" : "HR"} />
        <Sign label={isAr ? "المدير المباشر" : "Manager"} />
      </div>
      {equipment.prepared_by_name && (
        <div className="text-[11px] text-slate-500 mt-6">
          {isAr ? "أُعدّ بواسطة" : "Prepared by"}: {equipment.prepared_by_name}{equipment.prepared_by_id ? ` — ${equipment.prepared_by_id}` : ""}
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
function Sign({ label }) {
  return (
    <div>
      <div className="h-12 border-b border-slate-300" />
      <div className="text-xs text-slate-500 mt-1 text-center">{label}</div>
    </div>
  );
}