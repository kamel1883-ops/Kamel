import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Check, Upload, AlertTriangle, CalendarClock, BadgeCheck } from "lucide-react";

// التجديد السنوي — منفصل تماماً عن توليد العقود.
// يحدد المالك الفترة والمبلغ ويرفع الإيصال → يُسجَّل إيراد واحد لهذه الفترة فقط (بلا تكرار).
export default function RenewYearDialog({ open, onClose, tenant, isAr, session, onSaved }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    if (!open || !tenant) return;
    const base = tenant.subscription_end && tenant.status === "active"
      ? new Date(tenant.subscription_end)
      : new Date();
    base.setHours(0, 0, 0, 0);
    const s = new Date(base);
    const e = new Date(base); e.setFullYear(e.getFullYear() + 1);
    setStart(s.toISOString().slice(0, 10));
    setEnd(e.toISOString().slice(0, 10));
    setAmount(String(tenant.quoted_amount || ""));
    setFile(null); setErr(""); setDone(""); setBusy(false);
  }, [open, tenant]);

  if (!open || !tenant) return null;

  const submit = async () => {
    if (!start || !end || !amount) { setErr(isAr ? "حدد الفترة والمبلغ" : "Set period and amount"); return; }
    setBusy(true); setErr("");
    try {
      let proof_url = "";
      if (file) {
        const fu = await base44.integrations.Core.UploadFile({ file });
        proof_url = fu?.file_url || "";
      }
      const res = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id,
        action: "owner_renew_year",
        tenant_id: tenant.id,
        period_start: start, period_end: end,
        amount: Number(amount), proof_url,
      });
      const r = res?.data || res;
      if (!r?.ok) throw new Error(r?.error || "fail");
      setDone(r.duplicate
        ? (isAr ? "هذه الفترة مسجّلة مسبقاً — تم تحديثها بدون تكرار الإيراد." : "Period already recorded — updated without duplicating revenue.")
        : (isAr ? "تم تسجيل التجديد السنوي والإيراد لهذه الفترة." : "Annual renewal and its revenue recorded."));
      if (onSaved) onSaved();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o && !busy ? onClose() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={18} className="text-emerald-600" />
            {isAr ? "تجديد سنوي — " : "Annual renewal — "}{tenant.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5 text-sm">
          <p className="text-xs text-muted-foreground leading-relaxed rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            {isAr
              ? "هذا الإجراء مخصص للتجديد وتسجيل الإيراد فقط: حدد الفترة والمبلغ وارفع الإيصال. توليد العقود والفواتير إجراء منفصل لا يُسجّل أي إيراد ويمكن تكراره كما تشاء."
              : "This records the renewal and its revenue only: set the period, amount and receipt. Contract/invoice generation is a separate action that records no revenue and can be repeated freely."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "بداية الفترة" : "Period start"}</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} dir="ltr" disabled={busy} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "نهاية الفترة" : "Period end"}</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} dir="ltr" disabled={busy} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "مبلغ التجديد (ر.س)" : "Renewal amount (SAR)"}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "إيصال التحويل (اختياري)" : "Transfer receipt (optional)"}</Label>
            <label className="inline-flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-input hover:bg-accent cursor-pointer">
              <Upload size={14} /> {file ? file.name : (isAr ? "اختر صورة/PDF" : "Choose image/PDF")}
              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={busy}
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          {done && (
            <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
              <BadgeCheck size={14} className="shrink-0 mt-0.5" /> {done}
            </div>
          )}
          {err && (
            <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {err}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => (busy ? null : onClose())} disabled={busy}>{isAr ? "إغلاق" : "Close"}</Button>
          <Button onClick={submit} disabled={busy} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {isAr ? "تسجيل التجديد" : "Record renewal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}