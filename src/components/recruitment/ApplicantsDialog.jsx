import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import AppointmentLetterDoc from "@/components/docs/AppointmentLetterDoc";
import { CheckCircle2, XCircle, CalendarClock, UserCheck, ClipboardList, Loader2, FileCheck } from "lucide-react";

const statusMap = {
  applied: { ar: "قُدمت", cls: "bg-slate-100 text-slate-700" },
  screened: { ar: "مرشّح", cls: "bg-blue-100 text-blue-800" },
  interview: { ar: "مقابلة", cls: "bg-amber-100 text-amber-800" },
  hired: { ar: "معيّن", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { ar: "مرفوض", cls: "bg-red-100 text-red-700" },
};

export default function ApplicantsDialog({ open, onOpenChange, job, onHired, onEvaluate }) {
  const { toast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [onlySuitable, setOnlySuitable] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    if (!job) return;
    setLoading(true);
    try { const a = await base44.entities.JobApplication.filter({ job_id: job.id }, "-created_date", 500); setApps(a || []); }
    catch (e) { toast({ title: "تعذر تحميل المتقدمين", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (open) load(); }, [open, job?.id]);

  const suitable = (a) => {
    if (!job || job.nationality_req === "any") return true;
    if (job.nationality_req === "saudi") return (a.nationality || "").includes("سعود");
    if (job.nationality_req === "resident") return !(a.nationality || "").includes("سعود");
    return true;
  };
  const list = onlySuitable ? apps.filter(suitable) : apps;

  const setStatus = async (a, status, extra = {}) => {
    try { await base44.entities.JobApplication.update(a.id, { status, ...extra }); toast({ title: "تم التحديث" }); load(); }
    catch (e) { toast({ title: "تعذر التحديث", description: e.message, variant: "destructive" }); }
  };

  const hire = async (a) => {
    if (!confirm(`تعيين ${a.full_name}؟ سيتم إنشاء ملف موظف ومستند قرار تعيين ومعتمد، وإغلاق الوظيفة ورفض بقية الطلبات تلقائياً.`)) return;
    setBusy(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      let org = null;
      try { const orgs = await base44.entities.Organization.list("-created_date", 1); org = orgs[0] || null; } catch {}

      let docUrl = "";
      try {
        const blob = await renderToPdfBlob(<AppointmentLetterDoc applicant={{ ...a, hired_date: today }} job={job} org={org} />);
        docUrl = await uploadPdfBlob(blob, `appointment_${a.id}.pdf`);
      } catch (e) { console.error(e); }

      const empNo = "JDR-" + Date.now().toString().slice(-6);
      const emp = await base44.entities.Employee.create({
        full_name: a.full_name, employee_number: empNo, department: job.department || "",
        position: job.title, hire_date: today, base_salary: job.salary || 0,
        phone: a.phone, nationality: a.nationality, status: "active", termination_reason: "none",
      });
      await base44.entities.JobApplication.update(a.id, { status: "hired", hired_date: today, appointment_doc_url: docUrl, appointment_approved: true, hired_employee_id: emp.id });
      await base44.entities.Job.update(job.id, { status: "closed", closed_date: today, hired_applicant_name: a.full_name });
      await base44.entities.JobApplication.updateMany(
        { job_id: job.id, status: { $in: ["applied", "screened", "interview"] } },
        { $set: { status: "rejected", reject_reason: "تم تعيين مرشّح آخر" } }
      );
      await base44.entities.Notification.create({
        title: "تعيين موظف جديد",
        body: `تم تعيين ${a.full_name} كـ${job.title} (رقم ${empNo})، وتم إصدار قرار التعيين. الرجاء استكمال كافة بياناته لاعتماده ضمن الموظفين الثابتين.`,
        type: "hired", link: "/employees", is_read: false,
      });

      toast({ title: "تم التعيين وإغلاق الوظيفة", description: "تم إنشاء ملف الموظف وقرار التعيين وإشعار المسؤول" });
      onHired?.();
      load();
    } catch (e) { toast({ title: "تعذر إتمام التعيين", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const doReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast({ title: "يرجى كتابة سبب الرفض", variant: "destructive" }); return; }
    try { await base44.entities.JobApplication.update(rejectTarget.id, { status: "rejected", reject_reason: rejectReason }); toast({ title: "تم الرفض" }); setRejectTarget(null); setRejectReason(""); load(); }
    catch (e) { toast({ title: "تعذر الرفض", description: e.message, variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>المتقدمون — {job?.title}</DialogTitle></DialogHeader>
        <div className="flex items-center justify-between py-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <input type="checkbox" checked={onlySuitable} onChange={(e) => setOnlySuitable(e.target.checked)} />
            عرض المناسبين للوظيفة فقط
          </label>
          <span className="text-xs text-muted-foreground">{list.length} متقدم</span>
        </div>
        {loading ? <div className="py-12 text-center text-muted-foreground">جارٍ التحميل...</div> :
          list.length === 0 ? <div className="py-12 text-center text-muted-foreground">لا يوجد متقدمون.</div> :
          <div className="space-y-3">
            {list.map((a) => {
              const st = statusMap[a.status] || statusMap.applied;
              const ok = suitable(a);
              return (
                <div key={a.id} className="border rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {a.full_name}
                        {ok ? <Badge className="bg-emerald-100 text-emerald-800 border-0">مناسب</Badge> : <Badge className="bg-red-100 text-red-700 border-0">غير مطابق</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{a.email} · {a.phone} · {a.nationality} · {a.experience_years} سنوات خبرة</div>
                    </div>
                    <Badge className={st.cls + " border-0"}>{st.ar}</Badge>
                  </div>
                  {a.qualifications && <div className="text-sm text-muted-foreground">المؤهلات: {a.qualifications}</div>}
                  <div className="flex flex-wrap items-center gap-2">
                    {a.cv_url && /^https?:\/\//i.test(a.cv_url) && <a href={a.cv_url} target="_blank" rel="noreferrer" className="text-xs text-violet-700 underline">عرض السيرة الذاتية</a>}
                    {a.appointment_doc_url && /^https?:\/\//i.test(a.appointment_doc_url) && <a href={a.appointment_doc_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline inline-flex items-center gap-1"><FileCheck size={12} /> قرار التعيين</a>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {a.status === "applied" && <Button size="sm" variant="outline" onClick={() => setStatus(a, "screened")}><UserCheck size={14} /> ترشيح</Button>}
                    {a.status !== "interview" && a.status !== "hired" && a.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(a, "interview", { interview_date: new Date().toISOString().slice(0, 10) })}><CalendarClock size={14} /> استدعاء للمقابلة</Button>}
                    {job && job.status === "open" && a.status !== "hired" && a.status !== "rejected" && <Button size="sm" variant="default" onClick={() => hire(a)} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} تعيين وإصدار قرار</Button>}
                    {a.status !== "hired" && a.status !== "rejected" && <Button size="sm" variant="destructive" onClick={() => { setRejectTarget(a); setRejectReason(""); }}><XCircle size={14} /> رفض</Button>}
                    {a.status === "hired" && <Button size="sm" variant="outline" onClick={() => onEvaluate?.(a)}><ClipboardList size={14} /> تقييم فترة التجربة</Button>}
                  </div>
                  {a.reject_reason && <div className="text-xs text-red-700">سبب الرفض: {a.reject_reason}</div>}
                </div>
              );
            })}
          </div>}
        {rejectTarget && (
          <div className="border-t pt-3 mt-3 space-y-2">
            <div className="font-medium">رفض: {rejectTarget.full_name}</div>
            <Label>سبب الرفض *</Label>
            <Textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="اكتب سبب الرفض" />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={doReject}>تأكيد الرفض</Button>
              <Button variant="outline" onClick={() => setRejectTarget(null)}>إلغاء</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}