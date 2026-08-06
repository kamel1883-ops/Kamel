import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LICENSE_TYPES, typeMeta } from "@/lib/licenses";
import { differenceInMonths, parseISO } from "date-fns";

const empty = {
  license_type: "", custom_label: "", license_number: "",
  issuing_authority: "", issue_date: "", expiry_date: "",
  duration_months: "", not_applicable: false, notes: "", document_url: "",
};

export default function LicenseForm({ open, onClose, onSaved, editing, fixedType }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) setForm({ ...empty, ...editing });
      else setForm({ ...empty, license_type: fixedType || "", issuing_authority: fixedType ? typeMeta(fixedType).authority : "" });
    }
  }, [open, editing, fixedType]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const computedDuration = form.issue_date && form.expiry_date
    ? differenceInMonths(parseISO(form.expiry_date), parseISO(form.issue_date)) : null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.license_type) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration_months: Number(form.duration_months) || computedDuration || 0,
        not_applicable: !!form.not_applicable,
      };
      if (editing?.id) await base44.entities.License.update(editing.id, payload);
      else await base44.entities.License.create(payload);
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل الترخيص" : "تعبئة بيانات الترخيص"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">نوع الترخيص</Label>
            <select
              value={form.license_type}
              onChange={(e) => { const k = e.target.value; set("license_type", k); set("issuing_authority", typeMeta(k).authority); }}
              disabled={!!fixedType}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">اختر النوع</option>
              {LICENSE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          {form.license_type === "other" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">اسم الترخيص المخصص</Label>
              <Input value={form.custom_label} onChange={(e) => set("custom_label", e.target.value)} placeholder="مثال: ترخيص الهيئة العامة للإحصاء" />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.not_applicable} onChange={(e) => set("not_applicable", e.target.checked)} className="w-4 h-4" />
            لا ينطبق هذا الترخيص على المنشأة
          </label>

          {!form.not_applicable && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">الجهة المانحة</Label>
                <Input value={form.issuing_authority} onChange={(e) => set("issuing_authority", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">رقم الترخيص</Label>
                <Input value={form.license_number} onChange={(e) => set("license_number", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">تاريخ الإصدار</Label>
                  <Input type="date" value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">تاريخ الانتهاء</Label>
                  <Input type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">مدة الترخيص (أشهر)</Label>
                <Input
                  type="number" value={form.duration_months || (computedDuration ?? "")} onChange={(e) => set("duration_months", e.target.value)}
                  placeholder={computedDuration ? `محسوبة: ${computedDuration} شهر` : "اتركه فارغاً ليُحسب تلقائياً"}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">ملاحظات</Label>
                <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin ml-2" />} حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}