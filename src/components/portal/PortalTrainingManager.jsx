import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";

const STATUS = {
  draft: { ar: "مسودة", cls: "bg-slate-100 text-slate-700" },
  in_progress: { ar: "قيد التنفيذ", cls: "bg-blue-100 text-blue-700" },
  completed: { ar: "مكتملة", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { ar: "ملغاة", cls: "bg-rose-100 text-rose-700" },
};

// وحدة التدريب والتطوير في بوابة الموظف — للموظف المُفوّض بصلاحية «التدريب».
// يُنشئ خططًا تدريبية ويديرها، وتُوثّق كل خطة باسم وهوية المُعِدّ.
export default function PortalTrainingManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const t = isAr ? {
    title: "التدريب والتطوير", add: "إضافة خطة تدريبية", list: "الخطط",
    fName: "اسم الخطة *", scope: "النطاق", emp: "الموظف", dept: "الإدارة",
    def: "مشاكل النقص", goal: "الهدف", mech: "آلية التنفيذ", cost: "التكلفة",
    start: "تاريخ البداية", end: "تاريخ النهاية", status: "الحالة",
    submit: "حفظ الخطة", empty: "لا توجد خطط بعد",
    th: "الخطة", thScope: "النطاق", thTarget: "المستهدف", thCost: "التكلفة", thStatus: "الحالة", thBy: "أُعدّت بواسطة", thActions: "إجراءات",
    preNote: (n) => `كل خطة تُنشئها هنا تُوثّق باسمك (${n}).`,
    scopes: { employee: "موظف", department: "إدارة" },
  } : {
    title: "Training & development", add: "Add training plan", list: "Plans",
    fName: "Plan name *", scope: "Scope", emp: "Employee", dept: "Department",
    def: "Deficiencies", goal: "Goal", mech: "Mechanism", cost: "Cost",
    start: "Start date", end: "End date", status: "Status",
    submit: "Save plan", empty: "No plans yet",
    th: "Plan", thScope: "Scope", thTarget: "Target", thCost: "Cost", thStatus: "Status", thBy: "Prepared by", thActions: "Actions",
    preNote: (n) => `Every plan is attributed to you (${n}).`,
    scopes: { employee: "Employee", department: "Department" },
  };

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", scope: "employee", employee_id: "", department: "",
    deficiency: "", goal: "", mechanism: "", cost: 0,
    start_date: new Date().toISOString().slice(0, 10), end_date: "", status: "draft",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const invoke = async (action, extra = {}) => {
    const res = await base44.functions.invoke("portalData", { ...args, action, ...extra });
    return res?.data || res;
  };
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await invoke("delegated_list", { section: "training" });
      if (!d?.ok) return;
      setRecords(d.records || []); setEmployees(d.employees || []); setPreparer(d.preparer || { name: "", id: "" });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const empName = (id) => employees.find((e) => e.id === id)?.full_name || "";

  const submit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, cost: Number(form.cost) || 0 };
      if (form.scope === "employee") { payload.employee_name = empName(form.employee_id); payload.department = ""; }
      else { payload.employee_id = ""; payload.employee_name = ""; }
      const d = await invoke("delegated_create", { section: "training", payload });
      if (d?.ok) { setRecords((r) => [d.record, ...r]); setForm((f) => ({ ...f, title: "", deficiency: "", goal: "", mechanism: "" })); setShowForm(false); }
    } finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => {
    setRecords((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    await invoke("delegated_update", { section: "training", id, payload: { status } });
  };
  const remove = async (id) => {
    if (!confirm(isAr ? "حذف الخطة؟" : "Delete plan?")) return;
    setRecords((r) => r.filter((x) => x.id !== id));
    await invoke("delegated_delete", { section: "training", id });
  };

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2"><GraduationCap size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
          <Button onClick={() => setShowForm((s) => !s)} size="sm" className="gap-1.5"><Plus size={14} />{t.add}</Button>
        </div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={13} />{t.preNote(preparer.name)}</div>}
        {showForm && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2"><Label className={lbl}>{t.fName}</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.scope}</Label>
              <Select value={form.scope} onValueChange={(v) => set("scope", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="employee">{t.scopes.employee}</SelectItem><SelectItem value="department">{t.scopes.department}</SelectItem></SelectContent></Select>
            </div>
            {form.scope === "employee" ? (
              <div><Label className={lbl}>{t.emp}</Label>
                <Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent></Select>
              </div>
            ) : (
              <div><Label className={lbl}>{t.dept}</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} className={inp} /></div>
            )}
            <div className="col-span-2 md:col-span-1"><Label className={lbl}>{t.cost}</Label><Input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.start}</Label><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.end}</Label><Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} className={inp} /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.def}</Label><Textarea value={form.deficiency} onChange={(e) => set("deficiency", e.target.value)} className="text-sm min-h-[60px]" /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.goal}</Label><Textarea value={form.goal} onChange={(e) => set("goal", e.target.value)} className="text-sm min-h-[60px]" /></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.mech}</Label><Textarea value={form.mechanism} onChange={(e) => set("mechanism", e.target.value)} className="text-sm min-h-[60px]" /></div>
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
                <th className="text-right px-4 py-2.5 font-medium">{t.th}</th><th className="text-right px-4 py-2.5 font-medium">{t.thScope}</th>
                <th className="text-right px-4 py-2.5 font-medium">{t.thTarget}</th><th className="text-right px-4 py-2.5 font-medium">{t.thCost}</th>
                <th className="text-right px-4 py-2.5 font-medium">{t.thStatus}</th><th className="text-right px-4 py-2.5 font-medium">{t.thBy}</th><th className="text-right px-4 py-2.5 font-medium">{t.thActions}</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{r.title}</td>
                    <td className="px-4 py-2.5">{t.scopes[r.scope]}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.scope === "employee" ? r.employee_name : r.department}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.cost ? formatCurrency(r.cost) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)} className="text-[11px] rounded-md border border-border px-2 py-1 bg-transparent">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.ar}</option>)}
                      </select>
                    </td>
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