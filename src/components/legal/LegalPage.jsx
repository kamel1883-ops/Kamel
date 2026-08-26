import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { ArrowLeft } from "lucide-react";

// قالب موحّد لصفحات السياسات العامة (الخصوصية / الاسترداد) بهوية جدارة الكحلية
export default function LegalPage({ isAr, title, updated, intro, sections = [] }) {
  return (
    <div className="min-h-screen bg-[#0B2545] text-white" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/"><Logo tone="light" size={52} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm bg-white/10 border border-white/15 hover:bg-white/15 px-4 py-2 rounded-xl">
              <ArrowLeft size={15} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
              {isAr ? "الرئيسية" : "Home"}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <div className="text-white/50 text-sm mt-2">{isAr ? "آخر تحديث: " : "Last updated: "}{updated}</div>
        <p className="text-white/75 leading-loose mt-6 bg-white/5 border border-white/10 rounded-3xl p-6">{intro}</p>

        <div className="mt-8 space-y-5">
          {sections.map((s, i) => (
            <section key={s.title} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {i + 1}. {s.title}
              </h2>
              {s.body ? <p className="text-white/70 text-sm leading-loose">{s.body}</p> : null}
              {s.items?.length ? (
                <ul className="mt-3 space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="text-white/70 text-sm leading-relaxed flex gap-2">
                      <span className="text-amber-300 shrink-0">•</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="text-center text-white/50 text-sm mt-10">
          {isAr ? "للاستفسارات: " : "Inquiries: "}<a href="mailto:info@jadara-hr.com" className="text-amber-200 hover:text-amber-100" dir="ltr">info@jadara-hr.com</a>
        </div>
      </main>
    </div>
  );
}