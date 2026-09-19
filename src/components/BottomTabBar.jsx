import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardCheck, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// شريط التبويب السفلي — يدعم حفظ تاريخ التنقّل بين التبويبات (history stack preservation)
// بحيث يبقى مسار العودة محفوظاً عند التبديل بين التبويبات الجذرية.
const TABS = [
  { to: "/app", ar: "الرئيسية", en: "Home", icon: LayoutDashboard },
  { to: "/employees", ar: "الموظفين", en: "Employees", icon: Users },
  { to: "/approvals", ar: "الموافقات", en: "Approvals", icon: ClipboardCheck },
  { to: "/settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon },
];

export default function BottomTabBar({ onNavigate }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const stackRef = useRef([]);

  const isActive = (to) => (to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(to));

  const handleClick = (to) => {
    const stack = stackRef.current;
    if (stack[stack.length - 1] !== to) stack.push(to);
    onNavigate?.();
    const active = isActive(to);
    navigate(to, { state: active ? { refreshKey: Date.now(), tabStack: [...stack] } : { tabStack: [...stack] } });
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#F6F3FC]/95 backdrop-blur border-t border-[#E2D6F4] flex items-stretch justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <button
            key={item.to}
            type="button"
            onClick={() => handleClick(item.to)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-semibold transition-colors",
              active ? "text-[#7C5CE6]" : "text-[#8B7AB8]"
            )}
          >
            <Icon size={20} />
            {isAr ? item.ar : item.en}
          </button>
        );
      })}
    </nav>
  );
}