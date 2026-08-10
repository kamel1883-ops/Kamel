import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Download, Upload, FileSpreadsheet, Loader2, BadgeCheck, AlertTriangle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

const TEMPLATE_HEADERS = [
  "الاسم الكامل", "الرقم الوظيفي", "الهوية الوطنية / رقم الإقامة", "البريد الإلكتروني",
  "الجنسية", "سعودي (نعم/لا)", "الجنس (ذكر/أنثى)", "تاريخ الميلاد", "رقم الجوال", "العنوان",
  "جهة اتصال طوارئ", "الإدارة / القسم", "الفرع", "المسمى الوظيفي", "الدرجة الوظيفية",
  "المستوى الوظيفي (owner/executive/manager/supervisor/employee/worker)", "تاريخ المباشرة",
  "أيام الإجازات المستخدمة سابقاً",
  "نوع العقد (دوام كامل/جزئي/عقد)", "تاريخ بدء العقد", "تاريخ نهاية العقد",
  "الراتب الأساسي", "بدل السكن", "بدل المواصلات",
  "بدلات أخرى", "تاريخ انتهاء الإقامة", "رقم الجواز", "تاريخ انتهاء الجواز",
  "رقم التأمين الطبي", "تاريخ انتهاء التأمين الطبي", "الحساب البنكي",
  "الرقم الوظيفي للمدير المباشر",
];

export default function EmployeeImport({ open, onClose, onSaved }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "استيراد الموظفين عبر Excel",
    desc: "حمّل القالب، عبّئ بيانات موظفيك (مع تحديد الفرع لكل موظف)، ثم ارفع الملف لاستيرادهم دفعة واحدة. تُحلّ الفروع تلقائياً — وإذا لم يكن لديك إلا الفرع الرئيسي يُسجَّل الجميع عليه تلقائياً. رصيد الإجازات المستحق والمتبقي يُحسبان تلقائياً من تاريخ المباشرة وسياسة الشركة؛ املأ عمود «أيام الإجازات المستخدمة سابقاً» للإجازات التي استُنفدت قبل النظام (للشركات التي لديها سجل سابق).",
    download: "تحميل قالب Excel (CSV)",
    upload: "اختر ملف Excel/CSV",
    importing: "جارٍ الاستيراد…",
    import: "استيراد الآن",
    close: "إغلاق",
    supported: "صيغ مدعومة: CSV / Excel (xlsx) — يجب أن تحتوي الأعمدة على نفس حقول القالب.",
    result: "نتيجة الاستيراد",
    total: "الإجمالي", created: "تمت الإضافة", duplicate: "مكرر (تم تخطيه)", failed: "صفوف ناقصة",
    managersLinked: "مدير مباشر مُربوط",
    errGeneric: "تعذّر قراءة الملف، تأكد من تطابق الأعمدة مع القالب",
  } : {
    title: "Import Employees via Excel",
    desc: "Download the template, fill your staff data (set the branch per employee), then upload to import in one batch. Branches auto-resolve; if you only have the main branch everyone is assigned to it automatically. Leave entitlement and remaining balance are auto-computed from the hire date and company policy; fill the 'Prior leave days used' column for leave consumed before this system (for companies with prior history).",
    download: "Download Excel template (CSV)",
    upload: "Choose an Excel/CSV file",
    importing: "Importing…",
    import: "Import now",
    close: "Close",
    supported: "Supported formats: CSV / Excel (xlsx) — columns must match the template.",
    result: "Import result",
    total: "Total", created: "Created", duplicate: "Duplicates (skipped)", failed: "Incomplete rows",
    managersLinked: "Managers linked",
    errGeneric: "Could not read the file, make sure columns match the template",
  };

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const reset = () => { setFile(null); setBusy(false); setResult(null); setErr(""); };

  const handleClose = () => { reset(); onClose(); };

  const downloadTemplate = async () => {
    setDlBusy(true);
    let mainName = "الفرع الرئيسي";
    try {
      const branches = await base44.entities.Branch.list("-is_main", 500);
      const main = branches.find((b) => b.is_main) || branches[0];
      if (main) mainName = main.name;
    } catch (_) {}
    setDlBusy(false);

    const branchIndex = TEMPLATE_HEADERS.indexOf("الفرع");
    const sample = [
      "محمد عبدالله", "1001", "1234567890", "mohammed@company.sa", "سعودي", "نعم", "ذكر",
      "1990-01-15", "0551234567", "الرياض", "0550000000", "المبيعات", mainName, "مندوب مبيعات",
      "الثالثة", "employee", "2023-03-01", "10", "دوام كامل", "2023-03-01", "2024-03-01",
      "8000", "1000", "500", "0",
      "2027-05-01", "X1234567", "2030-01-01", "INS12345", "2026-12-31", "SA00001234",
      "1000",
    ];
    const bom = "\uFEFF";
    const lines = [TEMPLATE_HEADERS, sample, TEMPLATE_HEADERS.map(() => "")];
    const csv = bom + lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isAr ? "قالب_موظفي_جدارة.csv" : "jadara_employees_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const run = async () => {
    if (!file) return;
    setBusy(true); setErr(""); setResult(null);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("importEmployees", { file_url: up.file_url });
      const data = res?.data || res;
      if (data?.error) { setErr(data.error); return; }
      setResult(data);
      if (onSaved) onSaved();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) handleClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileSpreadsheet size={18} /> {t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <div className="text-sm font-medium text-violet-700 mb-2">{t.download}</div>
            <Button type="button" variant="outline" onClick={downloadTemplate} disabled={dlBusy} className="gap-2">
              {dlBusy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {t.download}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">{t.supported}</p>
          </div>

          <div className="rounded-2xl border border-border p-4 space-y-3">
            <Label>{t.upload}</Label>
            <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-violet-400 hover:bg-violet-50/40 transition px-4 py-6">
              <Upload size={18} className="text-violet-600" />
              <span className="text-sm text-muted-foreground">{file ? file.name : t.upload}</span>
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>

            {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm"><BadgeCheck size={16} /> {t.result}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <Metric label={t.total} value={result.total} />
                  <Metric label={t.created} value={result.created} tone="emerald" />
                  <Metric label={t.duplicate} value={result.duplicate} tone="amber" />
                  <Metric label={t.failed} value={result.failed} tone="rose" />
                  {result.managers_linked > 0 && <Metric label={t.managersLinked} value={result.managers_linked} tone="violet" />}
                </div>
                {result.failed > 0 && (
                  <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 rounded-lg p-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{isAr ? `${result.failed} صف لم تُستورد لنقص حقول إلزامية (الرقم الوظيفي/الإدارة/المسمى/تاريخ التعيين/الراتب الأساسي).` : `${result.failed} rows skipped — missing required fields (employee number/department/title/hire date/base salary).`}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} disabled={busy}>{t.close}</Button>
              <Button type="button" onClick={run} disabled={!file || busy} className="gap-2 min-w-[140px]">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {busy ? t.importing : t.import}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value, tone }) {
  const cls = tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : tone === "rose" ? "text-rose-700" : tone === "violet" ? "text-violet-700" : "text-foreground";
  return (
    <div className="rounded-lg bg-white border border-border px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${cls}`}>{value ?? 0}</div>
    </div>
  );
}