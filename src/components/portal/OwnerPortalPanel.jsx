import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import {
  Crown, Building2, FlaskConical, BadgeCheck, CalendarClock, Wallet, Loader2, Sparkles,
} from "lucide-react";

// بوابة خاصة بمالك المنصة — تُفتح تلقائياً عند دخول المالك من بوابة الموظف
// (موظف مُعَدّ role_level = "owner"). تعرض مؤشرات حيّة عن المنشآت المشتركة فقط.
export default function OwnerPortalPanel({ session, employee }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("portalData", {
          token: session.token,
          employee_id: session.employee_id,
          action: "owner_stats",
        });
        const data = res?.data || res;
        if (!data?.ok) setErr(data?.error || "fail");
        else if (live) setStats(data.stats);
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [session?.token, session?.employee_id]);

  const t = isAr ? {
    badge: "بوابة المالك", title: "لوحة تحكّم المالك",
    welcome: (n) => `أهلاً ${n || ""} — هذه بوابتك الخاصة لإدارة منشآت جدارة`,
    total: "إجمالي المنشآت", trials: "تجارب نشطة", paid: "اشتراكات نشطة",
    expiring: "تنتهي خلال 30 يوم", revenue: "الإيرادات السنوية",
    note: "هذه بيانات حيّة من قاعدة المنشآت المشتركة. لإدارة كل التفاصيل والفواتير والموافقات استخدم لوحة الإدارة الكاملة.",
    loading: "جارٍ تحميل بيانات المالك…", fail: "تعذّر تحميل بيانات المالك.",
  } : {
    badge: "Owner Portal", title: "Owner Dashboard",
    welcome: (n) => `Welcome ${n || ""} — your private portal to manage Jadara tenants`,
    total: "Total tenants", trials: "Active trials", paid: "Active subscriptions",
    expiring: "Expiring within 30d", revenue: "Annual revenue",
    note: "Live data from subscribed tenants. For full management, invoices and approvals use the full admin console.",
    loading: "Loading owner data…", fail: "Failed to load owner data.",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden border border-violet-200/60 bg-gradient-to-br from-[#0b1120] via-[#15183a] to-[#3b1d6e] text-white p-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Crown className="text-amber-300" size={26} />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-300/15 text-amber-200 border border-amber-200/30">
              <Sparkles size={12} /> {t.badge}
            </span>
            <h2 className="text-2xl font-bold mt-1.5">{t.title}</h2>
            <p className="text-white/70 text-sm mt-1 truncate">{t.welcome(employee?.full_name)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={18} /> {t.loading}
        </div>
      ) : err ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm">{t.fail}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Building2} label={t.total} value={stats?.total ?? 0} tint="violet" />
            <StatCard icon={FlaskConical} label={t.trials} value={stats?.trials ?? 0} tint="amber" />
            <StatCard icon={BadgeCheck} label={t.paid} value={stats?.paid ?? 0} tint="emerald" />
            <StatCard icon={CalendarClock} label={t.expiring} value={stats?.expiring ?? 0} tint="rose" />
            <StatCard icon={Wallet} label={t.revenue} value={formatCurrency(stats?.revenue || 0)} tint="indigo" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 leading-relaxed">
            {t.note}
          </div>
        </>
      )}
    </div>
  );
}

const TINTS = {
  violet: "bg-violet-100 text-violet-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", TINTS[tint])}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold truncate">{value}</div>
      </div>
    </div>
  );
}