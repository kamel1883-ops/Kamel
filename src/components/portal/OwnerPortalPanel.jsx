import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Crown, Building2, FlaskConical, BadgeCheck, CalendarClock, Wallet, Loader2,
  AlertTriangle, Pause, Play, RefreshCw, FileCheck2, Bell, Mail, Search,
  Users, MessageSquare, Check, Sparkles, ShieldCheck, Clock,
} from "lucide-react";

// بوابة مالك النظام — تُفتح داخل بوابة الموظف عند role_level === "owner"
// تعرض جدول العملاء، إشعارات قرب الانتهاء، تأكيد الدفع، إيقاف/إعادة تفعيل،
// تسجيل اشتراك (مع إرفاق الإيصال)، وملخص استبيانات تجربة العميل.
export default function OwnerPortalPanel({ session, employee }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "لوحة تحكّم مالك النظام",
    welcome: (n) => `أهلاً ${n || ""} — مالك منصة جدارة. إدارة كاملة لعملائك واشتراكاتهم.`,
    sTotal: "إجمالي العملاء", sTrial: "تجارب جارية", sPaid: "مُشتركون فعّالون",
    sSuspended: "موقوفون", sExpiring: "قارب الانتهاء", sRevenue: "الإيرادات (ر.س/سنة)",
    filterAll: "الكل", filterTrial: "تجربة", filterActive: "سنوي فعّال",
    filterSuspended: "موقوف", filterExpiring: "قارب الانتهاء",
    searchPh: "ابحث باسم المنشأة أو جهة الاتصال…",
    thCustomer: "العميل", thContact: "جهة الاتصال", thStatus: "الحالة",
    thEnd: "نهاية الفترة", thActions: "إجراءات",
    uptime: (d) => `اشتراك: ${d || "—"}`, triTime: (d, n) => `تجربة: ${d || "—"} (${n} يوم)`,
    daysLeft: (n) => `متبقي ${n} يوم`, ended: "انتهت — راجع الحساب",
    regSub: "تسجيل اشتراك", confirmRenew: "تأكيد الدفع والتفعيل", suspend: "إيقاف",
    resume: "إعادة تفعيل", activate: "تفعيل مباشر",
    pendingPay: "بانتظار تأكيد الدفع", noTenants: "لا يوجد عملاء بعد — تُسجّل تلقائياً من صفحة الهبوط.",
    notifTitle: "تنبيهات قرب الانتهاء", noNotif: "لا تنبيهات حالياً.",
    mailtoSub: "تذكير: اقتراب انتهاء اشتراك منصة جدارة",
    mailtoBody: (name, days) => `السلام عليكم،\n\nنحيطكم بأن اشتراك منشأتكم «${name}» في منصة جدارة ينتهي خلال ${days} يوم. يرجى المبادرة بالتجديد لتجنب توقف الخدمة.\n\nشاكرين لكم،\nفريق جدارة`,
    surveyTitle: "استبيانات تجربة العميل", surveyResponses: "إجمالي الردود",
    surveyAvg: "متوسط التقييم", surveyNote: "تُرسل الاستبيانات للمشتركين وتظهر نتائجهم هنا تلقائياً.",
    loading: "جارٍ تحميل البيانات…", fail: "تعذّر تحميل البيانات. أعد المحاولة.",
    dReg: "تسجيل اشتراك", dPlan: "الباقة", dAnnual: "سنوي", dMonthly: "شهري",
    dAmount: "المبلغ (ر.س)", dMethod: "طريقة الدفع", dDirect: "تحويل مباشر",
    dProof: "إثبات الدفع — إيصال التحويل (اختياري)", dCancel: "إلغاء", dConfirm: "تأكيد وتفعيل",
    dRenewTitle: "تأكيد تجديد وتفعيل", dRenewNote: "أرفق صورة الإيصال أو إثبات التحويل الذي وصلك من العميل.",
    sent: "تم تنفيذ العملية بنجاح.",
  } : {
    title: "System Owner Dashboard",
    welcome: (n) => `Welcome ${n || ""} — Jadara owner. Full control of your clients and subscriptions.`,
    sTotal: "Total clients", sTrial: "Active trials", sPaid: "Active subscribers",
    sSuspended: "Suspended", sExpiring: "Expiring soon", sRevenue: "Revenue (SAR/yr)",
    filterAll: "All", filterTrial: "Trial", filterActive: "Active",
    filterSuspended: "Suspended", filterExpiring: "Expiring",
    searchPh: "Search by company or contact…",
    thCustomer: "Customer", thContact: "Contact", thStatus: "Status",
    thEnd: "Period end", thActions: "Actions",
    uptime: (d) => `Sub: ${d || "—"}`, triTime: (d, n) => `Trial: ${d || "—"} (${n}d)`,
    daysLeft: (n) => `${n} days left`, ended: "Ended — review",
    regSub: "Register sub", confirmRenew: "Confirm & activate", suspend: "Suspend",
    resume: "Resume", activate: "Direct activate",
    pendingPay: "Awaiting payment confirmation", noTenants: "No clients yet — registered automatically from landing.",
    notifTitle: "Expiry alerts", noNotif: "No alerts right now.",
    mailtoSub: "Reminder: Jadara subscription ending soon",
    mailtoBody: (name, days) => `Hello,\n\nYour Jadara subscription for “${name}” ends in ${days} days. Please renew to avoid service interruption.\n\nThanks,\nJadara Team`,
    surveyTitle: "Customer experience surveys", surveyResponses: "Total responses",
    surveyAvg: "Avg rating", surveyNote: "Surveys are sent to subscribers; results appear here automatically.",
    loading: "Loading…", fail: "Failed to load. Retry.",
    dReg: "Register subscription", dPlan: "Plan", dAnnual: "Annual", dMonthly: "Monthly",
    dAmount: "Amount (SAR)", dMethod: "Payment method", dDirect: "Direct transfer",
    dProof: "Payment proof (optional)", dCancel: "Cancel", dConfirm: "Confirm & activate",
    dRenewTitle: "Confirm renewal & activate", dRenewNote: "Attach the receipt/proof sent by the client.",
    sent: "Done successfully.",
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [regTenant, setRegTenant] = useState(null);
  const [renewInfo, setRenewInfo] = useState(null); // { tenant, sub }

  const call = useCallback(async (action, extra = {}) => {
    const p = base44.functions.invoke("portalData", {
      token: session.token, employee_id: session.employee_id, action, ...extra,
    });
    const res = await Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 25000)),
    ]);
    const d = res?.data || res;
    if (!d?.ok) throw new Error(d?.error || "fail");
    return d;
  }, [session?.token, session?.employee_id]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await call("owner_list");
      setData(d);
      setErr("");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => { load(); }, [load]);
  const [extras, setExtras] = useState(null);
  const loadExtras = useCallback(async () => {
    try { const d = await call("owner_extras"); setExtras(d); } catch (_e) { setExtras(null); }
  }, [call]);
  useEffect(() => { loadExtras(); }, [loadExtras]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const act = async (id, action, extra = {}) => {
    setBusyId(id || action);
    try {
      await call(action, extra);
      flash(t.sent);
      await load();
      await loadExtras();
    } catch (e) {
      alert((e?.message || "fail"));
    } finally {
      setBusyId(null);
    }
  };

  const tenants = data?.tenants || [];
  const pendings = extras?.pendings || [];
  const expiring = data?.expiring || [];
  const stats = data?.stats || {};
  const surveyStats = extras?.surveyStats || { responses: 0, avg: 0 };
  const pendingByTenant = useMemo(() => {
    const m = new Map();
    for (const p of pendings) if (p.tenant_id) m.set(p.tenant_id, p);
    return m;
  }, [pendings]);

  const filtered = useMemo(() => {
    let list = tenants;
    if (filter === "trial") list = list.filter((x) => x.status === "trial");
    else if (filter === "active") list = list.filter((x) => x.status === "active");
    else if (filter === "suspended") list = list.filter((x) => x.status === "expired");
    else if (filter === "expiring") {
      const ids = new Set(expiring.map((e) => e.id));
      list = list.filter((x) => ids.has(x.id));
    }
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((x) => (`${x.name} ${x.contact_name || ""} ${x.contact_email || ""}`).toLowerCase().includes(s));
    return list;
  }, [tenants, filter, q, expiring]);

  return (
    <div className="space-y-6">
      {/* Hero — مالك النظام (لا انتماء لمنشأة) */}
      <div className="rounded-3xl overflow-hidden border border-violet-200/60 bg-gradient-to-br from-[#0b1120] via-[#15183a] to-[#3b1d6e] text-white p-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Crown className="text-amber-300" size={26} />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-300/15 text-amber-200 border border-amber-200/30">
              <Sparkles size={12} /> {isAr ? "مالك النظام" : "System Owner"}
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
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-center justify-between gap-3 flex-wrap">
          <span>{t.fail} ({err})</span>
          <Button size="sm" variant="outline" onClick={() => { load(); loadExtras(); }} className="shrink-0 gap-1.5 h-8"><RefreshCw size={13} /> {isAr ? "إعادة المحاولة" : "Retry"}</Button>
        </div>
      ) : (
        <>
          {/* مؤشرات */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat icon={Building2} label={t.sTotal} value={stats.total ?? 0} tint="violet" />
            <Stat icon={FlaskConical} label={t.sTrial} value={stats.trials ?? 0} tint="amber" />
            <Stat icon={BadgeCheck} label={t.sPaid} value={stats.paid ?? 0} tint="emerald" />
            <Stat icon={Pause} label={t.sSuspended} value={stats.suspended ?? 0} tint="slate" />
            <Stat icon={CalendarClock} label={t.sExpiring} value={stats.expiring ?? 0} tint="rose" />
            <Stat icon={Wallet} label={t.sRevenue} value={formatCurrency(stats.revenue || 0)} tint="indigo" />
          </div>

          {/* إشعارات قرب الانتهاء */}
          <Card title={t.notifTitle} icon={Bell}>
            {expiring.length === 0 ? (
              <Empty icon={<Bell size={26} />} text={t.noNotif} />
            ) : (
              <div className="space-y-2">
                {expiring.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{e.name}</div>
                        <div className="text-xs text-rose-700">
                          {e.days <= 0 ? t.ended : t.daysLeft(e.days)} · {e.end}
                        </div>
                      </div>
                    </div>
                    {e.contact_email && (
                      <a
                        href={`mailto:${e.contact_email}?subject=${encodeURIComponent(t.mailtoSub)}&body=${encodeURIComponent(t.mailtoBody(e.name, e.days))}`}
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                      >
                        <Mail size={13} /> {isAr ? "إرسال إيميل" : "Email"}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* بانتظار تأكيد الدفع */}
          {pendings.length > 0 && (
            <Card title={t.pendingPay} icon={<Clock size={18} />}>
              <div className="space-y-2">
                {pendings.map((p) => {
                  const tx = tenants.find((x) => x.id === p.tenant_id);
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{tx?.name || p.tenant_name || "—"}</div>
                        <div className="text-xs text-amber-700">
                          {formatCurrency(Number(p.amount) || 0)} · {p.period_start} → {p.period_end}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setRenewInfo({ tenant: tx, sub: p })} className="gap-1.5 h-8 shrink-0">
                        <FileCheck2 size={14} /> {t.confirmRenew}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* الاستبيانات */}
          <Card title={t.surveyTitle} icon={<MessageSquare size={18} />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground">{t.surveyResponses}</div>
                <div className="text-2xl font-bold mt-1">{surveyStats.responses ?? 0}</div>
              </div>
              <div className="bg-slate-50 border border-border rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground">{t.surveyAvg}</div>
                <div className="text-2xl font-bold mt-1">{surveyStats.avg ?? 0}/5</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t.surveyNote}</p>
          </Card>

          {/* فلتر + بحث */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                ["all", t.filterAll], ["trial", t.filterTrial], ["active", t.filterActive],
                ["suspended", t.filterSuspended], ["expiring", t.filterExpiring],
              ].map(([k, label]) => (
                <button key={k} type="button" onClick={() => setFilter(k)}
                  className={cn("px-3.5 py-1.5 rounded-full text-xs font-medium border transition",
                    filter === k ? "bg-violet-600 text-white border-violet-600" : "bg-white border-border text-muted-foreground hover:bg-slate-50")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} className="ps-9" />
            </div>
          </div>

          {/* جدول العملاء */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-muted-foreground text-xs">
                  <tr>
                    <th className="text-start font-medium px-4 py-3">{t.thCustomer}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thContact}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thStatus}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thEnd}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((x) => {
                    const pending = pendingByTenant.get(x.id);
                    const owner = isOwnerTenant(x);
                    const dl = owner ? null : (x.status === "active" ? daysLeft(x.subscription_end) : x.status === "trial" ? daysLeft(x.trial_end) : null);
                    const endingSoon = dl != null && dl <= 30;
                    return (
                      <tr key={x.id} className={cn("hover:bg-slate-50", endingSoon && "bg-rose-50/70")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {x.logo_url ? (
                              <img src={x.logo_url} alt={x.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 size={18} className="text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0 leading-tight">
                              <div className="font-medium truncate">{x.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{x.industry || x.city || "—"}</div>
                              {(x.employee_count > 0 || x.pricing_tier) && (
                                <div className="text-[11px] text-violet-600 mt-0.5 flex items-center gap-1">
                                  <Users size={11} /> {x.employee_count || 0} · {x.pricing_tier || "—"}
                                  {x.quoted_amount > 0 && <span className="font-semibold">· {x.quoted_amount.toLocaleString()} {isAr ? "ر.س" : "SAR"}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="leading-tight"><div className="truncate">{x.contact_name || "—"}</div>
                          <div className="text-xs text-muted-foreground truncate">{x.contact_phone || x.contact_email || "—"}</div></div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={x.status} isAr={isAr} /></td>
                        <td className={cn("px-4 py-3", owner ? "text-emerald-700 font-medium" : endingSoon ? "text-rose-700 font-medium" : "text-muted-foreground")}>
                          {owner ? (isAr ? "مدى الحياة" : "Lifetime") : (x.status === "active" ? t.uptime(x.subscription_end) : x.status === "trial" ? t.triTime(x.trial_end, daysLeft(x.trial_end)) : "—")}
                          {!owner && endingSoon && (
                            <div className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                              <AlertTriangle size={11} /> {dl <= 0 ? t.ended : t.daysLeft(dl)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {(x.status === "trial" || x.status === "expired") && (
                              <Button size="sm" onClick={() => setRegTenant(x)} className="gap-1.5 h-8" disabled={busyId === x.id}>
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />} {t.regSub}
                              </Button>
                            )}
                            {pending && (
                              <Button size="sm" variant="secondary" onClick={() => setRenewInfo({ tenant: x, sub: pending })} className="gap-1.5 h-8">
                                <FileCheck2 size={13} /> {t.confirmRenew}
                              </Button>
                            )}
                            {(x.status === "active" || x.status === "trial") && (
                              <Button size="sm" variant="ghost" onClick={() => act(x.id, "owner_suspend", { tenant_id: x.id })} disabled={busyId === x.id} className="gap-1.5 h-8 text-rose-600">
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} />} {t.suspend}
                              </Button>
                            )}
                            {x.status === "expired" && (
                              <Button size="sm" variant="ghost" onClick={() => act(x.id, "owner_resume", { tenant_id: x.id })} disabled={busyId === x.id} className="gap-1.5 h-8 text-emerald-600">
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} {t.resume}
                              </Button>
                            )}
                            {x.status !== "active" && !pending && x.status !== "expired" && (
                              <Button size="sm" variant="outline" onClick={() => act(x.id, "owner_activate", { tenant_id: x.id })} disabled={busyId === x.id} className="gap-1.5 h-8">
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <Crown size={13} />} {t.activate}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">{t.noTenants}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-5 inset-x-0 flex justify-center z-50">
          <div className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
            <Check size={15} /> {toast}
          </div>
        </div>
      )}

      <RegisterSubDialog open={!!regTenant} onClose={() => setRegTenant(null)} tenant={regTenant} isAr={isAr} t={t}
        onDone={(payload) => act(regTenant?.id, "owner_register_sub", { tenant_id: regTenant?.id, ...payload })} />

      <ConfirmRenewDialog open={!!renewInfo} onClose={() => setRenewInfo(null)} info={renewInfo} isAr={isAr} t={t}
        onDone={(payload) => act(renewInfo?.tenant?.id, "owner_confirm_renew", { tenant_id: renewInfo?.tenant?.id, sub_id: renewInfo?.sub?.id, ...payload })} />
    </div>
  );
}

// حساب المالك دائم مدى الحياة — لا تاريخ انتهاء لاشتراكه.
function isOwnerTenant(x) {
  return /\(المالك\)|\(owner\)/i.test(x?.name || "");
}

function daysLeft(date) {
  if (!date) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function StatusBadge({ status, isAr }) {
  const map = isAr ? {
    trial: { label: "تجربة", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    active: { label: "فعّال", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    expired: { label: "موقوف", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    cancelled: { label: "ملغي", cls: "bg-slate-100 text-slate-500 border-slate-200" },
  } : {
    trial: { label: "Trial", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    expired: { label: "Suspended", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const m = map[status] || { label: status, cls: "bg-slate-100 text-slate-500 border-slate-200" };
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", m.cls)}>{m.label}</span>;
}

const TINTS = {
  violet: "bg-violet-100 text-violet-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  slate: "bg-slate-200 text-slate-600",
  rose: "bg-rose-100 text-rose-600",
  indigo: "bg-indigo-100 text-indigo-600",
};
function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-3.5 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", TINTS[tint])}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-lg font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <div className="flex justify-center mb-2 opacity-50">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  );
}

function RegisterSubDialog({ open, onClose, tenant, isAr, t, onDone }) {
  const [plan, setPlan] = useState("annual");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("direct");
  const [proof, setProof] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setPlan("annual"); setAmount(""); setMethod("direct"); setProof(null); } }, [open, tenant]);
  const submit = async () => {
    if (!tenant || !amount) return;
    setSaving(true);
    try {
      let proofUrl = "";
      if (proof) { const r = await base44.integrations.Core.UploadFile({ file: proof }); proofUrl = r?.file_url || ""; }
      await onDone({ plan, amount: Number(amount), method, proof_url: proofUrl });
      onClose();
    } catch (e) {
      alert(e?.message || "fail");
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t.dReg} — {tenant?.name}</DialogTitle></DialogHeader>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.dPlan}</Label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="annual">{t.dAnnual}</option>
                <option value="monthly">{t.dMonthly}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.dAmount}</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.dMethod}</Label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="direct">{t.dDirect}</option>
              <option value="online">{isAr ? "دفع إلكتروني" : "Online"}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t.dProof}</Label>
            <Input type="file" onChange={(e) => setProof(e.target.files?.[0])} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t.dCancel}</Button>
          <Button onClick={submit} disabled={saving || !amount} className="gap-1.5">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {t.dConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmRenewDialog({ open, onClose, info, isAr, t, onDone }) {
  const [proof, setProof] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setProof(null); }, [open]);
  const sub = info?.sub;
  const submit = async () => {
    setSaving(true);
    try {
      let proofUrl = "";
      if (proof) { const r = await base44.integrations.Core.UploadFile({ file: proof }); proofUrl = r?.file_url || ""; }
      await onDone({ proof_url: proofUrl });
      onClose();
    } catch (e) {
      alert(e?.message || "fail");
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t.dRenewTitle} — {info?.tenant?.name}</DialogTitle></DialogHeader>
        {sub && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="font-semibold">{formatCurrency(Number(sub.amount) || 0)}</div>
              <div className="text-muted-foreground text-xs mt-1">{sub.period_start} → {sub.period_end}</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.dProof}</Label>
              <Input type="file" onChange={(e) => setProof(e.target.files?.[0])} />
            </div>
            <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-3">{t.dRenewNote}</div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t.dCancel}</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {t.dConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}