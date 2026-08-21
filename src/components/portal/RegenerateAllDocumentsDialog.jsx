import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, RefreshCw, AlertTriangle, FileStack } from "lucide-react";
import { PRICING_TIERS_AR, PRICING_TIERS_EN, tierForCount } from "@/lib/pricing";
import { renderToPdfBlob, uploadPdfBlob } from "@/lib/pdfDocs";
import SubscriptionContractDoc from "@/components/docs/SubscriptionContractDoc";
import SubscriptionInvoiceDoc from "@/components/docs/SubscriptionInvoiceDoc";
import { isOwnerTenant } from "./ClientActionDialogs";

// إعادة توليد عقد وفاتورة كل عميل مؤكّد (status=active, contract_confirmed=1)
// باستخدام نموذج العقد المختصر (صفحتان) والختم المُصحَّح، ثم رفع الجديد واستبدال الروابط القديمة.
export default function RegenerateAllDocumentsDialog({ open, onClose, tenants, session, isAr, onDone }) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState("");
  const [errors, setErrors] = useState([]);
  const [finished, setFinished] = useState(false);

  const t = isAr
    ? {
        title: "إعادة توليد العقود والفواتير لجميع العملاء",
        desc: "أولاً يعيد تصنيف كل العملاء (تجارب ومتعاقدين) وفق الشرائح الجديدة (البداية/الناشئة/المتوسطة/المتقدمة/الكبرى) ويحدّث حقلَي الشريحة والمبلغ السنوي. ثم يُعيد توليد عقد وفاتورة كل عميل متعاقد بالنموذج المختصر (صفحتان) والختم المُصحَّح، يرفع الجديد ويستبدل الروابط القديمة.",
        run: "بدء إعادة التوليد",
        progress: (n, m, name) => `جارٍ التوليد — ${n} من ${m} — ${name}`,
        okCount: (n, m) => `تم تحديث ${n} من ${m} عميل بنجاح`,
        errCount: (n) => `فشل تحديث: ${n} عميل`,
        close: "إغلاق",
        noTenants: "لا يوجد عملاء مؤكّدون لإعادة التوليد حالياً.",
        countLabel: (n) => `عدد العملاء المؤكّدين: ${n}`,
      }
    : {
        title: "Regenerate contracts & invoices for all clients",
        desc: "First re-tiers every client (trials and contracted) against the new segments (Starter/Emerging/Medium/Advanced/Enterprise) and updates the tier name and annual amount fields. Then regenerates a fresh contract and invoice for each contracted client with the shortened template and corrected stamp, uploads them and replaces the old links in each record.",
        run: "Start regeneration",
        progress: (n, m, name) => `Generating — ${n} of ${m} — ${name}`,
        okCount: (n, m) => `Updated ${n} of ${m} clients successfully`,
        errCount: (n) => `Failed: ${n} clients`,
        close: "Close",
        noTenants: "No confirmed clients to regenerate.",
        countLabel: (n) => `Confirmed clients: ${n}`,
      };

  const targets = useMemo(
    () => (tenants || []).filter((x) => !isOwnerTenant(x) && x.contract_confirmed),
    [tenants]
  );

  const run = async () => {
    if (!targets.length) return;
    setRunning(true); setFinished(false); setDone(0); setErrors([]); setTotal(targets.length);
    let ok = 0;
    const errs = [];
    // 0) إعادة تصنيف جميع العملاء (trial + contracted) وفق الشرائح الجديدة — تحديث pricing_tier و quoted_amount.
    setCurrent(isAr ? "جارٍ إعادة تصنيف جميع العملاء…" : "Re-tiering all clients…");
    try {
      const rt = await base44.functions.invoke("portalData", {
        token: session.token, employee_id: session.employee_id,
        action: "owner_retiert_all",
      });
      const rrt = rt?.data || rt;
      if (!rrt?.ok) throw new Error(rrt?.error || "retier_failed");
    } catch (e) {
      errs.push(`re-tier: ${String(e?.message || e)}`);
    }
    for (let i = 0; i < targets.length; i++) {
      const tenant = targets[i];
      setCurrent(tenant.name || "—");
      try {
        const tier = tenant.employee_count
          ? tierForCount(tenant.employee_count, isAr ? PRICING_TIERS_AR : PRICING_TIERS_EN)
          : null;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const quoteNo = tenant.contract_quote_no || `JQ${today}${Math.floor(100 + Math.random() * 899)}`;
        const invNo = `INV${today}${Math.floor(100 + Math.random() * 899)}`;
        const subStart =
          tenant.subscription_start
          || (tenant.contract_generated_date || "").slice(0, 10)
          || (tenant.created_date || "").slice(0, 10)
          || today;
        const subEnd =
          tenant.subscription_end
          || (() => { const d = new Date(subStart); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })();
        // المبلغ الجديد وفق الشريحة المعاد تصنيفها (لا يعتمد على القيمة القديمة)
        const newAmount = (tier ? Number(tier.yearly) : Number(tenant.quoted_amount)) || 0;

        // عقد الاشتراك
        const contractBlob = await renderToPdfBlob(
          <SubscriptionContractDoc company={tenant} quoteNo={quoteNo} date={subStart} tier={tier} quotedAmount={newAmount} discountPercent={Number(tenant.discount_percent) || 0} discountCode={tenant.discount_code || ""} />
        );
        const contract_url = await uploadPdfBlob(contractBlob, `Jadara-Contract-${quoteNo}.pdf`);

        // فاتورة غير ضريبية
        const invoiceBlob = await renderToPdfBlob(
          <SubscriptionInvoiceDoc
            company={tenant}
            tier={tier}
            invNo={invNo}
            date={subStart}
            startDate={subStart}
            endDate={subEnd}
            amount={newAmount}
            employeeCount={Number(tenant.employee_count) || 0}
            discountPercent={Number(tenant.discount_percent) || 0}
            discountCode={tenant.discount_code || ""}
            isAr={isAr}
          />
        );
        const invoice_url = await uploadPdfBlob(invoiceBlob, `Jadara-Invoice-${invNo}.pdf`);

        // حفظ الروابط الجديدة على سجل المنشأة
        const sav = await base44.functions.invoke("portalData", {
          token: session.token, employee_id: session.employee_id,
          action: "owner_save_documents",
          tenant_id: tenant.id,
          contract_pdf_url: contract_url,
          invoice_pdf_url: invoice_url,
          contract_quote_no: quoteNo,
        });
        const rsav = sav?.data || sav;
        if (!rsav?.ok) throw new Error(rsav?.error || "save_failed");
        ok++;
      } catch (e) {
        errs.push(`${tenant.name || tenant.id}: ${String(e?.message || e)}`);
      }
      setDone(i + 1);
      await new Promise((r) => setTimeout(r, 250));
    }
    setErrors(errs);
    setRunning(false); setFinished(true); setCurrent("");
    if (onDone) onDone();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o && !running && onClose ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileStack size={18} className="text-violet-600" /> {t.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed">{t.desc}</p>
          {targets.length === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">{t.noTenants}</div>
          ) : (
            <div className="text-xs text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-3">
              {t.countLabel(targets.length)}
            </div>
          )}
          {running && (
            <div className="flex items-center gap-2 text-violet-700 bg-violet-50 border border-violet-200 rounded-lg p-2.5 text-xs">
              <Loader2 size={14} className="animate-spin shrink-0" />
              <span className="truncate">{t.progress(done, total, current)}</span>
            </div>
          )}
          {finished && (
            <div className="space-y-2">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 flex items-center gap-2 text-xs">
                <Check size={16} /> {t.okCount(done, total)}
              </div>
              {errors.length > 0 && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <AlertTriangle size={14} /> {t.errCount(errors.length)}
                  </div>
                  <ul className="list-disc ps-5 space-y-1 max-h-40 overflow-auto">
                    {errors.map((e, i) => (<li key={i} className="break-words">{e}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => (running ? null : onClose())} disabled={running}>{t.close}</Button>
          <Button onClick={run} disabled={running || targets.length === 0} className="gap-1.5">
            {running ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} {t.run}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}