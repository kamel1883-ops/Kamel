import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

const empty = {
  name: "", commercial_register: "", industry: "",
  contact_name: "", contact_email: "", contact_phone: "", city: "",
};

export default function CheckoutModal({ open, onClose }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        title: "الاشتراك السنوي — الدفع الآن",
        first: "2,500 ريال",
        firstNote: "السنة الأولى (تشمل سنة مجانية)",
        after: "ثم 700 ريال سنوياً من العام الثاني",
        formHint: "أدخل بيانات المنشأة وبياناتك للتواصل، ثم أُكمل الدفع عبر بطاقة Visa / مدى بأمان عبر Stripe.",
        company: "اسم المنشأة *", cr: "السجل التجاري", industry: "القطاع / النشاط",
        city: "المدينة", contact: "جهة الاتصال", phone: "الهاتف", email: "البريد الإلكتروني *",
        payBtn: "المتابعة للدفع عبر Stripe",
        secure: "البيانات مشفّرة وآمنة عبر Stripe — لا نُخزّن تفاصيل البطاقة.",
        errRequired: "الرجاء إدخال اسم المنشأة وبريد إلكتروني صحيح",
        errGeneric: "تعذّر إنشاء جلسة الدفع، حاول مرة أخرى",
      }
    : {
        title: "Annual Subscription — Pay Now",
        first: "SAR 2,500",
        firstNote: "First year (includes one free year)",
        after: "Then SAR 700 / year from year two",
        formHint: "Enter your company and contact details, then complete payment securely via Visa / Mada card through Stripe.",
        company: "Company name *", cr: "Commercial Register", industry: "Sector / Activity",
        city: "City", contact: "Contact person", phone: "Phone", email: "Email *",
        payBtn: "Continue to Stripe checkout",
        secure: "Encrypted and secure through Stripe — we never store card details.",
        errRequired: "Please enter a company name and a valid email",
        errGeneric: "Could not start checkout, please try again",
      };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const name = form.name.trim();
    const email = form.contact_email.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr(t.errRequired);
      return;
    }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("createSubscription", {
        ...form,
        origin: window.location.origin,
        locale: isAr ? "ar" : "en",
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setErr(res?.data?.error || t.errGeneric);
        setSaving(false);
      }
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || t.errGeneric);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={18} /> {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-700">{t.first}</span>
            <span className="text-sm text-muted-foreground">— {t.firstNote}</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">{t.after}</div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{t.formHint}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>{t.company}</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t.cr}</Label>
              <Input value={form.commercial_register} onChange={(e) => set("commercial_register", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.industry}</Label>
              <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.city}</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.contact}</Label>
              <Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.phone}</Label>
              <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>{t.email}</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} required />
            </div>
          </div>

          {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {t.payBtn}
            </Button>
          </DialogFooter>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck size={13} /> {t.secure}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}