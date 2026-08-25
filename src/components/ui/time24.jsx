import React from "react";

const pad = (n) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

/** حقل وقت بنظام 24 ساعة (مستقل عن لغة المتصفح) — القيمة "HH:MM" */
export default function Time24Input({ value = "", onChange, className = "" }) {
  const [h = "", m = ""] = (value || "").split(":");
  const emit = (nh, nm) => onChange?.(nh && nm ? `${nh}:${nm}` : "");

  const cls =
    "h-9 rounded-md border border-input bg-transparent px-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className={`flex items-center gap-1.5 ${className}`} dir="ltr">
      <select className={cls} value={h} onChange={(e) => emit(e.target.value, m || "00")}>
        <option value="">--</option>
        {HOURS.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <span className="text-muted-foreground">:</span>
      <select className={cls} value={m} onChange={(e) => emit(h || "00", e.target.value)}>
        <option value="">--</option>
        {MINUTES.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}