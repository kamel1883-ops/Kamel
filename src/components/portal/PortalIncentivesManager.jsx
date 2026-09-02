import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";

const TYPE = { bonus: "حافز نقدي", cash_reward: "مكافأة نقدية", allowance_grant: "منح بدل", gift: "هدية", recognition: "تقدير", other: "أخرى" };
const TARGET = { all: "الجميع", department: "إدارة", employee: "موظف" };
const STATUS = { draft: { ar: "مسودة", cls: "bg-slate-100 text-slate-700" }, granted: { ar: "ممنوحة", cls: "bg-emerald-100 text-emerald-700" }, revoked: { ar: "مسحوبة", cls: "bg-rose-100 text-rose-700" } };

// وحدة الحوافز والمكافآت في بوابة الموظف — للموظف المُفوّض بصلاحية «الحوافز».
export default function PortalIncentivesManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const t = isAr ? {
    title: "الحوافز والمكافآت", add: "إضافة حافز",
    type: "النوع", titleF: "العنوان *", bodyF: "البيان", amount: "المبلغ",
    target: "النطاق", emp: "الموظف", dept: "الإدارة", date: "تاريخ المنح", payroll: "يُضمَّن مع الراتب",
    submit: "حفظ الحافز", empty: "لا توجد حوافز",
    th: "رقم", thTitle: "العنوان", thType: "النوع", thAmount: "المبلغ", thTarget: "النطاق", thStatus: "الحالة", thBy: "أصدره", thActions: "إجراءات",
    preNote: (n) => `كل حافز تُنشئه هنا يُوثّق باسمك (${n}).`,
  } : {
    title: "Incentives & rewards", add: "Add incentive",
    type: "Type", titleF: "Title *", bodyF: "Statement", amount: "Amount",
    target: "Target", emp: "Employee", dept: "Department", date: "Granted date", payroll: "Include with payroll",
    submit: "Save incentive", empty: "No incentives",
    th: "No.", thTitle: "Title", thType: "Type", thAmount: "Amount", thTarget: "Target", thStatus: "Status", thBy: "Issued by", thActions: "Actions",
    preNote: (n) => `Every incentive is attributed to you (${n}).`,
  };

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", incentive_type: "bonus", body: "", amount: 0, target: "employee",
    employee_id: "", department: "", granted_date: new Date().toISOString().slice(0, 10), status: "draft", payroll_included: false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const invoke = async (action, extra = {}) => { const res = await base44.functions.invoke("portalData", { ...args, action, ...extra }); return res?.data || res; };
  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await invoke("delegated_list", { section: "incentives" }); if (!d?.ok) return; setRecords(d.records || []); setEmployees(d.employees || []); setPreparer(d.preparer || { name: "", id: "" }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const empName = (id) => employees.find((e) => e.id === id)?.full_name || "";

  const submit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) || 0 };
      if (form.target === "employee") { payload.employee_name = empName(form.employee_id); payload.department = ""; }
      else if (form.target === "department") { payload.employee_id = ""; payload.employee_name = ""; }
      else { payload.employee_id = ""; payload.employee_name = ""; payload.department = ""; }
      const d = await invoke("delegated_create", { section: "incentives", payload });
      if (d?.ok) { setRecords((r) => [d.record, ...r]); setForm((f) => ({ ...f, title: "", body: "" })); setShowForm(false); }
    } finally { setSaving(false); }
  };
  const changeStatus = async (id, status) => { setRecords((r) => r.map((x) => (x.id === id ? { ...x, status } : x))); await invoke("delegated_update", { section: "incentives", id, payload: { status } }); };
  const remove = async (id) => { if (!confirm(isAr ? "حذف الحافز؟" : "Delete?")) return; setRecords((r) => r.filter((x) => x.id !== id)); await invoke("delegated_delete", { section: "incentives", id }); };

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2"><Gift size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
          <Button onClick={() => setShowForm((s) => !s)} size="sm" className="gap-1.5"><Plus size={14} />{t.add}</Button>
        </div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={13} />{t.preNote(preparer.name)}</div>}
        {showForm && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2"><Label className={lbl}>{t.titleF}</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.type}</Label><Select value={form.incentive_type} onValueChange={(v) => set("incentive_type", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPE).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className={lbl}>{t.amount}</Label><Input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={inp} /></div>
            <div><Label className={lbl}>{t.target}</Label><Select value={form.target} onValueChange={(v) => set("target", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TARGET).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            {form.target === "employee" ? (
              <div><Label className={lbl}>{t.emp}</Label><Select value={form.employee_id} onValueChange={(v) => set("employee_id", v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent></Select></div>
            ) : form.target === "department" ? (
              <div><Label className={lbl}>{t.dept}</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} className={inp} /></div>
            ) : null}
            <div><Label className={lbl}>{t.date}</Label><Input type="date" value={form.granted_date} onChange={(e) => set("granted_date", e.target.value)} className={inp} /></div>
            <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.payroll_included} onChange={(e) => set("payroll_included", e.target.checked)} className="rounded" />{t.payroll}</label></div>
            <div className="col-span-2 md:col-span-3"><Label className={lbl}>{t.bodyF}</Label><Textarea value={form.body} onChange={(e) => set("body", e.target.value)} className="text-sm min-h-[60px]" /></div>
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
                <th className="text-right px-4 py-2.5 font-medium">{t.th}</th><th className="text-right px-4 py-2.5 font-medium">{t.thTitle}</th><th className="text-right px-4 py-2.5 font-medium">{t.thType}</th>
                <th className="text-right px-4 py-2.5 font-medium">{t.thAmount}</th><th className="text-right px-4 py-2.5 font-medium">{t.thTarget}</th><th className="text-right px-4 py-2.5 font-medium">{t.thStatus}</th><th className="text-right px-4 py-2.5 font-medium">{t.thBy}</th><th className="text-right px-4 py-2.5 font-medium">{t.thActions}</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 tabular-nums text-xs text-muted-foreground">{r.incentive_number || "—"}</td>
                    <td className="px-4 py-2.5 font-medium">{r.title}</td>
                    <td className="px-4 py-2.5">{TYPE[r.incentive_type] || r.incentive_type}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.amount ? formatCurrency(r.amount) : "—"}</td>
                    <td className="px-4 py-2.5">{TARGET[r.target] || "—"}{r.target === "employee" && r.employee_name ? `: ${r.employee_name}` : r.target === "department" && r.department ? `: ${r.department}` : ""}</td>
                    <td className="px-4 py-2.5">
                      <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)} className="text-[11px] rounded-md border border-border px-2 py-1 bg-transparent">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.ar}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-violet-700">{r.created_by_name ? `${r.created_by_name}${r.created_by_id ? ` — ${r.created_by_id}` : ""}` : "—"}</td>
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