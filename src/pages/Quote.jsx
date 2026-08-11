import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import { Printer, Loader2, ArrowRight, ArrowLeft, Copy, Check, MessageCircle, Mail, ShieldCheck, AlertTriangle } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, tierForCount } from "@/lib/pricing";

const SIGNATURE_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/b430cd7cf_image.png";
const BANK = {
  beneficiaryAr: "كامل الشيخ", beneficiaryEn: "KAMEL ELSHIKH",
  bankAr: "بنك إس تي سي (STC Bank)", bankEn: "STC Bank",
  iban: "SA75780000000001285607287",
  account: "1285607287",
};
const WHATSAPP = "https://wa.me/966594700782";
const SALES_EMAIL = "info@jadara-hr.com";

const featuresAr = [
  "إدارة الموظفين", "الحضور والانصراف (بصمة ذاتية)", "إدارة الإجازات والموافقات",
  "رحلات العمل والانتداب", "إدارة الرواتب", "التأمينات الاجتماعية (GOSI)",
  "نهاية الخدمة", "إدارة الأداء", "التخطيط التعاقبي", "الهيكل التنظيمي",
  "تخطيط القوة العاملة", "تحليلات الموارد البشرية", "إدارة الأسطول والمركبات",
  "تراخيص المنشأة الحكومية", "التكاملات الذكية", "بوابة تجربة العميل",
  "سياسة العمل والإنذارات الذكية", "بوابة الموظف الذاتية",
];
const featuresEn = [
  "Employee Management", "Attendance & Self Check-in", "Leaves & Approvals",
  "Business Trips & Deputation", "Payroll", "GOSI (Social Insurance)",
  "End of Service", "Performance Management", "Succession Planning",
  "Organization Structure", "Workforce Planning", "HR Analytics",
  "Fleet & Vehicles", "Government Licenses", "Smart Integrations",
  "Client Trial Portal", "Labor Policy & Smart Warnings", "Employee Self-Service Portal",
];

const empty = { name: "", commercial_register: "", industry: "", contact_name: "", contact_email: "", contact_phone: "", unified_number: "", city: "", discount_code: "", employee_count: "" };

export default function Quote() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const location = useLocation();
  const t = isAr ? {
    pageTitle: "عرض سعر — الاشتراك السنوي",
    barBack: "العودة للرئيسية", barPrint: "طباعة / حفظ PDF",
    formTitle: "بيانات المنشأة", formSub: "أدخل بيانات منشأتك لتوليد عرض سعر رسمي مع بيانات التحويل البنكي.",
    company: "اسم المنشأة *", industry: "القطاع / النشاط", contact: "اسم الشخص المسؤول",
    phone: "الهاتف *", email: "البريد الإلكتروني *", unified: "الرقم الوطني الموحد للمنشآت (10 خانات تبدأ بـ7) *", city: "المدينة",
    generate: "توليد عرض السعر", errForm: "الرجاء إدخال اسم المنشأة وبريد إلكتروني صحيح والرقم الوطني الموحد للمنشآت (10 خانات تبدأ بـ7) وعدد موظفين متوقع",
    errGeneric: "تعذّر توليد العرض، حاول مرة أخرى", secure: "بياناتك آمنة ولن تُباع لأي طرف ثالث",
    to: "إلى", quoteNo: "رقم العرض", date: "التاريخ", planTitle: "الاشتراك السنوي — منصة جدارة",
    planDesc: "باقة واحدة متكاملة تشمل كل ميزات المنصة:", includes: "تشمل الباقة:",
    planTier: "شريحة الاشتراك", planTierRange: "نطاق الموظفين", planPrice: "السعر السنوي للباقة",
    renewNote: "يتجدد الاشتراك سنوياً بنفس قيمة شريحتك (حسب عدد الموظفين وقت التجديد).",
    headcountLabel: "عدد الموظفين المتوقع *", headcountHint: (tier, price) => `شريحتك: ${tier} — السعر السنوي: ${price.toLocaleString()} ريال`,
    headcountRequired: "أدخل عدد الموظفين المتوقع لحساب سعر الباقة تلقائياً",
    payTitle: "بيانات التحويل البنكي", payNote: "يُرجى إجراء التحويل إلى الحساب التالي وإرسال إثبات التحويل لتفعيل اشتراكك:",
    beneficiary: "المستفيد", bank: "البنك", iban: "رقم الآيبان", account: "رقم الحساب",
    copy: "نسخ الآيبان", copied: "تم النسخ", proofTitle: "بعد التحويل",
    proof: "أرسل إثبات التحويل عبر واتساب أو البريد، وسيتم تفعيل اشتراكك خلال 24 ساعة.",
    afterNote: "صلاحية هذا العرض 30 يوماً من تاريخ إصداره. يبدأ عملك بالمنصة فور تفعيل الاشتراك، مع فترة تجربة مجانية 30 يوماً قابلة للتشغيل الفوري بانتظار التحويل.",
    sigName: "المدير العام — كامل إسماعيل",
    stamp: "جدارة لإدارة الموارد البشرية",
    discCode: "كود الخصم (اختياري)",
    discBadge: "خصم", discApplied: "بعد تطبيق الكود", firstAfter: "السنة الأولى (بعد الخصم)",
    emailNotice: "تنويه مهم",
    emailNoticeBody: "الرقم الوطني الموحد للمنشآت (10 خانات تبدأ بـ7) هو معرّف منشأتكم الرسمي في المنصة. عند إتمام التحويل، سجّلوا في بوابة الشركات بهذا الرقم الوطني الموحّد وبنفس البريد المسجل هنا لتفعيل اشتراككم وإدارة حسابكم.",
    quoteEmailNote: (e, u) => `الرقم الوطني الموحّد للمنشآت لمنشأتكم في هذه المنصة هو: ${u} — عند إتمام التحويل يرجى التوجه إلى بوابة الشركات والتسجيل بنفس هذا الرقم الوطني الموحّد والمسجل بالبريد ${e} لتفعيل اشتراككم وإدارة حسابكم.`,
  } : {
    pageTitle: "Quotation — Annual Subscription",
    barBack: "Back to home", barPrint: "Print / Save PDF",
    formTitle: "Company details", formSub: "Enter your company data to generate an official quotation with bank transfer details.",
    company: "Company name *", industry: "Sector / Activity", contact: "Responsible person",
    phone: "Phone *", email: "Email *", unified: "National Unified Number (10 digits, starts with 7) *", city: "City",
    generate: "Generate quotation", errForm: "Please enter a company name, a valid email, the National Unified Number (10 digits starting with 7), and the expected employee count",
    errGeneric: "Could not generate the quote, try again", secure: "Your data is safe and never sold to third parties",
    to: "To", quoteNo: "Quote no.", date: "Date", planTitle: "Annual Subscription — Jadara Platform",
    planDesc: "One integrated package including every feature of the platform:", includes: "The package includes:",
    planTier: "Subscription tier", planTierRange: "Headcount range", planPrice: "Annual package price",
    renewNote: "The subscription renews annually at your tier's value (based on headcount at renewal).",
    headcountLabel: "Expected employees count *", headcountHint: (tier, price) => `Your tier: ${tier} — Annual: ${price.toLocaleString()} SAR`,
    headcountRequired: "Enter the expected employee count to auto-calculate the package price",
    payTitle: "Bank Transfer Details", payNote: "Please transfer to the account below and send proof to activate your subscription:",
    beneficiary: "Beneficiary", bank: "Bank", iban: "IBAN", account: "Account number",
    copy: "Copy IBAN", copied: "Copied", proofTitle: "After transfer",
    proof: "Send the transfer proof via WhatsApp or email; your subscription activates within 24 hours.",
    afterNote: "This quotation is valid for 30 days from issue date. You can start a free 30-day trial immediately while the transfer is being processed.",
    sigName: "General Manager — Kamel Ismail",
    stamp: "Jadara HR Management",
    discCode: "Discount code (optional)",
    discBadge: "OFF", discApplied: "After discount applied", firstAfter: "First year (after discount)",
    emailNotice: "Important",
    emailNoticeBody: "The National Unified Number (10 digits starting with 7) is your organization's official identifier on the platform. After the transfer, register in the Companies portal with this National Unified Number and the same email entered here to activate your subscription and manage your account.",
    quoteEmailNote: (e, u) => `Your organization's National Unified Number for this platform is: ${u} — after the transfer, go to the Companies portal and register with this National Unified Number and the registered email ${e} to activate your subscription and manage your account.`,
  };

  const incoming = location.state?.company || null;
  const [company, setCompany] = useState(incoming);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(!!incoming);
  const [copied, setCopied] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [quoteNo] = useState(() => "JQ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + Math.floor(100 + Math.random() * 900));
  const quoteDate = new Date().toISOString().slice(0, 10);
  const matchedTier = company?.employee_count ? tierForCount(company.employee_count, isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN) : null;

  useEffect(() => {
    if (incoming && !registered) {
      base44.functions.invoke("createTrial", incoming).then(() => setRegistered(true)).catch(() => {});
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const name = form.name.trim();
    const email = form.contact_email.trim();
    const unified = form.unified_number.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !/^7\d{7,11}$/.test(unified) || !Number(form.employee_count) || Number(form.employee_count) <= 0) { setErr(t.errForm); return; }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("createTrial", { ...form, lead_source: "quote", discount_code: form.discount_code?.trim() || undefined });
      const pct = Number(res?.discount_percent) || 0;
      setDiscount(pct > 0 ? { percent: pct, amount: Number(res?.quoted_amount) || 0, code: form.discount_code.trim() } : null);
      setRegistered(true);
      setCompany(form);
    } catch (error) {
      setErr(error?.response?.data?.error || error?.message || t.errGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const copyIban = async () => {
    try { await navigator.clipboard.writeText(BANK.iban); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (_) {}
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const features = isAr ? featuresAr : featuresEn;

  // —— نموذج بيانات المنشأة
  if (!company) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
          <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link to="/"><Logo size={40} /></Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">{t.barBack}</Link>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold">{t.formTitle}</h1>
          <p className="text-muted-foreground mt-2">{t.formSub}</p>
          <form onSubmit={submit} className="bg-white border border-border rounded-2xl p-6 mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t.company} value={form.name} onChange={(v) => set("name", v)} required />
              <Field label={t.industry} value={form.industry} onChange={(v) => set("industry", v)} />
              <Field label={t.city} value={form.city} onChange={(v) => set("city", v)} />
              <Field label={t.contact} value={form.contact_name} onChange={(v) => set("contact_name", v)} />
              <Field label={t.unified} value={form.unified_number} onChange={(v) => set("unified_number", v.replace(/\D/g, ""))} required />
              <Field label={t.phone} value={form.contact_phone} onChange={(v) => set("contact_phone", v)} required />
            </div>
            <Field label={t.email} value={form.contact_email} onChange={(v) => set("contact_email", v)} type="email" required />
            <Field label={t.headcountLabel} value={form.employee_count} onChange={(v) => set("employee_count", v.replace(/\D/g, ""))} required />
            {(() => { const pt = form.employee_count ? tierForCount(form.employee_count, isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN) : null; return pt ? <div className="text-sm rounded-xl bg-violet-50 border border-violet-200 text-violet-700 px-4 py-3">{t.headcountHint(pt.tier, pt.yearly)}</div> : <div className="text-xs text-muted-foreground">{t.headcountRequired}</div>; })()}
            <div className="text-xs flex gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div><b>{t.emailNotice}:</b> {t.emailNoticeBody}</div>
            </div>
            <div className="space-y-1.5">
              <Label>{t.discCode}</Label>
              <Input value={form.discount_code || ""} onChange={(e) => set("discount_code", e.target.value.toUpperCase())} placeholder="JADARA100" />
            </div>
            {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{err}</div>}
            <Button type="submit" disabled={submitting} className="gap-2 min-w-[180px]">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {t.generate}
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck size={13} /> {t.secure}</p>
          </form>
        </div>
      </div>
    );
  }

  // —— عرض السعر القابل للطباعة
  return (
    <div className="min-h-screen bg-muted" dir={isAr ? "rtl" : "ltr"}>
      {/* شريط علوي غير قابل للطباعة */}
      <div className="no-print sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/"><Logo size={40} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">{t.barBack}</Link>
            <Button onClick={() => window.print()} className="gap-2"><Printer size={16} /> {t.barPrint}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="print-quote bg-white border border-border rounded-2xl p-8 sm:p-12 shadow-sm">
          {/* رأس العرض */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Logo size={56} />
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>{t.pageTitle}</div>
                <div className="text-xs text-muted-foreground">جدارة — منصة الموارد البشرية السعودية</div>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-1 text-sm">
              <div><span className="text-muted-foreground">{t.quoteNo}: </span><span className="font-mono font-semibold">{quoteNo}</span></div>
              <div><span className="text-muted-foreground">{t.date}: </span><span className="font-semibold">{quoteDate}</span></div>
            </div>
          </div>

          {/* إلى (بيانات المنشأة) */}
          <div className="py-6">
            <div className="text-xs font-semibold text-muted-foreground mb-2">{t.to}</div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <Row k={t.company} v={company.name} />
              <Row k={t.industry} v={company.industry} />
              <Row k={t.city} v={company.city} />
              <Row k={t.contact} v={company.contact_name} />
              <Row k={t.phone} v={company.contact_phone} />
              <Row k={t.unified} v={company.unified_number} />
              <Row k={t.email} v={company.contact_email} />
            </div>
          </div>

          {/* الباقة والمميزات */}
          <div className="py-6 border-t border-border">
            <div className="text-xl font-bold mb-1">{t.planTitle}</div>
            <div className="text-sm text-muted-foreground mb-4">{t.planDesc}</div>
            <div className="text-xs font-semibold text-muted-foreground mb-3">{t.includes}</div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* الأسعار */}
          <div className="py-6 border-t border-border">
            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="font-medium">{matchedTier ? matchedTier.tier : t.planTier}</div>
                  <div className="text-xs text-muted-foreground">{matchedTier ? matchedTier.range : t.planTierRange}</div>
                </div>
                <div className={discount ? "text-sm text-muted-foreground line-through" : "text-2xl font-extrabold text-violet-700"}>
                  {(matchedTier ? matchedTier.yearly : 0).toLocaleString()} {isAr ? "ريال" : "SAR"}
                </div>
              </div>
              {discount && (
                <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-violet-200/70">
                  <div>
                    <div className="font-medium">{t.discBadge} {discount.percent}% — {discount.code}</div>
                    <div className="text-xs text-muted-foreground">{t.discApplied}</div>
                  </div>
                  <div className="text-2xl font-extrabold text-violet-700">{discount.amount.toLocaleString()} {isAr ? "ريال" : "SAR"}</div>
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-2 border-t border-violet-200/70">{t.renewNote}</div>
            </div>
          </div>

          {/* بيانات التحويل البنكي */}
          <div className="py-6 border-t border-border">
            <div className="text-lg font-bold mb-1">{t.payTitle}</div>
            <p className="text-sm text-muted-foreground mb-4">{t.payNote}</p>
            <div className="rounded-2xl border border-border bg-slate-50/60 p-5 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Row k={t.beneficiary} v={isAr ? BANK.beneficiaryAr : BANK.beneficiaryEn} />
              <Row k={t.bank} v={isAr ? BANK.bankAr : BANK.bankEn} />
              <Row k={t.account} v={BANK.account} mono />
              <div className="sm:col-span-2 flex items-center justify-between gap-3 flex-wrap">
                <div><span className="text-muted-foreground">{t.iban}: </span><span className="font-mono font-bold tracking-wide">{BANK.iban}</span></div>
                <button type="button" onClick={copyIban} className="no-print text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted transition">
                  {copied ? <><Check size={13} className="text-emerald-600" /> {t.copied}</> : <><Copy size={13} /> {t.copy}</>}
                </button>
              </div>
            </div>
          </div>

          {/* بعد التحويل */}
          <div className="py-6 border-t border-border text-sm">
            <div className="font-semibold mb-1">{t.proofTitle}</div>
            <p className="text-muted-foreground">{t.proof}</p>
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 mt-3">
              <div className="flex gap-2 text-sm text-amber-900">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div><b>{t.emailNotice}: </b>{t.quoteEmailNote(company.contact_email, company.unified_number)}</div>
              </div>
              <div className="mt-2 text-base font-bold text-amber-900 break-all" dir="ltr">{company.unified_number} — {company.contact_email}</div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="no-print inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"><MessageCircle size={14} /> WhatsApp</a>
              <a href={`mailto:${SALES_EMAIL}`} className="no-print inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200"><Mail size={14} /> {SALES_EMAIL}</a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t.afterNote}</p>
          </div>

          {/* التوقيع والختم */}
          <div className="pt-8 border-t border-border flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Image src={SIGNATURE_URL} fittingType="fit" className="h-20 w-56" />
              <div className="text-sm font-semibold mt-2 border-t border-foreground/20 pt-1 w-64">{t.sigName}</div>
            </div>
            <JadaraStamp ar={isAr} label={t.stamp} />
          </div>

          <div className="no-print mt-8 flex items-center justify-center gap-3">
            <Button onClick={() => window.print()} className="gap-2"><Printer size={16} /> {t.barPrint}</Button>
            <Link to={`/login?returnTo=/app`} className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700">
              {isAr ? "تسجيل الدخول للمنصة" : "Sign in to platform"}
              <ArrowLeft size={14} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Row({ k, v, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-medium ${mono ? "font-mono tracking-wide" : ""}`}>{v || "—"}</span>
    </div>
  );
}

function JadaraStamp({ ar, label }) {
  return (
    <div style={{ transform: "rotate(-7deg)" }} className="opacity-80">
      <svg viewBox="0 0 200 200" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="stampTop" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0" fill="none" />
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke="#1A237E" strokeWidth="3" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="#1A237E" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="46" fill="none" stroke="#1A237E" strokeWidth="1.6" />
        <text fill="#1A237E" fontSize="16" fontWeight="700" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif" style={{ letterSpacing: "1px" }}>
          <textPath href="#stampTop" startOffset="50%" textAnchor="middle">{label}</textPath>
        </text>
        <text x="100" y="98" textAnchor="middle" fill="#1A237E" fontSize="22" fontWeight="800" fontFamily="Tajawal, IBM Plex Sans Arabic, sans-serif">جدارة</text>
        <text x="100" y="118" textAnchor="middle" fill="#1A237E" fontSize="9" fontWeight="600" fontFamily="sans-serif">JADARA HR</text>
        <text x="100" y="132" textAnchor="middle" fill="#1A237E" fontSize="14">✦</text>
      </svg>
    </div>
  );
}