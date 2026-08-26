import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, RECURRENCES } from "@/lib/finance";
import { formatCurrency } from "@/lib/hr";

const empty = {
  name: "", category: "other", amount: "", recurrence: "monthly",
  expense_date: new Date().toISOString().slice(0, 10), end_date: "", vendor: "",
  partner_name: "", commission_percent: "", base_amount: "", revenue_ref: "",
  status: "active", notes: "",
};

// نموذج إدخال/تعديل مصروف — يشمل حالة العمولة (نسبة % من مبلغ بيع) بحساب تلقائي للمبلغ
export default function ExpenseFormDialog({ open, onClose, onSave, expense, revenues = [], isAr }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(expense ? { ...empty, ...expense } : empty); }, [expense, open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isCommission = form.category === "commission" || form.category === "partner_share";
  const commissionAmount = Number(
    ((Number(form.base_amount) || 0) * (Number(form.commission_percent) || 0) / 100).toFixed(2)
  );

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        amount: isCommission ? commissionAmount : Number(form.amount) || 0,
        commission_percent: Number(form.commission_percent) || 0,
        base_amount: Number(form.base_amount) || 0,
        recurrence: isCommission ? "one_time" : form.recurrence,
      });
      onClose?.();
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? (isAr ? "تعديل مصروف" : "Edit expense") : (isAr ? "إضافة مصروف" : "Add expense")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "اسم المصروف" : "Expense name"}</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required
              placeholder={isAr ? "مثال: اشتراك IONOS VPS" : "e.g. IONOS VPS"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "نوع المصروف" : "Category"}</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{isAr ? c.ar : c.en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "التكرار" : "Recurrence"}</Label>
              <Select value={isCommission ? "one_time" : form.recurrence} onValueChange={(v) => set("recurrence", v)} disabled={isCommission}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECURRENCES.map((r) => <SelectItem key={r.key} value={r.key}>{isAr ? r.ar : r.en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCommission ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-3">
              <p className="text-[11px] text-amber-900">
                {isAr
                  ? "إدخال يدوي لمرة واحدة — سجّل النسبة ومبلغ البيع وتاريخ المعاملة."
                  : "One-time manual entry — record the share, sale amount and transaction date."}
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "اسم المستفيد / المسوّق" : "Beneficiary / partner"}</Label>
                <Input value={form.partner_name} onChange={(e) => set("partner_name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "الإيراد / العميل المرتبط" : "Related revenue / client"}</Label>
                <Select value={form.revenue_ref || "manual"} onValueChange={(v) => {
                  if (v === "manual") { set("revenue_ref", ""); return; }
                  const r = revenues.find((x) => x.id === v);
                  set("revenue_ref", r?.tenant_name || "");
                  set("base_amount", Number(r?.amount) || 0);
                }}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر إيراداً" : "Pick a revenue"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">{isAr ? "إدخال يدوي" : "Manual entry"}</SelectItem>
                    {revenues.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.tenant_name} — {formatCurrency(r.amount)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{isAr ? "مبلغ البيع" : "Sale amount"}</Label>
                  <Input type="number" value={form.base_amount} onChange={(e) => set("base_amount", e.target.value)} dir="ltr" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{isAr ? "النسبة %" : "Share %"}</Label>
                  <Input type="number" step="0.1" value={form.commission_percent} onChange={(e) => set("commission_percent", e.target.value)} dir="ltr" placeholder="15" required />
                </div>
              </div>
              <div className="text-sm font-bold text-amber-800">
                {isAr ? "قيمة العمولة:" : "Commission:"} {formatCurrency(commissionAmount)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "المبلغ (ريال)" : "Amount (SAR)"}</Label>
                <Input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} dir="ltr" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "الجهة / المزوّد" : "Vendor"}</Label>
                <Input value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder={isAr ? "مثال: IONOS" : "e.g. IONOS"} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isCommission ? (isAr ? "تاريخ المعاملة" : "Transaction date") : (isAr ? "تاريخ المصروف / بداية التكرار" : "Date / recurrence start")}</Label>
              <Input type="date" lang={isAr ? "ar" : "en"} value={form.expense_date} onChange={(e) => set("expense_date", e.target.value)} required />
            </div>
            {!isCommission && form.recurrence !== "one_time" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "تاريخ التوقف (اختياري)" : "Stop date (optional)"}</Label>
                <Input type="date" lang={isAr ? "ar" : "en"} value={form.end_date || ""} onChange={(e) => set("end_date", e.target.value)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "الحالة" : "Status"}</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{isAr ? "سارٍ" : "Active"}</SelectItem>
                  <SelectItem value="stopped">{isAr ? "متوقف" : "Stopped"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "ملاحظات" : "Notes"}</Label>
              <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />} {isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}