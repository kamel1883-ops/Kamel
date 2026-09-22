import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bell, BarChart3, Settings as SettingsIcon,
  Briefcase, Users, Fingerprint, ClipboardList, CalendarDays, Plane, PlaneTakeoff, Target, GraduationCap,
  Wallet, Shield, Package, Gift, CheckCircle2, FileText,
  Car, ShieldCheck, HeartPulse, FileBadge, Globe, ScrollText, MessageSquareWarning,
  CalendarRange, GitBranch, Network, ShieldAlert, MessageSquare,
  ChevronLeft, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Image } from "@/components/ui/image";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

// بطاقات الأقسام البصرية لبوابة الشركات — تجمع مسارات التنقّل في 5 مجموعات هرمية قابلة للتوسعة.
const GROUPS = [
  {
    id: "home", icon: LayoutDashboard,
    ar: "الرئيسية", en: "Home",
    items: [
      { to: "/app", ar: "الرئيسية", en: "Dashboard", icon: LayoutDashboard },
      { to: "/notifications", ar: "الإشعارات", en: "Notifications", icon: Bell },
      { to: "/analytics", ar: "التحليلات والتقارير", en: "Analytics", icon: BarChart3 },
      { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
    ],
  },
  {
    id: "hr", icon: Users,
    ar: "الموارد البشرية", en: "Human Resources",
    items: [
      { to: "/recruitment", ar: "إدارة التوظيف", en: "Recruitment", icon: Briefcase },
      { to: "/employees", ar: "إدارة الموظفين", en: "Employees", icon: Users },
      { to: "/attendance", ar: "إدارة الحضور والانصراف", en: "Attendance", icon: Fingerprint },
      { to: "/import-attendance", ar: "استيراد البصمات", en: "Import Attendance", icon: ClipboardList },
      { to: "/leaves", ar: "إدارة الإجازات", en: "Leaves", icon: CalendarDays },
      { to: "/business-trips", ar: "رحلات العمل", en: "Business Trips", icon: Plane },
      { to: "/flight-bookings", ar: "حجوزات الطيران", en: "Flight Bookings", icon: PlaneTakeoff },
      { to: "/performance", ar: "إدارة الأداء", en: "Performance", icon: Target },
      { to: "/training", ar: "التدريب والتطوير", en: "Training", icon: GraduationCap },
    ],
  },
  {
    id: "finance", icon: Wallet,
    ar: "المالية والمزايا", en: "Finance & Benefits",
    items: [
      { to: "/payroll", ar: "إدارة الرواتب", en: "Payroll", icon: Wallet },
      { to: "/gosi", ar: "التأمينات الاجتماعية", en: "GOSI", icon: Shield },
      { to: "/equipment", ar: "العهد والمصروفات", en: "Custody", icon: Package },
      { to: "/incentives", ar: "الحوافز والمكافآت", en: "Incentives", icon: Gift },
      { to: "/approvals", ar: "إدارة الموافقات", en: "Approvals", icon: CheckCircle2 },
      { to: "/end-of-service", ar: "نهاية الخدمة", en: "End of Service", icon: FileText },
    ],
  },
  {
    id: "ops", icon: Car,
    ar: "العمليات والامتثال", en: "Operations & Compliance",
    items: [
      { to: "/fleet", ar: "إدارة المركبات", en: "Fleet", icon: Car },
      { to: "/vehicle-insurance", ar: "تأمين المركبات", en: "Vehicle Insurance", icon: ShieldCheck },
      { to: "/health-insurance", ar: "التأمين الصحي", en: "Health Insurance", icon: HeartPulse },
      { to: "/licenses", ar: "إدارة التراخيص", en: "Licenses", icon: FileBadge },
      { to: "/platform-subscriptions", ar: "اشتراكات المنصات", en: "Platform Subscriptions", icon: Globe },
      { to: "/decisions", ar: "القرارات الإدارية", en: "Decisions", icon: ScrollText },
      { to: "/complaints", ar: "الشكاوى", en: "Complaints", icon: MessageSquareWarning },
    ],
  },
  {
    id: "org", icon: Network,
    ar: "التنظيم والتطوير", en: "Organization & Development",
    items: [
      { to: "/workforce-planning", ar: "تخطيط القوى العاملة", en: "Workforce Planning", icon: CalendarRange },
      { to: "/succession", ar: "التعاقب الوظيفي", en: "Succession", icon: GitBranch },
      { to: "/org-structure", ar: "الهيكل التنظيمي", en: "Org Structure", icon: Network },
      { to: "/warnings", ar: "إدارة الإنذارات", en: "Warnings", icon: ShieldAlert },
      { to: "/exit-interviews", ar: "مقابلات المغادرة", en: "Exit Interviews", icon: MessageSquare },
      { to: "/surveys", ar: "إدارة الاستبيانات", en: "Surveys", icon: ClipboardList },
    ],
  },
];

export default function CompanyNav({ user, onLogout, onClose }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const location = useLocation();
  const isActive = (path) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

  const activeGroup = GROUPS.find((g) => g.items.some((it) => isActive(it.to)))?.id;
  const [open, setOpen] = useState(() => (activeGroup ? new Set([activeGroup]) : new Set()));
  useEffect(() => {
    setOpen((prev) => {
      if (!activeGroup) return prev;
      const next = new Set(prev);
      next.add(activeGroup);
      return next;
    });
  }, [activeGroup]);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ui = isAr
    ? { portal: "بوابة الشركات", logout: "تسجيل الخروج", manager: "المدير" }
    : { portal: "Company Portal", logout: "Sign out", manager: "Manager" };

  return (
    <>
      <style>{`
        @keyframes cnav-rise { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        .cnav-group { animation: cnav-rise .5s ease both; }
        .cnav-group:nth-child(2) { animation-delay: .06s; }
        .cnav-group:nth-child(3) { animation-delay: .12s; }
        .cnav-group:nth-child(4) { animation-delay: .18s; }
        .cnav-group:nth-child(5) { animation-delay: .24s; }
        .cnav-items { transition: max-height .3s ease; }
      `}</style>

      {/* رأس البوابة */}
      <div className="h-[66px] flex-none flex items-center justify-between px-4 bg-[linear-gradient(135deg,#6D45D6,#4B27A8)] text-white border-b-[3px] border-[#E8B14A]">
        <Link to="/app" onClick={onClose} className="flex items-center gap-2.5">
          <span className="w-[38px] h-[38px] rounded-[13px] bg-white grid place-items-center shadow-[0_5px_12px_rgba(48,27,120,0.38)]">
            <Logo tone="dark" size={26} />
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">{ui.portal}</span>
        </Link>
        <button className="lg:hidden text-white/90 active:scale-95 transition" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>
        <span className="hidden lg:block w-2 h-2 rounded-full bg-[#E8B14A] shadow-[0_0_0_4px_rgba(255,255,255,0.15)]" />
      </div>

      {/* بطاقات الأقسام */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 flex flex-col gap-[7px] bg-[linear-gradient(180deg,#FBFAFF,#FFFFFF)]">
        {GROUPS.map((g) => {
          const GIcon = g.icon;
          const isOpen = open.has(g.id);
          return (
            <section key={g.id} className="cnav-group rounded-[15px] border border-[#E5DCFA] bg-white shadow-[0_5px_15px_rgba(93,59,176,0.08)] overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(g.id)}
                className="w-full min-h-[42px] px-3 py-2 flex items-center gap-2.5 cursor-pointer bg-[linear-gradient(100deg,#6D45D6,#805FE1)] text-white"
              >
                <span className="w-[27px] h-[27px] rounded-[9px] grid place-items-center bg-[#E8B14A] text-[#40258E] shadow-[inset_0_-2px_0_#A86F16]">
                  <GIcon size={15} strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-extrabold flex-1 text-right">{isAr ? g.ar : g.en}</span>
                <ChevronLeft size={16} strokeWidth={3} className={cn("text-[#F8D889] transition-transform duration-300", isOpen ? "rotate-90" : "rotate-0")} />
              </button>
              <div className="cnav-items overflow-hidden" style={{ maxHeight: isOpen ? "600px" : "0px" }}>
                <div className="grid grid-cols-2 gap-1 p-[7px] bg-white">
                  {g.items.map((it) => {
                    const active = isActive(it.to);
                    return (
                      <Link
                        key={it.to}
                        to={it.to}
                        onClick={onClose}
                        className={cn(
                          "min-h-[34px] flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg border text-[11px] font-bold leading-tight",
                          active
                            ? "bg-[#F0EBFF] border-[#C9B8F4] text-[#5534B4]"
                            : "bg-[#FCFBFF] border-[#EEE9FB] text-[#493B70]"
                        )}
                      >
                        <span className={cn("w-[5px] h-[5px] shrink-0 rounded-full", active ? "bg-[#6D45D6]" : "bg-[#E8B14A]")} />
                        <span className="min-w-0 line-clamp-2">{isAr ? it.ar : it.en}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </nav>

      {/* بطاقة المستخدم + اللغة + الخروج */}
      <div className="flex-none border-t border-[#EDE8F8] px-3 pt-2 pb-2.5 bg-white">
        <div className="px-1 pb-1.5"><LanguageToggle /></div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-[#EBE5F7] bg-[#FAF9FF]">
          {user?.avatar_url ? (
            <Image src={user.avatar_url} fittingType="fill" className="w-[29px] h-[29px] rounded-full shrink-0 border border-[#E8DEF7]" />
          ) : (
            <span className="w-[29px] h-[29px] rounded-full bg-[#EADFFF] grid place-items-center shrink-0 text-[13px] font-black text-[#6D45D6]">
              {(user?.full_name || ui.manager).charAt(0)}
            </span>
          )}
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[12px] font-black text-[#30225C] truncate">{user?.full_name || ui.manager}</div>
            <div className="text-[10px] text-[#8A7BA9] truncate" dir="ltr">{user?.email || ""}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-1.5 w-full h-[34px] rounded-lg border border-[#EADFF8] bg-white text-[#755D9D] text-[11px] font-extrabold transition-[background-color,color,box-shadow] duration-[180ms] hover:bg-[#FFF7E8] hover:text-[#A76B13] hover:shadow-[0_4px_10px_rgba(232,177,74,0.20)] active:bg-[#F8EDFF] active:text-[#4B27A8] focus-visible:outline-[3px] focus-visible:outline-[#E8B14A] focus-visible:outline-offset-2"
        >
          {ui.logout}
        </button>
      </div>
    </>
  );
}