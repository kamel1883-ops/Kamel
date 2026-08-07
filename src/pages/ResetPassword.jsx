import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/lib/i18n";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr
    ? { newTitle: "كلمة مرور جديدة", newSub: "أدخل كلمة المرور الجديدة أدناه", mismatch: "كلمتا المرور غير متطابقتين", failed: "فشل إعادة تعيين كلمة المرور", newPass: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور", resetting: "جارٍ الإعادة...", submit: "إعادة تعيين كلمة المرور", badTitle: "رابط إعادة غير صالح", badSub: "رابط إعادة تعيين كلمة المرور مفقود أو غير صالح", fresh: "اطلب رابطاً جديداً", badBody: "يبدو أن الرابط المستخدم غير مكتمل. يرجى طلب رسالة جديدة لإعادة تعيين كلمة المرور." }
    : { newTitle: "New password", newSub: "Enter your new password below", mismatch: "Passwords do not match", failed: "Failed to reset password", newPass: "New password", confirm: "Confirm password", resetting: "Resetting...", submit: "Reset password", badTitle: "Invalid reset link", badSub: "The password reset link is missing or invalid", fresh: "Request a new link", badBody: "The link you used appears incomplete. Please request a new password reset message." };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError(t.mismatch); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout icon={AlertTriangle} title={t.badTitle} subtitle={t.badSub} footer={<Link to="/forgot-password" className="text-primary font-medium hover:underline">{t.fresh}</Link>}>
        <p className="text-sm text-foreground text-center">{t.badBody}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Lock} title={t.newTitle} subtitle={t.newSub}>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t.newPass}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t.confirm}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.resetting}</>) : t.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}