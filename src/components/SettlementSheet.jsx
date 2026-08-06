import React from "react";
import { Image } from "@/components/ui/image";
import { formatCurrency } from "@/lib/hr";
import { reasonMeta } from "@/lib/eos";

export default function SettlementSheet({ record, org }) {
  const r = record || {};
  return (
    <div className="print-settlement bg-white text-slate-900 mx-auto" style={{ maxWidth: "800px" }} dir="rtl">
      {/* رأس المخالصة - شعار المنشأة */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex items-center gap-3">
          {org?.logo_url ? (
            <Image
              src={org.logo_url}
              alt={org.name}
              className="w-16 h-16 object-contain"
              fittingType="fit"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              {(org?.name || "ش").charAt(0)}
            </div>
          )}
          <div>
            <div className="font-bold text-lg">{org?.name || "اسم المنشأة"}</div>
            <div className="text-xs text-slate-500">س.ت: {org?.commercial_register || "—"}</div>
            <div className="text-xs text-slate-500">رقم ضريبي: {org?.vat_number || "—"}</div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-base font-bold">مخالصة نهاية الخدمة</div>
          <div className="text-xs text-slate-500">رقم: {r.id ? r.id.slice(-6).toUpperCase() : ""}</div>
          <div className="text-xs text-slate-500">{r.generated_date || ""}</div>
        </div>
      </div>

      {/* بيانات الموظف */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
        <Info label="اسم الموظف" value={r.employee_name} />
        <Info label="الرقم الوظيفي" value={r.employee_number} />
        <Info label="الهوية/الإقامة" value={r.national_id} />
        <Info label="الجنسية" value={r.nationality} />
        <Info label="الإدارة" value={r.department} />
        <Info label="المسمى الوظيفي" value={r.position} />
        <Info label="تاريخ التعيين" value={r.hire_date} />
        <Info label="آخر يوم عمل" value={r.last_working_date} />
        <Info label="سنوات الخدمة" value={`${r.years_of_service} سنة`} />
        <Info label="سبب الإنهاء" value={reasonMeta(r.reason).label} />
      </div>

      {/* تفاصيل الحساب */}
      <table className="w-full text-sm border border-slate-300 mb-5">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-right p-2 border-b border-slate-300 font-semibold">البند</th>
            <th className="text-right p-2 border-b border-slate-300 font-semibold">التفصيل</th>
            <th className="text-left p-2 border-b border-slate-300 font-semibold">المبلغ (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          <Row label="الأجر الشهري" detail={`أساس: ${r.basis === "gross" ? "إجمالي" : "أساسي فقط"}`} value={r.monthly_wage} />
          <Row label="الأجر اليومي" detail="الأجر الشهري ÷ 30" value={r.daily_wage} />
          <Row label="مكافأة نهاية الخدمة" detail={r.fraction_label} value={r.eos_amount} bold />
          <Row label="تصفية رصيد الإجازات" detail={`${r.leave_balance_days} يوم × الأجر اليومي`} value={r.leave_cash} />
          <Row label="تعويض التذكرة" detail={r.ticket_entitlement === "none" ? "لا يستحق" : r.ticket_entitlement || ""} value={r.ticket_amount} />
          <tr className="bg-slate-100 font-bold">
            <td className="p-2 border-t-2 border-slate-900">إجمالي المخالصة</td>
            <td className="p-2 border-t-2 border-slate-900"></td>
            <td className="p-2 border-t-2 border-slate-900 text-left">{formatCurrency(r.total_settlement)}</td>
          </tr>
        </tbody>
      </table>

      {r.reason_note && (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-3 mb-5">
          {r.reason_note}
        </div>
      )}

      {/* التوقيعات */}
      <div className="grid grid-cols-3 gap-6 mt-10 text-center text-sm">
        <Sign label="توقيع الموظف" />
        <Sign label="مدير الموارد البشرية" />
        <Sign label="المعتمد من الإدارة" />
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        تم إصدار هذه المخالصة بواسطة نظام جدارة — {r.generated_date || ""}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-medium border-b border-dotted border-slate-300 pb-1">{value || "—"}</span>
    </div>
  );
}

function Row({ label, detail, value, bold }) {
  return (
    <tr className={bold ? "font-semibold" : ""}>
      <td className="p-2 border-b border-slate-200">{label}</td>
      <td className="p-2 border-b border-slate-200 text-slate-600 text-xs">{detail}</td>
      <td className="p-2 border-b border-slate-200 text-left">{formatCurrency(value)}</td>
    </tr>
  );
}

function Sign({ label }) {
  return (
    <div className="flex flex-col items-center gap-10">
      <span className="border-t border-slate-400 w-40"></span>
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}