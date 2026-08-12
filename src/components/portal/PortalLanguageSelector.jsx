import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { PORTAL_LANGS, usePortalI18n } from "@/lib/portalI18n";
import { cn } from "@/lib/utils";

// منتقي اللغات في بوابة الموظف الذاتية فقط
export default function PortalLanguageSelector({ className }) {
  const { lang, setLang } = usePortalI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const current = PORTAL_LANGS.find((l) => l.code === lang) || PORTAL_LANGS[0];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition",
          className
        )}
      >
        <Globe size={16} /> <span className="hidden sm:inline">{current.label}</span>
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
          {PORTAL_LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition text-right",
                l.code === lang ? "text-violet-700 font-medium bg-violet-50" : "text-foreground"
              )}
            >
              <span>{l.label}</span>
              {l.code === lang && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}