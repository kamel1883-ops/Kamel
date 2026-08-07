import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Lock, ShieldCheck, BadgeCheck, ArrowRight } from "lucide-react";
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
        title: "الاشتراك السنوي — الدفع الآمن",
        step1: "بيانات المنشأة",
        step2: "صفحة الدفع الآمنة (Tap)",
        first: "2,500 ريال",
        firstNote: "السنة الأولى (تشمل سنة مجانية)",
        after: "ثم 700 ريال سنوياً من العام الثاني",
        formHint: "أدخل بيانات المنشأة، ثم تُحوَّل تلقائياً إلى صفحة الدفع الآمنة عبر Tap لدفع 2,500 ريال بمدى / Visa / Mastercard / Apple Pay.",
        company: "اسم المنشأة *", cr: "السجل التجاري", industry: "القطاع / النشاط",
        city: "المدينة", contact: "جهة الاتصال", phone: "الهاتف", email: "البريد الإلكتروني *",
        nextBtn: "متابعة للدفع الآمن",
        redirecting: "جارٍ تجهيز صفحة الدفع وتحويلك إلى Tap…",
        payMethodsLabel: "طرق الدفع المتاحة:",
        secure: "تتم عملية الدفع بالكامل على بوابة Tap الآمنة المعتمدة — بيانات بطاقتك لا تمر عبر خوادمنا إطلاقاً.",
        errRequired: "الرجاء إدخال اسم المنشأة وبريد إلكتروني صحيح",
        errGeneric: "تعذّر بدء عملية الدفع، حاول مرة أخرى",
        closeBtn: "إغلاق",
      }
    : {
        title: "Annual Subscription — Secure Payment",
        step1: "Company details",
        step2: "Secure Checkout (Tap)",
        first: "SAR 2,500",
        firstNote: "First year (includes one free year)",
        after: "Then SAR 700 / year from year two",
        formHint: "Enter company details, then you’ll be redirected securely to Tap to pay 2,500 SAR via Mada / Visa / Mastercard / Apple Pay.",
        company: "Company name *", cr: "Commercial Register", industry: "Sector / Activity",
        city: "City", contact: "Contact person", phone: "Phone", email: "Email *",
        nextBtn: "Continue to secure payment",
        redirecting: "Preparing the payment page and redirecting you to Tap…",
        payMethodsLabel: "Available payment methods:",
        secure: "Payment is handled entirely on Tap’s secure gateway — your card details never touch our servers.",
        errRequired: "Please enter a company name and a valid email",
        errGeneric: "Could not start checkout, please try again",
        closeBtn: "Close",
      };

  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  // stages: details -> preparing
  const [stage, setStage] = useState("details");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => { setForm(empty); setErr(""); setStage("details"); };

  const handleClose = () => { reset(); onClose(); };

  const submitDetails = async (e) => {
    e.preventDefault();
    setErr("");
    const name = form.name.trim();
    const email = form.contact_email.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr(t.errRequired);
      return;
    }
    setStage("preparing");
    try {
      const res = await base44.functions.invoke("createSubscription", {
        ...form,
        return_url: window.location.origin,
        locale: isAr ? "ar" : "en",
      });
      const data = res?.data;
      if (!data?.redirect_url) {
        setErr(data?.error || t.errGeneric);
        setStage("details");
        return;
      }
      // التحويل لصفحة Tap المُستضافة — يكمل العميل الدفع ويعود تلقائياً للهبةomain
      window.location.href = data.redirect_url;
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || t.errGeneric);
      setStage("details");
    }
  };

  const renderStepBadge = (n, active) => (
    <div className={`flex items-center gap-1.5 text-xs ${active ? "text-violet-700 font-semibold" : "text-muted-foreground"}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${active ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"}`}>{n}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && stage !== "preparing") handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={18} /> {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-700">{t.first}</span>
            <span className="text-sm text-muted-foreground">— {t.firstNote}</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">{t.after}</div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            {renderStepBadge(1, stage === "details" || stage === "preparing")}
            <span className="text-xs font-medium">{t.step1}</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            {renderStepBadge(2, stage === "preparing")}
            <span className="text-xs font-medium">{t.step2}</span>
          </div>
        </div>

        {stage === "details" && (
          <form onSubmit={submitDetails} className="space-y-4">
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

            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-xs text-muted-foreground">{t.payMethodsLabel}</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">mada</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold italic">VISA</span>
              <span className="px-2.5 py-1 rounded-md bg-backdrop bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">Mastercard</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1">
                <svg width="11" height="13" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 301.3 9 330 19 380c12.5 58.1 57.7 98.3 102.7 98.3 26.3 0 56.8-18.6 81.6-18.6 24.2 0 47.2 18.6 81.6 18.6 45.5 0 84-50.1 97.2-98.3-21.9-22-46.2-45-46.2-111.4zM265.2 108.5c22.6-26.3 38.5-62.8 34.3-99.3-33.1 1.4-73.2 22.1-96.9 48.5-21.1 23.8-38 61.1-31.4 96.9 37.9 2.9 71.4-19.4 94-45.9z"/></svg>
                Apple Pay
              </span>
            </div>

            {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose}>{t.closeBtn}</Button>
              <Button type="submit" className="gap-2">
                {t.nextBtn}
                <ArrowRight size={16} className="rotate-180" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck size={13} /> {t.secure}
            </p>
          </form>
        )}

        {stage === "preparing" && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin text-violet-600" />
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Lock size={14} /> {t.redirecting}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}