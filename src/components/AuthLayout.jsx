import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        pre: "منصة موارد بشرية",
        hi: "خارقة ومتكاملة",
        desc: "موظفون، حضور، رواتب، نهاية خدمة، تأمينات، أداء، تخطيط تعاقبي، تراخيص حكومية، وأنظمة محاسبة — كل ذلك في منصة واحدة فاخرة.",
        li: ["امتثال كامل للأنظمة السعودية", "تصميم عصري فاخر لعام 2027", "تكاملات حكومية ذكية ومحاسبية"],
        copy: "© 2027 جدارة — جميع الحقوق محفوظة",
      }
    : {
        pre: "A Super, Integrated",
        hi: "HR Platform",
        desc: "Employees, attendance, payroll, end of service, GOSI, performance, succession, government licenses, and accounting — all in one premium platform.",
        li: ["Full compliance with Saudi regulations", "Premium modern design for 2027", "Smart government & accounting integrations"],
        copy: "© 2027 Jadara — All rights reserved",
      };

  return (
    <div className="min-h-screen flex bg-background" dir={isAr ? "rtl" : "ltr"}>
      <div className="hidden lg:flex w-1/2 bg-[#0b0f19] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="relative"><Logo tone="light" size={52} /></div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            {t.pre}
            <span className="block bg-gradient-to-l from-violet-300 to-indigo-300 bg-clip-text text-transparent">{t.hi}</span>
          </h2>
          <p className="text-white/70 mt-4 max-w-md leading-relaxed">{t.desc}</p>
          <ul className="mt-7 space-y-2.5 text-sm text-white/80">
            {t.li.map((l) => (
              <li key={l} className="flex items-center gap-2"><ShieldCheck size={16} className="text-violet-300 shrink-0" /> {l}</li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/40">{t.copy}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight size={16} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </Link>
          <LanguageToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8"><Logo tone="dark" size={44} /></div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2e2448] mb-4">
              {Icon && <Icon className="w-7 h-7 text-white" aria-hidden="true" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border/70 p-7">{children}</div>
          {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
        </div>
      </div>
    </div>
  );
}