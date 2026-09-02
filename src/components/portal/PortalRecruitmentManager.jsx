import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import AppointmentLetterDoc from "@/components/docs/AppointmentLetterDoc";

// وحدة التوظيف في بوابة الموظف — للموظف المُفوّض بصلاحية «التوظيف».
// يُضيف موظفين جددًا يظهرون في لوحة الإدارة مع نسبتهم لمُوظّفهم،
// وقرار التعيين يحمل توقيع «أُعدّت بواسطة [الموظف المُفوّض] — [هويته]».
export default function PortalRecruitmentManager({ session, isAr = true }) {
  const args = { token: session.token, employee_id: session.employee_id };
  const t = isAr ? {
    title: "التوظيف والاستقطاب", add: "إضافة موظف جديد", adding: "جارٍ الإضافة...",
    myHires: "الموظفون الذين وظّفتهم",
    preNote: (n) => `أي موظف تُضيفه هنا سيظهر لدى الإدارة منسوبًا إليك (${n})، وقرار التعيين يُوقّع باسمك.`,
    fName: "الاسم الكامل *", natId: "الهوية/الإقامة", nat: "الجنسية", saudi: "سعودي",
    gender: "الجنس", male: "ذكر", female: "أنثى", phone: "الجوال", email: "البريد",
    dept: "الإدارة *", pos: "المسمى الوظيفي *", level: "المستوى",
    hire: "تاريخ المباشرة *", contract: "نوع العقد", full: "دوام كامل", part: "دوام جزئي", ccontract: "عقد محدد",
    base: "الراتب الأساسي *", housing: "بدل السكن", transport: "بدل المواصلات", other: "بدلات أخرى",
    method: "طريقة الصرف", mudad: "مدد", cash: "كاش",
    submit: "حفظ وتوظيف", reset: "تفريغ",
    letter: "قرار التعيين", empty: "لم تُضف أي موظف بعد",
    th: "الموظف", thPos: "المسمى", thDept: "الإدارة", thDate: "تاريخ المباشرة", thSalary: "الإجمالي", thActions: "إجراءات",
    success: "تمت إضافة الموظف بنجاح ومنسوب إليك.",
    levels: { owner: "مالك", executive: "تنفيذي", manager: "مدير", supervisor: "مشرف", employee: "موظف", worker: "عامل" },
  } : {
    title: "Recruitment", add: "Add new employee", adding: "Adding...",
    myHires: "Employees you hired",
    preNote: (n) => `Any employee added here appears in the admin portal attributed to you (${n}), appointment letter signed with your name.`,
    fName: "Full name *", natId: "National ID", nat: "Nationality", saudi: "Saudi",
    gender: "Gender", male: "Male", female: "Female", phone: "Phone", email: "Email",
    dept: "Department *", pos: "Position *", level: "Level",
    hire: "Hire date *", contract: "Contract type", full: "Full-time", part: "Part-time", ccontract: "Fixed-term",
    base: "Base salary *", housing: "Housing", transport: "Transport", other: "Other",
    method: "Payment method", mudad: "Mudad", cash: "Cash",
    submit: "Save & hire", reset: "Reset",
    letter: "Appointment letter", empty: "No hires yet",
    th: "Employee", thPos: "Position", thDept: "Dept", thDate: "Hire date", thSalary: "Gross", thActions: "Actions",
    success: "Employee added and attributed to you.",
    levels: { owner: "Owner", executive: "Executive", manager: "Manager", supervisor: "Supervisor", employee: "Employee", worker: "Worker" },
  };

  const [hires, setHires] = useState([]);
  const [org, setOrg] = useState(null);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printTarget, setPrintTarget] = useState(null);
  const [form, setForm] = useState({
    full_name: "", national_id: "", nationality: "", is_saudi: false, gender: "male",
    phone: "", email: "", department: "", position: "", role_level: "employee",
    hire_date: new Date().toISOString().slice(0, 10), contract_type: "full_time",
    base_salary: "", housing_allowance: 0, transport_allowance: 0, other_allowances: 0,
    salary_payment_method: "mudad",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const invoke = async (action, extra = {}) => {
    const res = await base44.functions.invoke("portalData", { ...args, action, ...extra });
    return res?.data || res;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await invoke("recruitment_hires_mine");
      if (!d?.ok) return;
      setHires(d.hires || []); setOrg(d.org || null);
      setPreparer({ name: d.preparer?.hired_by_name || "", id: d.preparer?.hired_by_employee_id || "" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.full_name || !form.department || !form.position || !form.hire_date || !form.base_salary) return;
    setSaving(true);
    try {
      const d = await invoke("recruitment_create", {
        ...form,
        base_salary: Number(form.base_salary) || 0,
        housing_allowance: Number(form.housing_allowance) || 0,
        transport_allowance: Number(form.transport_allowance) || 0,
        other_allowances: Number(form.other_allowances) || 0,
      });
      if (d?.ok) {
        setHires((h) => [d.employee, ...h]);
        setForm((f) => ({ ...f, full_name: "", national_id: "", phone: "", email: "", position: "", base_salary: "" }));
        alert(t.success);
      }
    } finally { setSaving(false); }
  };

  const doPrint = (emp) => { setPrintTarget(emp); setTimeout(() => window.print(), 80); };
  const gross = (e) => (Number(e.base_salary) || 0) + (Number(e.housing_allowance) || 0) + (Number(e.transport_allowance) || 0) + (Number(e.other_allowances) || 0);

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-1"><UserPlus size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{t.title}</h3></div>
        {preparer.name && (
          <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] text-violet-800 flex items-center gap-1.5">
            <ShieldCheck size={13} />{t.preNote(preparer.name)}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="col-span-2 md:col-span-1"><Label className={lbl}>{t.fName}</Label><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.natId}</Label><Input value={form.national_id} onChange={(e) => set("national_id", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.nat}</Label><Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.gender}</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="male">{t.male}</SelectItem><SelectItem value="female">{t.female}</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className={lbl}>{t.phone}</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.email}</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.dept}</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.pos}</Label><Input value={form.position} onChange={(e) => set("position", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.level}</Label>
            <Select value={form.role_level} onValueChange={(v) => set("role_level", v)}>
              <SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(t.levels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className={lbl}>{t.hire}</Label><Input type="date" value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.contract}</Label>
            <Select value={form.contract_type} onValueChange={(v) => set("contract_type", v)}>
              <SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="full_time">{t.full}</SelectItem><SelectItem value="part_time">{t.part}</SelectItem><SelectItem value="contract">{t.ccontract}</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className={lbl}>{t.method}</Label>
            <Select value={form.salary_payment_method} onValueChange={(v) => set("salary_payment_method", v)}>
              <SelectTrigger className={cn(inp, "w-full")}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mudad">{t.mudad}</SelectItem><SelectItem value="cash">{t.cash}</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className={lbl}>{t.base}</Label><Input type="number" value={form.base_salary} onChange={(e) => set("base_salary", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.housing}</Label><Input type="number" value={form.housing_allowance} onChange={(e) => set("housing_allowance", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.transport}</Label><Input type="number" value={form.transport_allowance} onChange={(e) => set("transport_allowance", e.target.value)} className={inp} /></div>
          <div><Label className={lbl}>{t.other}</Label><Input type="number" value={form.other_allowances} onChange={(e) => set("other_allowances", e.target.value)} className={inp} /></div>
          <div className="col-span-2 md:col-span-1 flex items-end gap-2">
            <Button onClick={submit} disabled={saving} size="sm" className="gap-1.5">{saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{saving ? t.adding : t.submit}</Button>
            <Button onClick={() => setForm((f) => ({ ...f, full_name: "", national_id: "", phone: "", email: "", position: "", base_salary: "" }))} size="sm" variant="outline">{t.reset}</Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2"><FileText size={16} className="text-violet-600" /><h3 className="font-bold text-sm">{t.myHires}</h3><span className="text-xs text-muted-foreground">({hires.length})</span></div>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : hires.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">{t.empty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right px-4 py-2.5 font-medium">{t.th}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t.thPos}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t.thDept}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t.thDate}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t.thSalary}</th>
                  <th className="text-right px-4 py-2.5 font-medium">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hires.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium">{e.full_name}</td>
                    <td className="px-4 py-2.5">{e.position}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.department}</td>
                    <td className="px-4 py-2.5 tabular-nums">{e.hire_date}</td>
                    <td className="px-4 py-2.5 tabular-nums font-medium">{formatCurrency(gross(e))}</td>
                    <td className="px-4 py-2.5"><Button onClick={() => doPrint(e)} size="sm" variant="outline" className="gap-1.5"><FileText size={13} />{t.letter}</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {printTarget && (
        <div className="print-appointment hidden print:block" aria-hidden>
          <AppointmentLetterDoc
            applicant={{ full_name: printTarget.full_name, hired_date: printTarget.hire_date }}
            job={{ title: printTarget.position, department: printTarget.department, job_type: printTarget.contract_type, salary: gross(printTarget) }}
            org={org}
            preparedBy={{ name: preparer.name, id: preparer.id }}
          />
        </div>
      )}
    </div>
  );
}