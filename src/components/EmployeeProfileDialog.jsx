import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, statusEmployeeLabel } from "@/lib/hr";
import { computeEntitlement, sumUsedDays } from "@/lib/leaveBalance";
import { reasonMeta, computeSettlement } from "@/lib/eos";
import { useI18n } from "@/lib/i18n";

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-left">{value || "—"}</span>
    </div>
  );
}
function Block({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="text-xs font-bold text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

export default function EmployeeProfileDialog({ open, onClose, employee, org, onOpenTrips }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    personal: "بيانات شخصية", employment: "بيانات التوظيف", salary: "الراتب والبدلات",
    leave: "الإجازات والتذاكر", eos: "نهاية الخدمة", trips: "انتدابات الموظف",
    leaveEnt: (n) => `المستحق (تناسبي): ${n}`, leaveUsed: (n) => `المستهلك: ${n}`, leaveRem: (n) => `المتبقي: ${n}`,
    eosAmount: "مكافأة نهاية الخدمة", eosYears: "سنوات الخدمة", eosFraction: "النسبة المطبقة",
    leaveCash: "تعويض الإجازات", ticket: "تعويض التذكرة", total: "إجمالي المخالصة",
    termination: "معلومات الإنهاء", none: "غير منتهٍ", openTrips: "فتح سجل الانتدابات",
    joinJourney: "رحلة العمل داخل المنشأة",
  } : {
    personal: "Personal", employment: "Employment", salary: "Salary & allowances",
    leave: "Leaves & tickets", eos: "End of service", trips: "Employee trips",
    leaveEnt: (n) => `Accrued (prorated): ${n}`, leaveUsed: (n) => `Used: ${n}`, leaveRem: (n) => `Remaining: ${n}`,
    eosAmount: "EOS award", eosYears: "Years of service", eosFraction: "Applied fraction",
    leaveCash: "Leave compensation", ticket: "Ticket compensation", total: "Total settlement",
    termination: "Termination info", none: "Active", openTrips: "Open trips log",
    joinJourney: "Employment journey",
  };
  const [trips, setTrips] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (!open || !employee?.id) return;
    base44.entities.BusinessTrip.filter({ employee_id: employee.id }, "-created_date", 500)
      .then(setTrips).catch(() => setTrips([]));
    base44.entities.LeaveRequest.filter({ employee_id: employee.id }, "-created_date", 500)
      .then(setLeaves).catch(() => setLeaves([]));
  }, [open, employee?.id]);

  const annualDays = org?.annual_leave_days || 21;
  const entitled = employee ? computeEntitlement(employee.hire_date, annualDays) : 0;
  const used = sumUsedDays(leaves);
  const remaining = Math.max(0, Math.round((entitled - used) * 10) / 10);
  const eos = employee ? computeSettlement({
    employee, org,
    lastWorkingDate: employee.termination_date || new Date().toISOString().slice(0, 10),
    reason: employee.termination_reason && employee.termination_reason !== "none" ? employee.termination_reason : "end_of_contract",
  }) : null;
  const tmeta = employee?.termination_reason && employee.termination_reason !== "none" ? reasonMeta(employee.termination_reason) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span>{employee?.full_name}</span>
            {employee && <span className={cn("text-xs px-2 py-0.5 rounded-full", statusEmployeeLabel(employee.status).cls)}>{statusEmployeeLabel(employee.status).label}</span>}
            <button onClick={onOpenTrips} className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><Plane size={12} /> {t.trips} ({trips.length})</button>
          </DialogTitle>
        </DialogHeader>

        {employee && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">{t.joinJourney}</div>
            <Block title={t.personal}>
              <Row label={isAr ? "الجنسية" : "Nationality"} value={employee.nationality} />
              <Row label={isAr ? "الهوية/الإقامة" : "National ID"} value={employee.national_id} />
              <Row label={isAr ? "تاريخ الميلاد" : "Birth date"} value={employee.birth_date} />
              <Row label={isAr ? "الجوال" : "Phone"} value={employee.phone} />
              <Row label={isAr ? "البريد" : "Email"} value={employee.email} />
              <Row label={isAr ? "العنوان" : "Address"} value={employee.address} />
              <Row label={isAr ? "جهة الطوارئ" : "Emergency"} value={employee.emergency_contact} />
            </Block>

            <Block title={t.employment}>
              <Row label={isAr ? "تاريخ المباشرة" : "Hire date"} value={employee.hire_date} />
              <Row label={isAr ? "الإدارة" : "Department"} value={employee.department} />
              <Row label={isAr ? "الفرع" : "Branch"} value={employee.branch_name} />
              <Row label={isAr ? "المسمى" : "Position"} value={employee.position} />
              <Row label={isAr ? "نوع العقد" : "Contract type"} value={employee.contract_type} />
              <Row label={isAr ? "بداية العقد" : "Contract start"} value={employee.contract_start_date} />
              <Row label={isAr ? "نهاية العقد" : "Contract end"} value={employee.contract_end_date} />
              <Row label={isAr ? "المدير المباشر" : "Manager"} value={employee.manager_id} />
            </Block>

            <Block title={t.salary}>
              <Row label={isAr ? "الأساسي" : "Base"} value={formatCurrency(employee.base_salary)} />
              <Row label={isAr ? "بدل سكن" : "Housing"} value={formatCurrency(employee.housing_allowance)} />
              <Row label={isAr ? "بدل مواصلات" : "Transport"} value={formatCurrency(employee.transport_allowance)} />
              <Row label={isAr ? "بدلات أخرى" : "Other"} value={formatCurrency(employee.other_allowances)} />
            </Block>

            <Block title={t.leave}>
              <Row label={t.leaveEnt(entitled?.toFixed(1))} value={`${entitled?.toFixed(1)}`} />
              <Row label={t.leaveUsed(used)} value={`${used}`} />
              <Row label={t.leaveRem(remaining)} value={`${remaining}`} />
              <Row label={isAr ? "استحقاق التذاكر" : "Ticket entitlement"} value={employee.ticket_entitlement === "yearly" ? "سنوي" : employee.ticket_entitlement === "biennial" ? "كل سنتين" : employee.ticket_entitlement} />
            </Block>

            <Block title={t.termination}>
              {tmeta ? (
                <>
                  <Row label={isAr ? "تاريخ الإنهاء" : "Termination date"} value={employee.termination_date} />
                  <Row label={isAr ? "السبب" : "Reason"} value={tmeta.label} />
                  <Row label={isAr ? "المادة" : "Article"} value={tmeta.article} />
                  {tmeta.note && <div className="text-xs text-muted-foreground mt-1">{tmeta.note}</div>}
                </>
              ) : <div className="text-sm text-emerald-600">{t.none}</div>}
            </Block>

            {eos && (
              <Block title={t.eos}>
                <Row label={t.eosYears} value={eos.years} />
                <Row label={t.eosFraction} value={eos.fractionLabel} />
                <Row label={t.eosAmount} value={formatCurrency(eos.amount)} />
                <Row label={t.leaveCash} value={formatCurrency(eos.leaveCash)} />
                <Row label={t.ticket} value={formatCurrency(eos.ticketAmount)} />
                <div className="flex justify-between gap-3 pt-2 mt-1 border-t border-border">
                  <span className="text-sm font-bold">{t.total}</span>
                  <span className="text-sm font-bold">{formatCurrency(eos.total_settlement)}</span>
                </div>
              </Block>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}