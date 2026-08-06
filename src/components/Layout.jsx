import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, CalendarCheck, FileSpreadsheet, ClipboardCheck, Send, Wallet, ShieldCheck, Building2,
  LogOut, Menu, X, UserCircle, Settings, Car, Calculator,
  Target, Crown, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

const LOGO = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/43df068d0_generated_image.png";

const navItems = [
  { to: "/app", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/employees", label: "الموظفون", icon: Users },
  { to: "/attendance", label: "الحضور والانصراف", icon: CalendarCheck },
  { to: "/import-attendance", label: "استيراد البصمات", icon: FileSpreadsheet },
  { to: "/approvals", label: "الموافقات والطلبات", icon: ClipboardCheck },
  { to: "/my-requests", label: "طلباتي", icon: Send },
  { to: "/payroll", label: "الرواتب", icon: Wallet },
  { to: "/fleet", label: "إدارة الأسطول", icon: Car },
  { to: "/end-of-service", label: "نهاية الخدمة", icon: Calculator },
  { to: "/performance", label: "الأداء والتطوير", icon: Target },
  { to: "/succession", label: "تخطيط التعاقب", icon: Crown },
  { to: "/licenses", label: "تراخيص المنشأة", icon: ShieldCheck },
  { to: "/analytics", label: "التحليلات", icon: BarChart3 },
  { to: "/owner", label: "إدارة العملاء", icon: Building2 },
  { to: "/settings", label: "إعدادات المنشأة", icon: Settings },
];

export default function Layout() {
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
    <div className="min-h-screen bg-[hsl(var(--muted))] flex">
      {/* Sidebar — بنفس لغة الهبوط الفاخرة */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0b1120] text-white z-40 transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-lg overflow-hidden ring-1 ring-white/15">
              <Image src={LOGO} alt="شعار جدارة" className="w-full h-full" fittingType="fit" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>جدارة</div>
              <div className="text-[11px] text-white/50 -mt-0.5">لإدارة الموارد البشرية</div>
            </div>
          </Link>
          <button className="lg:hidden text-white/60" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="h-px bg-gradient-to-l from-violet-500/40 via-amber-300/40 to-transparent" />

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
                  active
                    ? "bg-gradient-to-l from-violet-500/20 to-indigo-500/10 border-amber-400 text-white"
                    : "border-transparent text-white/55 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={19} className={active ? "text-amber-300" : "text-white/50"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle size={22} className="text-amber-200" />
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-sm font-medium truncate text-white">{user?.full_name || "المدير"}</div>
              <div className="text-xs text-white/50 truncate">{user?.email || ""}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={19} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 bg-[#0b1120] text-white border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white overflow-hidden ring-1 ring-white/15">
              <Image src={LOGO} alt="جدارة" className="w-full h-full" fittingType="fit" />
            </div>
            <div className="font-bold leading-tight">
              جدارة
              <div className="text-[10px] font-normal text-white/50 -mt-0.5">لإدارة الموارد البشرية</div>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="text-white/80">
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-9 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}