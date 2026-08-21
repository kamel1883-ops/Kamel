import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import QuoteDoc from "@/components/docs/QuoteDoc";
import SubscriptionContractDoc from "@/components/docs/SubscriptionContractDoc";
import SubscriptionInvoiceDoc from "@/components/docs/SubscriptionInvoiceDoc";
import { renderToPdfBlob } from "@/lib/pdfDocs";
import { PRICING_TIERS_AR, tierForCount } from "@/lib/pricing";
import { PROVIDER } from "@/lib/providerIdentity";

// عيّنات المستندات الرسمية (عرض السعر + عقد الاشتراك) بالهوية الجديدة — للاطّلاع وتنزيل PDF
// قابلة للوصول على المسار /samples بدون تسجيل دخول.
const SAMPLE_COMPANY = {
  name: "منشأة العيّنة التجارية",
  commercial_register: "1010123456",
  industry: "التقنية والمعلومات",
  city: "الرياض",
  contact_name: "محمّد العبدالله",
  contact_phone: "+966500000000",
  contact_email: "client@example.com",
  unified_number: "7000000000",
  employee_count: 45,
};

export default function Samples() {
  const [busy, setBusy] = useState("");
  const tier = tierForCount(SAMPLE_COMPANY.employee_count, PRICING_TIERS_AR);
  const quoteNo = "JQ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "100";
  const date = new Date().toISOString().slice(0, 10);
  const end = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })();
  const invNo = quoteNo.replace(/^JQ/, "JI");

  const download = async (which) => {
    setBusy(which);
    try {
      const comp = which === "quote"
        ? <QuoteDoc company={SAMPLE_COMPANY} quoteNo={quoteNo} date={date} tier={tier} amount={tier.yearly} isAr />
        : which === "invoice"
        ? <SubscriptionInvoiceDoc company={SAMPLE_COMPANY} tier={tier} invNo={invNo} date={date} startDate={date} endDate={end} amount={tier.yearly} employeeCount={SAMPLE_COMPANY.employee_count} isAr />
        : <SubscriptionContractDoc company={SAMPLE_COMPANY} quoteNo={quoteNo} date={date} tier={tier} quotedAmount={tier.yearly} />;
      const blob = await renderToPdfBlob(comp);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      <div className="no-print sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0"><Logo size={40} /></Link>
          <div className="text-sm font-bold text-center leading-tight">
            عيّنات المستندات
            <div className="text-xs font-normal text-muted-foreground">{PROVIDER.institutionName} · الرقم الموحّد {PROVIDER.unifiedNumber}</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-xl font-bold">عرض السعر (صفحتان)</h2>
            <Button onClick={() => download("quote")} disabled={busy === "quote"} variant="outline" className="gap-2 shrink-0">
              {busy === "quote" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} تنزيل PDF
            </Button>
          </div>
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex justify-center">
            <QuoteDoc company={SAMPLE_COMPANY} quoteNo={quoteNo} date={date} tier={tier} amount={tier.yearly} isAr />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-xl font-bold">عقد الاشتراك السنوي</h2>
            <Button onClick={() => download("contract")} disabled={busy === "contract"} variant="outline" className="gap-2 shrink-0">
              {busy === "contract" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} تنزيل PDF
            </Button>
          </div>
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex justify-center">
            <SubscriptionContractDoc company={SAMPLE_COMPANY} quoteNo={quoteNo} date={date} tier={tier} quotedAmount={tier.yearly} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-xl font-bold">فاتورة الاشتراك السنوي</h2>
            <Button onClick={() => download("invoice")} disabled={busy === "invoice"} variant="outline" className="gap-2 shrink-0">
              {busy === "invoice" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} تنزيل PDF
            </Button>
          </div>
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex justify-center">
            <SubscriptionInvoiceDoc company={SAMPLE_COMPANY} tier={tier} invNo={invNo} date={date} startDate={date} endDate={end} amount={tier.yearly} employeeCount={SAMPLE_COMPANY.employee_count} isAr />
          </div>
        </section>
      </div>
    </div>
  );
}