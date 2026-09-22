import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Menu, ArrowRight, Crown, LayoutDashboard, Users, ClipboardCheck, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import CompanyNav from "@/components/CompanyNav";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationsBell from "@/components/NotificationsBell";
import IdleSessionGuard from "@/components/portal/IdleSessionGuard";
import CompanyAssistant from "@/components/CompanyAssistant";
import AnimatedOutlet from "@/components/AnimatedOutlet";
import BottomTabBar from "@/components/BottomTabBar";
import { useI18n } from "@/lib/i18n";

const ROOT_TABS = ["/app", "/employees", "/approvals", "/settings"];

const bottomNav = [
  { to: "/app", ar: "الرئيسية", en: "Home", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفين", en: "Employees", icon: Users },
  { to: "/approvals", ar: "الموافقات", en: "Approvals", icon: ClipboardCheck },
  { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // تسخين شعار المنشأة مسبقًا في ذاكرة المتصفح ليظهر فورًا في كل المستندات المطبوعة دون تأخير.
    import("@/lib/printBrand").then((m) => m.fetchOrg().catch(() => {}));
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

  const rootTab = ROOT_TABS.includes(location.pathname) ? bottomNav.find((i) => i.to === location.pathname) : null;

  return (
    <div className="min-h-screen bg-background flex">
      {user && <IdleSessionGuard onTimeout={handleLogout} />}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen w-72 bg-white border-l border-[#DDD5F2] z-40 transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <CompanyNav user={user} onLogout={handleLogout} onClose={() => setOpen(false)} />
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 bg-gradient-to-b from-[#F6F3FC] to-[#EFE9F8] text-[#2A2340] border-b border-[#E2D6F4] flex items-center justify-between px-4 sticky top-0 z-20" style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}>
          <div className="flex items-center gap-2.5">
            {rootTab ? (
              <span className="font-extrabold text-[15px] text-[#2A2340]">{isAr ? rootTab.ar : rootTab.en}</span>
            ) : (
              <>
                <button onClick={() => navigate(-1)} className="text-[#6B5E8C] active:scale-95 transition" aria-label="back">
                  <ArrowRight size={22} style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
                </button>
                <Logo tone="dark" size={36} />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell tone="dark" />
            <LanguageToggle />
            <button onClick={() => setOpen(true)} className="text-[#6B5E8C]"><Menu size={22} /></button>
          </div>
        </header>

        <div className="hidden lg:flex items-center justify-between h-14 px-6 border-b bg-[#F8F6FC]/80 backdrop-blur sticky top-0 z-20">
          <div className="text-sm font-medium text-[#6B5E8C]">{isAr ? "منصة جداره — الموارد البشرية" : "Jadara HR Platform"}</div>
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

        <BottomTabBar onNavigate={() => setOpen(false)} />
      </div>
      <CompanyAssistant />
    </div>
  );
}