import React from "react";
import { Info, Minus, Plus, ExternalLink, ArrowRight } from "lucide-react";
import { INSURANCE_PROVIDERS } from "@/lib/insuranceDeepLinks";

// شعار تأميني الأصلي (شعار الدرع/المظلة) كـ SVG مضمّن — يُرسم بالأبيض فوق خلفية ملونة.
const TAMEENI_EMBLEM_PATH =
  "M5.67889 9.56532H4.63534C4.46705 9.56595 4.30545 9.49853 4.18623 9.37795C4.06701 9.25737 4 9.09357 4 8.92273V3.73527C4 2.76424 4.77543 1.97707 5.73197 1.97707H10.7046C11.2572 1.97738 11.7985 1.81858 12.2657 1.5191L14.3692 0.172116C14.7281 -0.057372 15.1849 -0.057372 15.5439 0.172116L17.7715 1.59833C18.157 1.84521 18.6035 1.97624 19.0593 1.97628H24.32C25.1985 1.97628 25.9107 2.69924 25.9107 3.59107V4.95865C25.9107 5.07829 25.9154 9.57958 25.9154 9.57958C25.9555 9.98874 25.7669 10.3863 25.4268 10.6096L15.5228 17.9538C15.3897 18.0488 15.2156 18.0606 15.0713 17.9845C14.927 17.9083 14.8365 17.7568 14.8367 17.5917V15.9048C14.8368 15.5009 15.0275 15.1215 15.3495 14.8843L23.0915 9.10021C23.3945 8.88284 23.5703 8.52594 23.5598 8.1494L23.5465 5.3667C23.537 5.00717 23.3781 4.66852 23.109 4.4345C22.84 4.20049 22.486 4.09298 22.1345 4.13857L18.8759 4.16314C18.2154 4.18963 17.5615 4.02208 16.9925 3.6806L15.3183 2.61253C15.0978 2.46288 14.8096 2.4654 14.5916 2.61886L13.0782 3.55303C12.4254 3.95097 11.6792 4.16334 10.9177 4.16789L7.63175 4.1877C6.8821 4.1925 6.27738 4.8117 6.27911 5.57271L6.28848 8.94491C6.28889 9.10931 6.22485 9.26711 6.11049 9.38351C5.99612 9.4999 5.84084 9.56532 5.67889 9.56532ZM24.9793 13.0546L15.8715 19.8925C15.3289 20.3037 14.5845 20.3037 14.0419 19.8925L4.94031 13.0546C4.76141 12.9199 4.5228 12.8996 4.32429 13.0022C4.12579 13.1048 4.0016 13.3126 4.00369 13.5387V21.0335C4.00263 21.9452 4.43588 22.8012 5.16666 23.3313L13.8827 29.6518C14.5262 30.1161 15.3887 30.1161 16.0322 29.6518L24.7483 23.3313C25.4769 22.7993 25.9095 21.9445 25.9113 21.0335V13.5324C25.9114 13.3083 25.7872 13.1033 25.5902 13.0022C25.3932 12.9012 25.1569 12.9215 24.9793 13.0546ZM23.5214 20.2529C23.5471 20.8549 23.278 21.4309 22.8025 21.7916L16.1314 26.972C15.4368 27.5022 14.4805 27.5022 13.786 26.972L6.93847 21.7053C6.86574 21.6598 6.79977 21.6041 6.74256 21.5397C6.49751 21.2822 6.33951 20.9523 6.29142 20.5976C6.27128 20.5084 6.26029 20.4173 6.25864 20.3258L6.27815 18.1699C6.2753 17.9895 6.37326 17.823 6.53106 17.7401C6.68886 17.6571 6.87931 17.672 7.02277 17.7784L14.0724 22.912C14.5994 23.2966 15.3094 23.2966 15.8364 22.912L22.8407 17.8046C22.9712 17.7094 23.1431 17.6961 23.2863 17.7702C23.4294 17.8443 23.5198 17.9933 23.5206 18.1564L23.5214 20.2529Z";

export function ProviderLogo({ provider, className = "h-10 w-10" }) {
  if (provider.logoType === "tameeni") {
    return (
      <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label={provider.name}>
        <path fillRule="evenodd" clipRule="evenodd" d={TAMEENI_EMBLEM_PATH} fill="#ffffff" />
      </svg>
    );
  }
  if (provider.logoType === "bcare") {
    return (
      <img
        src="https://www.bcare.com.sa/assets/images/white-logo.svg"
        alt={provider.name}
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }
  return null;
}

export function InsuranceProviderCard({ providerKey, type, onSelect, isAr }) {
  const p = INSURANCE_PROVIDERS[providerKey];
  const brand = p.brand;
  const typeLabel =
    type === "health"
      ? isAr ? "تأمين صحي" : "Health insurance"
      : isAr ? "تأمين مركبات" : "Vehicle insurance";
  return (
    <button
      type="button"
      onClick={() => onSelect(providerKey)}
      className="group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-xl text-white"
      style={{ borderColor: brand, background: `linear-gradient(160deg, ${brand}, ${brand}cc)` }}
    >
      <div className="h-16 flex items-center justify-center">
        <ProviderLogo provider={p} className="h-14 w-14" />
      </div>
      <div className="text-center">
        <div className="text-2xl font-extrabold text-white">{isAr ? p.name : p.nameEn}</div>
        <div className="text-sm text-white/85 mt-1">{typeLabel}</div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:text-white">
        {isAr ? "اختيار" : "Select"}
        <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" style={{ transform: "scaleX(-1)" }} />
      </span>
    </button>
  );
}

export function ProviderHeader({ provider, isAr }) {
  const brand = provider.brand;
  return (
    <div className="flex items-center gap-3 mb-6 rounded-2xl p-4 border bg-white/90" style={{ borderColor: brand + "40" }}>
      <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: brand }}>
        <ProviderLogo provider={provider} className="h-8 w-8" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold" style={{ color: brand }}>{isAr ? provider.name : provider.nameEn}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1"><ExternalLink size={12} /> {provider.site}</div>
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99, label, brand = "#7C5CE6" }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white" style={{ borderColor: brand + "33" }}>
      <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 transition hover:brightness-95"
          style={{ background: brand + "1a", color: brand }}>
          <Minus size={15} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-slate-800">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 transition hover:brightness-95"
          style={{ background: brand + "1a", color: brand }}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export function ManualNote({ title, body }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
      <Info className="shrink-0 mt-0.5 text-amber-600" size={18} />
      <div>
        <p className="text-sm font-bold text-amber-700">{title}</p>
        <p className="text-xs leading-relaxed mt-1 text-amber-700/90">{body}</p>
      </div>
    </div>
  );
}

export function ChoiceGrid({ value, onChange, options, brand = "#7C5CE6" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(([k, label]) => (
        <button key={k} type="button" onClick={() => onChange(k)} className="h-11 rounded-lg border text-sm font-semibold transition-all"
          style={value === k ? { background: brand, color: "#fff", borderColor: brand } : { background: "#fff", color: "#475569", borderColor: brand + "33" }}>
          {label}
        </button>
      ))}
    </div>
  );
}