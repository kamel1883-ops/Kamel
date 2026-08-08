import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Crown, Wallet, TrendingUp, AlertTriangle, Check, Loader2, BadgeCheck, Upload, Clock, UserPlus, RefreshCw, Pause, FileCheck2, FileText, KeyRound } from "lucide-react";
import InvoiceDialog from "@/components/InvoiceDialog";
import MigrateAccountDialog from "@/components/MigrateAccountDialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/hr";

export default function OwnerAdmin() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إدارة العملاء والاشتراكات", subtitle: "متابعة العملاء، فترات التجربة، الاشتراكات السنوية، تجديدات الحسابات، والإيرادات",
    sTotal: "إجمالي العملاء", sTrial: "تجربة جارية", sActive: "مُشترك فعّال", sRevenue: "إيرادات سنوية (ر.س)", sEnding: "تجارب تنتهي قريباً",
    sNew: "عملاء جدد (الشهر)", sRenew: "بانتظار تجديد",
    loading: "جارٍ التحميل...",
    thCustomer: "العميل", thCr: "السجل التجاري", thContact: "جهة الاتصال", thStatus: "الحالة", thEnd: "نهاية الفترة", thActions: "إجراءات",
    noCustomers: "لا يوجد عملاء بعد — سجّل العملاء من صفحة الهبوط.",
    regSub: "تسجيل اشتراك", directActivate: "تفعيل مباشر",
    renewOffer: "عرض التجديد", confirmRenew: "تأكيد التجديد", suspend: "إيقاف مؤقت",
    pendingRenew: "بانتظار سداد التجديد", renewSent: "تم إرسال عرض التجديد للعميل",
    subActive: (d) => `اشتراك: ${d || "—"}`, subTrial: (d, n) => `تجربة: ${d || "—"} (${n} يوم)`,
    invoice: "فاتورة",
    transfer: "نقل الحساب",
  } : {
    title: "Customers & subscriptions", subtitle: "Track customers, trials, annual subscriptions, renewals and revenue",
    sTotal: "Total customers", sTrial: "Trial running", sActive: "Active subscriber", sRevenue: "Annual revenue (SAR)", sEnding: "Trials ending soon",
    sNew: "New (this month)", sRenew: "Pending renewal",
    loading: "Loading...",
    thCustomer: "Customer", thCr: "Commercial reg.", thContact: "Contact", thStatus: "Status", thEnd: "Period end", thActions: "Actions",
    noCustomers: "No customers yet — register customers from the landing page.",
    regSub: "Register subscription", directActivate: "Direct activate",
    renewOffer: "Renewal offer", confirmRenew: "Confirm renewal", suspend: "Suspend",
    pendingRenew: "Awaiting renewal payment", renewSent: "Renewal offer sent to client",
    subActive: (d) => `Subscription: ${d || "—"}`, subTrial: (d, n) => `Trial: ${d || "—"} (${n} days)`,
    invoice: "Invoice",
    transfer: "Transfer account",
  };

  const [tenants, setTenants] = useState([]);
  const [subs, setSubs] = useState([]);
  const [renewalByTenant, setRenewalByTenant] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [subOpen, setSubOpen] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [revenue, setRevenue] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [invOpen, setInvOpen] = useState(false);
  const [invTenant, setInvTenant] = useState(null);
  const [migOpen, setMigOpen] = useState(false);
  const [migTenant, setMigTenant] = useState(null);

  const load = async () => {
    setLoading(true);
    const [tList, s, pendings] = await Promise.all([
      base44.entities.Tenant.list("-created_date", 500),
      base44.entities.Subscription.filter({ status: "paid" }, "-created_date", 500),
      base44.entities.Subscription.filter({ status: "pending" }, "-created_date", 500),
    ]);
    setTenants(tList); setSubs(s);
    setRevenue(s.filter((x) => x.plan === "annual").reduce((sum, x) => sum + (Number(x.amount) || 0), 0));
    const map = new Map();
    for (const p of pendings) if (p.tenant_id) map.set(p.tenant_id, p);
    setRenewalByTenant(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const nowD = new Date();
  const monthStart = new Date(nowD.getFullYear(), nowD.getMonth(), 1);
  const stats = {
    total: tenants.length,
    trial: tenants.filter((x) => x.status === "trial").length,
    active: tenants.filter((x) => x.status === "active").length,
    expired: tenants.filter((x) => x.status === "expired").length,
    newThisMonth: tenants.filter((x) => new Date(x.created_date) >= monthStart).length,
    endingSoon: tenants.filter((x) => x.status === "trial" && daysLeft(x.trial_end) <= 7 && daysLeft(x.trial_end) >= 0).length,
    pendingRenew: renewalByTenant.size,
  };

  const openSub = (tt) => { setTenant(tt); setSubOpen(true); };
  const uploadLogo = async (tt, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Tenant.update(tt.id, { logo_url: file_url });
    load();
  };

  const sendRenewal = async (tt) => {
    setBusyId(tt.id);
    try {
      await base44.functions.invoke("generateRenewalQuote", { tenant_id: tt.id });
      await load();
    } finally { setBusyId(null); }
  };
  const suspendTenant = async (tt) => {
    await base44.entities.Tenant.update(tt.id, { status: "expired" });
    load();
  };
  const openConfirmRenew = (tt) => { setRenewTarget(tt); setRenewOpen(true); };
  const confirmRenew = async (proof) => {
    const tt = renewTarget;
    const sub = renewalByTenant.get(tt.id);
    if (!sub) return;
    let proofUrl = "";
    if (proof) { const { file_url } = await base44.integrations.Core.UploadFile({ file: proof }); proofUrl = file_url; }
    const today = new Date().toISOString().slice(0, 10);
    await base44.entities.Subscription.update(sub.id, { status: "paid", paid_date: today, proof_url: proofUrl });
    await base44.entities.Tenant.update(tt.id, { status: "active", plan: "annual", subscription_end: sub.period_end });
    setRenewOpen(false); setRenewTarget(null);
    load();
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-7">
        <Stat icon={Building2} label={t.sTotal} value={stats.total} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={Clock} label={t.sTrial} value={stats.trial} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={BadgeCheck} label={t.sActive} value={stats.active} cls="text-[#0d6f4d] bg-emerald-50" />
        <Stat icon={TrendingUp} label={t.sRevenue} value={revenue.toLocaleString()} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={AlertTriangle} label={t.sEnding} value={stats.endingSoon} cls="text-rose-600 bg-rose-50" />
        <Stat icon={UserPlus} label={t.sNew} value={stats.newThisMonth} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={RefreshCw} label={t.sRenew} value={stats.pendingRenew} cls="text-amber-600 bg-amber-50" />
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
                {tenants.map((x) => {
                  const pending = renewalByTenant.get(x.id);
                  return (
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
                      <td className="px-4 py-3 text-muted-foreground">
                        {x.status === "active" ? t.subActive(x.subscription_end) : x.status === "trial" ? t.subTrial(x.trial_end, daysLeft(x.trial_end)) : "—"}
                        {pending && (<div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><Clock size={11} /> {t.pendingRenew} — 700 {isAr ? "ر.س" : "SAR"}</div>)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" onClick={() => openSub(x)} className="gap-1.5 h-8"><Wallet size={14} /> {t.regSub}</Button>
                          <Button size="sm" variant="outline" onClick={() => { setInvTenant(x); setInvOpen(true); }} className="gap-1.5 h-8"><FileText size={14} /> {t.invoice}</Button>
                          <Button size="sm" variant="outline" onClick={() => { setMigTenant(x); setMigOpen(true); }} className="gap-1.5 h-8"><KeyRound size={14} /> {t.transfer}</Button>
                          <Button size="sm" variant="outline" onClick={() => sendRenewal(x)} disabled={busyId === x.id} className="gap-1.5 h-8">
                            {busyId === x.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} {t.renewOffer}
                          </Button>
                          {pending && (<Button size="sm" variant="secondary" onClick={() => openConfirmRenew(x)} className="gap-1.5 h-8"><FileCheck2 size={14} /> {t.confirmRenew}</Button>)}
                          {x.status === "active" && (<Button size="sm" variant="ghost" onClick={() => suspendTenant(x)} className="gap-1.5 h-8 text-rose-600"><Pause size={14} /> {t.suspend}</Button>)}
                          {x.status !== "active" && !pending && (<Button size="sm" variant="outline" onClick={() => activate(x, load)} className="gap-1.5 h-8"><Crown size={14} /> {t.directActivate}</Button>)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 && (<tr><td colSpan={6} className="p-12 text-center text-muted-foreground">{t.noCustomers}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SubForm open={subOpen} onClose={() => setSubOpen(false)} onSaved={load} tenant={tenant} isAr={isAr} t={t} />
      <RenewConfirmDialog open={renewOpen} onClose={() => setRenewOpen(false)} tenant={renewTarget} sub={renewTarget ? renewalByTenant.get(renewTarget.id) : null} isAr={isAr} onConfirm={confirmRenew} />
      <InvoiceDialog open={invOpen} onClose={() => setInvOpen(false)} tenant={invTenant} subs={subs} isAr={isAr} />
      <MigrateAccountDialog open={migOpen} onClose={() => setMigOpen(false)} onSaved={load} tenant={migTenant} isAr={isAr} />
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
    expired: { label: "موقوف", cls: "bg-rose-50 text-rose-600" },
    cancelled: { label: "ملغي", cls: "bg-slate-100 text-slate-500" },
  } : {
    trial: { label: "Trial", cls: "bg-amber-50 text-amber-600" },
    active: { label: "Active", cls: "bg-emerald-50 text-emerald-600" },
    expired: { label: "Suspended", cls: "bg-rose-50 text-rose-600" },
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

function RenewConfirmDialog({ open, onClose, tenant, sub, isAr, onConfirm }) {
  const [proof, setProof] = useState(null);
  const [saving, setSaving] = useState(false);
  const f = isAr ? {
    title: (n) => `تأكيد تجديد سنوي — ${n}`,
    amount: "مبلغ التجديد", payNote: (s, e) => `700 ريال — فترة التجديد من ${s} إلى ${e}`,
    proof: "إثبات التحويل (اختياري)",
    waNote: "أرفق صورة إيصال التحويل الذي وصلك عبر واتساب من العميل (اختياري).",
    cancel: "إلغاء", confirm: "تأكيد التجديد وإعادة التفعيل",
  } : {
    title: (n) => `Confirm renewal — ${n}`,
    amount: "Renewal amount", payNote: (s, e) => `700 SAR — renewal period ${s} to ${e}`,
    proof: "Transfer proof (optional)",
    waNote: "Attach the WhatsApp receipt you received from the client (optional).",
    cancel: "Cancel", confirm: "Confirm & reactivate",
  };

  const submit = async () => {
    setSaving(true);
    try { await onConfirm(proof); } finally { setSaving(false); setProof(null); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{f.title(tenant?.name)}</DialogTitle></DialogHeader>
        {sub && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="font-semibold">{f.amount}: 700 {isAr ? "ر.س" : "SAR"}</div>
              <div className="text-muted-foreground text-xs mt-1">{f.payNote(sub.period_start, sub.period_end)}</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{f.proof}</Label>
              <Input type="file" onChange={(e) => setProof(e.target.files?.[0])} />
            </div>
            <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-3">{f.waNote}</div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{f.cancel}</Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {f.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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