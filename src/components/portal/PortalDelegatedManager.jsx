import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// مكوّن عام للأقسام المُفوّضة في بوابة الموظف — إنشاء/تعديل حالة/حذف + عمود «أُعدّت بواسطة».
// كل قسم مُعرّف في SECTIONS بحقول وأعمدة وعناصر enum، ويُمرّر له section من البوابة.
const OPT = (o, v) => (o && o[v] ? o[v] : v);

const SECTIONS = {
  decisions: {
    icon: "ScrollText", titleAr: "القرارات الإدارية", titleEn: "Administrative decisions",
    numberField: "decision_number", numberPrefix: "DEC",
    nameField: "created_by_name", idField: "created_by_id",
    fields: [
      { k: "title", ar: "العنوان *", type: "text", req: true, col: 2 },
      { k: "decision_type", ar: "النوع", type: "select", options: { appointment: "تعيين", transfer: "نقل", promotion: "ترقية", assignment: "تكليف", secondment: "إعارة", exemption: "إعفاء", reward: "مكافأة", deduction: "خصم", warning: "إنذار", termination: "إنهاء", policy: "سياسة", other: "أخرى" }, col: 1 },
      { k: "body", ar: "نص القرار", type: "textarea", col: 3 },
      { k: "target", ar: "النطاق", type: "select", options: { all: "الجميع", department: "إدارة", employee: "موظف" }, col: 1 },
      { k: "department", ar: "الإدارة", type: "text", showWhen: { target: "department" }, col: 1 },
      { k: "employee_id", ar: "الموظف", type: "employee", showWhen: { target: "employee" }, resolve: ["employee_name", "employee_user_id"], col: 1 },
      { k: "issued_date", ar: "تاريخ الإصدار", type: "date", col: 1 },
      { k: "effective_date", ar: "تاريخ النفاذ", type: "date", col: 1 },
      { k: "status", ar: "الحالة", type: "status", options: { draft: "مسودة", issued: "صادر", archived: "مؤرشف" }, col: 1 },
    ],
    columns: [
      { k: "title", ar: "العنوان" },
      { k: "decision_type", ar: "النوع", options: { appointment: "تعيين", transfer: "نقل", promotion: "ترقية", assignment: "تكليف", secondment: "إعارة", exemption: "إعفاء", reward: "مكافأة", deduction: "خصم", warning: "إنذار", termination: "إنهاء", policy: "سياسة", other: "أخرى" } },
      { k: "issued_date", ar: "الإصدار" },
      { k: "status", ar: "الحالة", options: { draft: "مسودة", issued: "صادر", archived: "مؤرشف" } },
    ],
  },
  performance: {
    icon: "Target", titleAr: "تقييم الأداء", titleEn: "Performance",
    nameField: "prepared_by_name", idField: "prepared_by_id",
    fields: [
      { k: "employee_id", ar: "الموظف *", type: "employee", req: true, resolve: ["employee_name", "department"], col: 1 },
      { k: "review_period", ar: "فترة التقييم", type: "select", options: { Q1: "Q1", Q2: "Q2", Q3: "Q3", annual: "سنوي", midyear: "نصف سنوي", probation: "فترة التجربة" }, col: 1 },
      { k: "period_year", ar: "السنة", type: "number", default: new Date().getFullYear(), col: 1 },
      { k: "review_type", ar: "نوع المراجعة", type: "select", options: { annual: "سنوي", midyear: "نصف سنوي", probation: "تجربة", goal_setting: "تحديد أهداف" }, col: 1 },
      { k: "goals_rating", ar: "تقييم الأهداف (1-5)", type: "number", col: 1 },
      { k: "competencies_rating", ar: "تقييم الكفاءات (1-5)", type: "number", col: 1 },
      { k: "values_rating", ar: "تقييم القيم (1-5)", type: "number", col: 1 },
      { k: "overall_rating", ar: "التقييم الكلي (1-5)", type: "number", col: 1 },
      { k: "recommendation", ar: "التوصية", type: "select", options: { none: "لا شيء", maintain: "إبقاء", promote: "ترقية", bonus: "مكافأة", warn: "إنذار", terminate: "إنهاء" }, col: 1 },
      { k: "review_date", ar: "تاريخ التقييم", type: "date", col: 1 },
      { k: "goals", ar: "الأهداف والمخرجات", type: "textarea", col: 3 },
      { k: "strengths", ar: "نقاط القوة", type: "textarea", col: 2 },
      { k: "improvements", ar: "فرص التحسين", type: "textarea", col: 2 },
      { k: "status", ar: "الحالة", type: "status", options: { draft: "مسودة", submitted: "مُقدّم", acknowledged: "مُطّلع", completed: "مكتمل" }, col: 1 },
    ],
    columns: [
      { k: "employee_name", ar: "الموظف" },
      { k: "review_period", ar: "الفترة", options: { Q1: "Q1", Q2: "Q2", Q3: "Q3", annual: "سنوي", midyear: "نصف سنوي", probation: "تجربة" } },
      { k: "period_year", ar: "السنة" },
      { k: "overall_rating", ar: "الكلي" },
      { k: "recommendation", ar: "التوصية", options: { none: "لا شيء", maintain: "إبقاء", promote: "ترقية", bonus: "مكافأة", warn: "إنذار", terminate: "إنهاء" } },
      { k: "status", ar: "الحالة", options: { draft: "مسودة", submitted: "مُقدّم", acknowledged: "مُطّلع", completed: "مكتمل" } },
    ],
  },
  succession: {
    icon: "Network", titleAr: "خطة الإحلال", titleEn: "Succession",
    nameField: "prepared_by_name", idField: "prepared_by_id",
    fields: [
      { k: "position_title", ar: "المسمى الوظيفي *", type: "text", req: true, col: 2 },
      { k: "department", ar: "الإدارة", type: "text", col: 1 },
      { k: "current_holder_id", ar: "الشاغل الحالي", type: "employee", resolve: ["current_holder_name"], col: 1 },
      { k: "position_status", ar: "حالة المركز", type: "select", options: { active: "نشط", at_risk: "معرض لمخطر", leaving: "مغادر", vacant: "شاغر" }, col: 1 },
      { k: "successor_id", ar: "المرشح البديل", type: "employee", resolve: ["successor_name"], col: 1 },
      { k: "readiness_level", ar: "مستوى الجاهزية", type: "select", options: { ready_now: "جاهز الآن", ready_1_2_years: "جاهز 1-2 سنة", ready_3_5_years: "جاهز 3-5 سنة", development_needed: "يحتاج تطوير" }, col: 1 },
      { k: "risk_of_loss", ar: "خطر المغادرة", type: "select", options: { low: "منخفض", medium: "متوسط", high: "عالي" }, col: 1 },
      { k: "impact_of_loss", ar: "أثر المغادرة", type: "select", options: { low: "منخفض", medium: "متوسط", high: "عالي" }, col: 1 },
      { k: "development_deadline", ar: "موعد التطوير", type: "date", col: 1 },
      { k: "development_plan", ar: "خطة التطوير", type: "textarea", col: 3 },
      { k: "notes", ar: "ملاحظات", type: "textarea", col: 2 },
    ],
    columns: [
      { k: "position_title", ar: "المسمى" },
      { k: "department", ar: "الإدارة" },
      { k: "successor_name", ar: "المرشح البديل" },
      { k: "readiness_level", ar: "الجاهزية", options: { ready_now: "جاهز الآن", ready_1_2_years: "1-2 سنة", ready_3_5_years: "3-5 سنة", development_needed: "يحتاج تطوير" } },
      { k: "position_status", ar: "حالة المركز", options: { active: "نشط", at_risk: "معرض لمخطر", leaving: "مغادر", vacant: "شاغر" } },
    ],
  },
  "exit-interviews": {
    icon: "MessageSquare", titleAr: "مقابلات الخروج", titleEn: "Exit interviews",
    nameField: "prepared_by_name", idField: "prepared_by_id",
    fields: [
      { k: "employee_id", ar: "الموظف *", type: "employee", req: true, resolve: ["employee_name", "department", "position"], col: 1 },
      { k: "exit_type", ar: "نوع المغادرة", type: "select", options: { resignation: "استقالة", employer_termination: "إنهاء من صاحب العمل", end_of_contract: "انتهاء عقد", dismissal_for_cause: "فصل تأديبي", retirement: "تقاعد", other: "أخرى" }, col: 1 },
      { k: "last_working_date", ar: "آخر يوم عمل", type: "date", col: 1 },
      { k: "interview_date", ar: "تاريخ المقابلة", type: "date", col: 1 },
      { k: "interviewer_name", ar: "اسم المقابل", type: "text", col: 1 },
      { k: "primary_reason", ar: "السبب الرئيسي", type: "select", options: { salary: "الراتب", benefits: "المزايا", work_environment: "بيئة العمل", management: "الإدارة", career_growth: "النمو الوظيفي", work_life_balance: "توازن العمل/الحياة", relocation: "انتقال", personal: "شخصي", company_culture: "ثقافة الشركة", other: "أخرى" }, col: 1 },
      { k: "would_rejoin", ar: "هل يعود للعمل", type: "select", options: { yes: "نعم", no: "لا", maybe: "ربما" }, col: 1 },
      { k: "reason_details", ar: "تفاصيل الأسباب", type: "textarea", col: 2 },
      { k: "constructive_feedback", ar: "ملاحظات للتحسين", type: "textarea", col: 3 },
      { k: "status", ar: "الحالة", type: "status", options: { scheduled: "مجدول", completed: "مكتمل", cancelled: "ملغي" }, col: 1 },
    ],
    columns: [
      { k: "employee_name", ar: "الموظف" },
      { k: "exit_type", ar: "النوع", options: { resignation: "استقالة", employer_termination: "إنهاء", end_of_contract: "انتهاء عقد", dismissal_for_cause: "فصل", retirement: "تقاعد", other: "أخرى" } },
      { k: "primary_reason", ar: "السبب", options: { salary: "الراتب", benefits: "المزايا", work_environment: "بيئة العمل", management: "الإدارة", career_growth: "النمو", work_life_balance: "التوازن", relocation: "انتقال", personal: "شخصي", company_culture: "الثقافة", other: "أخرى" } },
      { k: "interview_date", ar: "المقابلة" },
      { k: "status", ar: "الحالة", options: { scheduled: "مجدول", completed: "مكتمل", cancelled: "ملغي" } },
    ],
  },
  surveys: {
    icon: "ClipboardList", titleAr: "استبيانات الموظفين", titleEn: "Surveys",
    nameField: "prepared_by_name", idField: "prepared_by_id",
    fields: [
      { k: "title", ar: "عنوان الاستبيان *", type: "text", req: true, col: 2 },
      { k: "type", ar: "النوع", type: "select", options: { engagement: "مشاركة", exit: "مغادرة", onboarding: "تهيئة", pulse: "نبض" }, col: 1 },
      { k: "description", ar: "الوصف", type: "textarea", col: 3 },
      { k: "questions", ar: "الأسئلة (JSON)", type: "textarea", col: 3, ph: '[{"q":"...","type":"rating"}]' },
      { k: "is_anonymous", ar: "استبيان مجهّل", type: "boolean", col: 1 },
      { k: "target_department", ar: "الإدارة المستهدفة", type: "text", col: 1 },
      { k: "start_date", ar: "تاريخ البدء", type: "date", col: 1 },
      { k: "end_date", ar: "تاريخ الانتهاء", type: "date", col: 1 },
      { k: "status", ar: "الحالة", type: "status", options: { draft: "مسودة", active: "نشط", closed: "مغلق" }, col: 1 },
    ],
    columns: [
      { k: "title", ar: "العنوان" },
      { k: "type", ar: "النوع", options: { engagement: "مشاركة", exit: "مغادرة", onboarding: "تهيئة", pulse: "نبض" } },
      { k: "start_date", ar: "البدء" },
      { k: "end_date", ar: "الانتهاء" },
      { k: "responses_count", ar: "الردود" },
      { k: "status", ar: "الحالة", options: { draft: "مسودة", active: "نشط", closed: "مغلق" } },
    ],
  },
  licenses: {
    icon: "FileBadge", titleAr: "تراخيص المنشأة", titleEn: "Licenses",
    nameField: "prepared_by_name", idField: "prepared_by_id",
    fields: [
      { k: "license_type", ar: "نوع الترخيص *", type: "select", req: true, options: { cr: "سجل تجاري", municipality: "بلدية", civil_defense: "الدفاع المدني", industrial: "صناعي", modon: "مدن", sfda: "الغذاء والدواء", medical: "طبي", veterinary: "بيطري", safety_maintenance: "صيانة السلامة", labor: "العمل", gosi: "التأمينات", transport: "النقل", tourism: "السياحة", other: "أخرى" }, col: 1 },
      { k: "custom_label", ar: "اسم مخصص", type: "text", col: 2 },
      { k: "license_number", ar: "رقم الترخيص", type: "text", col: 1 },
      { k: "issuing_authority", ar: "الجهة المانحة", type: "text", col: 1 },
      { k: "issue_date", ar: "تاريخ الإصدار", type: "date", col: 1 },
      { k: "expiry_date", ar: "تاريخ الانتهاء", type: "date", col: 1 },
      { k: "duration_months", ar: "المدة (أشهر)", type: "number", col: 1 },
      { k: "not_applicable", ar: "لا ينطبق على المنشأة", type: "boolean", col: 1 },
      { k: "notes", ar: "ملاحظات", type: "textarea", col: 2 },
    ],
    columns: [
      { k: "_label", ar: "الترخيص" },
      { k: "license_number", ar: "الرقم" },
      { k: "issuing_authority", ar: "الجهة" },
      { k: "expiry_date", ar: "الانتهاء" },
    ],
  },
};

const ICONS = { ScrollText: ShieldCheck, Target: ShieldCheck, Network: ShieldCheck, MessageSquare: ShieldCheck, ClipboardList: ShieldCheck, FileBadge: ShieldCheck };

export default function PortalDelegatedManager({ section, session, isAr = true }) {
  const cfg = SECTIONS[section];
  const args = { token: session.token, employee_id: session.employee_id };
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [preparer, setPreparer] = useState({ name: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const emptyForm = useCallback(() => {
    const f = {};
    (cfg?.fields || []).forEach((fld) => { f[fld.k] = fld.default !== undefined ? fld.default : (fld.type === "number" ? 0 : fld.type === "boolean" ? false : ""); });
    return f;
  }, [cfg]);
  const [form, setForm] = useState({});
  useEffect(() => { if (cfg) setForm(emptyForm()); }, [cfg, emptyForm]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const invoke = async (action, extra = {}) => { const res = await base44.functions.invoke("portalData", { ...args, action, ...extra }); return res?.data || res; };
  const load = useCallback(async () => {
    if (!cfg) return;
    setLoading(true);
    try { const d = await invoke("delegated_list", { section }); if (!d?.ok) return; setRecords(d.records || []); setEmployees(d.employees || []); setPreparer(d.preparer || { name: "", id: "" }); }
    finally { setLoading(false); }
  }, [cfg]);
  useEffect(() => { load(); }, [load]);

  if (!cfg) return null;
  const Icon = ICONS[cfg.icon] || ShieldCheck;
  const t = (k, ar, en) => isAr ? ar : en;

  const empName = (id) => employees.find((e) => e.id === id)?.full_name || "";

  const submit = async () => {
    const reqFld = (cfg.fields || []).find((f) => f.req && !form[f.k]);
    if (reqFld) return;
    setSaving(true);
    try {
      const payload = { ...form };
      (cfg.fields || []).forEach((f) => {
        if (f.type === "number") payload[f.k] = Number(form[f.k]) || 0;
        if (f.type === "employee" && f.resolve && form[f.k]) {
          const emp = employees.find((e) => e.id === form[f.k]);
          if (emp) f.resolve.forEach((rk) => { if (rk === "employee_name") payload.employee_name = emp.full_name; else if (rk === "employee_user_id") payload.employee_user_id = emp.user_id || ""; else if (rk === "department") payload.department = emp.department || ""; else if (rk === "position") payload.position = emp.position || ""; else if (rk === "current_holder_name") payload.current_holder_name = emp.full_name; else if (rk === "successor_name") payload.successor_name = emp.full_name; });
        }
      });
      const d = await invoke("delegated_create", { section, payload });
      if (d?.ok) { setRecords((r) => [d.record, ...r]); setForm(emptyForm()); setShowForm(false); }
    } finally { setSaving(false); }
  };

  const changeStatus = async (id, val) => {
    const statusField = (cfg.fields || []).find((f) => f.type === "status");
    if (!statusField) return;
    setRecords((r) => r.map((x) => (x.id === id ? { ...x, [statusField.k]: val } : x)));
    await invoke("delegated_update", { section, id, payload: { [statusField.k]: val } });
  };
  const remove = async (id) => { if (!confirm(isAr ? "حذف؟" : "Delete?")) return; setRecords((r) => r.filter((x) => x.id !== id)); await invoke("delegated_delete", { section, id }); };

  const statusField = (cfg.fields || []).find((f) => f.type === "status");
  const byCell = (r) => { const n = r[cfg.nameField], id = r[cfg.idField]; return n ? `${n}${id ? ` — ${id}` : ""}` : "—"; };
  const colVal = (r, c) => {
    if (c.k === "_label") return r.custom_label || OPT(c.options, r.license_type);
    if (c.options) return OPT(c.options, r[c.k]);
    return r[c.k] ?? "—";
  };

  const inp = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";
  const lbl = "text-[11px] font-medium text-muted-foreground mb-1";
  const showField = (f) => !f.showWhen || form[f.showWhen.target ? Object.keys(f.showWhen)[0] : ""] === Object.values(f.showWhen)[0];
  const visibleFields = (cfg.fields || []).filter(showField);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2"><Icon size={18} className="text-violet-600" /><h3 className="font-bold text-sm">{isAr ? cfg.titleAr : cfg.titleEn}</h3></div>
          <Button onClick={() => setShowForm((s) => !s)} size="sm" className="gap-1.5"><Plus size={14} />{isAr ? "إضافة" : "Add"}</Button>
        </div>
        {preparer.name && <div className="text-[11px] text-violet-700 flex items-center gap-1.5 mb-2"><ShieldCheck size={13} />{isAr ? `كل سجل تُنشئه هنا يُوثّق باسمك (${preparer.name}).` : `Every record is attributed to you (${preparer.name}).`}</div>}
        {showForm && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-3">
            {visibleFields.map((f) => {
              const colCls = f.col === 3 ? "col-span-2 md:col-span-3" : f.col === 2 ? "col-span-2" : "";
              return (
                <div key={f.k} className={colCls}>
                  <Label className={lbl}>{f.ar}</Label>
                  {f.type === "text" && <Input value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} className={inp} placeholder={f.ph} />}
                  {f.type === "number" && <Input type="number" value={form[f.k] ?? 0} onChange={(e) => set(f.k, e.target.value)} className={inp} />}
                  {f.type === "date" && <Input type="date" value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} className={inp} />}
                  {f.type === "boolean" && <label className="flex items-center gap-2 text-xs mt-1"><input type="checkbox" checked={!!form[f.k]} onChange={(e) => set(f.k, e.target.checked)} className="rounded" />{isAr ? "نعم" : "Yes"}</label>}
                  {f.type === "textarea" && <Textarea value={form[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} className="text-sm min-h-[60px]" placeholder={f.ph} />}
                  {f.type === "select" && (
                    <Select value={form[f.k] || ""} onValueChange={(v) => set(f.k, v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{Object.entries(f.options).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
                  )}
                  {f.type === "status" && (
                    <Select value={form[f.k] || ""} onValueChange={(v) => set(f.k, v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{Object.entries(f.options).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
                  )}
                  {f.type === "employee" && (
                    <Select value={form[f.k] || ""} onValueChange={(v) => set(f.k, v)}><SelectTrigger className={cn(inp, "w-full")}><SelectValue placeholder="—" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent></Select>
                  )}
                </div>
              );
            })}
            <div className="col-span-2 md:col-span-3"><Button onClick={submit} disabled={saving} size="sm" className="gap-1.5">{saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}{isAr ? "حفظ" : "Save"}</Button></div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2 text-sm"><Loader2 className="animate-spin" size={16} />{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        : records.length === 0 ? <div className="p-10 text-center text-muted-foreground text-sm">{isAr ? "لا توجد سجلات بعد" : "No records yet"}</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-muted-foreground text-xs"><tr>
                {cfg.columns.map((c) => <th key={c.k} className="text-right px-4 py-2.5 font-medium">{c.ar}</th>)}
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "أُعدّت بواسطة" : "Prepared by"}</th>
                <th className="text-right px-4 py-2.5 font-medium">{isAr ? "إجراءات" : "Actions"}</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    {cfg.columns.map((c) => {
                      const v = colVal(r, c);
                      return (
                        <td key={c.k} className="px-4 py-2.5">
                          {statusField && c.k === statusField.k ? (
                            <select value={r[statusField.k]} onChange={(e) => changeStatus(r.id, e.target.value)} className="text-[11px] rounded-md border border-border px-2 py-1 bg-transparent">
                              {Object.entries(statusField.options).map(([k, val]) => <option key={k} value={k}>{val}</option>)}
                            </select>
                          ) : <span className={cn(c.k === "expiry_date" && r.expiry_date && new Date(r.expiry_date) < new Date() && "text-rose-600 font-medium")}>{v}</span>}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-[11px] text-violet-700">{byCell(r)}</td>
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