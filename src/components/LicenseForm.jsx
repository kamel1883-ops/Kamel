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
import { useI18n } from "@/lib/i18n";

const empty = {
  license_type: "", custom_label: "", license_number: "",
  issuing_authority: "", issue_date: "", expiry_date: "",
  duration_months: "", not_applicable: false, notes: "", document_url: "",
};

export default function LicenseForm({ open, onClose, onSaved, editing, fixedType, renewing }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        edit: "تعديل الترخيص",
        add: "تعبئة بيانات الترخيص",
        renew: "تجديد الترخيص",
        type: "نوع الترخيص",
        choose: "اختر النوع",
        custom: "اسم الترخيص المخصص",
        customPh: "مثال: ترخيص الهيئة العامة للإحصاء",
        na: "لا ينطبق هذا الترخيص على المنشأة",
        authority: "الجهة المانحة",
        number: "رقم الترخيص",
        issue: "تاريخ الإصدار",
        expiry: "تاريخ الانتهاء",
        duration: "مدة الترخيص (أشهر)",
        durationPh: (c) => (c ? `محسوبة: ${c} شهر` : "اتركه فارغاً ليُحسب تلقائياً"),
        notes: "ملاحظات",
        cancel: "إلغاء",
        save: "حفظ",
      }
    : {
        edit: "Edit license",
        add: "Fill license data",
        renew: "Renew license",
        type: "License type",
        choose: "Select type",
        custom: "Custom license name",
        customPh: "e.g. General Authority for Statistics license",
        na: "This license does not apply to the org",
        authority: "Issuing authority",
        number: "License number",
        issue: "Issue date",
        expiry: "Expiry date",
        duration: "Duration (months)",
        durationPh: (c) => (c ? `Computed: ${c} months` : "Leave empty to auto-compute"),
        notes: "Notes",
        cancel: "Cancel",
        save: "Save",
      };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({ ...empty, ...editing });
      } else if (renewing) {
        setForm({ ...empty, ...renewing, issue_date: "", expiry_date: "", duration_months: "", document_url: "", not_applicable: false, id: undefined });
      } else {
        setForm({
          ...empty,
          license_type: fixedType || "",
          issuing_authority: fixedType ? typeMeta(fixedType).authority : "",
        });
      }
    }
  }, [open, editing, fixedType, renewing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const computedDuration =
    form.issue_date && form.expiry_date
      ? differenceInMonths(parseISO(form.expiry_date), parseISO(form.issue_date))
      : null;

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
      else await base44.entities.License.create(payload); // includes renewing → new record
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const onTypeChange = (e) => {
    const k = e.target.value;
    set("license_type", k);
    set("issuing_authority", typeMeta(k).authority);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? t.edit : renewing ? t.renew : t.add}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{t.type}</Label>
            <select
              value={form.license_type}
              onChange={onTypeChange}
              disabled={!!fixedType}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">{t.choose}</option>
              {LICENSE_TYPES.map((tt) => (
                <option key={tt.key} value={tt.key}>
                  {typeMeta(tt.key).label}
                </option>
              ))}
            </select>
          </div>

          {form.license_type === "other" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t.custom}</Label>
              <Input
                value={form.custom_label}
                onChange={(e) => set("custom_label", e.target.value)}
                placeholder={t.customPh}
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.not_applicable}
              onChange={(e) => set("not_applicable", e.target.checked)}
              className="w-4 h-4"
            />
            {t.na}
          </label>

          {!form.not_applicable && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.authority}</Label>
                <Input
                  value={form.issuing_authority}
                  onChange={(e) => set("issuing_authority", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.number}</Label>
                <Input
                  value={form.license_number}
                  onChange={(e) => set("license_number", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t.issue}</Label>
                  <Input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => set("issue_date", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{t.expiry}</Label>
                  <Input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => set("expiry_date", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.duration}</Label>
                <Input
                  type="number"
                  value={form.duration_months || (computedDuration ?? "")}
                  onChange={(e) => set("duration_months", e.target.value)}
                  placeholder={t.durationPh(computedDuration)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{t.notes}</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin ml-2" />}
              {t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}