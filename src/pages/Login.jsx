import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { useI18n } from "@/lib/i18n";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? { title: "مرحباً بعودتك", subtitle: "سجّل الدخول إلى حسابك", noAccount: "ليس لديك حساب؟", create: "أنشئ حساباً", google: "المتابعة عبر Google", or: "أو", email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟", signing: "جارٍ تسجيل الدخول...", submit: "تسجيل الدخول", err: "البريد الإلكتروني أو كلمة المرور غير صحيحة", approverNote: "أنت معتمد مدعوّ؟ حسابك مُنشأ بالفعل — استخدم رابط «إعداد كلمة المرور» في رسالة الدعوة المرسلة لبريدك مباشرة. لا تُنشئ حساباً جديداً (سيفشل بخطأ 403 لأن بريدك مُسجّل سابقاً). إن فقدت رابط الدعوة أو لم يصلك، اطلب من الموارد البشرية إعادة إرسال الدعوة من لوحة الاعتمادات." }
    : { title: "Welcome back", subtitle: "Sign in to your account", noAccount: "No account?", create: "Create one", google: "Continue with Google", or: "or", email: "Email", password: "Password", forgot: "Forgot password?", signing: "Signing in...", submit: "Sign in", err: "Invalid email or password", approverNote: "Invited as an approver? Your account already exists — use the “set password” link in the invitation email sent to you. Don't create a new account (it will fail with 403 since your email is already registered). If you lost the invite link or it never arrived, ask HR to resend the invitation from the approvals dashboard." };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const isApprover = returnTo.includes("approvals-portal");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || t.err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", returnTo);

  return (
    <AuthLayout
      icon={LogIn}
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <>
          {t.noAccount}{" "}
          <Link to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className="text-primary font-medium hover:underline">{t.create}</Link>
        </>
      }
    >
      {isApprover && (
        <div className="mb-4 p-3 rounded-lg bg-violet-50 text-violet-800 text-xs leading-relaxed border border-violet-200">
          {t.approverNote}
        </div>
      )}
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" /> {t.google}
      </Button>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">{t.or}</span></div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.password}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t.forgot}</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.signing}</>) : t.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}