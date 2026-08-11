import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, CalendarPlus } from "lucide-react";

// ——— أدوات مساعدة مشتركة ———
export function daysLeft(date) {
  if (!date) return 0;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}

// حساب المالك دائم مدى الحياة — لا يُنهى ولا يُعلّق.
export function isOwnerTenant(x) {
  return /\u0627\u0644\u0645\u0627\u0644\u0643|\(owner\)/i.test(x?.name || "");
}

// رابط واتساب لمراسلة العميل بعرض السعر وبيانات التحويل واستلام إثبات التحويل.
export function waLink(t, isAr) {
  const raw = String(t.contact_phone || "").replace(/\D/g, "");
  let num = raw;
  if (num.startsWith("0")) num = "966" + num.slice(1);
  else if (num && !num.startsWith("966")) num = "966" + num;
  const amount = Number(t.quoted_amount) || 0;
  const disc = Number(t.discount_percent) || 0;
  const lines = isAr ? [
    `السلام عليكم ${t.contact_name || ""}،`,
    `نسعد بكم في منصة «جدارة» لإدارة الموارد البشرية.`,
    ``,
    `عرض السعر لمنشأتكم «${t.name}»:`,
    `• شريحة الاشتراك: ${t.pricing_tier || "—"}`,
    `• عدد الموظفين المتوقع: ${t.employee_count || 0}`,
    `• السعر السنوي للباقة: ${amount.toLocaleString()} ريال${disc > 0 ? ` (بعد خصم ${disc}%)` : ""}`,
    ``,
    `بيانات التحويل البنكي:`,
    `المستفيد: كامل الشيخ`,
    `البنك: بنك إس تي سي (STC Bank)`,
    `الآيبان: SA75780000000001285607287`,
    `رقم الحساب: 1285607287`,
    ``,
    `يرجى إجراء التحويل وإرسال إثباته هنا لتفعيل اشتراككم.`,
    `شاكرين لكم، فريق جدارة.`,
  ] : [
    `Hello ${t.contact_name || ""},`,
    `Welcome to Jadara HR Management platform.`,
    ``,
    `Annual subscription quote for «${t.name}»:`,
    `• Tier: ${t.pricing_tier || "—"}`,
    `• Expected employees: ${t.employee_count || 0}`,
    `• Annual price: ${amount.toLocaleString()} SAR${disc > 0 ? ` (after ${disc}% discount)` : ""}`,
    ``,
    `Bank transfer details:`,
    `Beneficiary: KAMEL ELSHIKH`,
    `Bank: STC Bank`,
    `IBAN: SA75780000000001285607287`,
    `Account: 1285607287`,
    ``,
    `Please transfer and send the proof here to activate your subscription.`,
  ];
  return `https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ——— تأكيد التعاقد وتفعيل الاشتراك ———
export function ActivateDialog({ open, onClose, tenant, isAr, t, onDone }) {
  const [saving, setSaving] = useState(false);
  const defaultEnd = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  };
  const [end, setEnd] = useState("");
  const [amount, setAmount] = useState("");
  useEffect(() => {
    if (open && tenant) { setEnd(defaultEnd()); setAmount(String(tenant.quoted_amount || "")); }
  }, [open, tenant]);

  const submit = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      await onDone({
        subscription_end: end,
        amount: Number(amount) || 0,
      });
      onClose();
    } catch (e) {
      // الخطأ يُرفع ليعالجه المُستدعي
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isAr ? "تأكيد التعاقد وتفعيل الاشتراك" : "Confirm contract & activate"} — {tenant?.name}</DialogTitle></DialogHeader>
        <div className="space-y-3.5 text-sm">
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-1">
            <Row k={isAr ? "جهة الاتصال" : "Contact"} v={tenant?.contact_name || "—"} />
            <Row k={isAr ? "البريد" : "Email"} v={tenant?.contact_email || "—"} />
            <Row k={isAr ? "الهاتف" : "Phone"} v={tenant?.contact_phone || "—"} />
            <Row k={isAr ? "الرقم الموحد" : "Unified no."} v={tenant?.unified_number || "—"} />
            <Row k={isAr ? "عدد الموظفين" : "Employees"} v={tenant?.employee_count || 0} />
            <Row k={isAr ? "الشريحة" : "Tier"} v={tenant?.pricing_tier || "—"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "المبلغ (ر.س)" : "Amount (SAR)"}</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "نهاية الاشتراك" : "Subscription end"}</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} dir="ltr" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{isAr ? "بالتأكيد يتم تسجيل عميلة مدفوعة سنوية وتحويل المنشأة إلى (فعّال)." : "Confirms a paid annual subscription and marks the tenant active."}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{isAr ? "إلغاء" : "Cancel"}</Button>
          <Button onClick={submit} disabled={saving || !amount || !end} className="gap-1.5">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {isAr ? "تأكيد وتفعيل" : "Confirm & activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ——— تمديد فترة التجربة ———
export function ExtendTrialDialog({ open, onClose, tenant, isAr, t, onDone }) {
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState("7");
  useEffect(() => { if (open) setDays("7"); }, [open]);

  const submit = async () => {
    if (!tenant || Number(days) <= 0) return;
    setSaving(true);
    try { await onDone({ days: Number(days) }); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isAr ? "تمديد فترة التجربة" : "Extend trial"} — {tenant?.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-3">
            {isAr ? "الحالية تنتهي في: " : "Current trial ends: "}<span className="font-medium">{tenant?.trial_end || "—"}</span>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "عدد أيام التمديد" : "Days to extend"}</Label>
            <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} min={1} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{isAr ? "إلغاء" : "Cancel"}</Button>
          <Button onClick={submit} disabled={saving || Number(days) <= 0} className="gap-1.5">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarPlus size={15} />} {isAr ? "تمديد" : "Extend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium truncate">{v}</span>
    </div>
  );
}