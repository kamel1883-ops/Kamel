import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
    LayoutDashboard, Users, CalendarCheck, FileSpreadsheet, ClipboardCheck, Wallet, ShieldCheck, Building2,
    LogOut, Menu, X, UserCircle, Settings, Car, Calculator,
    Target, Crown, BarChart3, Network, ClipboardList, CalendarDays, Plane, ClipboardPenLine, DoorOpen, AlertTriangle
  } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

const navItems = [
  { to: "/app", ar: "لوحة التحكم", en: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفون", en: "Employees", icon: Users },
  { to: "/attendance", ar: "الحضور والانصراف", en: "Attendance", icon: CalendarCheck },
  { to: "/import-attendance", ar: "استيراد البصمات", en: "Import Punches", icon: FileSpreadsheet },
  { to: "/approvals", ar: "الموافقات والطلبات", en: "Approvals", icon: ClipboardCheck },
  { to: "/leaves", ar: "إدارة الإجازات", en: "Leaves", icon: CalendarDays },
  { to: "/business-trips", ar: "رحلات العمل والانتداب", en: "Business Trips", icon: Plane },
  { to: "/payroll", ar: "الرواتب", en: "Payroll", icon: Wallet },
  { to: "/fleet", ar: "إدارة الأسطول", en: "Fleet", icon: Car },
  { to: "/end-of-service", ar: "نهاية الخدمة", en: "End of Service", icon: Calculator },
  { to: "/performance", ar: "الأداء والتطوير", en: "Performance", icon: Target },
  { to: "/org-structure", ar: "الهيكل التنظيمي", en: "Org Structure", icon: Network },
  { to: "/succession", ar: "تخطيط التعاقب", en: "Succession", icon: Crown },
  { to: "/workforce-planning", ar: "تخطيط القوة العاملة", en: "Workforce Planning", icon: ClipboardList },
  { to: "/exit-interviews", ar: "مقابلات المغادرة", en: "Exit Interviews", icon: DoorOpen },
  { to: "/warnings", ar: "سياسة العمل والإنذارات", en: "Labor Policy & Warnings", icon: AlertTriangle },
  { to: "/surveys", ar: "استبيانات الموظفين", en: "Surveys", icon: ClipboardPenLine },
  { to: "/licenses", ar: "تراخيص المنشأة", en: "Licenses", icon: ShieldCheck },
  { to: "/analytics", ar: "التحليلات", en: "Analytics", icon: BarChart3 },
  { to: "/owner", ar: "إدارة العملاء", en: "Clients", icon: Building2 },
  { to: "/settings", ar: "إعدادات المنشأة", en: "Settings", icon: Settings },
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
          <Link to="/app"><Logo tone="light" size={44} /></Link>
          <button className="lg:hidden text-white/60" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="h-px bg-gradient-to-l from-violet-500/50 to-indigo-500/30" />

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border-r-2",
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
        <header className="lg:hidden h-16 bg-[#0b1120] text-white border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2.5"><Logo tone="light" size={36} /></div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button onClick={() => setOpen(true)} className="text-white/80"><Menu size={22} /></button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-9 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}