import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ClipboardCopy, BarChart3, Power, Lock, Unlock, Trash2, Loader2, Star, Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import CustomerSurveyFormDialog from "@/components/owner/CustomerSurveyFormDialog";
import CustomerSurveyReport from "@/components/owner/CustomerSurveyReport";

export default function CustomerSurveys() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "استبيانات تجربة العميل",
    subtitle: "أرسل استبيانات قصيرة (حتى 5 أسئلة) لمشتركيك وراقب تقارير النتائج.",
    create: "استبيان جديد",
    thTitle: "العنوان",
    thQs: "الأسئلة",
    thResponses: "الردود",
    thStatus: "الحالة",
    thActions: "إجراءات",
    link: "نسخ الرابط",
    report: "التقرير",
    close: "إغلاق",
    reopen: "فتح",
    del: "حذف",
    edit: "تعديل",
    st: { active: "نشط", draft: "مسودة", closed: "مغلق" },
    copied: "تم نسخ الرابط",
    loading: "جارٍ التحميل...",
    empty: "لا توجد استبيانات بعد. أنشئ أول استبيان.",
    delConfirm: "هل تريد حذف هذا الاستبيان وردوده؟",
  } : {
    title: "Customer Experience Surveys",
    subtitle: "Send short surveys (up to 5 questions) to your subscribers and track results.",
    create: "New survey",
    thTitle: "Title",
    thQs: "Questions",
    thResponses: "Responses",
    thStatus: "Status",
    thActions: "Actions",
    link: "Copy link",
    report: "Report",
    close: "Close",
    reopen: "Reopen",
    del: "Delete",
    edit: "Edit",
    st: { active: "Active", draft: "Draft", closed: "Closed" },
    copied: "Link copied",
    loading: "Loading...",
    empty: "No surveys yet. Create your first one.",
    delConfirm: "Delete this survey and its responses?",
  };

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await base44.entities.CustomerSurvey.list("-created_date", 50);
      setSurveys(r || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyLink = async (s) => {
    const url = `${window.location.origin}/c/${s.id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = async (s) => {
    const next = s.status === "active" ? "closed" : "active";
    setBusyId(s.id);
    try {
      await base44.entities.CustomerSurvey.update(s.id, { status: next });
      load();
    } finally { setBusyId(null); }
  };

  const del = async (s) => {
    if (!window.confirm(t.delConfirm)) return;
    setBusyId(s.id);
    try {
      await base44.entities.CustomerSurveyResponse.deleteMany({ survey_id: s.id }).catch(() => {});
      await base44.entities.CustomerSurvey.delete(s.id);
      load();
    } finally { setBusyId(null); }
  };

  const stCls = (v) => v === "active" ? "bg-emerald-50 text-emerald-600"
    : v === "closed" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600";

  const countQs = (s) => {
    try { return JSON.parse(s.questions || "[]").length; } catch { return 0; }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} >
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-1.5"><Plus size={16} /> {t.create}</Button>
      </PageHeader>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> {t.loading}</div>
      ) : surveys.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground bg-white rounded-2xl border border-border">{t.empty}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right font-medium px-4 py-3">{t.thTitle}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thQs}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thResponses}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thStatus}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {surveys.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium truncate max-w-[260px]">{s.title}</div>
                      {s.description && <div className="text-xs text-muted-foreground truncate max-w-[260px]">{s.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{countQs(s)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400" /> {s.responses_count || 0}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stCls(s.status)}`}>{t.st[s.status]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => copyLink(s)} className="h-8 gap-1.5">
                          {copiedId === s.id ? <><ClipboardCopy size={13} /> {t.copied}</> : <><Link2 size={13} /> {t.link}</>}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setReportFor(s)} className="h-8 gap-1.5"><BarChart3 size={13} /> {t.report}</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditing(s); setFormOpen(true); }} className="h-8">{t.edit}</Button>
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(s)} disabled={busyId === s.id} className="h-8 gap-1.5">
                          {s.status === "active" ? <><Lock size={13} /> {t.close}</> : <><Unlock size={13} /> {t.reopen}</>}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => del(s)} disabled={busyId === s.id} className="h-8 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CustomerSurveyFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} survey={editing} isAr={isAr} />
      <CustomerSurveyReport open={!!reportFor} onClose={() => setReportFor(null)} survey={reportFor} isAr={isAr} />
    </div>
  );
}