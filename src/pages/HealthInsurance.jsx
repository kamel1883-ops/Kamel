import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ClipboardList, ArrowRight, Info } from "lucide-react";
import { INSURANCE_PROVIDERS, buildInsuranceUrl } from "@/lib/insuranceDeepLinks";
import { Stepper, ProviderHeader, ManualNote, ChoiceGrid, InsuranceProviderCard } from "@/components/insurance/InsuranceShared";
import { useI18n } from "@/lib/i18n";

const CITIES = [
  ["riyadh", "الرياض", "Riyadh"],
  ["jeddah", "جدة", "Jeddah"],
  ["dammam", "الدمام", "Dammam"],
  ["mecca", "مكة المكرمة", "Mecca"],
  ["medina", "المدينة المنورة", "Medina"],
  ["khobar", "الخبر", "Khobar"],
  ["taif", "الطائف", "Taif"],
  ["other", "أخرى", "Other"],
];

const CLASSES = [
  ["vip", "VIP", "VIP"],
  ["a", "A", "A"],
  ["b", "B", "B"],
  ["c", "C", "C"],
  ["basic", "أساسي", "Basic"],
];

export default function HealthInsurance() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [provider, setProvider] = useState(null);
  const [employees, setEmployees] = useState(1);
  const [dependents, setDependents] = useState(0);
  const [city, setCity] = useState("riyadh");
  const [cls, setCls] = useState("b");
  const [contact, setContact] = useState("");

  const t = isAr
    ? {
        title: "التأمين الصحي",
        subtitle:
          "ابحث عن بوليصة تأمين صحي لموظفيك عبر منصة تأميني أو بي كير، ثم أكمل التسعير والمقارنة والشراء مباشرة على موقعها.",
        pick: "اختر منصة التأمين",
        pickSub:
          "ستنتقل إلى موقع المنصة المختار لإتمام التسعير والدفع. جداره لا تتلقى أي مبالغ ولا تتحمل مسؤولية البوليصة.",
        back: "تغيير المنصة",
        employees: "عدد الموظفين",
        dependents: "عدد المعالين",
        city: "مدينة العمل",
        class: "فئة التغطية",
        contact: "رقم الجوال للتواصل (اختياري)",
        search: "ابحث عن تأمين صحي",
        noteTitle: "ملاحظة مهمة",
        noteBody:
          "عند الضغط على «بحث» تُفتح المنصة في نافذة جديدة. سجّل الدخول، ثم أدخل بيانات الموظفين والمعالين ومدينة العمل وفئة التغطية، وقارن عروض شركات التأمين وأكمل الشراء مباشرة هناك.",
        summary: "ملخص البحث",
      }
    : {
        title: "Health Insurance",
        subtitle:
          "Search a health insurance policy for your employees via Tameeni or BCare, then complete quoting, comparison and purchase directly on the chosen site.",
        pick: "Choose insurance platform",
        pickSub:
          "You'll be redirected to the chosen platform to complete quoting and payment. Jadara does not collect funds and is not responsible for the policy.",
        back: "Change platform",
        employees: "Employees",
        dependents: "Dependents",
        city: "Working city",
        class: "Coverage class",
        contact: "Contact phone (optional)",
        search: "Search health insurance",
        noteTitle: "Important note",
        noteBody:
          "Clicking 'Search' opens the platform in a new tab. Sign in, then enter employees, dependents, working city and coverage class, compare insurer offers and complete the purchase there.",
        summary: "Search summary",
      };

  const handleSearch = () => {
    const url = buildInsuranceUrl(provider, "health");
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!provider) {
    return (
      <div>
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 mb-6 flex items-start gap-3">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-slate-600 leading-relaxed">{t.pickSub}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
          <InsuranceProviderCard providerKey="tameeni" type="health" onSelect={setProvider} isAr={isAr} />
          <InsuranceProviderCard providerKey="bcare" type="health" onSelect={setProvider} isAr={isAr} />
        </div>
      </div>
    );
  }

  const p = INSURANCE_PROVIDERS[provider];
  const brand = p.brand;
  const cityLabel = (c) => (isAr ? CITIES.find((x) => x[0] === c)?.[1] : CITIES.find((x) => x[0] === c)?.[2]);
  const classLabel = (c) => (isAr ? CLASSES.find((x) => x[0] === c)?.[1] : CLASSES.find((x) => x[0] === c)?.[2]);

  return (
    <div className="relative">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <Button variant="outline" onClick={() => setProvider(null)} className="gap-2">
            <ArrowRight size={16} style={{ transform: "scaleX(-1)" }} /> {t.back}
          </Button>
        }
      />

      <ProviderHeader provider={p} isAr={isAr} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-white/90 p-6 space-y-5" style={{ borderColor: brand + "33" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">{t.employees}</Label>
              <Stepper value={employees} onChange={setEmployees} min={1} max={500} label={t.employees} brand={brand} />
            </div>
            <div>
              <Label className="mb-2 block">{t.dependents}</Label>
              <Stepper value={dependents} onChange={setDependents} min={0} max={500} label={t.dependents} brand={brand} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t.city}</Label>
            <ChoiceGrid value={city} onChange={setCity} brand={brand} options={CITIES.map((c) => [c[0], isAr ? c[1] : c[2]])} />
          </div>

          <div>
            <Label className="mb-2 block">{t.class}</Label>
            <ChoiceGrid value={cls} onChange={setCls} brand={brand} options={CLASSES.map((c) => [c[0], isAr ? c[1] : c[2]])} />
          </div>

          <div>
            <Label className="mb-2 block">{t.contact}</Label>
            <Input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="05xxxxxxxx" className="h-11" dir="ltr" />
          </div>

          <Button onClick={handleSearch} className="w-full h-12 text-base font-semibold gap-2 text-white" style={{ background: brand }}>
            <Search size={18} /> {t.search}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white/90 p-5" style={{ borderColor: brand + "33" }}>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ClipboardList size={16} style={{ color: brand }} /> {t.summary}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.employees}</dt><dd className="font-semibold text-slate-700">{employees}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.dependents}</dt><dd className="font-semibold text-slate-700">{dependents}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.city}</dt><dd className="font-semibold text-slate-700">{cityLabel(city)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.class}</dt><dd className="font-semibold text-slate-700">{classLabel(cls)}</dd></div>
            </dl>
          </div>
          <ManualNote title={t.noteTitle} body={t.noteBody} />
        </div>
      </div>
    </div>
  );
}