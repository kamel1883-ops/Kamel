import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, CalendarCheck, ClipboardCheck, Send, Wallet, ShieldCheck,
  LogOut, Menu, X, UserCircle, Sparkles, Settings, Car, Calculator,
  Target, Crown, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/employees", label: "الموظفون", icon: Users },
  { to: "/attendance", label: "الحضور والانصراف", icon: CalendarCheck },
  { to: "/approvals", label: "الموافقات والطلبات", icon: ClipboardCheck },
  { to: "/my-requests", label: "طلباتي", icon: Send },
  { to: "/payroll", label: "الرواتب", icon: Wallet },
  { to: "/fleet", label: "إدارة الأسطول", icon: Car },
  { to: "/end-of-service", label: "نهاية الخدمة", icon: Calculator },
  { to: "/performance", label: "الأداء والتطوير", icon: Target },
  { to: "/succession", label: "تخطيط التعاقب", icon: Crown },
  { to: "/licenses", label: "تراخيص المنشأة", icon: ShieldCheck },
  { to: "/analytics", label: "التحليلات", icon: BarChart3 },
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
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen w-72 bg-white border-l border-border z-40 transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base text-foreground">جدارة</div>
              <div className="text-xs text-muted-foreground">نظام الموارد البشرية</div>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive(item.to)
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                )}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserCircle size={22} />
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-sm font-medium truncate">{user?.full_name || "المدير"}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email || ""}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={19} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-20">
          <button onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="font-bold">جدارة</div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-9 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}