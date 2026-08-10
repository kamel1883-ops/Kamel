import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { Clock, Ban, Loader2 } from "lucide-react";

const iso = (d) => d.toISOString().slice(0, 10);
function addDays(dateStr, n) {
  const base = dateStr ? new Date(dateStr) : new Date();
  base.setDate(base.getDate() + Number(n));
  return iso(base);
}

// يتيح للمالك: (١) تمديد فترة التجربة بعدد أيام اختياري، (٢) إلغاء التجربة.
// عند التمديد يُعاد ضبط بلاغ انتهاء التجربة ليُرسل مجدداً للتاريخ الجديد.
export default function TrialManageDialog({ open, onClose, tenant, onSaved }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState("");

  const f = isAr ? {
    title: (n) => `إدارة فترة التجربة — ${n}`,
    desc: "تمديد فترة التجربة أو إلغاؤها لهذا العميل.",
    current: "نهاية التجربة الحالية",
    days: "عدد أيام التمديد",
    extend: "تمديد التجربة",
    extendHint: "ستُضاف الأيام إلى تاريخ نهاية التجربة الحالي.",
    cancel: "إلغاء التجربة",
    cancelConfirm: "تأكيد إلغاء فترة التجربة لهذا العميل؟",
    cancelHint: "سيتم إلغاء فترة التجربة وإيقاف الحساب. يمكن إعادة التفعيل لاحقاً عبر «تفعيل مباشر».",
    close: "إغلاق",
  } : {
    title: (n) => `Manage trial — ${n}`,
    desc: "Extend or cancel the trial period for this client.",
    current: "Current trial end",
    days: "Days to extend",
    extend: "Extend trial",
    extendHint: "Days will be added to the current trial end date.",
    cancel: "Cancel trial",
    cancelConfirm: "Cancel the trial period for this client?",
    cancelHint: "Trial will be cancelled and the account suspended. You can reactivate later via direct activation.",
    close: "Close",
  };

  const extend = async () => {
    if (!tenant) return;
    setBusy("ext");
    try {
      const n = Math.max(1, Number(days) || 0);
      const newEnd = addDays(tenant.trial_end, n);
      await base44.entities.Tenant.update(tenant.id, {
        trial_end: newEnd,
        status: "trial",
        plan: "trial",
        trial_reminder_sent: false,
      });
      onSaved?.();
      onClose();
    } finally { setBusy(""); }
  };

  const cancelT = async () => {
    if (!tenant) return;
    if (!window.confirm(f.cancelConfirm)) return;
    setBusy("cancel");
    try {
      await base44.entities.Tenant.update(tenant.id, { status: "cancelled", plan: "none" });
      onSaved?.();
      onClose();
    } finally { setBusy(""); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{f.title(tenant?.name)}</DialogTitle>
          <DialogDescription>{f.desc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{f.current}</Label>
            <div className="rounded-md border border-border bg-slate-50 px-3 py-2" dir="ltr">{tenant?.trial_end || "—"}</div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{f.days}</Label>
            <Input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
            <div className="text-xs text-muted-foreground">{f.extendHint}</div>
          </div>
          <Button onClick={extend} disabled={busy === "ext" || !days} className="gap-1.5 w-full">
            {busy === "ext" ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />} {f.extend}
          </Button>
          <div className="pt-3 border-t border-border space-y-2">
            <Button onClick={cancelT} disabled={busy === "cancel"} variant="ghost" className="gap-1.5 w-full text-rose-600 hover:bg-rose-50">
              {busy === "cancel" ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />} {f.cancel}
            </Button>
            <div className="text-xs text-muted-foreground">{f.cancelHint}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>{f.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}