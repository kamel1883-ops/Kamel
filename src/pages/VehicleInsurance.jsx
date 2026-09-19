import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, ClipboardList, ArrowRight, Info, User, Building2 } from "lucide-react";
import { INSURANCE_PROVIDERS, buildInsuranceUrl } from "@/lib/insuranceDeepLinks";
import { Stepper, ProviderHeader, ManualNote, ChoiceGrid, InsuranceProviderCard } from "@/components/insurance/InsuranceShared";
import { useI18n } from "@/lib/i18n";

const OWNERSHIP = [
  ["individual", "فرد", "Individual"],
  ["company", "منشأة", "Company"],
];

const COVERAGE = [
  ["comprehensive", "شامل", "Comprehensive"],
  ["thirdparty", "طرف ثالث", "Third-party"],
];

const VEHICLE_TYPES = [
  ["sedan", "سيدان", "Sedan"],
  ["suv", "دفع رباعي", "SUV"],
  ["truck", "شاحنة", "Truck"],
  ["bus", "حافلة", "Bus"],
  ["other", "أخرى", "Other"],
];

export default function VehicleInsurance() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [provider, setProvider] = useState(null);
  const [ownership, setOwnership] = useState("individual");
  const [coverage, setCoverage] = useState("comprehensive");
  const [vtype, setVtype] = useState("sedan");
  const [count, setCount] = useState(1);

  const t = isAr
    ? {
        title: "تأمين المركبات",
        subtitle:
          "ابحث عن بوليصة تأمين لمركباتك — مملوكة باسم فرد أو منشأة — عبر منصة تأميني أو بي كير، ثم أكمل التسعير والمقارنة والشراء مباشرة على موقعها.",
        pick: "اختر منصة التأمين",
        pickSub:
          "ستنتقل إلى موقع المنصة المختار لإتمام التسعير والدفع. جداره لا تتلقى أي مبالغ ولا تتحمل مسؤولية البوليصة.",
        back: "تغيير المنصة",
        ownership: "نوع الملكية",
        coverage: "نوع التغطية",
        vtype: "نوع المركبة",
        count: "عدد المركبات",
        search: "ابحث عن تأمين مركبات",
        noteTitle: "ملاحظة مهمة",
        noteBody:
          "عند الضغط على «بحث» تُفتح المنصة في نافذة جديدة. سجّل الدخول، ثم أدخل بيانات المركبة (الرقم التسلسلي/اللوحة) ونوع التغطية، وقارن عروض شركات التأمين وأكمل الشراء مباشرة هناك.",
        summary: "ملخص البحث",
      }
    : {
        title: "Vehicle Insurance",
        subtitle:
          "Search a policy for your vehicles — owned by an individual or a company — via Tameeni or BCare, then complete quoting, comparison and purchase directly on the chosen site.",
        pick: "Choose insurance platform",
        pickSub:
          "You'll be redirected to the chosen platform to complete quoting and payment. Jadara does not collect funds and is not responsible for the policy.",
        back: "Change platform",
        ownership: "Ownership",
        coverage: "Coverage type",
        vtype: "Vehicle type",
        count: "Vehicle count",
        search: "Search vehicle insurance",
        noteTitle: "Important note",
        noteBody:
          "Clicking 'Search' opens the platform in a new tab. Sign in, then enter vehicle details (sequence/plate) and coverage type, compare insurer offers and complete the purchase there.",
        summary: "Search summary",
      };

  const handleSearch = () => {
    const url = buildInsuranceUrl(provider, "vehicle");
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
          <InsuranceProviderCard providerKey="tameeni" type="vehicle" onSelect={setProvider} isAr={isAr} />
          <InsuranceProviderCard providerKey="bcare" type="vehicle" onSelect={setProvider} isAr={isAr} />
        </div>
      </div>
    );
  }

  const p = INSURANCE_PROVIDERS[provider];
  const brand = p.brand;
  const label = (list, v) => (isAr ? list.find((x) => x[0] === v)?.[1] : list.find((x) => x[0] === v)?.[2]);

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
          <div>
            <Label className="mb-2 block">{t.ownership}</Label>
            <div className="grid grid-cols-2 gap-2">
              {OWNERSHIP.map(([k, ar, en]) => {
                const Icon = k === "individual" ? User : Building2;
                const active = ownership === k;
                return (
                  <button key={k} type="button" onClick={() => setOwnership(k)}
                    className="h-14 rounded-lg border flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                    style={active ? { background: brand, color: "#fff", borderColor: brand } : { background: "#fff", color: "#475569", borderColor: brand + "33" }}>
                    <Icon size={18} /> {isAr ? ar : en}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t.coverage}</Label>
            <ChoiceGrid value={coverage} onChange={setCoverage} brand={brand} options={COVERAGE.map((c) => [c[0], isAr ? c[1] : c[2]])} />
          </div>

          <div>
            <Label className="mb-2 block">{t.vtype}</Label>
            <ChoiceGrid value={vtype} onChange={setVtype} brand={brand} options={VEHICLE_TYPES.map((c) => [c[0], isAr ? c[1] : c[2]])} />
          </div>

          <div>
            <Label className="mb-2 block">{t.count}</Label>
            <Stepper value={count} onChange={setCount} min={1} max={200} label={t.count} brand={brand} />
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
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.ownership}</dt><dd className="font-semibold text-slate-700">{label(OWNERSHIP, ownership)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.coverage}</dt><dd className="font-semibold text-slate-700">{label(COVERAGE, coverage)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.vtype}</dt><dd className="font-semibold text-slate-700">{label(VEHICLE_TYPES, vtype)}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-400">{t.count}</dt><dd className="font-semibold text-slate-700">{count}</dd></div>
            </dl>
          </div>
          <ManualNote title={t.noteTitle} body={t.noteBody} />
        </div>
      </div>
    </div>
  );
}