import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Hash, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import TurnstileWidget from "@/components/TurnstileWidget";
import { toast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";

export default function CompanyRegister() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? {
        title: "تسجيل حساب منشأة",
        subtitle: "سجّل بالبريد والرقم الوطني الموحد المقدّم في طلب التجربة أو اشتراكك السنوي المفعّل لإنشاء كلمة مرورك",
        email: "البريد الإلكتروني المسجّل في الطلب",
        unified: "الرقم الوطني الموحد للمنشآت (10 خانات تبدأ بـ7)",
        password: "كلمة المرور",
        confirm: "تأكيد كلمة المرور",
        mismatch: "كلمتا المرور غير متطابقتين",
        errUnified: "الرقم الوطني الموحد للمنشآت يجب أن تكون 10 خانات تبدأ بـ7",
        errCaptcha: "أكّد أنك لست روبوت",
        errCreds: "بيانات المنشأة غير مطابقة. تأكد من البريد والرقم الموحد المطابق لطلبك.",
        errExists: "هذا البريد مسجّل مسبقاً — استخدم الدخول أو استعادة كلمة المرور.",
        creating: "جارٍ إنشاء الحساب...",
        create: "إنشاء الحساب",
        note: "التسجيل متاح فقط للمنشآت التي قدّمت طلب تجربة أو لديها اشتراك سنوي مفعّل من جدارة لإدارة الموارد البشرية. يجب تطابق البريد والرقم الموحد المستخدم في طلبك.",
        otpTitle: "تأكيد بريدك الإلكتروني",
        otpSub: "أرسلنا رمزاً إلى",
        verifying: "جارٍ التحقق وتفعيل الحساب...",
        verify: "تحقّق وتفعيل",
        noCode: "لم يصلك الرمز؟",
        resend: "إعادة الإرسال",
        resendOk: "تم إرسال الرمز",
        resendOkDesc: "تحقق من بريدك الإلكتروني للرمز الجديد.",
        resendFail: "تعذّرت إعادة إرسال الرمز",
        otpFail: "رمز التحقق غير صحيح",
        promoteErr: "تم إنشاء الحساب لكن تعذّرت تفعيل صلاحية الإدارة. تواصل مع دعم جدارة لإتمام التفعيل.",
        haveAccount: "لديك حساب بالفعل؟",
        signin: "تسجيل الدخول",
        back: "العودة للرئيسية",
      }
    : {
        title: "Register company account",
        subtitle: "Register with the email and National Unified Number you submitted in your trial request or activated annual subscription to set your password",
        email: "Email registered with your request",
        unified: "National Unified Number (10 digits, starts with 7)",
        password: "Password",
        confirm: "Confirm password",
        mismatch: "Passwords do not match",
        errUnified: "National Unified Number must be 10 digits starting with 7",
        errCaptcha: "Please verify you're human",
        errCreds: "Company credentials do not match. Verify the email and unified number matching your request.",
        errExists: "This email is already registered — use sign-in or password recovery.",
        creating: "Creating account...",
        create: "Create account",
        note: "Registration is available only for organizations that submitted a trial request or have an annual subscription activated by Jadara. Your email and unified number must match your request.",
        otpTitle: "Verify your email",
        otpSub: "We sent a code to",
        verifying: "Verifying and activating...",
        verify: "Verify & activate",
        noCode: "Didn't get the code?",
        resend: "Resend",
        resendOk: "Code sent",
        resendOkDesc: "Check your email for the new code.",
        resendFail: "Could not resend the code",
        otpFail: "Invalid verification code",
        promoteErr: "Account created but admin activation failed. Contact Jadara support to complete activation.",
        haveAccount: "Already have an account?",
        signin: "Sign in",
        back: "Back to home",
      };

  const [email, setEmail] = useState("");
  const [unified, setUnified] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);

  const resetCaptcha = () => { setCaptcha(""); setCaptchaKey((k) => k + 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError(t.mismatch); return; }
    const u = unified.replace(/\D/g, "");
    if (!/^7\d{7,11}$/.test(u)) { setError(t.errUnified); return; }
    if (!captcha) { setError(t.errCaptcha); return; }
    const em = email.trim().toLowerCase();
    if (!em) { setError(t.errCreds); return; }
    setLoading(true);
    try {
      // 1) التحقق من تطابق بيانات المنشأة مع الطلب المقدّم (بريد + رقم موحد)
      const res = await base44.functions.invoke("verifyTenantCredentials", {
        email: em, unified_number: u, turnstileToken: captcha,
      });
      if (!res?.data?.valid) { setError(t.errCreds); resetCaptcha(); return; }
      // 2) إنشاء حساب Base44 بكلمة المرور — يرسل رمز تحقق OTP
      await base44.auth.register({ email: em, password });
      setShowOtp(true);
    } catch (err) {
      const m = String(err?.message || "");
      if (/exist|already|registered|taken|in use|duplicate/i.test(m)) setError(t.errExists);
      else setError(m || t.creating);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      // 3) تفعيل صلاحية الإدارة ليتمكن من دخول بوابة الشركات (/app)
      try {
        await base44.functions.invoke("registerTenantAccount", { unified_number: unified.replace(/\D/g, "") });
      } catch (e) {
        setError(t.promoteErr);
        setLoading(false);
        return;
      }
      // 4) إعادة تحميل صريحة لاست refresh دور المستخدم المحدّث
      window.location.href = "/app";
    } catch (err) {
      setError(err.message || t.otpFail);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim().toLowerCase());
      toast({ title: t.resendOk, description: t.resendOkDesc });
    } catch (err) {
      setError(err.message || t.resendFail);
    }
  };

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

  return (
    <AuthLayout
      icon={UserPlus}
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <div className="flex flex-col items-center gap-1">
          <span>{t.haveAccount}{" "}
            <Link to="/company-login" className="text-primary font-medium hover:underline">{t.signin}</Link>
          </span>
          <Link to="/" className="text-xs text-muted-foreground hover:underline">{t.back}</Link>
        </div>
      }
    >
      <div className="mb-4 p-3 rounded-lg bg-violet-50 text-violet-700 text-xs leading-relaxed">{t.note}</div>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="creg-email">{t.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="creg-email" type="email" autoComplete="email" autoFocus placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creg-unified">{t.unified}</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="creg-unified" inputMode="numeric" autoComplete="off" placeholder="7XXXXXXXX"
              value={unified} onChange={(e) => setUnified(e.target.value.replace(/\D/g, ""))}
              className="pl-10 h-12" dir="ltr" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creg-password">{t.password}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="creg-password" type="password" autoComplete="new-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creg-confirm">{t.confirm}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="creg-confirm" type="password" autoComplete="new-password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <TurnstileWidget key={captchaKey} onToken={setCaptcha} className="flex justify-center" />
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !captcha}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.creating}</>) : t.create}
        </Button>
      </form>
    </AuthLayout>
  );
}