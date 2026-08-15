import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Copy, Check, FileCheck2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";

// خطوة التحويل البنكي في تدفق شراء الاشتراك:
// 1) عرض بيانات الحساب البنكي حتى يقوم العميل بتحويل المبلغ.
// 2) بعد التحويل يضغط للانتقال لخطوة رفع إثبات التحويل.
// 3) عند الرفع والتأكيد يُستدعى onPaid لتوليد العقد والفاتورة وتفعيل إنشاء الحساب.
export default function BankTransferPayment({ amount, isAr, t, bank, onPaid, onBack }) {
  const [step, setStep] = useState("details"); // "details" | "upload"
  const [proof, setProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(bank.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {}
  };

  const pick = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      setErr(isAr ? "حجم الملف يجب أن يكون أقل من 10 ميجابايت" : "File must be under 10MB");
      return;
    }
    setProof(f);
    setErr("");
  };

  const confirm = async () => {
    if (!proof) {
      setErr(isAr ? "الرجاء إرفاق إثبات التحويل" : "Please attach the transfer proof");
      return;
    }
    setUploading(true);
    setErr("");
    try {
      const res = await base44.integrations.Core.UploadFile({ file: proof });
      const file_url = res?.file_url;
      if (!file_url) throw new Error("no url");
      onPaid({ method: "bank_transfer", proof_url: file_url });
    } catch (_) {
      setErr(isAr ? "تعذّر رفع المستند، حاول مرة أخرى" : "Could not upload the document, try again");
    } finally {
      setUploading(false);
    }
  };

  const BackArrow = isAr ? ArrowLeft : ArrowRight;

  if (step === "details") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-5">
          <div className="flex items-center gap-2 text-violet-700 font-bold text-sm mb-4">
            <ShieldCheck size={16} /> {isAr ? "بيانات التحويل البنكي" : "Bank transfer details"}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <Row k={t.beneficiary} v={isAr ? bank.beneficiaryAr : bank.beneficiaryEn} />
            <Row k={t.bank} v={isAr ? bank.bankAr : bank.bankEn} />
            <Row k={t.iban} v={<span className="font-mono tracking-wide">{bank.iban}</span>} />
            <Row k={t.account} v={<span className="font-mono">{bank.account}</span>} />
            <Row k={t.amountDue} v={<span className="font-extrabold text-violet-700">{amount.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={copyIban} variant="outline" size="sm" className="gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t.copied : t.copy}
            </Button>
            <span className="text-xs text-muted-foreground">
              {isAr ? "حوّل المبلغ الموضّح أعلاه ثم اضغط الزر التالي لرفع إثبات التحويل." : "Transfer the amount above, then click the next button to upload the proof."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setStep("upload")} className="gap-2">
            {isAr ? "لقد أنهيت التحويل، ارفع الإثبات" : "I completed the transfer, upload proof"}
            <BackArrow size={16} />
          </Button>
          <button type="button" onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground underline">
            {isAr ? "تغيير طريقة الدفع" : "Change payment method"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-100 bg-white p-5">
        <div className="flex items-center gap-2 text-violet-700 font-bold text-sm mb-2">
          <Upload size={16} /> {isAr ? "أرفق إثبات التحويل" : "Upload transfer proof"}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {isAr
            ? "بعد تأكيد رفع المستند يُولَّد عقد اشتراكك الرسمي والفاتورة غير الضريبية تلقائياً، ثم تنشئ حسابك في بوابة الشركات بنفس البريد والرقم الموحّد المُسجَّلَين — أو يمكنك إنشاؤه لاحقاً."
            : "After uploading the proof, your official contract and non-tax invoice generate automatically, then create your account with the same email and unified number — or later."}
        </p>
        <label className="flex items-center justify-center gap-2 cursor-pointer rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 hover:bg-violet-50 px-4 py-6 text-sm text-violet-700 transition">
          <input type="file" accept="image/*,application/pdf" onChange={pick} className="hidden" />
          {proof ? (
            <span className="flex items-center gap-2"><FileCheck2 size={16} /> {proof.name}</span>
          ) : (
            <span className="flex items-center gap-2"><Upload size={16} /> {isAr ? "اختر صورة أو ملف PDF" : "Choose image or PDF"}</span>
          )}
        </label>
        {err && <p className="text-xs text-destructive mt-2">{err}</p>}
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={confirm} disabled={uploading || !proof} className="gap-2">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isAr ? "تأكيد التحويل وتوليد العقد والفاتورة" : "Confirm transfer & generate contract & invoice"}
          </Button>
          <button type="button" onClick={() => setStep("details")} className="text-xs text-muted-foreground hover:text-foreground underline">
            {isAr ? "العودة لبيانات الحساب" : "Back to bank details"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}