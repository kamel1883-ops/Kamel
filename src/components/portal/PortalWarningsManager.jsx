import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const VIOLATION = { absence_short: "غياب قصير", absence_repeated: "تكرر الغياب", absence_long: "غياب طويل", tardiness: "التأخير", sleeping: "النوم أثناء العمل", product_damage: "إتلاف المنتج", disobedience: "عدم الطاعة", disclosure: "إفشاء الأسرار", assault: "اعتداء", safety: "مخالفة السلامة", other: "أخرى" };
const LEVEL = { first: "إنذار أول", second: "إنذار ثاني", third: "إنذار ثالث", termination: "إنذار بالفصل" };
const LEVEL_CLS = { first: "bg-amber-100 text-amber-700", second: "bg-orange-100 text-orange-700", third: "bg-rose-100 text-rose-700", termination: "bg-red-600 text-white" };

// وحدة الإنذارات في بوابة الموظف — للموظف المُفوّض بصلاحية «الإنذارات».
export default function PortalWarningsManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const t = isAr ? {
    title: "الإنذارات", add: "إصدار إنذار",
    emp: "الموظف *", violation: "نوع المخالفة *", article: "المرجع النظامي", level: "درجة الإنذار",
    incident: "تاريخ الواقعة", session: "تاريخ الجلسة", summary: "ملخص التحقيق", desc: "نص الإنذار", notes: "ملاحظات",
    submit: "إصدار الإنذار", empty: "لا توجد إنذارات",
    th: "الموظف", thViolation: "المخالفة", thLevel: "الدرجة", thDate: "الواقعة", thBy: "أُعدّت بواسطة", thActions: "إجراءات",
    preNote: (n) => `كل إنذار تُصدره هنا يُوثّق باسمك (${n}).`,
  } : {
    title: "Warnings", add: "Issue warning",
    emp: "Employee *", violation: "Violation *", article: "Article ref", level: "Level",
    incident: "Incident date", session: "Session date", summary: "Investigation summary", desc: "Warning text", notes: "Notes",
    submit: "Issue warning", empty: "No warnings",
    th: "Employee", thViolation: "Violation", thLevel: "Level", thDate: "Incident", thBy: "Prepared by", thActions: "Actions",
    preNote: (n) => `Every warning is attributed to you (${n}).`,
  };

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", violation_category: "", article_reference: "", warning_level: "first",
    incident_date: new Date().toISOString().slice(0, 10), session_date: "", investigation_summary: "", description: "", notes: "", status: "sent",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const invoke = async (action, extra = {}) => { const res = await base44.functions.invoke("portalData", { ...args, action, ...extra }); return res?.data || res; };
  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await invoke("delegated_list", { section: "warnings" }); if (!d?.ok) return; setRecords(d.records || []); setEmployees(d.employees || []); setPreparer(d.preparer || { name: "", id: "" }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.employee_id || !form.violation_category) return;
    const emp = employees.find((e) => e.id === form.employee_id);
    setSaving(true);
    try {
      const payload = { ...form, employee_name: emp?.full_name || "", employee_user_id: emp?.user_id || "", national_id: emp?.national_id || "", department: emp?.department || "" };
      const d = await invoke("delegated_create", { section: "warnings", payload });
      if (d?.ok) { setRecords((r) => [d.record, ...r]); setForm((f) => ({ ...f, employee_id: "", violation_category: "", article_reference: "", investigation_summary: "", description: "", notes: "", session_date: "" })); setShowForm(false); }
    } finally { setSaving(false); }
  };
  const remove = async (id) => { if (!confirm(isAr ? "حذف الإنذار؟" : "Delete?")) return; setRecords((r) => r.filter((x) => x.id !== id)); await invoke("delegated_delete", { section: "warnings", id }); };

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2"><ShieldAlert size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
          <Button onClick={() => setShowForm((s) => !s)} size="sm" className="gap-1.5"><Plus size={14} />{t.add}</Button>
        </div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={13} />{t.preNote(preparer.name)}</div>}
        {showForm && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1"><Label className={lbl}>{t.emp}</Label><Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className={lbl}>{t.violation}</Label><Select value={form.violation_category} onValueChange={(v) => set("violation_category", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{Object.entries(VIOLATION).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className={lbl}>{t.level}</Label><Select value={form.warning_level} onValueChange={(v) => set("warning_level", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(LEVEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className={lbl}>{t.article}</Label><Input value={form.article_reference} onChange={(e) => set("article_reference", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.incident}</Label><Input type="date" value={form.incident_date} onChange={(e) => set("incident_date", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.session}</Label><Input type="date" value={form.session_date} onChange={(e) => set("session_date", e.target.value)} className={inp} /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.summary}</Label><Textarea value={form.investigation_summary} onChange={(e) => set("investigation_summary", e.target.value)} className="text-sm min-h-[50px]" /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.desc}</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="text-sm min-h-[70px]" /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.notes}</Label><Input value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inp} /></div>
            <div className="col-span-2 md:col-span-3"><Button onClick={submit} disabled={saving} size="sm" className="gap-1.5">{saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{t.submit}</Button></div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        : records.length === 0 ? <div className="p-10 text-center text-muted-foreground text-sm">{t.empty}</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-muted-foreground text-xs"><tr>
                <th className="text-right px-4 py-2.5 font-medium">{t.th}</th><th className="text-right px-4 py-2.5 font-medium">{t.thViolation}</th><th className="text-right px-4 py-2.5 font-medium">{t.thLevel}</th><th className="text-right px-4 py-2.5 font-medium">{t.thDate}</th><th className="text-right px-4 py-2.5 font-medium">{t.thBy}</th><th className="text-right px-4 py-2.5 font-medium">{t.thActions}</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{r.employee_name}</td>
                    <td className="px-4 py-2.5">{VIOLATION[r.violation_category] || r.violation_category}</td>
                    <td className="px-4 py-2.5"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", LEVEL_CLS[r.warning_level])}>{LEVEL[r.warning_level]}</span></td>
                    <td className="px-4 py-2.5 tabular-nums">{r.incident_date || "—"}</td>
                    <td className="px-4 py-2.5 text-[11px] text-violet-700">{r.prepared_by_name ? `${r.prepared_by_name}${r.prepared_by_id ? ` — ${r.prepared_by_id}` : ""}` : "—"}</td>
                    <td className="px-4 py-2.5"><button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}