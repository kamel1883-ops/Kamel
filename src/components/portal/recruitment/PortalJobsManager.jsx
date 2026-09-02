import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Share2, Loader2, Briefcase, CalendarCheck, ClipboardList } from "lucide-react";
import PortalJobForm from "./PortalJobForm";
import PortalApplicantsPanel from "./PortalApplicantsPanel";
import PortalHireDialog from "./PortalHireDialog";
import PortalTrialEvalDialog from "./PortalTrialEvalDialog";

const plus90 = (d) => d ? new Date(new Date(d).getTime() + 90 * 864e5).toISOString().slice(0, 10) : "";
const todayISO = () => new Date().toISOString().slice(0, 10);

// إدارة التوظيف الكاملة داخل بوابة الموظف المُفوّض:
// إنشاء الوظيفة ونشرها ومشاركتها، ثم فرز المتقدمين ومتابعتهم وجدولة مقابلاتهم،
// وإكمال توظيفهم وتقييم فترة التجربة — بنفس صلاحيات مسؤول التوظيف في لوحة الإدارة.
export default function PortalJobsManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const [data, setData] = useState({ jobs: [], applications: [], evaluations: [] });
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({ open: false, job: null });
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [hireTarget, setHireTarget] = useState(null);
  const [evalTarget, setEvalTarget] = useState(null);

  const t = isAr ? {
    title: "إدارة التوظيف", newJob: "وظيفة جديدة", loading: "جارٍ التحميل...",
    noJobs: "لا توجد وظائف — ابدأ بإنشاء وظيفة وإعلانها.",
    open: "شاغرة", closed: "مغلقة", applicants: "المتقدمون", share: "رابط الإعلان",
    hired: "تم التعيين:", confirmDel: "حذف هذه الوظيفة؟", copied: "تم نسخ رابط الإعلان",
    probation: "المعيّنون خلال آخر ٩٠ يوماً (فترة التجربة)", noHired: "لا يوجد تعيينات حديثة.",
    inTrial: "في فترة التجربة", await: "أكمل التجربة — بانتظار التقييم",
    conf: "مثبّت", dism: "مستبعد (مادة 53)", ext: "تمديد التجربة", evaluate: "التقييم",
    sar: "ريال", vac: "شاغر",
  } : {
    title: "Recruitment", newJob: "New job", loading: "Loading...",
    noJobs: "No jobs yet — create and publish one.",
    open: "Open", closed: "Closed", applicants: "Applicants", share: "Share link",
    hired: "Hired:", confirmDel: "Delete this job?", copied: "Job link copied",
    probation: "Hires in the last 90 days (probation)", noHired: "No recent hires.",
    inTrial: "In probation", await: "Completed — awaiting evaluation",
    conf: "Confirmed", dism: "Dismissed (Art. 53)", ext: "Extended", evaluate: "Evaluate",
    sar: "SAR", vac: "vacancy",
  };

  const invoke = async (action, extra = {}) => {
    const res = await base44.functions.invoke("portalData", { ...args, action, ...extra });
    return res?.data || res;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await invoke("recruit_list");
      if (d?.ok) setData({ jobs: d.jobs || [], applications: d.applications || [], evaluations: d.evaluations || [] });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveJob = async (payload, id) => { await invoke("recruit_job_save", { payload, id }); await load(); };
  const delJob = async (j) => {
    if (!confirm(t.confirmDel)) return;
    await invoke("recruit_job_delete", { id: j.id }); await load();
  };
  const updateApp = async (id, payload) => { await invoke("recruit_app_update", { id, payload }); await load(); };
  const hire = async (applicant, payload) => { await invoke("recruit_hire", { application_id: applicant.id, payload }); await load(); };
  const saveEval = async (payload, id) => { await invoke("recruit_eval_save", { payload, id }); await load(); };

  const share = async (j) => {
    const url = `${window.location.origin}/jobs/${j.id}`;
    try { await navigator.clipboard.writeText(url); alert(`${t.copied}\n${url}`); }
    catch { window.prompt(t.share, url); }
  };

  const evalFor = (appId) => (data.evaluations || []).find((e) => e.applicant_id === appId);
  const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const hires = (data.applications || []).filter((a) => a.status === "hired" && (a.hired_date || "") >= cutoff);
  const countFor = (jobId) => (data.applications || []).filter((a) => a.job_id === jobId).length;

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2"><Briefcase size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
        <Button size="sm" onClick={() => setJobForm({ open: true, job: null })}><Plus size={15} />{t.newJob}</Button>
      </div>

      <Card className="p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck size={17} className="text-emerald-600" />
          <div className="font-semibold text-sm">{t.probation} ({hires.length})</div>
        </div>
        {hires.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">{t.noHired}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {hires.map((a) => {
                  const end = plus90(a.hired_date);
                  const rec = evalFor(a.id)?.recommendation;
                  return (
                    <tr key={a.id} className="hover:bg-muted/40">
                      <td className="px-3 py-2.5 font-medium">{a.full_name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{a.job_title}</td>
                      <td className="px-3 py-2.5 tabular-nums">{a.hired_date} → {end}</td>
                      <td className="px-3 py-2.5">
                        {rec === "confirm" ? <Badge className="bg-emerald-100 text-emerald-800 border-0">{t.conf}</Badge>
                          : rec === "dismiss_probation" ? <Badge className="bg-rose-100 text-rose-700 border-0">{t.dism}</Badge>
                          : rec === "extend" ? <Badge className="bg-blue-100 text-blue-800 border-0">{t.ext}</Badge>
                          : end >= todayISO() ? <Badge className="bg-amber-100 text-amber-800 border-0">{t.inTrial}</Badge>
                          : <Badge className="bg-violet-100 text-violet-800 border-0">{t.await}</Badge>}
                      </td>
                      <td className="px-3 py-2.5">
                        <Button size="sm" variant="outline" onClick={() => setEvalTarget(a)} className="gap-1"><ClipboardList size={13} />{t.evaluate}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{t.loading}</div>
      ) : data.jobs.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border bg-card text-sm text-muted-foreground">{t.noJobs}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.jobs.map((j) => (
            <Card key={j.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold">{j.title}</div>
                <Badge className={j.status === "open" ? "bg-emerald-100 text-emerald-800 border-0" : "bg-slate-200 text-slate-700 border-0"}>
                  {j.status === "open" ? t.open : t.closed}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {j.department || j.profession || ""} {j.salary ? `· ${j.salary} ${t.sar}` : ""} {j.vacancy_count ? `· ${j.vacancy_count} ${t.vac}` : ""}
              </div>
              {j.hired_applicant_name && <div className="text-xs text-emerald-700">{t.hired} {j.hired_applicant_name}</div>}
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => setApplicantsJob(j)}><Users size={14} /> {t.applicants} ({countFor(j.id)})</Button>
                <Button size="sm" variant="ghost" onClick={() => share(j)}><Share2 size={14} /> {t.share}</Button>
                <Button size="icon" variant="ghost" onClick={() => setJobForm({ open: true, job: j })}><Pencil size={15} /></Button>
                <Button size="icon" variant="ghost" onClick={() => delJob(j)}><Trash2 size={15} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PortalJobForm
        open={jobForm.open}
        onOpenChange={(o) => setJobForm((s) => ({ ...s, open: o }))}
        job={jobForm.job} onSave={saveJob} isAr={isAr}
      />
      {applicantsJob && (
        <PortalApplicantsPanel
          job={applicantsJob} applications={data.applications}
          onClose={() => setApplicantsJob(null)}
          onUpdate={updateApp}
          onHire={(a) => setHireTarget(a)}
          onEvaluate={(a) => setEvalTarget(a)}
          isAr={isAr}
        />
      )}
      <PortalHireDialog
        open={!!hireTarget} onOpenChange={(o) => !o && setHireTarget(null)}
        applicant={hireTarget}
        job={data.jobs.find((j) => j.id === hireTarget?.job_id) || null}
        onHire={hire} isAr={isAr}
      />
      <PortalTrialEvalDialog
        open={!!evalTarget} onOpenChange={(o) => !o && setEvalTarget(null)}
        applicant={evalTarget} existing={evalTarget ? evalFor(evalTarget.id) : null}
        onSave={saveEval} isAr={isAr}
      />
    </div>
  );
}