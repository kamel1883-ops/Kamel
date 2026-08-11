import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, FileText, Printer } from "lucide-react";
import SettlementSheet from "@/components/SettlementSheet";
import { leaveTypeLabel } from "@/lib/hr";
import { reasonMeta } from "@/lib/eos";
import { useI18n } from "@/lib/i18n";

// أرشيف المستندات المالية المصروفة للموظف (مخالصات إجازة مكتملة + مخالصات نهاية الخدمة)
export default function EmployeePaidDocuments({ employee, org }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [leaves, setLeaves] = useState([]);
  const [sets, setSets] = useState([]);
  const [printing, setPrinting] = useState(null);

  useEffect(() => {
    if (!employee?.id) return;
    base44.entities.LeaveRequest.filter({ employee_id: employee.id }, "-created_date", 500)
      .then(setLeaves).catch(() => setLeaves([]));
    base44.entities.Settlement.filter({ employee_id: employee.id }, "-created_date", 200)
      .then(setSets).catch(() => setSets([]));
  }, [employee?.id]);

  const paidLeaves = leaves.filter((l) =>
    (l.status === "completed" || l.status === "paid") && l.settlement_pdf_url
  );
  const paidSets = sets.filter((s) => s.status === "completed");

  const t = isAr ? {
    empty: "لا توجد مستندات مصروفة لهذا الموظف.",
    leaveDoc: "مخالصة إجازة", eosDoc: "مخالصة نهاية الخدمة",
    proof: "إثبات التحويل", print: "معاينة/طباعة المخالصة", settle: "المخالصة",
    days: (n) => `${n} يوم`, lwd: "آخر يوم عمل", issued: "تاريخ الإصدار",
  } : {
    empty: "No paid documents for this employee.",
    leaveDoc: "Leave settlement", eosDoc: "End-of-service settlement",
    proof: "Transfer proof", print: "View/Print settlement", settle: "Settlement",
    days: (n) => `${n} days`, lwd: "Last working day", issued: "Issued",
  };

  const printSet = (rec) => {
    setPrinting(rec);
    setTimeout(() => { window.print(); setPrinting(null); }, 150);
  };

  const hasAny = paidLeaves.length > 0 || paidSets.length > 0;
  if (!hasAny) return <div className="text-sm text-muted-foreground py-2">{t.empty}</div>;

  return (
    <div className="space-y-2">
      {paidLeaves.map((l) => (
        <div key={"l" + l.id} className="rounded-lg border border-border bg-white p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium">{t.leaveDoc} — {leaveTypeLabel(l.leave_type)}</div>
            <div className="text-xs text-muted-foreground">{l.start_date} ← {l.end_date} · {t.days(l.days_count)}</div>
          </div>
          <a href={l.settlement_pdf_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium shrink-0">
            <Download size={14} /> {t.settle}
          </a>
        </div>
      ))}
      {paidSets.map((s) => (
        <div key={"s" + s.id} className="rounded-lg border border-border bg-white p-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-medium">{t.eosDoc} — {reasonMeta(s.reason).label}</div>
            <div className="text-xs text-muted-foreground">{t.lwd}: {s.last_working_date} · {t.issued}: {s.generated_date}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            {s.finance_proof_url && (
              <a href={s.finance_proof_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium">
                <FileText size={14} /> {t.proof}
              </a>
            )}
            <button onClick={() => printSet(s)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium">
              <Printer size={14} /> {t.print}
            </button>
          </div>
        </div>
      ))}

      {printing && (
        <div className="fixed -left-[9999px] top-0" aria-hidden="true">
          <SettlementSheet record={printing} org={org} />
        </div>
      )}
    </div>
  );
}