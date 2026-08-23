import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, TicketPercent, LogOut, Menu, X, UserCircle, LayoutDashboard, Users, ClipboardCheck, Settings as SettingsIcon, ArrowRight, Fingerprint, CheckCircle2, CalendarDays, Plane, Wallet, Shield, Car, FileText, Target, GitBranch, Network, CalendarRange, MessageSquare, ClipboardList, ShieldAlert, BarChart3, FileBadge, Eye, Crown, Briefcase, GraduationCap, Globe, ScrollText, Gift, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationsBell from "@/components/NotificationsBell";
import IdleSessionGuard from "@/components/portal/IdleSessionGuard";
import CompanyAssistant from "@/components/CompanyAssistant";
import AnimatedOutlet from "@/components/AnimatedOutlet";
import { useI18n } from "@/lib/i18n";

const appNav = [
  { to: "/app", ar: "الرئيسية", en: "Dashboard", icon: LayoutDashboard },
  { to: "/recruitment", ar: "إدارة التوظيف", en: "Recruitment", icon: Briefcase },
  { to: "/employees", ar: "الموظفين", en: "Employees", icon: Users },
  { to: "/attendance", ar: "الحضور والانصراف", en: "Attendance", icon: Fingerprint },
  { to: "/import-attendance", ar: "استيراد البصمات يدوياً", en: "Import Attendance", icon: ClipboardList },
  { to: "/approvals", ar: "الموافقات", en: "Approvals", icon: CheckCircle2 },
  { to: "/leaves", ar: "الإجازات", en: "Leaves", icon: CalendarDays },
  { to: "/business-trips", ar: "رحلات العمل", en: "Business Trips", icon: Plane },
  { to: "/payroll", ar: "الرواتب", en: "Payroll", icon: Wallet },
  { to: "/gosi", ar: "التأمينات الاجتماعية", en: "Social Insurance (GOSI)", icon: Shield },
  { to: "/fleet", ar: "المركبات", en: "Fleet", icon: Car },
  { to: "/end-of-service", ar: "نهاية الخدمة", en: "End of Service", icon: FileText },
  { to: "/performance", ar: "إدارة الأداء", en: "Performance", icon: Target },
  { to: "/training", ar: "التدريب والتطوير", en: "Training & Development", icon: GraduationCap },
  { to: "/workforce-planning", ar: "تخطيط القوى العاملة", en: "Workforce Planning", icon: CalendarRange },
  { to: "/succession", ar: "التعاقب الوظيفي", en: "Succession", icon: GitBranch },
  { to: "/org-structure", ar: "الهيكل التنظيمي", en: "Org Structure", icon: Network },
  { to: "/licenses", ar: "إدارة التراخيص", en: "Licenses", icon: FileBadge },
  { to: "/platform-subscriptions", ar: "اشتراكات المنصات الحكومية", en: "Platform Subscriptions", icon: Globe },
  { to: "/warnings", ar: "إدارة الإنذارات", en: "Warnings", icon: ShieldAlert },
  { to: "/decisions", ar: "القرارات الإدارية", en: "Decisions", icon: ScrollText },
  { to: "/incentives", ar: "الحوافز والمكافآت", en: "Incentives", icon: Gift },
  { to: "/exit-interviews", ar: "مقابلات المغادرة", en: "Exit Interviews", icon: MessageSquare },
  { to: "/surveys", ar: "الاستبيانات", en: "Surveys", icon: ClipboardList },
  { to: "/ad-designs", ar: "تصميمات الإعلانات", en: "Ad Designs", icon: Palette },
  { to: "/analytics", ar: "إدارة التحليلات والتقارير", en: "Analytics & Reports", icon: BarChart3 },
  { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
];

const bottomNav = [
  { to: "/app", ar: "الرئيسية", en: "Home", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفين", en: "Employees", icon: Users },
  { to: "/approvals", ar: "الموافقات", en: "Approvals", icon: ClipboardCheck },
  { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const ui = isAr ? { logout: "تسجيل الخروج", manager: "المدير" } : { logout: "Sign out", manager: "Manager" };

  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const restricted = user && user.role !== "admin";
  useEffect(() => {
    if (restricted) navigate("/portal", { replace: true });
  }, [restricted, navigate]);
  if (restricted) return null;

  const handleLogout = async () => {
    try { await base44.auth.logout(); } catch {}
    window.location.href = "/";
  };

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {user && <IdleSessionGuard onTimeout={handleLogout} />}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0B2545] text-white z-40 transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
          <Link to="/app"><Logo tone="light" size={44} /></Link>
          <button className="lg:hidden text-white/60" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="h-px bg-gradient-to-l from-violet-500/50 to-indigo-500/30" />

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {appNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-r-2",
                  active ? "bg-[#16355c] border-violet-300 text-white" : "border-transparent text-white/55 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={19} className={active ? "text-violet-200" : "text-white/50"} />
                {isAr ? item.ar : item.en}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 pb-2"><LanguageToggle /></div>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle size={22} className="text-amber-200" />
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-sm font-medium truncate text-white">{user?.full_name || ui.manager}</div>
              <div className="text-xs text-white/50 truncate">{user?.email || ""}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={19} /> {ui.logout}
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 bg-[#0B2545] text-white border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-20" style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}>
          <div className="flex items-center gap-2.5">
            {location.pathname !== "/app" && location.pathname !== "/" && (
              <button onClick={() => navigate(-1)} className="text-white/80 active:scale-95 transition" aria-label="back">
                <ArrowRight size={22} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
              </button>
            )}
            <Logo tone="light" size={36} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell tone="light" />
            <LanguageToggle />
            <button onClick={() => setOpen(true)} className="text-white/80"><Menu size={22} /></button>
          </div>
        </header>

        <div className="hidden lg:flex items-center justify-between h-14 px-6 border-b bg-background/80 backdrop-blur sticky top-0 z-20">
          <div className="text-sm text-muted-foreground">{isAr ? "منصة جدارة — الموارد البشرية" : "Jadara HR Platform"}</div>
          <NotificationsBell tone="dark" />
        </div>

        <main className="relative flex-1 p-4 sm:p-6 lg:p-9 pb-24 lg:pb-9 animate-fade-in overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.10] via-indigo-500/[0.05] to-amber-200/[0.10] dark:from-violet-500/[0.14] dark:via-indigo-500/[0.10] dark:to-amber-500/[0.08]" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-24 -left-16 w-[460px] h-[460px] rounded-full bg-violet-500/[0.10] dark:bg-violet-500/[0.16] blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 w-[380px] h-[380px] rounded-full bg-amber-400/[0.10] dark:bg-amber-500/[0.10] blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.10]" aria-hidden="true">
            <Crown size={440} className="text-amber-500 dark:text-amber-400" strokeWidth={0.8} />
          </div>
          <div className="relative">
            <AnimatedOutlet />
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0B2545]/95 backdrop-blur border-t border-white/10 flex items-stretch justify-around" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = item.to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} state={active ? { refreshKey: Date.now() } : undefined} onClick={() => setOpen(false)}
                className={cn("flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors", active ? "text-violet-300" : "text-white/55")}>
                <Icon size={20} />
                {isAr ? item.ar : item.en}
              </Link>
            );
          })}
        </nav>
      </div>
      <CompanyAssistant />
    </div>
  );
}