import React, { useState } from "react";
import { Download, FileText, Printer, ShieldCheck } from "lucide-react";
import SettlementSheet from "@/components/SettlementSheet";
import { leaveTypeLabel } from "@/lib/hr";
import { reasonMeta } from "@/lib/eos";
import { useI18n } from "@/lib/i18n";

// مستنداتي المالية في بوابة الموظف — مخالصات تصفية الإجازات + مخالصات نهاية الخدمة المصروفة
export default function EmployeeDocuments({ leaves, settlements, org }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [printing, setPrinting] = useState(null);

  const paidLeaves = (leaves || []).filter(
    (l) => (l.status === "completed" || l.status === "paid") && l.settlement_pdf_url
  );
  const paidSets = (settlements || []).filter((s) => s.status === "completed");

  const t = isAr ? {
    title: "مستنداتي المالية",
    desc: "تظهر هنا مخالصات تصفية الإجازات ومخالصات نهاية الخدمة المُصدرة والمصروفة لك — حفظاً لحقوق الطرفين.",
    empty: "لا توجد مستندات مالية مصروفة لك حالياً.",
    leaveDoc: "مخالصة تصفية إجازة", eosDoc: "مخالصة نهاية الخدمة",
    proof: "إثبات التحويل", print: "معاينة/طباعة المخالصة", settle: "تحميل المخالصة",
    days: (n) => `${n} يوم`, lwd: "آخر يوم عمل", issued: "تاريخ الإصدار",
    rights: "حقوق مالية محفوظة",
  } : {
    title: "My Financial Documents",
    desc: "Your settled leave clearances and paid end-of-service settlements — preserving both parties' rights.",
    empty: "No paid financial documents for you yet.",
    leaveDoc: "Leave settlement", eosDoc: "End-of-service settlement",
    proof: "Transfer proof", print: "View/Print settlement", settle: "Download settlement",
    days: (n) => `${n} days`, lwd: "Last working day", issued: "Issued",
    rights: "Preserved rights",
  };

  const printSet = (rec) => {
    setPrinting(rec);
    setTimeout(() => { window.print(); setPrinting(null); }, 250);
  };

  const hasAny = paidLeaves.length > 0 || paidSets.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-600" /> {t.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">{t.desc}</p>

      {!hasAny ? (
        <div className="text-center text-muted-foreground text-sm py-6">{t.empty}</div>
      ) : (
        <div className="space-y-2">
          {paidLeaves.map((l) => (
            <div key={"l" + l.id} className="rounded-lg border border-border p-3 flex items-center justify-between gap-2">
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
            <div key={"s" + s.id} className="rounded-lg border border-border p-3 flex items-center justify-between gap-2 flex-wrap">
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
        </div>
      )}

      {printing && (
        <div className="fixed -left-[9999px] top-0" aria-hidden="true">
          <SettlementSheet record={printing} org={org} />
        </div>
      )}
    </div>
  );
}