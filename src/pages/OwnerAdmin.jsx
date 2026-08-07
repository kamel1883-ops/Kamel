import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Crown, Wallet, TrendingUp, AlertTriangle, Check, Loader2, BadgeCheck, Upload, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/hr";

export default function OwnerAdmin() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إدارة العملاء والاشتراكات", subtitle: "متابعة العملاء، فترات التجربة، الاشتراكات السنوية، والإيرادات",
    sTotal: "إجمالي العملاء", sTrial: "تجربة جارية", sActive: "مُشترك فعّال", sRevenue: "إيرادات سنوية (ر.س)", sEnding: "تجارب تنتهي قريباً",
    loading: "جارٍ التحميل...",
    thCustomer: "العميل", thCr: "السجل التجاري", thContact: "جهة الاتصال", thStatus: "الحالة", thEnd: "نهاية الفترة", thActions: "إجراءات",
    noCustomers: "لا يوجد عملاء بعد — سجّل العملاء من صفحة الهبوط.",
    regSub: "تسجيل اشتراك", directActivate: "تفعيل مباشر",
    subActive: (d) => `اشتراك: ${d || "—"}`, subTrial: (d, n) => `تجربة: ${d || "—"} (${n} يوم)`,
  } : {
    title: "Customers & subscriptions", subtitle: "Track customers, trial periods, annual subscriptions and revenue",
    sTotal: "Total customers", sTrial: "Trial running", sActive: "Active subscriber", sRevenue: "Annual revenue (SAR)", sEnding: "Trials ending soon",
    loading: "Loading...",
    thCustomer: "Customer", thCr: "Commercial reg.", thContact: "Contact", thStatus: "Status", thEnd: "Period end", thActions: "Actions",
    noCustomers: "No customers yet — register customers from the landing page.",
    regSub: "Register subscription", directActivate: "Direct activate",
    subActive: (d) => `Subscription: ${d || "—"}`, subTrial: (d, n) => `Trial: ${d || "—"} (${n} days)`,
  };

  const [tenants, setTenants] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subOpen, setSubOpen] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [revenue, setRevenue] = useState(0);

  const load = async () => {
    setLoading(true);
    const [tList, s] = await Promise.all([
      base44.entities.Tenant.list("-created_date", 500),
      base44.entities.Subscription.filter({ status: "paid" }, "-created_date", 500),
    ]);
    setTenants(tList); setSubs(s);
    setRevenue(s.filter((x) => x.plan === "annual").reduce((sum, x) => sum + (Number(x.amount) || 0), 0));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const stats = {
    total: tenants.length,
    trial: tenants.filter((x) => x.status === "trial").length,
    active: tenants.filter((x) => x.status === "active").length,
    expired: tenants.filter((x) => x.status === "expired").length,
    endingSoon: tenants.filter((x) => x.status === "trial" && daysLeft(x.trial_end) <= 7 && daysLeft(x.trial_end) >= 0).length,
  };

  const openSub = (tt) => { setTenant(tt); setSubOpen(true); };
  const uploadLogo = async (tt, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Tenant.update(tt.id, { logo_url: file_url });
    load();
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        <Stat icon={Building2} label={t.sTotal} value={stats.total} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={Clock} label={t.sTrial} value={stats.trial} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={BadgeCheck} label={t.sActive} value={stats.active} cls="text-[#0d6f4d] bg-emerald-50" />
        <Stat icon={TrendingUp} label={t.sRevenue} value={revenue.toLocaleString()} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={AlertTriangle} label={t.sEnding} value={stats.endingSoon} cls="text-rose-600 bg-rose-50" />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right font-medium px-4 py-3">{t.thCustomer}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thCr}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thContact}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thStatus}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thEnd}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenants.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Logo tt={x} onUpload={(f) => uploadLogo(x, f)} />
                        <div className="leading-tight min-w-0"><div className="font-medium truncate">{x.name}</div><div className="text-xs text-muted-foreground">{x.industry || x.city}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{x.commercial_register || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="leading-tight"><div>{x.contact_name || "—"}</div><div className="text-xs text-muted-foreground">{x.contact_phone || x.contact_email}</div></div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={x.status} isAr={isAr} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{x.status === "active" ? t.subActive(x.subscription_end) : x.status === "trial" ? t.subTrial(x.trial_end, daysLeft(x.trial_end)) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openSub(x)} className="gap-1.5 h-8"><Wallet size={14} /> {t.regSub}</Button>
                        {x.status !== "active" && (<Button size="sm" variant="outline" onClick={() => activate(x, load)} className="gap-1.5 h-8"><Crown size={14} /> {t.directActivate}</Button>)}
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (<tr><td colSpan={6} className="p-12 text-center text-muted-foreground">{t.noCustomers}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SubForm open={subOpen} onClose={() => setSubOpen(false)} onSaved={load} tenant={tenant} isAr={isAr} t={t} />
    </div>
  );
}

function activate(tt, reload) {
  const end = new Date(); end.setDate(end.getDate() + 365);
  base44.entities.Tenant.update(tt.id, { status: "active", plan: "annual", subscription_end: end.toISOString().slice(0, 10) }).then(reload);
}

function daysLeft(date) {
  if (!date) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function StatusBadge({ status, isAr }) {
  const map = isAr ? {
    trial: { label: "تجربة", cls: "bg-amber-50 text-amber-600" },
    active: { label: "فعّال", cls: "bg-emerald-50 text-emerald-600" },
    expired: { label: "منتهي", cls: "bg-rose-50 text-rose-600" },
    cancelled: { label: "ملغي", cls: "bg-slate-100 text-slate-500" },
  } : {
    trial: { label: "Trial", cls: "bg-amber-50 text-amber-600" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-600" },
    expired: { label: "Expired", cls: "bg-rose-50 text-rose-600" },
    cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500" },
  };
  const m = map[status] || { label: status, cls: "bg-slate-100 text-slate-500" };
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", m.cls)}>{m.label}</span>;
}

function Logo({ tt, onUpload }) {
  return (
    <label className="relative w-11 h-11 rounded-xl bg-slate-100 border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 shrink-0">
      {tt.logo_url ? <img src={tt.logo_url} alt={tt.name} className="w-full h-full object-cover" /> : <Building2 size={18} className="text-slate-400" />}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
      <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] text-center opacity-0 hover:opacity-100"><Upload size={9} className="inline" /></span>
    </label>
  );
}

function Stat({ icon: Icon, label, value, cls }) {
  return (
    <div className="bg-card rounded-2xl border border-border/70 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cls)}><Icon size={16} /></div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  );
}

function SubForm({ open, onClose, onSaved, tenant, isAr, t }) {
  const [plan, setPlan] = useState("annual");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("direct");
  const [proof, setProof] = useState(null);
  const [today] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const f = isAr ? {
    title: (n) => `تسجيل اشتراك — ${n}`, plan: "الباقة", planAnnual: "سنوي", planMonthly: "شهري", amount: "المبلغ (ر.س)",
    method: "طريقة الدفع", direct: "تحويل مباشر", online: "دفع عبر الإنترنت (Visa/Mada)", proof: "إثبات الدفع (اختياري)",
    onlineNote: "سيتم تفعيل بوابة الدفع الإلكترونية (Stripe) قريباً لإتمام الدفع عبر Visa وMada داخل المنصة.",
    cancel: "إلغاء", confirm: "تأكيد وتفعيل الاشتراك",
  } : {
    title: (n) => `Register subscription — ${n}`, plan: "Plan", planAnnual: "Annual", planMonthly: "Monthly", amount: "Amount (SAR)",
    method: "Payment method", direct: "Direct transfer", online: "Online (Visa/Mada)", proof: "Payment proof (optional)",
    onlineNote: "The online payment gateway (Stripe) will be available soon for Visa & Mada payments.",
    cancel: "Cancel", confirm: "Confirm & activate",
  };

  const submit = async () => {
    if (!tenant || !amount) return;
    setSaving(true);
    try {
      let proofUrl = "";
      if (proof) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proof }); proofUrl = file_url; }
      const end = new Date(); end.setDate(end.getDate() + (plan === "annual" ? 365 : 30));
      await base44.entities.Subscription.create({
        tenant_id: tenant.id, tenant_name: tenant.name, plan, amount: Number(amount),
        period_start: today, period_end: end.toISOString().slice(0, 10),
        payment_method: method, status: "paid", paid_date: today, proof_url: proofUrl,
      });
      await base44.entities.Tenant.update(tenant.id, { status: "active", plan, subscription_end: end.toISOString().slice(0, 10) });
      onSaved?.(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{f.title(tenant?.name)}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{f.plan}</Label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="annual">{f.planAnnual}</option>
                <option value="monthly">{f.planMonthly}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{f.amount}</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{f.method}</Label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="direct">{f.direct}</option>
              <option value="online">{f.online}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{f.proof}</Label>
            <Input type="file" onChange={(e) => setProof(e.target.files?.[0])} />
          </div>
          {method === "online" && (<div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">{f.onlineNote}</div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{f.cancel}</Button>
          <Button onClick={submit} disabled={saving || !amount} className="gap-1.5">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {f.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}