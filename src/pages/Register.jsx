import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useI18n } from "@/lib/i18n";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? { title: "أنشئ حسابك", subtitle: "سجّل للبدء الآن", haveAccount: "لديك حساب بالفعل؟", signin: "تسجيل الدخول", google: "المتابعة عبر Google", or: "أو", email: "البريد الإلكتروني", password: "كلمة المرور", confirm: "تأكيد كلمة المرور", mismatch: "كلمتا المرور غير متطابقتين", failed: "فشل التسجيل", creating: "جارٍ إنشاء الحساب...", create: "إنشاء الحساب", otpTitle: "تأكيد بريدك الإلكتروني", otpSub: "أرسلنا رمزاً إلى", verifying: "جارٍ التحقق...", verify: "تحقّق", noCode: "لم يصلك الرمز؟", resend: "إعادة الإرسال", resendOk: "تم إرسال الرمز", resendOkDesc: "تحقق من بريدك الإلكتروني للرمز الجديد.", resendFail: "تعذّرت إعادة إرسال الرمز", otpFail: "رمز التحقق غير صحيح", notActivated: "هذا البريد غير مفعّل للاشتراك. لا يمكن التسجيل إلا للبريد الذي صدر له عرض سعر وتم الدفع والتفعيل من الإدارة.", note: "التسجيل متاح فقط للبريد المفعّل من جدارة (بعد عرض السعر والدفع).", captchaFail: "فشل التحقق البشري — أعد المحاولة." }
    : { title: "Create your account", subtitle: "Register to get started", haveAccount: "Already have an account?", signin: "Sign in", google: "Continue with Google", or: "or", email: "Email", password: "Password", confirm: "Confirm password", mismatch: "Passwords do not match", failed: "Registration failed", creating: "Creating account...", create: "Create account", otpTitle: "Verify your email", otpSub: "We sent a code to", verifying: "Verifying...", verify: "Verify", noCode: "Didn't get the code?", resend: "Resend", resendOk: "Code sent", resendOkDesc: "Check your email for the new code.", resendFail: "Could not resend the code", otpFail: "Invalid verification code", notActivated: "This email is not activated for subscription. Registration is only available for emails that received a quote and were paid and activated by our team.", note: "Registration is only available for emails activated by Jadara (after a quote and payment).", captchaFail: "Human verification failed — please retry." };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError(t.mismatch); return; }
    setLoading(true);
    try {
      const ac = await base44.functions.invoke("checkTenantAccess", { email, captcha_token: captcha });
      const ad = ac?.data || ac;
      if (!ad?.ok) { setError(ad?.error === "captcha_failed" ? t.captchaFail : t.notActivated); setCaptcha(""); setCaptchaKey((k) => k + 1); setLoading(false); return; }
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || t.otpFail);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: t.resendOk, description: t.resendOkDesc });
    } catch (err) {
      setError(err.message || t.resendFail);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", safeReturnTo());

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title={t.otpTitle} subtitle={`${t.otpSub} ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.verifying}</>) : t.verify}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t.noCode}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">{t.resend}</button>
        </p>
      </AuthLayout>
    );
  }

  const rt = safeReturnTo();
  return (
    <AuthLayout
      icon={UserPlus}
      title={t.title}
      subtitle={t.subtitle}
      footer={<>{t.haveAccount}{" "}<Link to={"/login" + (rt !== "/" ? "?returnTo=" + encodeURIComponent(rt) : "")} className="text-primary font-medium hover:underline">{t.signin}</Link></>}
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" /> {t.google}
      </Button>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">{t.or}</span></div>
      </div>
      <div className="mb-4 p-3 rounded-lg bg-violet-50 text-violet-700 text-xs leading-relaxed">{t.note}</div>
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
          <Label htmlFor="password">{t.password}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t.confirm}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="flex justify-center"><TurnstileWidget key={captchaKey} onToken={setCaptcha} className="rounded-xl overflow-hidden" /></div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !captcha}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.creating}</>) : t.create}
        </Button>
      </form>
    </AuthLayout>
  );
}