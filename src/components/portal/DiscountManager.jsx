import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  TicketPercent, Plus, Loader2, Check, Trash2, Power, RefreshCw,
} from "lucide-react";

// إدارة كودات الخصم من بوابة المالك — عبر وصلة portalData (asServiceRole).
export default function DiscountManager({ session }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "كودات الخصم", sub: "أنشئ أكواد خصم تُعطى للعملاء لتخفيض سعر الاشتراك السنوي.",
    add: "كود جديد", edit: "تعديل الكود",
    code: "الكود", percent: "نسبة الخصم %", label: "الوصف / التسمية",
    max: "حد الاستخدام (0 = غير محدود)", used: "الاستخدام", status: "الحالة",
    active: "مفعّل", disabled: "معطّل", actions: "إجراءات",
    save: "حفظ", cancel: "إلغاء", del: "حذف", toggle: "تفعيل/تعطيل", editBtn: "تعديل",
    empty: "لا توجد أكواد بعد — أنشئ أول كود.", loading: "جارٍ التحميل…", fail: "تعذّر التحميل. أعد المحاولة.",
    saved: "تم الحفظ.", deleted: "تم حذف الكود.", confirmDel: "هل تريد حذف هذا الكود نهائياً؟",
    retry: "إعادة", pCode: "مثال: SUMMER25", pLabel: "مثال: خصم الصيف",
  } : {
    title: "Discount Codes", sub: "Create discount codes for clients to reduce the annual subscription price.",
    add: "New code", edit: "Edit code",
    code: "Code", percent: "Discount %", label: "Label / description",
    max: "Max uses (0 = unlimited)", used: "Used", status: "Status",
    active: "Active", disabled: "Disabled", actions: "Actions",
    save: "Save", cancel: "Cancel", del: "Delete", toggle: "Enable/Disable", editBtn: "Edit",
    empty: "No codes yet — create your first one.", loading: "Loading…", fail: "Failed to load. Retry.",
    saved: "Saved.", deleted: "Code deleted.", confirmDel: "Delete this code permanently?",
    retry: "Retry", pCode: "e.g. SUMMER25", pLabel: "e.g. Summer discount",
  };

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ id: "", code: "", discount_percent: 10, label: "", max_uses: 0, notes: "", status: "active" });

  const call = useCallback(async (action, extra = {}) => {
    const res = await base44.functions.invoke("portalData", {
      token: session.token, employee_id: session.employee_id, action, ...extra,
    });
    const d = res?.data || res;
    if (!d?.ok) throw new Error(d?.error || "fail");
    return d;
  }, [session?.token, session?.employee_id]);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { const d = await call("discount_list"); setCodes(d.codes || []); }
    catch (e) { setErr(String(e?.message || e)); }
    finally { setLoading(false); }
  }, [call]);

  useEffect(() => { load(); }, [load]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const openNew = () => {
    setForm({ id: "", code: "", discount_percent: 10, label: "", max_uses: 0, notes: "", status: "active" });
    setOpen(true);
  };
  const openEdit = (c) => {
    setForm({
      id: c.id, code: c.code || "", discount_percent: c.discount_percent || 0,
      label: c.label || "", max_uses: c.max_uses || 0, notes: c.notes || "", status: c.status || "active",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      await call("discount_save", {
        id: form.id, code: form.code.trim(), discount_percent: Number(form.discount_percent) || 0,
        label: form.label, max_uses: Number(form.max_uses) || 0, status: form.status, notes: form.notes,
      });
      setOpen(false); flash(t.saved); await load();
    } catch (e) { alert(e?.message || "fail"); }
    finally { setSaving(false); }
  };

  const toggle = async (c) => {
    setBusy(c.id);
    try {
      await call("discount_save", {
        id: c.id, code: c.code, discount_percent: c.discount_percent, label: c.label,
        max_uses: c.max_uses, status: c.status === "active" ? "disabled" : "active", notes: c.notes,
      });
      flash(t.saved); await load();
    } catch (e) { alert(e?.message || "fail"); } finally { setBusy(""); }
  };

  const del = async (c) => {
    if (!window.confirm(t.confirmDel)) return;
    setBusy(c.id);
    try { await call("discount_delete", { id: c.id }); flash(t.deleted); await load(); }
    catch (e) { alert(e?.message || "fail"); } finally { setBusy(""); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><TicketPercent size={20} className="text-violet-600" /> {t.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
        </div>
        <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> {t.add}</Button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> {t.loading}</div>
      ) : err ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-center justify-between gap-3">
          <span>{t.fail} ({err})</span>
          <Button size="sm" variant="outline" onClick={load} className="shrink-0 gap-1.5 h-8"><RefreshCw size={13} /> {t.retry}</Button>
        </div>
      ) : codes.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">{t.empty}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted-foreground text-xs">
                <tr>
                  <th className="text-start font-medium px-4 py-3">{t.code}</th>
                  <th className="text-start font-medium px-4 py-3">{t.percent}</th>
                  <th className="text-start font-medium px-4 py-3">{t.label}</th>
                  <th className="text-start font-medium px-4 py-3">{t.used}</th>
                  <th className="text-start font-medium px-4 py-3">{t.status}</th>
                  <th className="text-start font-medium px-4 py-3">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3"><span className="font-mono font-semibold tracking-wide bg-violet-50 text-violet-700 px-2 py-1 rounded">{c.code}</span></td>
                    <td className="px-4 py-3 font-medium">{c.discount_percent}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.label || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.used_count || 0}{c.max_uses > 0 ? ` / ${c.max_uses}` : ""}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                        {c.status === "active" ? t.active : t.disabled}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="h-8">{t.editBtn}</Button>
                        <Button size="sm" variant="ghost" onClick={() => toggle(c)} disabled={busy === c.id} className="h-8 gap-1.5">
                          {busy === c.id ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />} {t.toggle}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => del(c)} disabled={busy === c.id} className="h-8 text-rose-600 gap-1.5">
                          {busy === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} {t.del}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? t.edit : t.add}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.code}</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder={t.pCode} dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.percent}</Label>
                <Input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.max}</Label>
                <Input type="number" min="0" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.label}</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder={t.pLabel} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>{t.cancel}</Button>
            <Button onClick={save} disabled={saving || !form.code.trim()} className="gap-1.5">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-5 inset-x-0 flex justify-center z-50">
          <div className="bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"><Check size={15} /> {toast}</div>
        </div>
      )}
    </div>
  );
}