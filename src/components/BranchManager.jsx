import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Star, Loader2, Building2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function BranchManager({ open, onClose, onSaved }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "إدارة الفروع",
    desc: "أضف فروع المنشأة وحدّد الفرع الرئيسي. كل موظف يُربط بالفرع الذي يعمل فيه.",
    add: "إضافة فرع", name: "اسم الفرع *", city: "المدينة", address: "العنوان", phone: "الهاتف",
    main: "الفرع الرئيسي", setMain: "تعيين كفرع رئيسي", mainBadge: "رئيسي", del: (n) => `حذف الفرع «${n}»؟`,
    empty: "لا توجد فروع بعد — أضف أول فرع الآن.", save: "حفظ", cancel: "إغلاق", saving: "جارٍ الحفظ…",
    delMainErr: "لا يمكن حذف الفرع الرئيسي. عيّن فرعاً رئيسياً آخر أولاً.",
  } : {
    title: "Branches", desc: "Add company branches and set the main branch. Each employee is linked to their branch.",
    add: "Add branch", name: "Branch name *", city: "City", address: "Address", phone: "Phone",
    main: "Main branch", setMain: "Set as main", mainBadge: "Main", del: (n) => `Delete branch “${n}”?`,
    empty: "No branches yet — add your first branch.", save: "Save", cancel: "Close", saving: "Saving…",
    delMainErr: "Cannot delete the main branch. Set another branch as main first.",
  };

  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "", is_main: false });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    const list = await base44.entities.Branch.list("-is_main", 500);
    setBranches(list);
  };
  useEffect(() => { if (open) load(); }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addBranch = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setErr("");
    try {
      let payload = { name: form.name.trim(), city: form.city, address: form.address, phone: form.phone, is_main: form.is_main };
      if (form.is_main) {
        await base44.entities.Branch.updateMany({ is_main: true }, { $set: { is_main: false } });
      }
      await base44.entities.Branch.create(payload);
      setForm({ name: "", city: "", address: "", phone: "", is_main: false });
      await load();
      onSaved?.();
    } catch (e2) {
      setErr(e2?.message || "Error");
    } finally { setSaving(false); }
  };

  const setMain = async (b) => {
    await base44.entities.Branch.updateMany({ is_main: true }, { $set: { is_main: false } });
    await base44.entities.Branch.update(b.id, { is_main: true });
    load(); onSaved?.();
  };

  const remove = async (b) => {
    if (b.is_main) { setErr(t.delMainErr); return; }
    if (!confirm(t.del(b.name))) return;
    await base44.entities.Branch.delete(b.id);
    load(); onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setErr(""); onClose(); } }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 size={18} /> {t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={addBranch} className="rounded-2xl border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.name}</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.city}</Label>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.address}</Label>
                <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.phone}</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_main} onChange={(e) => set("is_main", e.target.checked)} />
              {t.main}
            </label>
            {err && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">{err}</div>}
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {t.add}
            </Button>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {branches.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">{t.empty}</div>}
            {branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{b.name}</span>
                    {b.is_main && <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1"><Star size={9} className="fill-violet-700" /> {t.mainBadge}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{[b.city, b.phone].filter(Boolean).join(" • ") || "—"}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!b.is_main && <button onClick={() => setMain(b)} title={t.setMain} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600"><Star size={15} /></button>}
                  <button onClick={() => remove(b)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}