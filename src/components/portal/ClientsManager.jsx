import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown, Building2, FlaskConical, FileText, BadgeCheck, Pause, CalendarClock,
  Wallet, Loader2, AlertTriangle, RefreshCw, MessageCircle, Search, Users,
  Check, Sparkles, Ban, RotateCcw, ShieldCheck,
} from "lucide-react";
import {
  ActivateDialog, ExtendTrialDialog, waLink, daysLeft, isOwnerTenant,
} from "./ClientActionDialogs";

export default function ClientsManager({ session }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إدارة العملاء والعقود",
    welcome: (n) => `أهلاً ${n || ""} — تابع طلبات التجربة وعرض السعر، استلم التحويل بالواتساب، وأكّد التعاقد وفعّل الاشتراك.`,
    sTotal: "إجمالي العملاء", sTrials: "تجارب جارية", sQuotes: "طلبات عرض سعر",
    sPaid: "مُشتركون فعّالون", sSuspended: "موقوفون", sCancelled: "ملغيات", sRevenue: "الإيرادات (ر.س/سنة)",
    filterAll: "الكل", filterTrial: "تجارب", filterQuote: "طلبات عرض سعر",
    filterActive: "فعّال", filterSuspended: "موقوف", filterExpiring: "قارب الانتهاء", filterCancelled: "ملغيات",
    searchPh: "ابحث باسم المنشأة أو جهة الاتصال أو الرقم الموحد…",
    thCustomer: "العميل", thContact: "جهة التواصل", thSource: "المصدر", thStatus: "الحالة",
    thContract: "التعاقد", thEnd: "نهاية الفترة", thActions: "إجراءات",
    srcTrial: "تجربة", srcQuote: "عرض سعر",
    wa: "واتساب", confirm: "تأكيد وتفعيل", extend: "تمديد التجربة", cancel: "إلغاء", restore: "استرجاع",
    confirmed: "مؤكّد", notConfirmed: "غير مؤكد", noClients: "لا يوجد عملاء بعد — يُسجّلون تلقائياً من صفحة الهبوط أو طلب عرض السعر.",
    loading: "جارٍ تحميل البيانات…", fail: "تعذّر تحميل البيانات. أعد المحاولة.", retry: "إعادة المحاولة",
    sent: "تم تنفيذ العملية بنجاح.",
    daysLeft: (n) => `متبقي ${n} يوم`, ended: "انتهت",
    lifetime: "مدى الحياة", noPhone: "لا رقم",
  } : {
    title: "Clients & Contracts",
    welcome: (n) => `Welcome ${n || ""} — follow up trial & quote requests, receive transfers via WhatsApp, confirm contracts and activate subscriptions.`,
    sTotal: "Total clients", sTrials: "Active trials", sQuotes: "Quote requests",
    sPaid: "Active subscribers", sSuspended: "Suspended", sCancelled: "Cancelled", sRevenue: "Revenue (SAR/yr)",
    filterAll: "All", filterTrial: "Trials", filterQuote: "Quotes",
    filterActive: "Active", filterSuspended: "Suspended", filterExpiring: "Expiring", filterCancelled: "Cancelled",
    searchPh: "Search by company, contact or unified number…",
    thCustomer: "Customer", thContact: "Contact", thSource: "Source", thStatus: "Status",
    thContract: "Contract", thEnd: "Period end", thActions: "Actions",
    srcTrial: "Trial", srcQuote: "Quote",
    wa: "WhatsApp", confirm: "Confirm & activate", extend: "Extend trial", cancel: "Cancel", restore: "Restore",
    confirmed: "Confirmed", notConfirmed: "Not confirmed", noClients: "No clients yet — auto-registered from landing or quote requests.",
    loading: "Loading…", fail: "Failed to load. Retry.", retry: "Retry",
    sent: "Done successfully.",
    daysLeft: (n) => `${n} days left`, ended: "Ended",
    lifetime: "Lifetime", noPhone: "No phone",
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [activate, setActivate] = useState(null);
  const [extend, setExtend] = useState(null);

  const call = useCallback(async (action, extra = {}) => {
    const p = base44.functions.invoke("portalData", { token: session.token, employee_id: session.employee_id, action, ...extra });
    const res = await Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 18000))]);
    const d = res?.data || res;
    if (!d?.ok) throw new Error(d?.error || "fail");
    return d;
  }, [session?.token, session?.employee_id]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try { const d = await call("owner_list"); setData(d); setErr(""); }
    catch (e) { setErr(String(e?.message || e)); }
    finally { setLoading(false); }
  }, [call]);

  const didMount = useRef(false);
  useEffect(() => { if (didMount.current) return; didMount.current = true; loadAll(); }, [loadAll]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const act = async (id, action, extra = {}) => {
    setBusyId(id || action);
    try { await call(action, { tenant_id: id, ...extra }); flash(t.sent); await loadAll(); }
    catch (e) { alert(e?.message || "fail"); }
    finally { setBusyId(null); }
  };

  const tenants = data?.tenants || [];
  const stats = data?.stats || {};

  const filtered = useMemo(() => {
    let list = tenants;
    if (filter === "trial") list = list.filter((x) => x.status === "trial");
    else if (filter === "quote") list = list.filter((x) => x.lead_source === "quote");
    else if (filter === "active") list = list.filter((x) => x.status === "active");
    else if (filter === "suspended") list = list.filter((x) => x.status === "expired");
    else if (filter === "cancelled") list = list.filter((x) => x.status === "cancelled");
    else if (filter === "expiring") list = list.filter((x) => {
      const owner = isOwnerTenant(x);
      if (owner) return false;
      const dl = x.status === "active" ? daysLeft(x.subscription_end) : x.status === "trial" ? daysLeft(x.trial_end) : null;
      return dl != null && dl <= 7;
    });
    else list = list.filter((x) => x.status !== "cancelled");
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((x) => (`${x.name} ${x.contact_name || ""} ${x.contact_email || ""} ${x.unified_number || ""}`).toLowerCase().includes(s));
    return list;
  }, [tenants, filter, q]);

  return (
    <div className="space-y-6">
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
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{t.welcome("")}</p>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (<div key={i} className="h-24 rounded-2xl bg-slate-100 border border-border animate-pulse" />))}
          </div>
          <div className="rounded-2xl border border-border bg-white overflow-hidden animate-pulse">
            <div className="h-11 border-b border-border bg-slate-50" />
            {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-16 border-b border-border bg-white" />))}
          </div>
        </div>
      ) : err ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-center justify-between gap-3 flex-wrap">
          <span>{t.fail} ({err})</span>
          <Button size="sm" variant="outline" onClick={loadAll} className="shrink-0 gap-1.5 h-8"><RefreshCw size={13} /> {t.retry}</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Stat icon={Building2} label={t.sTotal} value={stats.total ?? 0} tint="violet" />
            <Stat icon={FlaskConical} label={t.sTrials} value={stats.trials ?? 0} tint="amber" />
            <Stat icon={FileText} label={t.sQuotes} value={stats.quotes ?? 0} tint="indigo" />
            <Stat icon={BadgeCheck} label={t.sPaid} value={stats.paid ?? 0} tint="emerald" />
            <Stat icon={Pause} label={t.sSuspended} value={stats.suspended ?? 0} tint="slate" />
            <Stat icon={Ban} label={t.sCancelled} value={stats.cancelled ?? 0} tint="rose" />
            <Stat icon={Wallet} label={t.sRevenue} value={formatCurrency(stats.revenue || 0)} tint="indigo" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                ["all", t.filterAll], ["trial", t.filterTrial], ["quote", t.filterQuote],
                ["active", t.filterActive], ["suspended", t.filterSuspended], ["expiring", t.filterExpiring], ["cancelled", t.filterCancelled],
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

          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-muted-foreground text-xs">
                  <tr>
                    <th className="text-start font-medium px-4 py-3">{t.thCustomer}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thContact}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thSource}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thStatus}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thContract}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thEnd}</th>
                    <th className="text-start font-medium px-4 py-3">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((x) => {
                    const owner = isOwnerTenant(x);
                    const dl = owner ? null : (x.status === "active" ? daysLeft(x.subscription_end) : x.status === "trial" ? daysLeft(x.trial_end) : null);
                    const endingSoon = dl != null && dl <= 7;
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
                                  {x.quoted_amount > 0 && <span className="font-semibold">· {Number(x.quoted_amount).toLocaleString()} {isAr ? "ر.س" : "SAR"}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="leading-tight">
                            <div className="truncate">{x.contact_name || "—"}</div>
                            <div className="text-xs text-muted-foreground truncate" dir="ltr">{x.contact_phone || x.contact_email || "—"}</div>
                            <div className="text-xs text-muted-foreground truncate" dir="ltr">{x.unified_number || ""}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border",
                            x.lead_source === "quote" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                            {x.lead_source === "quote" ? t.srcQuote : t.srcTrial}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={x.status} isAr={isAr} owner={owner} /></td>
                        <td className="px-4 py-3">
                          {owner ? (
                            <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1"><Check size={13} /> {t.lifetime}</span>
                          ) : x.contract_confirmed ? (
                            <span className="text-xs text-emerald-700 inline-flex items-center gap-1"><ShieldCheck size={13} /> {t.confirmed}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><AlertTriangle size={12} /> {t.notConfirmed}</span>
                          )}
                        </td>
                        <td className={cn("px-4 py-3", owner ? "text-emerald-700 font-medium" : endingSoon ? "text-rose-700 font-medium" : "text-muted-foreground")}>
                          {owner ? t.lifetime : (x.status === "active" ? x.subscription_end || "—" : x.status === "trial" ? x.trial_end || "—" : "—")}
                          {!owner && endingSoon && (
                            <div className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                              <AlertTriangle size={11} /> {dl <= 0 ? t.ended : t.daysLeft(dl)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {!owner && x.contact_phone && (
                              <a href={waLink(x, isAr)} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600">
                                <MessageCircle size={13} /> {t.wa}
                              </a>
                            )}
                            {!owner && x.status !== "active" && x.status !== "cancelled" && (
                              <Button size="sm" onClick={() => setActivate(x)} className="gap-1.5 h-8" disabled={busyId === x.id}>
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />} {t.confirm}
                              </Button>
                            )}
                            {!owner && x.status === "trial" && (
                              <Button size="sm" variant="outline" onClick={() => setExtend(x)} className="gap-1.5 h-8" disabled={busyId === x.id}>
                                <CalendarClock size={13} /> {t.extend}
                              </Button>
                            )}
                            {!owner && x.status !== "cancelled" && (
                              <Button size="sm" variant="ghost" onClick={() => act(x.id, "owner_cancel")} disabled={busyId === x.id} className="gap-1.5 h-8 text-rose-600">
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />} {t.cancel}
                              </Button>
                            )}
                            {!owner && x.status === "cancelled" && (
                              <Button size="sm" variant="ghost" onClick={() => act(x.id, "owner_restore")} disabled={busyId === x.id} className="gap-1.5 h-8 text-emerald-600">
                                {busyId === x.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} {t.restore}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">{t.noClients}</td></tr>
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

      <ActivateDialog open={!!activate} onClose={() => setActivate(null)} tenant={activate} isAr={isAr} t={t}
        onDone={(payload) => act(activate?.id, "owner_activate", payload)} />
      <ExtendTrialDialog open={!!extend} onClose={() => setExtend(null)} tenant={extend} isAr={isAr} t={t}
        onDone={(payload) => act(extend?.id, "owner_extend_trial", payload)} />
    </div>
  );
}

function StatusBadge({ status, isAr, owner }) {
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
  const m = owner ? (isAr ? { label: "مالك", cls: "bg-violet-50 text-violet-700 border-violet-200" } : { label: "Owner", cls: "bg-violet-50 text-violet-700 border-violet-200" }) : (map[status] || { label: status, cls: "bg-slate-100 text-slate-500 border-slate-200" });
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", m.cls)}>{m.label}</span>;
}

const TINTS = {
  violet: "bg-violet-100 text-violet-600",
  amber: "bg-amber-100 text-amber-600",
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  slate: "bg-slate-200 text-slate-600",
  rose: "bg-rose-100 text-rose-600",
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