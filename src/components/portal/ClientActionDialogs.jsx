import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, CalendarPlus, Printer, X, Pause, Ban, Play, RotateCcw, BadgeCheck, Building2, Crown } from "lucide-react";

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

// ——— بطاقة العميل القابلة للطباعة PDF + لوحة التحكم الكاملة ———
export function ClientInfoDialog({ open, onClose, tenant, isAr, t, onAction, busyId }) {
  const [days, setDays] = useState("7");
  const [amount, setAmount] = useState("");
  const [end, setEnd] = useState("");
  useEffect(() => {
    if (open && tenant) {
      setDays("7");
      setAmount(String(tenant.quoted_amount || ""));
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() + 1);
      setEnd(d.toISOString().slice(0, 10));
    }
  }, [open, tenant]);
  if (!open || !tenant) return null;
  const owner = isOwnerTenant(tenant);
  const status = tenant.status;
  const busy = busyId === tenant.id;
  const lifetime = isAr ? "مدى الحياة" : "Lifetime";
  const rows = [
    [isAr ? "اسم المنشأة / الشركة" : "Company", tenant.name],
    [isAr ? "الرقم الوطني الموحد للمنشآت" : "National Unified No.", tenant.unified_number],
    [isAr ? "الشخص المسؤول" : "Responsible person", tenant.contact_name],
    [isAr ? "رقم الجوال" : "Phone", tenant.contact_phone],
    [isAr ? "البريد الإلكتروني" : "Email", tenant.contact_email],
    [isAr ? "المدينة" : "City", tenant.city],
    [isAr ? "القطاع / النشاط" : "Industry", tenant.industry],
    [isAr ? "عدد الموظفين" : "Employees", tenant.employee_count],
    [isAr ? "شريحة الاشتراك" : "Pricing tier", tenant.pricing_tier],
    [isAr ? "المبلغ المعروض" : "Quoted amount", tenant.quoted_amount ? `${Number(tenant.quoted_amount).toLocaleString()} ${isAr ? "ر.س" : "SAR"}` : "—"],
    [isAr ? "كود الخصم" : "Discount", tenant.discount_code ? `${tenant.discount_code} (${tenant.discount_percent || 0}%)` : "—"],
    [isAr ? "نوع الطلب" : "Lead", tenant.lead_source === "quote" ? (isAr ? "طلب عرض سعر" : "Quote request") : (isAr ? "تسجيل تجربة" : "Trial sign-up")],
    [isAr ? "الحالة" : "Status", owner ? lifetime : status],
    [isAr ? "بداية التجربة" : "Trial start", owner ? lifetime : (tenant.trial_start || "—")],
    [isAr ? "نهاية التجربة" : "Trial end", owner ? lifetime : (tenant.trial_end || "—")],
    [isAr ? "نهاية الاشتراك" : "Subscription end", owner ? lifetime : (tenant.subscription_end || "—")],
    [isAr ? "تأكيد التعاقد" : "Contract", owner ? lifetime : (tenant.contract_confirmed ? (isAr ? "مؤكّد" : "Confirmed") : (isAr ? "غير مؤكد" : "Not confirmed"))],
    [isAr ? "تاريخ التسجيل" : "Registered", (tenant.created_date || "").slice(0, 10)],
  ];
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
      <div className="max-w-3xl mx-auto my-6 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="no-print flex items-center justify-between gap-3 p-4 border-b border-border bg-white">
          <div className="flex items-center gap-2 font-semibold">{isAr ? "بيانات العميل" : "Client info"} — {tenant.name}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5"><Printer size={14} /> {isAr ? "طباعة PDF" : "Print PDF"}</Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-9 w-9 p-0"><X size={16} /></Button>
          </div>
        </div>
        <div className="print-client p-8">
          <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><Crown className="text-violet-700" size={22} /></div>
              <div>
                <div className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>جدارة — بإدارة الموارد البشرية</div>
                <div className="text-xs text-slate-500">{isAr ? "بيانات العميل المسجّل" : "Registered client info"}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 text-left">{new Date().toISOString().slice(0, 10)}</div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm py-6">
            {rows.map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 pb-1">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-slate-800 truncate max-w-[60%]" dir="ltr">{v == null || v === "" ? "—" : v}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 text-center">
            {isAr ? "تم استلام هذه البيانات عبر بوابة تسجيل التجربة أو طلب عرض سعر في منصة جدارة" : "Data received via Jadara trial sign-up or quote request portal"}
          </div>
        </div>
        {!owner && (
        <div className="no-print p-5 border-t border-border bg-slate-50 space-y-4">
          {status === "trial" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium me-1">{isAr ? "تمديد التجربة:" : "Extend trial:"}</span>
              <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} className="w-24 h-9" min={1} />
              <span className="text-xs text-muted-foreground">{isAr ? "يوم" : "days"}</span>
              <Button size="sm" onClick={() => onAction(tenant.id, "owner_extend_trial", { days: Number(days) })} disabled={busy} className="gap-1.5">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CalendarPlus size={14} />} {isAr ? "تمديد" : "Extend"}
              </Button>
            </div>
          )}
          {(status === "trial" || status === "expired") && (
            <div className="space-y-2 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
              <div className="text-sm font-medium">{isAr ? "تأكيد التعاقد وتفعيل الاشتراك" : "Confirm contract & activate"}</div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{isAr ? "المبلغ (ر.س)" : "Amount"}</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32 h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{isAr ? "نهاية الاشتراك" : "Sub end"}</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40 h-9" dir="ltr" />
                </div>
                <Button size="sm" onClick={() => onAction(tenant.id, "owner_activate", { subscription_end: end, amount: Number(amount) })} disabled={busy || !amount || !end} className="gap-1.5">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />} {isAr ? "تأكيد وتفعيل" : "Confirm & activate"}
                </Button>
              </div>
            </div>
          )}
          {status === "active" && (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-sm font-medium">{isAr ? "تجديد الاشتراك السنوي" : "Renew annual subscription"}</div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{isAr ? "المبلغ (ر.س)" : "Amount"}</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32 h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{isAr ? "نهاية الاشتراك الجديد" : "New sub end"}</Label>
                  <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40 h-9" dir="ltr" />
                </div>
                <Button size="sm" onClick={() => onAction(tenant.id, "owner_activate", { subscription_end: end, amount: Number(amount) })} disabled={busy || !amount || !end} className="gap-1.5">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14} />} {isAr ? "تجديد وتفعيل" : "Renew"}
                </Button>
              </div>
            </div>
          )}
          {(status === "trial" || status === "active") && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onAction(tenant.id, "owner_suspend")} disabled={busy} className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Pause size={14} />} {isAr ? "إيقاف مؤقت" : "Suspend"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAction(tenant.id, "owner_cancel")} disabled={busy} className="gap-1.5 text-rose-600">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          )}
          {status === "expired" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onAction(tenant.id, "owner_restore")} disabled={busy} className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {isAr ? "استرجاع من الإيقاف" : "Restore"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAction(tenant.id, "owner_cancel")} disabled={busy} className="gap-1.5 text-rose-600">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          )}
          {status === "cancelled" && (
            <Button size="sm" variant="outline" onClick={() => onAction(tenant.id, "owner_restore")} disabled={busy} className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} {isAr ? "استرجاع العميل" : "Restore client"}
            </Button>
          )}
        </div>
        )}
      </div>
    </div>
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