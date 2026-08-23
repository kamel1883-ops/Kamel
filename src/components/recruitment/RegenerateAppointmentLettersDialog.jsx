import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, RefreshCw, AlertTriangle, FileStack } from "lucide-react";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import AppointmentLetterDoc from "@/components/docs/AppointmentLetterDoc";

// إعادة توليد قرارات التعيين المخزّنة لكل المتعينين بالترويسة الموحدة (المنشأة يميناً + جدارة يساراً)
export default function RegenerateAppointmentLettersDialog({ open, onClose, onDone }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState("");
  const [errors, setErrors] = useState([]);
  const [finished, setFinished] = useState(false);
  const [org, setOrg] = useState(null);
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState({});

  const t = {
    title: "إعادة توليد قرارات التعيين المخزّنة",
    desc: "يُعيد توليد قرار التعيين لكل الموظفين المعيّنين بالصيغة الموحدة (المنشأة يميناً + جدارة يساراً)، ويرفع المستند الجديد ويستبدل الرابط القديم على سجل طلب التوظيف.",
    run: "بدء إعادة التوليد",
    progress: (n, m, name) => `جارٍ التوليد — ${n} من ${m} — ${name}`,
    okCount: (n, m) => `تم تحديث ${n} من ${m} قرار بنجاح`,
    errCount: (n) => `فشل تحديث: ${n} قرار`,
    close: "إغلاق",
    none: "لا يوجد قرارات تعيين مخزّنة لإعادة توليدها.",
    countLabel: (n) => `عدد قرارات التعيين المخزّنة: ${n}`,
  };

  const targets = useMemo(() => (apps || []).filter((a) => a.status === "hired" && a.appointment_doc_url), [apps]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const orgs = await base44.entities.Organization.list("-created_date", 1);
        setOrg(orgs[0] || null);
        const a = await base44.entities.JobApplication.filter({ status: "hired" }, "-hired_date", 1000);
        setApps(a || []);
        const js = await base44.entities.Job.list("-created_date", 500);
        const map = {};
        (js || []).forEach((j) => { map[j.id] = j; });
        setJobs(map);
      } catch {
        setApps([]);
      }
    })();
  }, [open]);

  const run = async () => {
    if (!targets.length) return;
    setRunning(true); setFinished(false); setDone(0); setErrors([]); setTotal(targets.length);
    let ok = 0;
    const errs = [];
    for (let i = 0; i < targets.length; i++) {
      const a = targets[i];
      setCurrent(a.full_name || "—");
      try {
        const job = jobs[a.job_id] || { title: a.job_title, department: "", job_type: "full_time", salary: 0 };
        const blob = await renderToPdfBlob(
          <AppointmentLetterDoc applicant={{ ...a, hired_date: a.hired_date || new Date().toISOString().slice(0, 10) }} job={job} org={org} />
        );
        const url = await uploadPdfBlob(blob, `appointment_${a.id}.pdf`);
        await base44.entities.JobApplication.update(a.id, { appointment_doc_url: url });
        ok++;
      } catch (e) {
        errs.push(`${a.full_name || a.id}: ${String(e?.message || e)}`);
      }
      setDone(i + 1);
      await new Promise((r) => setTimeout(r, 200));
    }
    setErrors(errs);
    setRunning(false); setFinished(true); setCurrent("");
    if (onDone) onDone();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o && !running && onClose ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileStack size={18} className="text-violet-600" /> {t.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">{t.desc}</p>
          {targets.length === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">{t.none}</div>
          ) : (
            <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-3">
              {t.countLabel(targets.length)}
            </div>
          )}
          {running && (
            <div className="flex items-center gap-2 text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-2.5 text-xs">
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span className="truncate">{t.progress(done, total, current)}</span>
            </div>
          )}
          {finished && (
            <div className="space-y-2">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 flex items-center gap-2 text-xs">
                <Check size={16} /> {t.okCount(done, total)}
              </div>
              {errors.length > 0 && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <AlertTriangle size={14} /> {t.errCount(errors.length)}
                  </div>
                  <ul className="list-disc ps-5 space-y-1 max-h-40 overflow-auto">
                    {errors.map((e, i) => (<li key={i} className="break-words">{e}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => (running ? null : onClose())} disabled={running}>{t.close}</Button>
          <Button onClick={run} disabled={running || targets.length === 0} className="gap-1.5">
            {running ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} {t.run}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}