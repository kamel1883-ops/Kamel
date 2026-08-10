import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase } from "lucide-react";

export default function JobApply() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", nationality: "", qualifications: "", experience_years: 0, notes: "" });
  const [cvFile, setCvFile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.Job.get(id).then(setJob).catch(() => setJob(null)).finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name) { toast({ title: "يرجى إدخال الاسم", variant: "destructive" }); return; }
    if (!job || job.status !== "open") { toast({ title: "هذه الوظيفة مغلقة", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      let cv_url = "";
      if (cvFile) {
        try { const r = await base44.integrations.Core.UploadFile({ file: cvFile }); cv_url = r.file_url; }
        catch (e) { toast({ title: "تعذر رفع السيرة الذاتية", variant: "destructive" }); setSubmitting(false); return; }
      }
      await base44.entities.JobApplication.create({
        job_id: job.id, job_title: job.title, full_name: form.full_name, email: form.email,
        phone: form.phone, nationality: form.nationality, qualifications: form.qualifications,
        experience_years: Number(form.experience_years) || 0, notes: form.notes, cv_url,
        status: "applied", applied_date: new Date().toISOString().slice(0, 10),
      });
      setDone(true);
    } catch (e) { toast({ title: "تعذر التقديم", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  if (!job) return <div className="min-h-screen flex flex-col items-center justify-center gap-3"><Logo size={48} /><p className="text-muted-foreground">الوظيفة غير موجودة.</p></div>;
  if (done) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4"><Logo size={48} /><div className="text-xl font-bold">تم استلام طلبك بنجاح</div><p className="text-muted-foreground">شكراً لتقديمك على وظيفة {job.title}. سيتم التواصل معك في حال المطابقة.</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6"><Logo size={44} /><span className="text-sm text-muted-foreground">منصة جدارة</span></div>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-violet-700 font-semibold mb-1"><Briefcase size={18} /> {job.title}</div>
          <div className="text-sm text-muted-foreground mb-4">{job.profession} · {job.job_type === "full_time" ? "دوام كامل" : job.job_type === "part_time" ? "دوام جزئي" : "عقد"} {job.salary ? `· ${job.salary} ريال` : ""}</div>
          {job.description && <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-slate-50 rounded-xl p-4 mb-5">{job.description}</div>}
          <div className="grid gap-3">
            <div><Label>الاسم الكامل *</Label><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>البريد الإلكتروني</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div><Label>الهاتف</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الجنسية</Label><Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} /></div>
              <div><Label>سنوات الخبرة</Label><Input type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} /></div>
            </div>
            <div><Label>المؤهلات</Label><Textarea rows={2} value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} /></div>
            <div><Label>ملاحظات</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div><Label>السيرة الذاتية (PDF/Word)</Label><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="text-sm block w-full border rounded-md p-2" /></div>
            <Button onClick={submit} disabled={submitting} className="w-full">{submitting ? "جارٍ التقديم..." : "تقديم الطلب"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}