import React from "react";
import { Image } from "@/components/ui/image";
import { ShieldCheck } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/43df068d0_generated_image.png";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* لوحة العلامة الكحلية */}
      <div className="hidden lg:flex w-1/2 bg-[#0b0f19] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden ring-1 ring-white/20">
            <Image src={LOGO} alt="جدارة" className="w-full h-full" fittingType="fit" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
            <div className="text-xs text-white/50">لإدارة الموارد البشرية</div>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            منصة موارد بشرية
            <span className="block bg-gradient-to-l from-violet-300 to-indigo-300 bg-clip-text text-transparent">خارقة ومتكاملة</span>
          </h2>
          <p className="text-white/70 mt-4 max-w-md leading-relaxed">
            موظفون، حضور، رواتب، نهاية خدمة، تأمينات، أداء، تخطيط تعاقبي، تراخيص حكومية، وأنظمة محاسبة — كل ذلك في منصة واحدة فاخرة.
          </p>
          <ul className="mt-7 space-y-2.5 text-sm text-white/80">
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-violet-300 shrink-0" /> امتثال كامل للأنظمة السعودية</li>
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-violet-300 shrink-0" /> تصميم عصري فاخر لعام 2027</li>
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-violet-300 shrink-0" /> تكاملات حكومية ذكية ومحاسبية</li>
          </ul>
        </div>
        <div className="relative text-xs text-white/40">© 2027 جدارة — جميع الحقوق محفوظة</div>
      </div>

      {/* منطقة النموذج */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-11 h-11 rounded-2xl bg-[#0b0f19] overflow-hidden ring-1 ring-white/10">
              <Image src={LOGO} alt="جدارة" className="w-full h-full" fittingType="fit" />
            </div>
            <div className="leading-tight text-foreground">
              <div className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
              <div className="text-[10px] text-muted-foreground">لإدارة الموارد البشرية</div>
            </div>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2e2448] mb-4">
              {Icon && <Icon className="w-7 h-7 text-white" aria-hidden="true" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border/70 p-7">
            {children}
          </div>
          {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
        </div>
      </div>
    </div>
  );
}