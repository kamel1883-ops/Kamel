import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { KeyRound, Loader2, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MigrateAccountDialog({ open, onClose, onSaved, tenant, isAr }) {
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const { toast } = useToast();

  const f = isAr ? {
    title: (n) => `نقل حساب المنشأة — ${n}`,
    desc: "استخدم هذه الأداة عندما يفقد العميل الوصول إلى بريده المسجّل. سيتم تحويل كل بيانات المنشأة (الموظفون، الحضور، الرواتب، التراخيص...) إلى الحساب الجديد وإرسال دعوة تسجيل للبريد الجديد.",
    current: "البريد الحالي", newEmail: "البريد الجديد", newPh: "new.company@email.com",
    warn: "تنبيه: تأكد من البريد الجديد قبل التأكيد — سيُعتمد لإدارة المنصة لاحقاً.",
    cancel: "إلغاء", confirm: "نقل الحساب",
    succ: "تم نقل الحساب بنجاح", moved: "عدد السجلات المنقولة",
    invalid: "أدخل بريداً صحيحاً",
  } : {
    title: (n) => `Transfer account — ${n}`,
    desc: "Use this tool when a client loses access to their registered email. All the organization's data (employees, attendance, payroll, licenses…) will be reassigned to the new account and an invitation sent to the new email.",
    current: "Current email", newEmail: "New email", newPh: "new.company@email.com",
    warn: "Caution: verify the new email before confirming — it will manage the platform from now on.",
    cancel: "Cancel", confirm: "Transfer account",
    succ: "Account transferred successfully", moved: "Records reassigned",
    invalid: "Enter a valid email",
  };

  const submit = async () => {
    setErr("");
    const email = newEmail.trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr(f.invalid); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("migrateTenantAccount", { tenant_id: tenant.id, new_email: email });
      setResult(res?.data || res);
      toast({ title: f.succ });
      onSaved?.();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Error");
    } finally { setSaving(false); }
  };

  const close = () => { setNewEmail(""); setResult(null); setErr(""); onClose(); };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound size={16} /> {f.title(tenant?.name)}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-1">{f.desc}</p>

        <div className="space-y-3 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">{f.current}</Label>
            <div className="font-medium break-all mt-0.5" dir="ltr">{tenant?.contact_email || "—"}</div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{f.newEmail}</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={f.newPh} dir="ltr" />
          </div>
          <div className="text-xs flex gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{f.warn}</span>
          </div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{err}</div>}
          {result && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2">
              <Check size={16} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{f.succ}</div>
                <div className="text-xs text-emerald-600 mt-0.5" dir="ltr">{f.moved}: {result.records_moved ?? 0} — {result.new_email}</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={saving}>{f.cancel}</Button>
          <Button onClick={submit} disabled={saving || !newEmail.trim()} className="gap-1.5">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} {f.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}