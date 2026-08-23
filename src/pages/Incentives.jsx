import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import IncentiveFormDialog from "@/components/incentives/IncentiveFormDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Plus, Eye, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/hr";

const TYPE_LABEL = {
  ar: { bonus: "مكافأة", cash_reward: "مكافأة نقدية", allowance_grant: "بدل مخصص", gift: "هدية", recognition: "تقدير", other: "حافز" },
  en: { bonus: "Bonus", cash_reward: "Cash reward", allowance_grant: "Allowance grant", gift: "Gift", recognition: "Recognition", other: "Incentive" },
};

function trOf(rec) { try { return JSON.parse(rec.i18n || "{}"); } catch { return {}; } }
function localized(rec, lang) { const tr = trOf(rec); return { title: tr?.title?.[lang] || rec.title || "", body: tr?.body?.[lang] || rec.body || "" }; }

export default function Incentives() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الحوافز والمكافآت", sub: "منح الحوافز وإرسالها لبوابة الموظف (7 لغات) — محفوظة بتاريخها وقيمتها لحقوق الطرفين.",
    grant: "منح حافز جديد", empty: "لا توجد حوافز بعد", num: "الرقم", type: "النوع", titleL: "العنوان", amount: "المبلغ",
    target: "النطاق", granted: "تاريخ المنح", by: "أصدره", actions: "إجراءات",
    view: "عرض الصيغة", del: "حذف", confirmDel: "حذف هذا الحافز نهائياً؟",
    targetAll: "الجميع", targetDept: "قسم", targetEmp: "موظف", payroll: "ضمن الراتب", langAr: "العربية",
  } : {
    title: "Incentives & Rewards", sub: "Grant incentives and publish them to the employee portal (7 languages) — preserved with date and value for both parties.",
    grant: "New incentive", empty: "No incentives yet", num: "Number", type: "Type", titleL: "Title", amount: "Amount",
    target: "Scope", granted: "Granted", by: "By", actions: "Actions",
    view: "View wording", del: "Delete", confirmDel: "Delete this incentive permanently?",
    targetAll: "All", targetDept: "Department", targetEmp: "Employee", payroll: "In payroll", langAr: "Arabic",
  };

  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, emps] = await Promise.all([
        base44.entities.Incentive.list("-granted_date", 500),
        base44.entities.Employee.list("-created_date", 2000),
      ]);
      setRows(list || []);
      setEmployees(emps || []);
      const depts = Array.from(new Set((emps || []).map((e) => e.department).filter(Boolean))).sort();
      setDepartments(depts);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (r) => {
    if (!window.confirm(t.confirmDel)) return;
    await base44.entities.Incentive.delete(r.id);
    load();
  };

  return (
    <div>
      <PageHeader title={t.title} subtitle={t.sub} action={<Button onClick={() => setOpen(true)} className="gap-2"><Plus size={18} /> {t.grant}</Button>} />
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground text-sm">…</div> : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-2"><Gift size={28} className="opacity-40" /> {t.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-right font-medium px-4 py-3">{t.num}</th>
                <th className="text-right font-medium px-4 py-3">{t.type}</th>
                <th className="text-right font-medium px-4 py-3">{t.titleL}</th>
                <th className="text-right font-medium px-4 py-3">{t.amount}</th>
                <th className="text-right font-medium px-4 py-3">{t.target}</th>
                <th className="text-right font-medium px-4 py-3">{t.granted}</th>
                <th className="text-right font-medium px-4 py-3">{t.actions}</th>
              </tr></thead>
              <tbody>
                {rows.map((r) => {
                  const typeLabel = (TYPE_LABEL[isAr ? "ar" : "en"])[r.incentive_type] || r.incentive_type;
                  const targetLabel = r.target === "all" ? t.targetAll : r.target === "department" ? `${t.targetDept}: ${r.department}` : `${t.targetEmp}: ${r.employee_name}`;
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{r.incentive_number}</td>
                      <td className="px-4 py-3">{typeLabel}{r.payroll_included && <span className="ms-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{t.payroll}</span>}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{localized(r, isAr ? "ar" : "en").title || r.title}</td>
                      <td className="px-4 py-3 font-semibold text-violet-700">{formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3 text-xs">{targetLabel}</td>
                      <td className="px-4 py-3 text-xs" dir="ltr">{r.granted_date || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setView(r)} className="p-1.5 rounded-md hover:bg-violet-50 text-violet-600" title={t.view}><Eye size={15} /></button>
                          <button onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600" title={t.del}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IncentiveFormDialog open={open} onClose={() => setOpen(false)} onSaved={load} employees={employees} departments={departments} />

      <Dialog open={!!view} onOpenChange={() => setView(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{localized(view || {}, isAr ? "ar" : "en").title || view?.title}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs items-center">
                <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-mono">{view.incentive_number}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{(TYPE_LABEL[isAr ? "ar" : "en"])[view.incentive_type]}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm">{formatCurrency(view.amount)}</span>
                {view.granted_date && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.granted}: {view.granted_date}</span>}
                {view.created_by_name && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{t.by}: {view.created_by_name}</span>}
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="text-xs text-muted-foreground mb-2">{t.langAr}</div>
                <div className="font-semibold text-base mb-2">{view.title}</div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{view.body}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["en","hi","ne","bn","fil","ur"].map((l) => {
                  const lc = localized(view, l);
                  return (
                    <div key={l} className="rounded-lg border border-border/70 bg-white p-3">
                      <div className="text-[11px] text-muted-foreground mb-1 uppercase">{l}</div>
                      <div className="text-sm font-medium mb-1">{lc.title}</div>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{lc.body}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}