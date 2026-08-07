import React from "react";
import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export default function LanguageToggle({ className = "" }) {
  const { lang, toggle } = useI18n();
  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition ${className}`}
      title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages size={15} />
      <span className="font-medium">{lang === "ar" ? "EN" : "ع"}</span>
    </button>
  );
}