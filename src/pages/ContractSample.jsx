import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight, Loader2, Download } from "lucide-react";
import SubscriptionContractDoc from "@/components/docs/SubscriptionContractDoc";
import { renderToPdfBlob } from "@/lib/pdfDocs";

// عيّنة عامة من العقد لمعاينته فوراً (يُفتح من المسار /contract-sample)
const SAMPLE_COMPANY = {
  name: "منشأة العيّنة التجارية",
  commercial_register: "1010123456",
  industry: "التقنية والمعلومات",
  city: "الرياض",
  contact_name: "محمّد العبدالله",
  contact_phone: "+966500000000",
  contact_email: "client@example.com",
  unified_number: "7000000000",
};

export default function ContractSample() {
  const [owner, setOwner] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    base44.functions.invoke("getOwnerContractProfile")
      .then((r) => setOwner((r?.data) || r || null))
      .catch(() => setOwner(null));
  }, []);

  const quoteNo = "JC" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const date = new Date().toISOString().slice(0, 10);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await renderToPdfBlob(<SubscriptionContractDoc company={SAMPLE_COMPANY} owner={owner || undefined} quoteNo={quoteNo} date={date} />);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      <div className="no-print sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/"><Logo size={40} /></Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">العودة للرئيسية</Link>
            <Button onClick={() => window.print()} className="gap-2"><Printer size={16} /> طباعة</Button>
            <Button onClick={download} disabled={busy} variant="outline" className="gap-2">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} تنزيل PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="no-print mb-4 text-sm text-muted-foreground flex items-center gap-2">
          <ArrowRight size={14} /> هذه عيّنة العقد الرسمي الموقّع والمختوم من «جدارة» — الخانات المخصّصة لتوقيع وختم العميل تُترك فارغة.
        </div>
        <div className="print-contract bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex justify-center">
          <SubscriptionContractDoc company={SAMPLE_COMPANY} owner={owner || undefined} quoteNo={quoteNo} date={date} />
        </div>
      </div>
    </div>
  );
}