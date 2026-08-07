import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/lib/i18n";

export default function ForgotPassword() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? { title: "إعادة تعيين كلمة المرور", subtitle: "سنرسل لك رابطاً لإعادة التعيين", back: "العودة لتسجيل الدخول", email: "البريد الإلكتروني", sending: "جارٍ الإرسال...", submit: "إرسال رابط الإعادة", sent: "إذا كان هناك حساب مرتبط بهذا البريد، فستصلك رسالة لإعادة تعيين كلمة المرور قريباً." }
    : { title: "Reset your password", subtitle: "We'll send you a reset link", back: "Back to sign in", email: "Email", sending: "Sending...", submit: "Send reset link", sent: "If an account is linked to this email, you'll receive a password reset message shortly." };

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
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
      footer={<Link to="/login" className="text-primary font-medium hover:underline"><ArrowLeft className="w-3 h-3 inline mr-1" style={{ transform: isAr ? "none" : "scaleX(-1)" }} />{t.back}</Link>}
    >
      {sent ? (
        <p className="text-sm text-foreground text-center">{t.sent}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.sending}</>) : t.submit}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}