import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, UserCheck, ClipboardList } from "lucide-react";
import { safeHref } from "@/lib/utils";

const STATUS = {
  applied: { ar: "متقدم جديد", en: "New", cls: "bg-slate-100 text-slate-700" },
  screened: { ar: "تم الفرز", en: "Screened", cls: "bg-blue-100 text-blue-800" },
  interview: { ar: "مقابلة", en: "Interview", cls: "bg-amber-100 text-amber-800" },
  hired: { ar: "معيّن", en: "Hired", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { ar: "مستبعد", en: "Rejected", cls: "bg-rose-100 text-rose-700" },
};

// متقدمو وظيفة واحدة: فرز، جدولة مقابلة، ملاحظات، استبعاد، وإكمال التوظيف
export default function PortalApplicantsPanel({ job, applications, onClose, onUpdate, onHire, onEvaluate, isAr = true }) {
  const [busy, setBusy] = useState("");
  const rows = (applications || []).filter((a) => a.job_id === job?.id);

  const t = isAr ? {
    title: "المتقدمون على", empty: "لا يوجد متقدمون على هذه الوظيفة بعد.",
    name: "المتقدم", contact: "التواصل", exp: "الخبرة", cv: "السيرة", status: "الحالة",
    interview: "تاريخ المقابلة", notes: "ملاحظات المقابلة", actions: "إجراءات",
    hire: "إكمال التوظيف", evaluate: "تقييم التجربة", years: "سنة",
  } : {
    title: "Applicants for", empty: "No applicants yet.",
    name: "Applicant", contact: "Contact", exp: "Experience", cv: "CV", status: "Status",
    interview: "Interview date", notes: "Interview notes", actions: "Actions",
    hire: "Complete hiring", evaluate: "Probation eval", years: "y",
  };

  const patch = async (a, payload) => {
    setBusy(a.id);
    try { await onUpdate(a.id, payload); } finally { setBusy(""); }
  };

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader><DialogTitle>{t.title} {job?.title} ({rows.length})</DialogTitle></DialogHeader>
        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground text-xs">
                <tr>
                  {[t.name, t.contact, t.exp, t.cv, t.status, t.interview, t.notes, t.actions].map((h) => (
                    <th key={h} className="text-right px-3 py-2.5 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((a) => {
                  const st = STATUS[a.status] || STATUS.applied;
                  return (
                    <tr key={a.id} className="hover:bg-muted/40 align-top">
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap">{a.full_name}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground" dir="ltr">{a.phone || "—"}<br />{a.email || ""}</td>
                      <td className="px-3 py-2.5 tabular-nums">{a.experience_years || 0} {t.years}</td>
                      <td className="px-3 py-2.5">
                        {a.cv_url ? <a href={safeHref(a.cv_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-violet-700 underline text-xs"><FileText size={13} />{t.cv}</a> : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <Select value={a.status || "applied"} disabled={busy === a.id} onValueChange={(v) => patch(a, { status: v })}>
                          <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{isAr ? v.ar : v.en}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Badge className={`${st.cls} border-0 mt-1 text-[10px]`}>{isAr ? st.ar : st.en}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Input type="date" className="h-8 w-[140px]" defaultValue={a.interview_date || ""} onBlur={(e) => e.target.value !== (a.interview_date || "") && patch(a, { interview_date: e.target.value })} />
                      </td>
                      <td className="px-3 py-2.5">
                        <Input className="h-8 w-[180px]" defaultValue={a.interview_notes || ""} onBlur={(e) => e.target.value !== (a.interview_notes || "") && patch(a, { interview_notes: e.target.value })} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {a.status !== "hired" ? (
                            <Button size="sm" onClick={() => onHire(a)} className="gap-1"><UserCheck size={13} />{t.hire}</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => onEvaluate(a)} className="gap-1"><ClipboardList size={13} />{t.evaluate}</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}