import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, Hash, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/lib/i18n";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function CompanyLogin() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        title: "بوابة الشركات",
        subtitle: "الدخول مخصص للمنشآت — البريد + الرقم الموحد + كلمة المرور",
        email: "البريد الإلكتروني",
        unified: "الرقم الموحد (يبدأ بـ7)",
        password: "كلمة المرور",
        forgot: "نسيت كلمة المرور؟",
        signing: "جارٍ التحقق وتسجيل الدخول...",
        submit: "دخول المنشأة",
        errUnified: "الرقم الموحد يجب أن يبدأ بـ7",
        errCreds: "بيانات المنشأة غير مطابقة. تأكد من البريد والرقم الموحد.",
        errLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        noAccount: "ليس لديك حساب منشأة؟",
        create: "سجّل تجربتك المجانية",
        back: "العودة للرئيسية",
      }
    : {
        title: "Company Portal",
        subtitle: "Sign-in for organizations — Email + Unified Number + Password",
        email: "Email",
        unified: "Unified number (starts with 7)",
        password: "Password",
        forgot: "Forgot password?",
        signing: "Verifying and signing in...",
        submit: "Sign in",
        errUnified: "Unified number must start with 7",
        errCreds: "Organization credentials do not match. Verify email and unified number.",
        errLogin: "Invalid email or password",
        noAccount: "No company account?",
        create: "Start your free trial",
        back: "Back to home",
      };

  const [email, setEmail] = useState("");
  const [unified, setUnified] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

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
      if (!res?.data?.valid) { setError(t.errCreds); return; }
      await base44.auth.loginViaEmailPassword(em, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err?.message || t.errLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Building2}
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <div className="flex flex-col items-center gap-1">
          <span>{t.noAccount}{" "}
            <Link to="/quote" className="text-primary font-medium hover:underline">{t.create}</Link>
          </span>
          <Link to="/" className="text-xs text-muted-foreground hover:underline">{t.back}</Link>
        </div>
      }
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-email">{t.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="company-email" type="email" autoComplete="email" autoFocus placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-unified">{t.unified}</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="company-unified" inputMode="numeric" autoComplete="off" placeholder="7XXXXXXXX"
              value={unified} onChange={(e) => setUnified(e.target.value.replace(/\D/g, ""))}
              className="pl-10 h-12" dir="ltr" required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="company-password">{t.password}</Label>
            <Link to="/company-forgot-password" className="text-xs text-primary hover:underline">{t.forgot}</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="company-password" type="password" autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.signing}</>) : t.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}