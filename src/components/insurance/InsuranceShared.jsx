import React from "react";
import { Info, Minus, Plus, ExternalLink } from "lucide-react";

// مكوّنات مشتركة لصفحات التأمين (الخطوات، رأس المزوّد، ملاحظة الإكمال اليدوي).

export function Stepper({ value, onChange, min = 0, max = 99, label, brand = "#7C5CE6" }) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white"
      style={{ borderColor: brand + "33" }}
    >
      <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 transition hover:brightness-95"
          style={{ background: brand + "1a", color: brand }}
        >
          <Minus size={15} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-slate-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-40 transition hover:brightness-95"
          style={{ background: brand + "1a", color: brand }}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export function ProviderHeader({ provider, isAr, icon: Icon }) {
  const brand = provider.brand;
  return (
    <div
      className="flex items-center gap-3 mb-6 rounded-2xl p-4 border bg-white/90"
      style={{ borderColor: brand + "40" }}
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: brand + "1a" }}
      >
        <Icon size={24} style={{ color: brand }} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold" style={{ color: brand }}>
          {isAr ? provider.name : provider.nameEn}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <ExternalLink size={12} /> {provider.site}
        </div>
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
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className="h-11 rounded-lg border text-sm font-semibold transition-all"
          style={
            value === k
              ? { background: brand, color: "#fff", borderColor: brand }
              : { background: "#fff", color: "#475569", borderColor: brand + "33" }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}