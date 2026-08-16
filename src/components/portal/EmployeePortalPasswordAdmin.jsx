import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// لوحة إدارة كلمة مرور بوابة الموظف — تظهر داخل ملف الموظف في شاشة «الموظفين» للإدارة.
// تتيح: تعيين كلمة مرور جديدة (تفعّل الدخول بالكلمة)، أو تعطيل البوابة (إلزام إعادة التسجيل).
export default function EmployeePortalPasswordAdmin({ employee }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "بوابة الموظف الذاتية",
    enabled: "مُفعّلة — يَدخل الموظف برقم الإقامة وكلمة مرور",
    disabled: "غير مُفعّلة — الموظف لم ينشئ دخوله بعد",
    setBtn: "تعيين كلمة مرور",
    disableBtn: "تعطيل البوابة",
    newPwd: "كلمة المرور الجديدة (6 أحرف فأكثر)",
    confirm: "تأكيد كلمة المرور",
    save: "حفظ وتفعيل",
    cancel: "إلغاء",
    weak: "كلمة المرور ضعيفة — 6 أحرف على الأقل.",
    mismatch: "كلمتا المرور غير متطابقتين.",
    okSet: "تم تعيين كلمة مرور الموظف بنجاح. أبلغه بها وضعافياً.",
    okDisable: "تم تعطيل بوابة الموظف. سيحتاج لإعادة التسجيل عند الدخول التالي.",
    fail: "تعذّر تنفيذ العملية. حاول مرة أخرى.",
    disableConfirm: "سيُلغى دخول الموظف الحالي ويلتزم بإعادة التسجيل. متابعة؟",
    hint: "أبلغ الموظف بكلمة المرور شفهياً أو هاتفياً — لا تُرسَل عبر النظام.",
  } : {
    title: "Employee Self-Service Portal",
    enabled: "Active — employee signs in with Iqama + password",
    disabled: "Not active — employee hasn't set up sign-in yet",
    setBtn: "Set password",
    disableBtn: "Disable portal",
    newPwd: "New password (at least 6 chars)",
    confirm: "Confirm password",
    save: "Save & activate",
    cancel: "Cancel",
    weak: "Password too weak — at least 6 characters.",
    mismatch: "Passwords do not match.",
    okSet: "Employee password set. Tell them verbally.",
    okDisable: "Portal disabled. Employee must re-register next sign-in.",
    fail: "Could not complete. Try again.",
    disableConfirm: "This cancels the employee's sign-in and requires re-registration. Continue?",
    hint: "Tell the employee the password verbally — it is not sent through the system.",
  };

  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  if (!employee) return null;
  const enabled = !!employee.portal_password_enabled;

  const submit = async (e) => {
    e.preventDefault();
    if (pwd.length < 6) { setMsg({ type: "err", text: t.weak }); return; }
    if (pwd !== confirm) { setMsg({ type: "err", text: t.mismatch }); return; }
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      const res = await base44.functions.invoke("adminResetEmployeePassword", {
        employee_id: employee.id, action: "set", new_password: pwd,
      });
      const data = res?.data || res;
      if (data?.ok) {
        setMsg({ type: "ok", text: t.okSet });
        setPwd(""); setConfirm(""); setOpen(false);
      } else {
        setMsg({ type: "err", text: data?.error || t.fail });
      }
    } catch (err) {
      setMsg({ type: "err", text: err?.message || t.fail });
    } finally { setBusy(false); }
  };

  const disable = async () => {
    if (!window.confirm(t.disableConfirm)) return;
    setBusy(true); setMsg({ type: "", text: "" });
    try {
      const res = await base44.functions.invoke("adminResetEmployeePassword", {
        employee_id: employee.id, action: "disable",
      });
      const data = res?.data || res;
      if (data?.ok) setMsg({ type: "ok", text: t.okDisable });
      else setMsg({ type: "err", text: data?.error || t.fail });
    } catch (err) {
      setMsg({ type: "err", text: err?.message || t.fail });
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound size={16} className="text-violet-600" />
        <div className="text-xs font-bold text-muted-foreground">{t.title}</div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
          enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200")}>
          {enabled ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
          {enabled ? t.enabled : t.disabled}
        </span>
      </div>

      {msg.text && (
        <div className={cn("mb-3 text-sm rounded-lg p-2.5 leading-relaxed",
          msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>{msg.text}</div>
      )}

      {!open ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={busy} className="gap-2">
            <KeyRound size={14} /> {t.setBtn}
          </Button>
          <Button size="sm" variant="ghost" onClick={disable} disabled={busy || !enabled} className="gap-2 text-rose-600 hover:bg-rose-50">
            <ShieldOff size={14} /> {t.disableBtn}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t.newPwd}</Label>
            <Input type="text" dir="ltr" value={pwd} onChange={(e) => setPwd(e.target.value)} required disabled={busy} placeholder="••••••" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t.confirm}</Label>
            <Input type="text" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={busy} placeholder="••••••" />
          </div>
          <div className="text-xs text-muted-foreground">{t.hint}</div>
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={busy} className="gap-2">
              {busy && <Loader2 size={14} className="animate-spin" />} {t.save}
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => { setOpen(false); setPwd(""); setConfirm(""); }} disabled={busy}>
              {t.cancel}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}