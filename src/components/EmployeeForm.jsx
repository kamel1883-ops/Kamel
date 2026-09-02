import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSION_MODULES, parsePermissions, togglePermission, allPermissionKeys } from "@/lib/employeePermissions";
import { useI18n } from "@/lib/i18n";
import { managerCandidates, ROLE_LABELS, ROLE_ORDER } from "@/lib/orgTree";
import EmployeeLeaveLoanSummary from "@/components/EmployeeLeaveLoanSummary";
import JobDescPrintActions from "@/components/docs/JobDescPrintActions";

const empty = {
  full_name: "",
  employee_number: "", national_id: "", email: "", gender: "male", is_saudi: false,
  birth_date: "", phone: "",
  department: "", branch_id: "", branch_name: "", position: "", job_grade: "", role_level: "employee", hire_date: "",
  contract_type: "full_time", contract_start_date: "", contract_end_date: "", status: "active",
  termination_reason: "none", termination_date: "", manager_id: "",
  is_approver_manager: false, is_approver_finance: false, is_approver_hr: false,
  base_salary: 0, housing_allowance: 0, transport_allowance: 0, other_allowances: 0,
  salary_payment_method: "mudad",
  avatar_url: "",
  iqama_expiry: "", passport_number: "", passport_expiry: "",
  health_insurance_expiry: "",
  bank_account: "", ticket_entitlement: "yearly", ticket_last_used_year: null, ticket_value: "",
  annual_leave_entitlement: 21,
  unified_number: "",
  job_description: "",
  permissions: "",
};

export default function EmployeeForm({ open, onClose, onSaved, employee, unifiedNumber }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    edit: "تعديل بيانات الموظف", add: "إضافة موظف جديد",
    fullName: "الاسم الكامل", empNo: "الرقم الوظيفي",
    natIdSaudi: "الهوية الوطنية", natIdExpat: "رقم الإقامة",
    email: "بريد العمل (لربط الحساب)", gender: "الجنس", male: "ذكر", female: "أنثى",
    birth: "تاريخ الميلاد", phone: "رقم الجوال", dept: "الإدارة", branch: "الفرع", noBranch: "بدون فرع", position: "المسمى الوظيفي", jobGrade: "الدرجة الوظيفية", hireDate: "تاريخ المباشرة (ثابت — مرجع نهاية الخدمة والإجازات)", contractStart: "تاريخ بدء العقد", contractEnd: "تاريخ نهاية العقد",
    contract: "نوع العقد", full: "دوام كامل", part: "دوام جزئي", cont: "عقد",
    status: "الحالة الوظيفية", active: "على رأس العمل", onLeave: "في إجازة", terminated: "منهي", resigned: "مستقيل",
    base: "الراتب الأساسي (ريال)", housing: "بدل السكن", transport: "بدل المواصلات", other: "بدلات أخرى",
    saudi: "سعودي؟", saudiY: "سعودي", saudiN: "مقيم", iqama: "انتهاء الإقامة/الهوية",
    passNo: "رقم الجواز", passExp: "انتهاء الجواز", medExp: "انتهاء التأمين الطبي",
    ticket: "استحقاق التذاكر", ticketValue: "قيمة التذكرة (ريال — مفتوحة)", yearly: "سنوي", biennial: "كل سنتين", none: "بدون", bank: "الحساب البنكي",
    annualLeaveEnt: "رصيد الإجازات السنوي (يحدده الموارد البشرية)", d21: "21 يوم", d30: "30 يوم",
    roleLevel: "المستوى الوظيفي", directManager: "المدير المباشر", noManager: "بدون (قمة الهيكل)",
    approverManager: "معتمد إجازات (مدير مباشر)", approverFinance: "معتمد مالي (صرف)", approverHr: "معتمد موارد بشرية (سلف وانتدابات)",
    deptHint: "اختر من الإدارات الموجودة أو اكتب إدارة جديدة",
    payMethod: "طريقة صرف الراتب", payMudad: "مدد — حماية الأجور", payCash: "كاش — صرف نقدي",
    cancel: "إلغاء", save: "حفظ",
    jobDesc: "الوصف الوظيفي", jobDescHint: "المهام والمسؤوليات والمؤهلات المطلوبة للدور",
    genJobDesc: "توليد بالذكاء الاصطناعي", genJobDescing: "جارٍ التوليد...",
    perms: "مصفوفة الصلاحيات (وصول الوحدات)", permsHint: "توثيقية — تسجّل الوحدات التي يحق للموظف فتحها دون منع فعلي",
    permsAll: "تحديد الكل", permsNone: "إلغاء الكل", permsCount: (n) => `${n} وحدة مُفعّلة`,
  } : {
    edit: "Edit employee", add: "Add new employee",
    fullName: "Full name", empNo: "Employee number",
    natIdSaudi: "National ID", natIdExpat: "Iqama number",
    email: "Work email (account linking)", gender: "Gender", male: "Male", female: "Female",
    birth: "Birth date", phone: "Phone", dept: "Department", branch: "Branch", noBranch: "No branch", position: "Job title", jobGrade: "Job grade", hireDate: "Commencement date (fixed — EOS & leave reference)", contractStart: "Contract start date", contractEnd: "Contract end date",
    contract: "Contract type", full: "Full-time", part: "Part-time", cont: "Contract",
    status: "Employment status", active: "Active", onLeave: "On leave", terminated: "Terminated", resigned: "Resigned",
    base: "Base salary (SAR)", housing: "Housing allowance", transport: "Transport allowance", other: "Other allowances",
    saudi: "Saudi?", saudiY: "Saudi", saudiN: "Expat", iqama: "Iqama/ID expiry",
    passNo: "Passport number", passExp: "Passport expiry", medExp: "Insurance expiry",
    ticket: "Ticket entitlement", ticketValue: "Ticket value (SAR — open)", yearly: "Yearly", biennial: "Biennial", none: "None", bank: "Bank account",
    annualLeaveEnt: "Annual leave entitlement (set by HR)", d21: "21 days", d30: "30 days",
    roleLevel: "Role level", directManager: "Direct manager", noManager: "None (org top)",
    approverManager: "Leave approver (direct manager)", approverFinance: "Finance approver (payment)", approverHr: "HR approver (loans & trips)",
    deptHint: "Pick from existing departments or type a new one",
    payMethod: "Salary payment method", payMudad: "Mudad — WPS", payCash: "Cash",
    cancel: "Cancel", save: "Save",
    jobDesc: "Job description", jobDescHint: "Tasks, responsibilities and required qualifications for the role",
    genJobDesc: "Generate with AI", genJobDescing: "Generating...",
    perms: "Permissions matrix (module access)", permsHint: "Descriptive — records modules the employee may open, no actual enforcement",
    permsAll: "Select all", permsNone: "Clear all", permsCount: (n) => `${n} modules enabled`,
  };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => { setForm(employee ? { ...empty, ...employee } : empty); }, [employee, open]);
  useEffect(() => {
    base44.entities.Employee.list("-created_date", 500).then((list) => setAllEmployees(list));
    base44.entities.Branch.list("-is_main", 500).then((list) => setBranches(list));
  }, [open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // توليد الوصف الوظيفي بالذكاء الاصطناعي من المسمى/الإدارة/المستوى، قابل للتعديل بعد التوليد
  const generateJobDesc = async () => {
    setGenerating(true);
    try {
      const role = ROLE_LABELS[isAr ? "ar" : "en"][form.role_level] || form.role_level || "";
      const prompt = isAr
        ? `اكتب وصفاً وظيفياً احترافياً ومفصلاً باللغة العربية لموظف يشغل المسمى الوظيفي "${form.position || role}" في إدارة "${form.department || "غير محددة"}" بمستوى وظيفي "${role}". ` +
          `يتضمن: ملخصاً موجزاً للدور، ثم المهام والمسؤوليات الرئيسية (٦ إلى ٨ نقاط واضحة)، ثم المؤهلات والمهارات المطلوبة، ثم المهارات المرغوبة، ثم الجهات التي يتعامل معها داخل وخارج المنشأة. ` +
          `اكتب النص مباشرة دون مقدمات، واستخدم نقاطاً مرقمة واضحة، واجعله جاهزاً للتعديل.`
        : `Write a professional, detailed job description for an employee holding the job title "${form.position || role}" in the "${form.department || "unspecified"}" department at "${role}" role level. ` +
          `Include: a brief role summary, main duties and responsibilities (6 to 8 clear points), required qualifications and skills, desirable skills, and internal/external contacts. ` +
          `Write the text directly with no preamble, use clear numbered bullet points, make it ready to edit.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = typeof res === "string" ? res : (res?.response || res?.text || "");
      if (text && String(text).trim()) set("job_description", String(text).trim());
    } finally { setGenerating(false); }
  };

  const departments = Array.from(new Set(allEmployees.map((e) => e.department).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ar"));
  const managers = managerCandidates(allEmployees, employee?.id);
  const managerLabel = (m) => `${m.full_name || m.position || m.employee_number}${m.department ? ` — ${m.department}` : ""}${m.role_level ? ` (${ROLE_LABELS[isAr ? "ar" : "en"][m.role_level]})` : ""}`;

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, base_salary: Number(form.base_salary) || 0, housing_allowance: Number(form.housing_allowance) || 0, transport_allowance: Number(form.transport_allowance) || 0, other_allowances: Number(form.other_allowances) || 0, ticket_value: Number(form.ticket_value) || 0 };
      // ربط دائم بالرقم الموحّد للمنشأة — يبقى الموظف مربوطاً بالعميل حتى لو حُذف الحساب
      if (!employee && unifiedNumber && !payload.unified_number) payload.unified_number = String(unifiedNumber).trim();
      if (employee) await base44.entities.Employee.update(employee.id, payload);
      else await base44.entities.Employee.create(payload);
      onSaved?.(); onClose?.();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{employee ? t.edit : t.add}</DialogTitle></DialogHeader>
        {employee?.id && (
          <div className="mb-3 max-h-64 overflow-y-auto p-3 rounded-xl bg-slate-50/60 border border-border">
            <EmployeeLeaveLoanSummary employee={employee} />
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.fullName}><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder={isAr ? "مثال: محمد عبدالله" : "e.g. Mohammed Alharbi"} /></Field>
            <Field label={t.empNo}><Input value={form.employee_number} onChange={(e) => set("employee_number", e.target.value)} required /></Field>
            <Field label={form.is_saudi ? t.natIdSaudi : t.natIdExpat}><Input value={form.national_id} onChange={(e) => set("national_id", e.target.value)} /></Field>
            <Field label={t.email}><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={isAr ? "name@company.sa" : "name@company.sa"} /></Field>
            <Field label={t.gender}>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">{t.male}</SelectItem><SelectItem value="female">{t.female}</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={t.birth}><Input type="date" lang={isAr ? "ar" : "en"} value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} /></Field>
            <Field label={t.phone}><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label={t.dept}>
              <Input value={form.department} onChange={(e) => set("department", e.target.value)} required placeholder={t.deptHint} list="dept-options" />
              <datalist id="dept-options">{departments.map((d) => <option key={d} value={d} />)}</datalist>
            </Field>
            <Field label={t.branch}>
              <Select value={form.branch_id || "none"} onValueChange={(v) => {
                const b = branches.find((x) => x.id === v);
                set("branch_id", v === "none" ? "" : v);
                set("branch_name", v === "none" ? "" : (b?.name || ""));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noBranch}</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}{b.is_main ? ` (${isAr ? "رئيسي" : "main"})` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.position}><Input value={form.position} onChange={(e) => set("position", e.target.value)} required /></Field>
            <Field label={t.roleLevel}>
              <Select value={form.role_level || "employee"} onValueChange={(v) => set("role_level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_ORDER.filter((r) => r !== "owner").map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[isAr ? "ar" : "en"][r]}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t.jobGrade}><Input value={form.job_grade} onChange={(e) => set("job_grade", e.target.value)} /></Field>
            <Field label={t.hireDate}><Input type="date" lang={isAr ? "ar" : "en"} value={form.hire_date} onChange={(e) => set("hire_date", e.target.value)} required /></Field>
            <Field label={t.annualLeaveEnt}>
              <Select value={String(form.annual_leave_entitlement === 30 ? 30 : 21)} onValueChange={(v) => set("annual_leave_entitlement", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="21">{t.d21}</SelectItem>
                  <SelectItem value="30">{t.d30}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.contractStart}><Input type="date" lang={isAr ? "ar" : "en"} value={form.contract_start_date} onChange={(e) => set("contract_start_date", e.target.value)} /></Field>
            <Field label={t.contractEnd}><Input type="date" lang={isAr ? "ar" : "en"} value={form.contract_end_date} onChange={(e) => set("contract_end_date", e.target.value)} /></Field>
            <Field label={t.directManager}>
              <Select value={form.manager_id || "none"} onValueChange={(v) => set("manager_id", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.noManager}</SelectItem>
                  {managers.map((m) => <SelectItem key={m.id} value={m.id}>{managerLabel(m)}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.approverManager}>
              <label className="flex items-center gap-2 h-9"><input type="checkbox" checked={!!form.is_approver_manager} onChange={(e) => set("is_approver_manager", e.target.checked)} className="w-4 h-4 accent-violet-600" /> <span className="text-sm">{isAr ? "تفعيل صلاحية اعتماد إجازات مرؤوسيه" : "Enable leave approval rights"}</span></label>
            </Field>
            <Field label={t.approverFinance}>
              <label className="flex items-center gap-2 h-9"><input type="checkbox" checked={!!form.is_approver_finance} onChange={(e) => set("is_approver_finance", e.target.checked)} className="w-4 h-4 accent-violet-600" /> <span className="text-sm">{isAr ? "تفعيل صلاحية الصرف المالي" : "Enable finance payment rights"}</span></label>
            </Field>
            <Field label={t.approverHr}>
              <label className="flex items-center gap-2 h-9"><input type="checkbox" checked={!!form.is_approver_hr} onChange={(e) => set("is_approver_hr", e.target.checked)} className="w-4 h-4 accent-violet-600" /> <span className="text-sm">{isAr ? "تفعيل صلاحية اعتماد الموارد البشرية (سلف وانتدابات)" : "Enable HR approval rights (loans & trips)"}</span></label>
            </Field>
            <Field label={t.contract}>
              <Select value={form.contract_type} onValueChange={(v) => set("contract_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="full_time">{t.full}</SelectItem><SelectItem value="part_time">{t.part}</SelectItem><SelectItem value="contract">{t.cont}</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={t.status}>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">{t.active}</SelectItem><SelectItem value="on_leave">{t.onLeave}</SelectItem><SelectItem value="terminated">{t.terminated}</SelectItem><SelectItem value="resigned">{t.resigned}</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={t.base}><Input type="number" value={form.base_salary} onChange={(e) => set("base_salary", e.target.value)} required /></Field>
            <Field label={t.housing}><Input type="number" value={form.housing_allowance} onChange={(e) => set("housing_allowance", e.target.value)} /></Field>
            <Field label={t.transport}><Input type="number" value={form.transport_allowance} onChange={(e) => set("transport_allowance", e.target.value)} /></Field>
            <Field label={t.other}><Input type="number" value={form.other_allowances} onChange={(e) => set("other_allowances", e.target.value)} /></Field>
            <Field label={t.payMethod}>
              <Select value={form.salary_payment_method || "mudad"} onValueChange={(v) => set("salary_payment_method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="mudad">{t.payMudad}</SelectItem><SelectItem value="cash">{t.payCash}</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <Field label={t.saudi}>
              <Select value={form.is_saudi ? "true" : "false"} onValueChange={(v) => set("is_saudi", v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="true">{t.saudiY}</SelectItem><SelectItem value="false">{t.saudiN}</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={t.iqama}><Input type="date" lang={isAr ? "ar" : "en"} value={form.iqama_expiry} onChange={(e) => set("iqama_expiry", e.target.value)} /></Field>
            <Field label={t.passNo}><Input value={form.passport_number} onChange={(e) => set("passport_number", e.target.value)} /></Field>
            <Field label={t.passExp}><Input type="date" lang={isAr ? "ar" : "en"} value={form.passport_expiry} onChange={(e) => set("passport_expiry", e.target.value)} /></Field>
            <Field label={t.medExp}><Input type="date" lang={isAr ? "ar" : "en"} value={form.health_insurance_expiry} onChange={(e) => set("health_insurance_expiry", e.target.value)} /></Field>
            <Field label={t.ticket}>
              <Select value={form.ticket_entitlement} onValueChange={(v) => set("ticket_entitlement", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="yearly">{t.yearly}</SelectItem><SelectItem value="biennial">{t.biennial}</SelectItem><SelectItem value="none">{t.none}</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label={t.ticketValue}><Input type="number" value={form.ticket_value} onChange={(e) => set("ticket_value", e.target.value)} placeholder="0" dir="ltr" /></Field>
            <Field label={t.bank}><Input value={form.bank_account} onChange={(e) => set("bank_account", e.target.value)} /></Field>
          </div>

          <div className="pt-2 border-t border-border space-y-3">
            <Field label={t.jobDesc}>
              <div className="flex items-center gap-2 mb-1.5">
                <Button type="button" variant="outline" size="sm" onClick={generateJobDesc} disabled={generating} className="gap-1.5">
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {generating ? t.genJobDescing : t.genJobDesc}
                </Button>
                <span className="text-[11px] text-muted-foreground">{isAr ? "بعد التوليد يمكنك الإضافة والحذف والتعديل بحرية" : "After generation you can add, delete and edit freely"}</span>
                <div className="ms-auto"><JobDescPrintActions employee={{ ...employee, ...form }} text={form.job_description} isAr={isAr} /></div>
              </div>
              <Textarea value={form.job_description} onChange={(e) => set("job_description", e.target.value)} rows={6} placeholder={t.jobDescHint} />
            </Field>
            <Field label={`${t.perms} · ${t.permsCount(parsePermissions(form.permissions).length)}`}>
              <div className="text-[11px] text-muted-foreground mb-1">{t.permsHint}</div>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => set("permissions", JSON.stringify(allPermissionKeys()))}>{t.permsAll}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => set("permissions", "[]")}>{t.permsNone}</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto rounded-xl border border-border p-2 bg-slate-50/40">
                {PERMISSION_MODULES.map((m) => {
                  const checked = parsePermissions(form.permissions).includes(m.key);
                  return (
                    <label key={m.key} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => set("permissions", JSON.stringify(togglePermission(form.permissions, m.key)))} className="w-3.5 h-3.5 accent-violet-600 shrink-0" />
                      <span className="truncate">{isAr ? m.ar : m.en}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{t.cancel}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 size={16} className="animate-spin ml-2" />} {t.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (<div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>);
}