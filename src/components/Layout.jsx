import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, TicketPercent, LogOut, Menu, X, UserCircle, LayoutDashboard, Users, ClipboardCheck, Settings as SettingsIcon, ArrowRight, Fingerprint, CheckCircle2, CalendarDays, Plane, Wallet, Car, FileText, Target, GitBranch, Network, CalendarRange, MessageSquare, ClipboardList, ShieldAlert, BarChart3, FileBadge, Eye, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const ownerItems = [
  { to: "/owner", ar: "العملاء والاشتراكات", en: "Customers & Subscriptions", icon: Building2 },
  { to: "/discounts", ar: "كودات الخصم", en: "Discount Codes", icon: TicketPercent },
];

const appNav = [
  { to: "/app", ar: "الرئيسية", en: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفون", en: "Employees", icon: Users },
  { to: "/attendance", ar: "الحضور", en: "Attendance", icon: Fingerprint },
  { to: "/import-attendance", ar: "استيراد الحضور", en: "Import Attendance", icon: ClipboardList },
  { to: "/approvals", ar: "الموافقات", en: "Approvals", icon: CheckCircle2 },
  { to: "/leaves", ar: "الإجازات", en: "Leaves", icon: CalendarDays },
  { to: "/business-trips", ar: "رحلات العمل", en: "Business Trips", icon: Plane },
  { to: "/payroll", ar: "الرواتب", en: "Payroll", icon: Wallet },
  { to: "/fleet", ar: "المركبات", en: "Fleet", icon: Car },
  { to: "/end-of-service", ar: "نهاية الخدمة", en: "End of Service", icon: FileText },
  { to: "/performance", ar: "الأداء", en: "Performance", icon: Target },
  { to: "/succession", ar: "التعاقب الوظيفي", en: "Succession", icon: GitBranch },
  { to: "/org-structure", ar: "الهيكل التنظيمي", en: "Org Structure", icon: Network },
  { to: "/workforce-planning", ar: "تخطيط القوى العاملة", en: "Workforce Planning", icon: CalendarRange },
  { to: "/exit-interviews", ar: "مقابلات المغادرة", en: "Exit Interviews", icon: MessageSquare },
  { to: "/surveys", ar: "الاستبيانات", en: "Surveys", icon: ClipboardList },
  { to: "/warnings", ar: "الإنذارات", en: "Warnings", icon: ShieldAlert },
  { to: "/analytics", ar: "التحليلات", en: "Analytics", icon: BarChart3 },
  { to: "/licenses", ar: "التراخيص", en: "Licenses", icon: FileBadge },
  { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
];

const bottomNav = [
  { to: "/app", ar: "الرئيسية", en: "Home", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفون", en: "Employees", icon: Users },
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
  const [demoMode, setDemoMode] = useState(() => {
    try { return localStorage.getItem("jadara_demo_mode") === "1"; } catch (e) { return false; }
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const restricted = user && user.role !== "admin";
  useEffect(() => {
    if (restricted) navigate("/portal", { replace: true });
  }, [restricted, navigate]);
  if (restricted) return null;

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0b1120] text-white z-40 transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
          <Link to={demoMode ? "/app" : "/owner"}><Logo tone="light" size={44} /></Link>
          <button className="lg:hidden text-white/60" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="h-px bg-gradient-to-l from-violet-500/50 to-indigo-500/30" />

        {!restricted ? (
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                const next = !demoMode;
                setDemoMode(next);
                try { localStorage.setItem("jadara_demo_mode", next ? "1" : "0"); } catch (e) {}
                navigate(next ? "/app" : "/owner");
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border",
                demoMode ? "bg-violet-500/15 border-violet-400/40 text-violet-100" : "bg-white/5 border-white/10 text-white/55 hover:text-white"
              )}
            >
              <Eye size={16} /> {isAr ? (demoMode ? "إنهاء عرض البرنامج" : "عرض البرنامج (تجريبي)") : (demoMode ? "Exit demo" : "Preview app (demo)")}
            </button>
          </div>
        ) : null}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {(demoMode ? appNav : ownerItems).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-r-2",
                  active ? "bg-[#2e2448] border-violet-300 text-white" : "border-transparent text-white/55 hover:text-white hover:bg-white/5"
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
        <header className="lg:hidden h-16 bg-[#0b1120] text-white border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-20" style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}>
          <div className="flex items-center gap-2.5">
            {location.pathname !== "/app" && location.pathname !== "/" && (
              <button onClick={() => navigate(-1)} className="text-white/80 active:scale-95 transition" aria-label="back">
                <ArrowRight size={22} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
              </button>
            )}
            <Logo tone="light" size={36} />
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button onClick={() => setOpen(true)} className="text-white/80"><Menu size={22} /></button>
          </div>
        </header>

        <main className="relative flex-1 p-4 sm:p-6 lg:p-9 pb-24 lg:pb-9 animate-fade-in overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.10] via-indigo-500/[0.05] to-amber-200/[0.10] dark:from-violet-500/[0.14] dark:via-indigo-500/[0.10] dark:to-amber-500/[0.08]" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-24 -left-16 w-[460px] h-[460px] rounded-full bg-violet-500/[0.10] dark:bg-violet-500/[0.16] blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 w-[380px] h-[380px] rounded-full bg-amber-400/[0.10] dark:bg-amber-500/[0.10] blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.10]" aria-hidden="true">
            <Crown size={440} className="text-amber-500 dark:text-amber-400" strokeWidth={0.8} />
          </div>
          <div className="relative">
            <Outlet />
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0b1120]/95 backdrop-blur border-t border-white/10 flex items-stretch justify-around" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = item.to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                className={cn("flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors", active ? "text-violet-300" : "text-white/55")}>
                <Icon size={20} />
                {isAr ? item.ar : item.en}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}