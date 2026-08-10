import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Hash, ArrowLeft, Loader2, Info } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/lib/i18n";

export default function CompanyForgotPassword() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        title: "استعادة كلمة المرور",
        subtitle: "أدخل بريد المنشأة ورقمها الموحد لإرسال رابط التعديل",
        email: "البريد الإلكتروني للمنشأة",
        unified: "الرقم الموحد (يبدأ بـ7)",
        sending: "جارٍ الإرسال...",
        submit: "إرسال رابط الاستعادة",
        sent: "إذا تطابقت بيانات المنشأة، فستصلك رسالة استعادة كلمة المرور على بريدك قريباً. افتح الرابط لتعيين كلمة مرور جديدة.",
        errUnified: "الرقم الموحد يجب أن يبدأ بـ7",
        errCreds: "بيانات المنشأة غير مطابقة. تأكد من البريد والرقم الموحد.",
        back: "العودة لدخول المنشأة",
        forgotEmailTitle: "نسيت البريد الإلكتروني نفسه؟",
        forgotEmailBody: "لا يمكن إضافة بريد بديل لاستقبال الرمز تلقائياً (الإرسال يقتصر على المستخدمين المسجّلين). تواصل مع دعم جدارة على info@jadara-hr.com مع إثبات ملكية المنشأة (الرقم الموحد + السجل التجاري) لإعادة ربط حسابك.",
      }
    : {
        title: "Recover your password",
        subtitle: "Enter your company email and unified number to receive a reset link",
        email: "Company email",
        unified: "Unified number (starts with 7)",
        sending: "Sending...",
        submit: "Send recovery link",
        sent: "If your company details match, a password reset message will arrive at your inbox shortly. Open the link to set a new password.",
        errUnified: "Unified number must start with 7",
        errCreds: "Company credentials do not match. Verify email and unified number.",
        back: "Back to company sign-in",
        forgotEmailTitle: "Forgot the email itself?",
        forgotEmailBody: "Adding an alternate email to receive the code isn't supported automatically (email delivery is limited to registered users). Contact Jadara support at info@jadara-hr.com with proof of ownership (unified number + commercial register) to re-link your account.",
      };

  const [email, setEmail] = useState("");
  const [unified, setUnified] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const u = unified.replace(/\D/g, "");
    if (!/^7\d{7,11}$/.test(u)) { setError(t.errUnified); return; }
    const em = email.trim().toLowerCase();
    setLoading(true);
    try {
      const res = await base44.functions.invoke("verifyTenantCredentials", {
        email: em,
        unified_number: u,
      });
      if (res?.data?.valid) {
        try { await base44.auth.resetPasswordRequest(em); } catch {}
      }
    } catch {
      // تجاهل — نُظهر رسالة عامة دائماً
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <Link to="/company-login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" style={{ transform: isAr ? "none" : "scaleX(-1)" }} />
          {t.back}
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-foreground text-center">{t.sent}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="forgot-email" type="email" autoComplete="email" autoFocus placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="forgot-unified">{t.unified}</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="forgot-unified" inputMode="numeric" autoComplete="off" placeholder="7XXXXXXXX"
                value={unified} onChange={(e) => setUnified(e.target.value.replace(/\D/g, ""))}
                className="pl-10 h-12" dir="ltr" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.sending}</>) : t.submit}
          </Button>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-0.5">{t.forgotEmailTitle}</div>
              <div className="leading-relaxed">{t.forgotEmailBody}</div>
            </div>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}