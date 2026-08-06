import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Building2, Crown, Wallet, TrendingUp, AlertTriangle, Check,
  Loader2, BadgeCheck, Upload, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OwnerAdmin() {
  const [tenants, setTenants] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subOpen, setSubOpen] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [revenue, setRevenue] = useState(0);

  const load = async () => {
    setLoading(true);
    const [t, s] = await Promise.all([
      base44.entities.Tenant.list("-created_date", 500),
      base44.entities.Subscription.filter({ status: "paid" }, "-created_date", 500),
    ]);
    setTenants(t);
    setSubs(s);
    setRevenue(s.filter((x) => x.plan === "annual").reduce((sum, x) => sum + (Number(x.amount) || 0), 0));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const stats = {
    total: tenants.length,
    trial: tenants.filter((t) => t.status === "trial").length,
    active: tenants.filter((t) => t.status === "active").length,
    expired: tenants.filter((t) => t.status === "expired").length,
    endingSoon: tenants.filter((t) => t.status === "trial" && daysLeft(t.trial_end) <= 7 && daysLeft(t.trial_end) >= 0).length,
  };

  const openSub = (t) => { setTenant(t); setSubOpen(true); };

  const uploadLogo = async (t, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Tenant.update(t.id, { logo_url: file_url });
    load();
  };

  return (
    <div>
      <PageHeader title="إدارة العملاء والاشتراكات" subtitle="متابعة العملاء، فترات التجربة، الاشتراكات السنوية، والإيرادات" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        <Stat icon={Building2} label="إجمالي العملاء" value={stats.total} cls="text-blue-600 bg-blue-50" />
        <Stat icon={Clock} label="تجربة جارية" value={stats.trial} cls="text-amber-600 bg-amber-50" />
        <Stat icon={BadgeCheck} label="مُشترك فعّال" value={stats.active} cls="text-emerald-600 bg-emerald-50" />
        <Stat icon={TrendingUp} label="إيرادات سنوية (ر.س)" value={revenue.toLocaleString()} cls="text-violet-600 bg-violet-50" />
        <Stat icon={AlertTriangle} label="تجارب تنتهي قريباً" value={stats.endingSoon} cls="text-rose-600 bg-rose-50" />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right font-medium px-4 py-3">العميل</th>
                  <th className="text-right font-medium px-4 py-3">السجل التجاري</th>
                  <th className="text-right font-medium px-4 py-3">جهة الاتصال</th>
                  <th className="text-right font-medium px-4 py-3">الحالة</th>
                  <th className="text-right font-medium px-4 py-3">نهاية الفترة</th>
                  <th className="text-right font-medium px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Logo t={t} onUpload={(f) => uploadLogo(t, f)} />
                        <div className="leading-tight min-w-0">
                          <div className="font-medium truncate">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.industry || t.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.commercial_register || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="leading-tight">
                        <div>{t.contact_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{t.contact_phone || t.contact_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.status === "active" ? `اشتراك: ${t.subscription_end || "—"}`
                       : t.status === "trial" ? `تجربة: ${t.trial_end || "—"} (${daysLeft(t.trial_end)} يوم)`
                       : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => openSub(t)} className="gap-1.5 h-8">
                          <Wallet size={14} /> تسجيل اشتراك
                        </Button>
                        {t.status !== "active" && (
                          <Button size="sm" variant="outline" onClick={() => activate(t, load)} className="gap-1.5 h-8">
                            <Crown size={14} /> تفعيل مباشر
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">لا يوجد عملاء بعد — سجّل العملاء من صفحة الهبوط.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SubForm open={subOpen} onClose={() => setSubOpen(false)} onSaved={load} tenant={tenant} />
    </div>
  );
}

function activate(t, reload) {
  const end = new Date(); end.setDate(end.getDate() + 365);
  base44.entities.Tenant.update(t.id, { status: "active", plan: "annual", subscription_end: end.toISOString().slice(0, 10) }).then(reload);
}

function daysLeft(date) {
  if (!date) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function StatusBadge({ status }) {
  const map = {
    trial: { label: "تجربة", cls: "bg-amber-50 text-amber-600" },
    active: { label: "فعّال", cls: "bg-emerald-50 text-emerald-600" },
    expired: { label: "منتهي", cls: "bg-rose-50 text-rose-600" },
    cancelled: { label: "ملغي", cls: "bg-slate-100 text-slate-500" },
  };
  const m = map[status] || { label: status, cls: "bg-slate-100 text-slate-500" };
  return <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", m.cls)}>{m.label}</span>;
}

function Logo({ t, onUpload }) {
  return (
    <label className="relative w-11 h-11 rounded-xl bg-slate-100 border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 shrink-0">
      {t.logo_url ? (
        <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" />
      ) : (
        <Building2 size={18} className="text-slate-400" />
      )}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
      <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] text-center opacity-0 hover:opacity-100"><Upload size={9} className="inline" /></span>
    </label>
  );
}

function Stat({ icon: Icon, label, value, cls }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cls)}><Icon size={16} /></div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  );
}

function SubForm({ open, onClose, onSaved, tenant }) {
  const [plan, setPlan] = useState("annual");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("direct");
  const [proof, setProof] = useState(null);
  const [today] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!tenant || !amount) return;
    setSaving(true);
    try {
      let proofUrl = "";
      if (proof) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: proof });
        proofUrl = file_url;
      }
      const end = new Date(); end.setDate(end.getDate() + (plan === "annual" ? 365 : 30));
      await base44.entities.Subscription.create({
        tenant_id: tenant.id, tenant_name: tenant.name, plan, amount: Number(amount),
        period_start: today, period_end: end.toISOString().slice(0, 10),
        payment_method: method, status: "paid", paid_date: today, proof_url: proofUrl,
      });
      await base44.entities.Tenant.update(tenant.id, { status: "active", plan, subscription_end: end.toISOString().slice(0, 10) });
      onSaved?.(); onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>تسجيل اشتراك — {tenant?.name}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">الباقة</Label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="annual">سنوي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">المبلغ (ر.س)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">طريقة الدفع</Label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="direct">تحويل مباشر</option>
              <option value="online">دفع عبر الإنترنت (Visa/Mada)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">إثبات الدفع (اختياري)</Label>
            <Input type="file" onChange={(e) => setProof(e.target.files?.[0])} />
          </div>
          {method === "online" && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
              سيتم تفعيل بوابة الدفع الإلكترونية (Stripe) قريباً لإتمام الدفع عبر Visa وMada داخل المنصة.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button onClick={submit} disabled={saving || !amount} className="gap-1.5">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} تأكيد وتفعيل الاشتراك
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}