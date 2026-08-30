import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { ArrowLeft } from "lucide-react";

// قالب موحّد لصفحات السياسات العامة (الخصوصية / الاسترداد) بهوية جدارة اللبنية/البنفسجية
export default function LegalPage({ isAr, title, updated, intro, sections = [] }) {
  return (
    <div className="min-h-screen bg-[#F6F3FC] text-foreground" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-violet-100">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/"><Logo tone="dark" size={52} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm bg-white border border-violet-200 text-foreground hover:bg-violet-50 px-4 py-2 rounded-xl transition">
              <ArrowLeft size={15} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
              {isAr ? "الرئيسية" : "Home"}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <div className="text-muted-foreground text-sm mt-2">{isAr ? "آخر تحديث: " : "Last updated: "}{updated}</div>
        <p className="text-muted-foreground leading-loose mt-6 bg-white border border-violet-100 rounded-3xl p-6">{intro}</p>

        <div className="mt-8 space-y-5">
          {sections.map((s, i) => (
            <section key={s.title} className="bg-white border border-violet-100 rounded-3xl p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {i + 1}. {s.title}
              </h2>
              {s.body ? <p className="text-muted-foreground text-sm leading-loose">{s.body}</p> : null}
              {s.items?.length ? (
                <ul className="mt-3 space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="text-muted-foreground text-sm leading-relaxed flex gap-2">
                      <span className="text-violet-600 shrink-0">•</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="text-center text-muted-foreground text-sm mt-10">
          {isAr ? "للاستفسارات: " : "Inquiries: "}<a href="mailto:info@jadara-hr.com" className="text-violet-700 hover:text-violet-800" dir="ltr">info@jadara-hr.com</a>
        </div>
      </main>
    </div>
  );
}