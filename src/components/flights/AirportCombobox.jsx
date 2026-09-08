import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";
import { AIRPORTS, airportLabel, searchAirports } from "@/lib/airports";
import { cn } from "@/lib/utils";

/**
 * منتقي مطار قابل للبحث (كود IATA + المدينة + الدولة).
 * value: كود IATA الحالي، onChange: يُرجع كود IATA.
 */
export default function AirportCombobox({ value, onChange, placeholder, lang = "ar", error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const selected = AIRPORTS.find((a) => a.iata === value) || null;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = searchAirports(query, lang, 8);

  const display = selected ? airportLabel(selected, lang) : query;

  return (
    <div className="relative" ref={ref}>
      <div className={cn("relative", error && "ring-2 ring-rose-400 rounded-lg")}>
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
        <input
          type="text"
          value={open ? query : display}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
          dir="ltr"
          className="w-full h-11 pr-10 pl-9 rounded-lg border border-violet-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 text-right"
        />
        {selected && (
          <button
            type="button"
            onClick={() => { onChange(""); setQuery(""); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-violet-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              {lang === "ar" ? "لا توجد نتائج" : "No results"}
            </div>
          ) : (
            results.map((a) => (
              <button
                key={a.iata}
                type="button"
                onClick={() => { onChange(a.iata); setOpen(false); setQuery(""); }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-right hover:bg-violet-50 border-b border-slate-100 last:border-0",
                  a.iata === value && "bg-violet-50"
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-violet-100 text-violet-700 text-xs font-bold shrink-0">{a.iata}</span>
                  <span className="truncate text-sm font-semibold text-slate-700">
                    {lang === "ar" ? a.cityAr : a.cityEn}
                  </span>
                </span>
                <span className="text-xs text-slate-400 shrink-0">{lang === "ar" ? a.countryAr : a.countryEn}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}