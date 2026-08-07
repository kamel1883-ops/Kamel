import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TicketPercent, Plus, Loader2, Check, Copy, Power, PowerOff, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Discounts() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "كودات الخصم", subtitle: "أنشئ كودات خصم بنسب مئوية تحددها، ووزّعها على العملاء لتشغيل المنصة مجاناً أو بسعر مخفّض.",
    newCode: "إنشاء كود", active: "فعّال", disabled: "موقوف", all: "الكل",
    thCode: "الكود", thPercent: "الخصم", thUsed: "الاستخدام", thStatus: "الحالة", thActions: "إجراءات",
    loading: "جارٍ التحميل...", none: "لا توجد كودات بعد — أنشئ أول كود خصم.",
    sTotal: "إجمالي الكودات", sActive: "فعّال", sUsed: "مرات الاستخدام", sAvg: "متوسط الخصم",
  } : {
    title: "Discount Codes", subtitle: "Create discount codes with custom percentages and share them with customers to enable the platform for free or at a reduced price.",
    newCode: "New code", active: "Active", disabled: "Disabled", all: "All",
    thCode: "Code", thPercent: "Discount", thUsed: "Usage", thStatus: "Status", thActions: "Actions",
    loading: "Loading...", none: "No codes yet — create your first discount code.",
    sTotal: "Total codes", sActive: "Active", sUsed: "Times used", sAvg: "Avg discount",
  };

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.DiscountCode.list("-created_date", 500);
      setCodes(list);
    } catch (_) { setCodes([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (c) => {
    await base44.entities.DiscountCode.update(c.id, { status: c.status === "active" ? "disabled" : "active" });
    load();
  };
  const remove = async (c) => {
    if (!window.confirm(isAr ? "حذف هذا الكود؟" : "Delete this code?")) return;
    await base44.entities.DiscountCode.delete(c.id);
    load();
  };
  const copy = (code) => {
    try { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(""), 1500); } catch (_) {}
  };

  const stats = {
    total: codes.length,
    active: codes.filter((x) => x.status === "active").length,
    used: codes.reduce((s, x) => s + (Number(x.used_count) || 0), 0),
    avg: codes.length ? Math.round(codes.reduce((s, x) => s + (Number(x.discount_percent) || 0), 0) / codes.length) : 0,
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <PageHeader title={t.title} subtitle={t.subtitle} action={
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus size={16} /> {t.newCode}</Button>
      } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Stat icon={TicketPercent} label={t.sTotal} value={stats.total} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={Check} label={t.sActive} value={stats.active} cls="text-emerald-600 bg-emerald-50" />
        <Stat icon={TrendingUp} label={t.sUsed} value={stats.used} cls="text-[#2e2448] bg-[#2e2448]/10" />
        <Stat icon={TicketPercent} label={t.sAvg} value={stats.avg + "%"} cls="text-violet-600 bg-violet-50" />
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground">{t.loading}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-right font-medium px-4 py-3">{t.thCode}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thPercent}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thUsed}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thStatus}</th>
                  <th className="text-right font-medium px-4 py-3">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold tracking-wide px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">{c.code}</span>
                        <button onClick={() => copy(c.code)} className="text-muted-foreground hover:text-foreground">
                          {copied === c.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                      {c.label && <div className="text-xs text-muted-foreground mt-1">{c.label}</div>}
                    </td>
                    <td className="px-4 py-3"><span className="font-semibold text-violet-700">{Number(c.discount_percent) || 0}%</span></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(Number(c.used_count) || 0)}{Number(c.max_uses) > 0 ? ` / ${c.max_uses}` : (isAr ? " / ∞" : " / ∞")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium",
                        c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                        {c.status === "active" ? t.active : t.disabled}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggle(c)} className="gap-1.5 h-8">
                          {c.status === "active" ? <PowerOff size={14} /> : <Power size={14} />}
                          {c.status === "active" ? t.disabled : t.active}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c)} className="h-8 text-rose-600 hover:bg-rose-50">{isAr ? "حذف" : "Delete"}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (<tr><td colSpan={5} className="p-12 text-center text-muted-foreground">{t.none}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CodeForm open={open} onClose={() => setOpen(false)} onSaved={load} isAr={isAr} t={t} />
    </div>
  );
}

function CodeForm({ open, onClose, onSaved, isAr, t }) {
  const f = isAr ? {
    title: "إنشاء كود خصم", code: "الكود *", codePh: "مثال: FREE100", percent: "نسبة الخصم % *",
    label: "وصف / تسمية", maxUses: "الحد الأقصى للاستخدام (0 = غير محدود)", status: "الحالة",
    cancel: "إلغاء", confirm: "إنشاء الكود", hint: "استخدم 100% لاشتراك مجاني كامل.",
  } : {
    title: "Create discount code", code: "Code *", codePh: "e.g. FREE100", percent: "Discount % *",
    label: "Label", maxUses: "Max uses (0 = unlimited)", status: "Status",
    cancel: "Cancel", confirm: "Create code", hint: "Use 100% for a fully free subscription.",
  };
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("0");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    const c = code.trim().toUpperCase();
    const p = Number(percent);
    if (!c) return setErr(isAr ? "أدخل الكود" : "Enter a code");
    if (!p || p < 1 || p > 100) return setErr(isAr ? "نسبة الخصم بين 1 و 100" : "Discount must be 1–100");
    setSaving(true);
    try {
      await base44.entities.DiscountCode.create({
        code: c, discount_percent: p, label: label.trim(),
        max_uses: Number(maxUses) || 0, used_count: 0, status: "active",
      });
      setCode(""); setPercent(""); setLabel(""); setMaxUses("0");
      onSaved?.(); onClose();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || (isAr ? "تعذّر الإنشاء" : "Could not create"));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{f.title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{f.code}</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={f.codePh} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{f.percent}</Label>
              <Input type="number" min={1} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{f.maxUses}</Label>
              <Input type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{f.label}</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">{f.hint}</div>
          {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">{err}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{f.cancel}</Button>
          <Button onClick={submit} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {f.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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