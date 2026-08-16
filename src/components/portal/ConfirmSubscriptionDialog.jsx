import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, Upload, Download, FileSignature, AlertTriangle, BadgeCheck } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, tierForCount } from "@/lib/pricing";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import SubscriptionContractDoc from "@/components/docs/SubscriptionContractDoc";
import SubscriptionInvoiceDoc from "@/components/docs/SubscriptionInvoiceDoc";

// تأكيد الاشتراك بعد استلام إيقاع التحويل عبر واتساب.
// الخطوات: رفع الإيصال ← تفعيل اشتراك (owner_activate) ← توليد عقد + فاتورة PDF ← حفظ روابطهما (owner_save_documents).
export default function ConfirmSubscriptionDialog({ open, onClose, tenant, isAr, session, onSaved }) {
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [doneUrls, setDoneUrls] = useState({ contract: "", invoice: "" });
  const [err, setErr] = useState("");

  const defaultEnd = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  };
  useEffect(() => {
    if (open && tenant) {
      setFile(null); setAmount(String(tenant.quoted_amount || "")); setEnd(defaultEnd());
      setBusy(false); setStep(""); setErr("");
      setDoneUrls({ contract: tenant.contract_pdf_url || "", invoice: tenant.invoice_pdf_url || "" });
    }
  }, [open, tenant]);

  const tier = useMemo(() => {
    if (!tenant?.employee_count) return null;
    return tierForCount(tenant.employee_count, isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN);
  }, [tenant, isAr]);

  // رقم تسلسلي للفاتورة والعقد مرتبط بتاريخ التأكيد.
  const seqns = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const r = Math.floor(100 + Math.random() * 899);
    return { quoteNo: `JQ${stamp}${r}`, invoiceNo: `INV${stamp}${r}` };
  }, [open, tenant]);

  if (!open || !tenant) return null;

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const activate = async () => {
    if (!tenant) return;
    if (!file) { setErr(isAr ? "الرجاء رفع صورة إيصال التحويل" : "Please upload the transfer receipt"); return; }
    if (!amount || !end) { setErr(isAr ? "الرجاء تحديد المبلغ وتاريخ نهاية الاشتراك" : "Enter amount and subscription end"); return; }
    setBusy(true); setErr("");
    try {
      // 1) رفع إيصال التحويل إلى تخزين الملفات
      setStep(isAr ? "بدء رفع إيصال التحويل…" : "Uploading receipt…");
      let proof_url = "";
      try {
        const fu = await base44.integrations.Core.UploadFile({ file });
        proof_url = fu?.file_url || "";
      } catch (_) { setErr(isAr ? "فشل رفع الإيصال، حاول مرة أخرى" : "Receipt upload failed, retry"); setBusy(false); return; }

      // 2) تأكيد اشتراك على الخادم (تفعيل الاشتراك + حفظ رابط الإيصال)
      setStep(isAr ? "جارٍ تأكيد الاشتراك وتفعيل الحساب…" : "Confirming subscription…");
      const act = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id,
        action: "owner_activate",
        tenant_id: tenant.id,
        amount: Number(amount),
        subscription_end: end,
        subscription_start: new Date().toISOString().slice(0, 10),
        proof_url,
      });
      const ract = act?.data || act;
      if (!ract?.ok) throw new Error(ract?.error || "fail");
      const subStart = ract.subscription_start || new Date().toISOString().slice(0, 10);
      const subEnd = ract.subscription_end || end;

      // 3) توليد عقد الاشتراك PDF ورفعه
      setStep(isAr ? "جارٍ توليد عقد الاشتراك PDF…" : "Generating contract PDF…");
      const contractBlob = await renderToPdfBlob(
        <SubscriptionContractDoc company={tenant} quoteNo={seqns.quoteNo} date={subStart} />
      );
      const contract_url = await uploadPdfBlob(contractBlob, `Jadara-Contract-${seqns.quoteNo}.pdf`);

      // 4) توليد فاتورة غير ضريبية PDF ورفعها
      setStep(isAr ? "جارٍ توليد الفاتورة PDF…" : "Generating invoice PDF…");
      const invoiceBlob = await renderToPdfBlob(
        <SubscriptionInvoiceDoc
          company={tenant}
          tier={tier}
          invNo={seqns.invoiceNo}
          date={subStart}
          startDate={subStart}
          endDate={subEnd}
          amount={Number(amount)}
          employeeCount={Number(tenant.employee_count) || 0}
          isAr={isAr}
        />
      );
      const invoice_url = await uploadPdfBlob(invoiceBlob, `Jadara-Invoice-${seqns.invoiceNo}.pdf`);

      // 5) حفظ الروابط على المنشأة
      setStep(isAr ? "جارٍ حفظ روابط العقد والفاتورة…" : "Saving documents…");
      const sav = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id,
        action: "owner_save_documents",
        tenant_id: tenant.id,
        contract_pdf_url: contract_url,
        invoice_pdf_url: invoice_url,
        contract_quote_no: seqns.quoteNo,
      });
      const rsav = sav?.data || sav;
      if (!rsav?.ok) throw new Error(rsav?.error || "save_failed");

      setDoneUrls({ contract: contract_url, invoice: invoice_url });
      setStep("");
      if (onSaved) onSaved();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o && !busy && onClose ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isAr ? "تأكيد الاشتراك — " : "Confirm subscription — "}{tenant.name}</DialogTitle></DialogHeader>
        <div className="space-y-3.5 text-sm">
          {doneUrls.contract && doneUrls.invoice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2">
              <BadgeCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-emerald-800">{isAr ? "تم تأكيد الاشتراك وتوليد العقد والفاتورة" : "Subscription confirmed, contract & invoice generated"}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a href={doneUrls.contract} target="_blank" rel="noreferrer" download
                     className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-md bg-violet-600 hover:bg-violet-700 text-white">
                    <Download size={13} /> {isAr ? "تنزيل العقد" : "Contract"}
                  </a>
                  <a href={doneUrls.invoice} target="_blank" rel="noreferrer" download
                     className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
                    <FileSignature size={13} /> {isAr ? "تنزيل الفاتورة" : "Invoice"}
                  </a>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-1">
            <Row k={isAr ? "جهة الاتصال" : "Contact"} v={tenant.contact_name || "—"} />
            <Row k={isAr ? "البريد" : "Email"} v={tenant.contact_email || "—"} />
            <Row k={isAr ? "الهاتف" : "Phone"} v={tenant.contact_phone || "—"} />
            <Row k={isAr ? "الرقم الموحد" : "Unified no."} v={tenant.unified_number || "—"} />
            <Row k={isAr ? "عدد الموظفين" : "Employees"} v={tenant.employee_count || 0} />
            <Row k={isAr ? "الشريحة" : "Tier"} v={tenant.pricing_tier || tier?.tier || "—"} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{isAr ? "صورة إيصال التحويل (مستلمة عبر واتساب)" : "Transfer receipt image (received via WhatsApp)"}</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm h-9 px-3 rounded-md border border-input bg-transparent hover:bg-accent cursor-pointer">
                <Upload size={14} /> {file ? (isAr ? "selected: " : "Selected: ") + file.name : (isAr ? "اختر صورة/PDF الإيصال" : "Choose receipt image/PDF")}
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPickFile} disabled={busy} />
              </label>
              {file && !busy && <button type="button" onClick={() => setFile(null)} className="text-xs text-rose-600 hover:underline">{isAr ? "إزالة" : "Remove"}</button>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "المبلغ (ر.س)" : "Amount (SAR)"}</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "نهاية الاشتراك" : "Subscription end"}</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} dir="ltr" disabled={busy} />
            </div>
          </div>
          {busy && (
            <div className="flex items-center gap-2 text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-2.5">
              <Loader2 size={14} className="animate-spin" /> {step || (isAr ? "جارٍ التنفيذ…" : "Working…")}
            </div>
          )}
          {err && (
            <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {err}
            </div>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">{isAr ? "عند التأكيد يتم: تحويل المنشأة إلى فعّال، توليد عقد الاشتراك والفاتورة غير الضريبية، وحفظهما ليُنزّلهما المالك ويرسلهما للعميل." : "On confirm: marks tenant active, generates the contract and non-tax invoice, and saves them for the owner to download and send to the customer."}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => (busy ? null : onClose())} disabled={busy}>{isAr ? "إغلاق" : "Close"}</Button>
          <Button onClick={activate} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {doneUrls.contract && doneUrls.invoice ? (isAr ? "إعادة التوليد والتأكيد" : "Re-generate & confirm") : (isAr ? "تأكيد وتوليد العقد والفاتورة" : "Confirm & generate documents")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium truncate max-w-[60%]" dir="ltr">{v == null || v === "" ? "—" : v}</span>
    </div>
  );
}