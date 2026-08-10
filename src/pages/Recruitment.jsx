import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, CalendarCheck, Share2, ClipboardList, FileCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import JobFormDialog from "@/components/recruitment/JobFormDialog";
import ApplicantsDialog from "@/components/recruitment/ApplicantsDialog";
import TrialEvaluationDialog from "@/components/recruitment/TrialEvaluationDialog";
import ShareJobDialog from "@/components/recruitment/ShareJobDialog";

const plus90 = (d) => d ? new Date(new Date(d).getTime() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10) : "";
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Recruitment() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [hiredRecent, setHiredRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobDialog, setJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [evalApplicant, setEvalApplicant] = useState(null);
  const [evalJob, setEvalJob] = useState(null);
  const [shareJob, setShareJob] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [j, apps] = await Promise.all([
        base44.entities.Job.list("-created_date", 200),
        base44.entities.JobApplication.filter({ status: "hired" }, "-hired_date", 500),
      ]);
      setJobs(j || []);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      setHiredRecent((apps || []).filter((a) => new Date(a.hired_date || a.created_date) >= cutoff));
    } catch (e) { toast({ title: "تعذر التحميل", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditingJob(null); setJobDialog(true); };
  const openEdit = (j) => { setEditingJob(j); setJobDialog(true); };
  const del = async (j) => {
    if (!confirm("حذف هذه الوظيفة؟")) return;
    try { await base44.entities.Job.delete(j.id); toast({ title: "تم الحذف" }); load(); }
    catch (e) { toast({ title: "تعذر الحذف", description: e.message, variant: "destructive" }); }
  };

  const openHiredEval = (app) => {
    const job = jobs.find((x) => x.id === app.job_id) || null;
    setEvalApplicant(app);
    setEvalJob(job);
  };

  return (
    <div>
      <PageHeader title="إدارة التوظيف" subtitle="إدارة الوظائف الشاغرة والوصف الوظيفي والمتقدمين والتعيين وتقييم فترة التجربة" action={
        <Button onClick={openNew}><Plus size={16} /> وظيفة جديدة</Button>
      } />

      <Card className="p-4 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><CalendarCheck size={22} /></div>
          <div>
            <div className="font-semibold">تقرير: الموظفون المعيّنون خلال آخر ٩٠ يوماً (فترة التجربة)</div>
            <div className="text-sm text-muted-foreground">{hiredRecent.length} موظف — مع تاريخ التعيين ونهاية فترة التجربة وإجراء التقييم</div>
          </div>
        </div>
        {hiredRecent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-3">لا يوجد موظفون توظّفوا خلال آخر ٩٠ يوم.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-right font-semibold px-3 py-2.5">الموظف</th>
                  <th className="text-right font-semibold px-3 py-2.5">الوظيفة</th>
                  <th className="text-right font-semibold px-3 py-2.5">تاريخ التعيين</th>
                  <th className="text-right font-semibold px-3 py-2.5">نهاية فترة التجربة (٩٠ يوماً)</th>
                  <th className="text-right font-semibold px-3 py-2.5">الحالة</th>
                  <th className="text-right font-semibold px-3 py-2.5">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {hiredRecent.map((a) => {
                  const end = plus90(a.hired_date);
                  const inTrial = end >= todayISO();
                  return (
                    <tr key={a.id} className="border-t hover:bg-muted/40">
                      <td className="px-3 py-2.5 font-medium">{a.full_name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{a.job_title}</td>
                      <td className="px-3 py-2.5">{a.hired_date}</td>
                      <td className="px-3 py-2.5">{end}</td>
                      <td className="px-3 py-2.5">
                        {inTrial ? <Badge className="bg-amber-100 text-amber-800 border-0">في فترة التجربة</Badge> : <Badge className="bg-violet-100 text-violet-800 border-0">أكمل فترة التجربة</Badge>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => openHiredEval(a)}><ClipboardList size={14} /> تقييم فترة التجربة</Button>
                          {a.appointment_doc_url && <a href={a.appointment_doc_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-700 underline"><FileCheck size={13} /> قرار التعيين</a>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">الوظائف</h3>
      {loading ? (
        <div className="py-24 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border bg-card">
          <Users className="text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground mb-4">لا توجد وظائف شاغرة — ابدأ بإنشاء وظيفة.</p>
          <Button onClick={openNew}><Plus size={16} /> وظيفة جديدة</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((j) => (
            <Card key={j.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-foreground">{j.title}</div>
                {j.status === "open" ? <Badge className="bg-emerald-100 text-emerald-800 border-0">شاغرة</Badge> : <Badge className="bg-slate-200 text-slate-700 border-0">مغلقة</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{j.profession} · {j.job_type === "full_time" ? "دوام كامل" : j.job_type === "part_time" ? "دوام جزئي" : "عقد"} {j.salary ? `· ${j.salary} ريال` : ""}</div>
              {j.hired_applicant_name && <div className="text-xs text-emerald-700">تم التعيين: {j.hired_applicant_name}</div>}
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => setApplicantsJob(j)}><Users size={14} /> المتقدمون</Button>
                <Button size="sm" variant="ghost" onClick={() => setShareJob(j)}><Share2 size={14} /> مشاركة</Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(j)}><Pencil size={15} /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(j)}><Trash2 size={15} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <JobFormDialog open={jobDialog} onOpenChange={setJobDialog} onSaved={load} job={editingJob} />
      <ApplicantsDialog open={!!applicantsJob} onOpenChange={(o) => !o && setApplicantsJob(null)} job={applicantsJob} onHired={load} onEvaluate={(a) => { setEvalApplicant(a); setEvalJob(applicantsJob); }} />
      <TrialEvaluationDialog open={!!evalApplicant} onOpenChange={(o) => !o && setEvalApplicant(null)} applicant={evalApplicant} job={evalJob} onSaved={load} />
      <ShareJobDialog open={!!shareJob} onOpenChange={(o) => !o && setShareJob(null)} job={shareJob} />
    </div>
  );
}