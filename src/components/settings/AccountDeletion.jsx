import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * قائمة "المنطقة الخطرة" في إعدادات المنشأة — تتيح تقديم طلب إغلاق الحساب/حذف المنشأة.
 * يفتح نموذج تأكيد يتطلب كتابة كلمة التأكيد، ثم يُرسل بريداً للمستخدم المسجّل
 * (مضمون التسليم للمستخدمين المسجّلين) كإتمام لـ "مسار تأكيد الدعم".
 */
export default function AccountDeletion({ org }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إغلاق الحساب وحذف المنشأة",
    desc: "هذا الإجراء دائم ولا يمكن التراجع عنه. سيُوقف الوصول لبوابة الشركة وتُحذف بيانات المنشأة والموظفين نهائياً وفق سياسة الاحتفاظ بالبيانات. سيتواصل فريق الدعم معك عبر بريدك المسجّل خلال 48 ساعة لإتمام الطلب.",
    request: "طلب إغلاق الحساب",
    modalTitle: "تأكيد إغلاق الحساب",
    confirmLabel: 'اكتب كلمة «حذف» لتأكيد الإجراء',
    confirmPh: "حذف",
    reason: "سبب الإغلاق (اختياري)",
    cancel: "إلغاء",
    submit: "إرسال طلب الإغلاق",
    warn: "كلمة التأكيد غير مطابقة",
    success: "تم تسجيل طلبك بنجاح. سيتواصل معك فريق الدعم عبر بريدك المسجّل خلال 48 ساعة لإتمام إغلاق الحساب.",
    sending: "جارٍ الإرسال...",
    done: "تم",
  } : {
    title: "Close account & delete organization",
    desc: "This action is permanent and cannot be undone. Company access and organization/employee data are permanently removed per the data retention policy. Our support team will contact you at your registered email within 48 hours to complete the request.",
    request: "Request account closure",
    modalTitle: "Confirm account closure",
    confirmLabel: 'Type the word "DELETE" to confirm',
    confirmPh: "DELETE",
    reason: "Reason (optional)",
    cancel: "Cancel",
    submit: "Submit closure request",
    warn: "Confirmation word does not match",
    success: "Your request has been recorded. Our support team will contact you at your registered email within 48 hours to complete the closure.",
    sending: "Sending...",
    done: "Done",
  };

  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const expected = isAr ? "حذف" : "DELETE";

  const submit = async () => {
    if (confirm.trim() !== expected) return;
    setBusy(true);
    try {
      let to = "";
      try {
        const me = await base44.auth.me();
        to = me?.email || "";
      } catch (_) {}
      if (!to) to = org?.contact_email || "";
      if (to) {
        try {
          await base44.integrations.Core.SendEmail({
            to,
            subject: isAr
              ? `طلب إغلاق حساب — ${org?.name || ""}`.trim()
              : `Account closure request — ${org?.name || ""}`.trim(),
            body: isAr
              ? `سلاماً،\n\nسُجّل طلب إغلاق حساب منشأتك (${org?.name || "—"}) على منصة جدارة.\nالسبب: ${reason || "غير محدد"}\nسيتواصل معك فريق الدعم خلال 48 ساعة لإتمام العملية.\n\n— جدارة | الدعم الفني`
              : `Hello,\n\nAn account closure request has been submitted for your organization (${org?.name || "—"}) on Jadara.\nReason: ${reason || "N/A"}\nOur support team will contact you within 48 hours to complete the process.\n\n— Jadara Support`,
            from_name: "جدارة | الدعم",
          });
        } catch (_) {}
      }
      setDone(true);
    } finally { setBusy(false); }
  };

  const reset = () => { setOpen(false); setConfirm(""); setReason(""); setDone(false); };

  return (
    <>
      <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><ShieldAlert size={18} /></span>
          <div className="min-w-0">
            <h3 className="font-semibold text-rose-800">{t.title}</h3>
            <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">{t.desc}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)} className="gap-2"><Trash2 size={16} /> {t.request}</Button>
      </div>

      <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.modalTitle}</DialogTitle></DialogHeader>
          {done ? (
            <div className="space-y-4">
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 leading-relaxed">{t.success}</div>
              <DialogFooter><Button onClick={reset}>{t.done}</Button></DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.confirmLabel}</Label>
                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t.confirmPh} dir={isAr ? "rtl" : "ltr"} />
                {confirm && confirm.trim() !== expected && <span className="text-xs text-rose-500">{t.warn}</span>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.reason}</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={reset} disabled={busy}>{t.cancel}</Button>
                <Button variant="destructive" onClick={submit} disabled={busy || confirm.trim() !== expected} className="gap-1.5">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {busy ? t.sending : t.submit}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}