import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TurnstileWidget from "@/components/TurnstileWidget";
import { ShieldCheck, UserPlus, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortalI18n, usePortalT, portalDir } from "@/lib/portalI18n";

// بطاقة مصادقة بوابة الموظف — ثلاثة تبويبات:
// دخول (إقامة + كلمة مرور)، إنشاء حساب (إقامة + ميلاد مرة واحدة + كلمة مرور)،
// نسيت كلمة المرور (إقامة → رمز بالبريد → كلمة مرور جديدة).

function errText(t, err) {
  const e = String(err || "").toLowerCase();
  if (!e) return t.invalid;
  if (e.includes("rate_limited")) return t.rateLimited;
  if (e.includes("needs_registration")) return t.needsReg;
  if (e.includes("inactive")) return t.inactive;
  if (e.includes("owner_use_owner_portal")) return t.ownerPortal;
  if (e.includes("already_registered")) return t.alreadyReg;
  if (e.includes("not_matched")) return t.notMatched;
  if (e.includes("weak_password")) return t.weak;
  if (e.includes("no_email")) return t.noEmail;
  if (e.includes("email_failed")) return t.emailFailed;
  if (e.includes("invalid_code")) return t.invalidCode;
  if (e.includes("expired_code")) return t.expiredCode;
  if (e.includes("locked")) return t.locked;
  if (e.includes("captcha")) return t.captchaReq;
  if (e.includes("invalid_credentials")) return t.invalid;
  return e;
}

export default function PortalAuthCard({ onAuthenticated }) {
  const { lang } = usePortalI18n();
  const t = usePortalT("portalAuth");
  const isRtl = portalDir(lang) === "rtl";

  const [mode, setMode] = useState("login");
  const [nid, setNid] = useState("");
  const [pwd, setPwd] = useState("");
  const [birth, setBirth] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [info, setInfo] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpUid, setOtpUid] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setMsg({ type: "", text: "" });
    setInfo("");
    setOtpSent(false);
    setOtp("");
    setCaptcha("");
    if (m !== "forgot") { setPwd(""); setConfirm(""); }
    setBirth("");
  };

  const header =
    mode === "login"
      ? { icon: <ShieldCheck size={22} className="text-violet-600" />, title: t.cardTitle, desc: t.cardDesc }
      : mode === "register"
      ? { icon: <UserPlus size={22} className="text-violet-600" />, title: t.regTitle, desc: t.regDesc }
      : { icon: <KeyRound size={22} className="text-violet-600" />, title: t.forgotTitle, desc: t.forgotDesc };

  const doLogin = async (e) => {
    e.preventDefault();
    const id = nid.trim();
    if (!id || !pwd) return;
    if (!captcha) { setMsg({ type: "err", text: t.captchaReq }); return; }
    setBusy(true); setMsg({ type: "", text: "" }); setInfo("");
    try {
      const res = await base44.functions.invoke("verifyEmployeePortal", {
        national_id: id, password: pwd, captcha_token: captcha,
      });
      const data = res?.data || res;
      if (data?.ok) {
        onAuthenticated({
          token: data.token,
          employee_id: data.employee.id,
          employee: data.employee,
          org: data.org,
          expires_at: data.expires_at,
        });
        setNid(""); setPwd(""); setCaptcha("");
      } else {
        setMsg({ type: "err", text: errText(t, data?.error) });
      }
    } catch (err) {
      setMsg({ type: "err", text: errText(t, err?.response?.data?.error || err?.message) });
    } finally { setBusy(false); }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    const id = nid.trim();
    if (!id || !birth || !pwd) return;
    if (pwd.length < 6) { setMsg({ type: "err", text: t.weak }); return; }
    if (pwd !== confirm) { setMsg({ type: "err", text: t.mismatch }); return; }
    if (!captcha) { setMsg({ type: "err", text: t.captchaReq }); return; }
    setBusy(true); setMsg({ type: "", text: "" }); setInfo("");
    try {
      const res = await base44.functions.invoke("registerEmployeePortal", {
        national_id: id, birth_date: birth, new_password: pwd, captcha_token: captcha,
      });
      const data = res?.data || res;
      if (data?.ok) {
        setNid(""); setBirth(""); setPwd(""); setConfirm(""); setCaptcha("");
        setMode("login");
        setInfo(t.regSuccess);
      } else {
        setMsg({ type: "err", text: errText(t, data?.error) });
      }
    } catch (err) {
      setMsg({ type: "err", text: errText(t, err?.response?.data?.error || err?.message) });
    } finally { setBusy(false); }
  };

  const doSendOtp = async (e) => {
    e.preventDefault();
    const id = nid.trim();
    if (!id) return;
    if (!captcha) { setMsg({ type: "err", text: t.captchaReq }); return; }
    setBusy(true); setMsg({ type: "", text: "" }); setInfo("");
    try {
      const res = await base44.functions.invoke("employeeForgotPassword", {
        national_id: id, captcha_token: captcha,
      });
      const data = res?.data || res;
      if (data?.ok) {
        setOtpSent(true);
        setOtpUid(id);
        setInfo(t.otpSent(data.email_hint || ""));
        setCaptcha("");
      } else {
        setMsg({ type: "err", text: errText(t, data?.error) });
      }
    } catch (err) {
      setMsg({ type: "err", text: errText(t, err?.response?.data?.error || err?.message) });
    } finally { setBusy(false); }
  };

  const doReset = async (e) => {
    e.preventDefault();
    const id = otpUid || nid.trim();
    if (!id || !otp || !pwd) return;
    if (pwd.length < 6) { setMsg({ type: "err", text: t.weak }); return; }
    if (pwd !== confirm) { setMsg({ type: "err", text: t.mismatch }); return; }
    if (!captcha) { setMsg({ type: "err", text: t.captchaReq }); return; }
    setBusy(true); setMsg({ type: "", text: "" }); setInfo("");
    try {
      const res = await base44.functions.invoke("employeeResetPassword", {
        national_id: id, otp_code: otp, new_password: pwd, captcha_token: captcha,
      });
      const data = res?.data || res;
      if (data?.ok) {
        setNid(""); setOtp(""); setPwd(""); setConfirm(""); setCaptcha(""); setOtpSent(false);
        setMode("login");
        setInfo(t.resetSuccess);
      } else {
        setMsg({ type: "err", text: errText(t, data?.error) });
      }
    } catch (err) {
      setMsg({ type: "err", text: errText(t, err?.response?.data?.error || err?.message) });
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-border p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          {header.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{header.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{header.desc}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {[["login", t.tabLogin], ["register", t.tabRegister], ["forgot", t.tabForgot]].map(([m, label]) => (
          <button key={m} type="button" onClick={() => switchMode(m)}
            className={cn("px-3 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap",
              mode === m ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {info && (
        <div className="mb-4 text-sm rounded-lg p-3 bg-emerald-50 text-emerald-700 leading-relaxed border border-emerald-100">{info}</div>
      )}
      {msg.text && (
        <div className={cn("mb-4 text-sm rounded-lg p-3 leading-relaxed",
          msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>{msg.text}</div>
      )}

      {mode === "login" && (
        <form onSubmit={doLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.idLabel}</Label>
            <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder={t.idPh} required disabled={busy} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.pwdLabel}</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.pwdPh} required disabled={busy} dir="ltr" />
          </div>
          <TurnstileWidget onToken={setCaptcha} className="origin-top-right" />
          <Button type="submit" disabled={busy || !captcha} className="gap-2 w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}{t.loginBtn}
          </Button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={doRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.idLabel}</Label>
            <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder={t.idPh} required disabled={busy} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.birthLabel}</Label>
            <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required disabled={busy} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.newPwdLabel}</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.newPwdPh} required disabled={busy} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.confirmPwdLabel}</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={busy} dir="ltr" />
          </div>
          <TurnstileWidget onToken={setCaptcha} className="origin-top-right" />
          <Button type="submit" disabled={busy || !captcha} className="gap-2 w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}{t.regBtn}
          </Button>
        </form>
      )}

      {mode === "forgot" && !otpSent && (
        <form onSubmit={doSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.idLabel}</Label>
            <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder={t.idPh} required disabled={busy} dir="ltr" />
          </div>
          <TurnstileWidget onToken={setCaptcha} className="origin-top-right" />
          <Button type="submit" disabled={busy || !captcha} className="gap-2 w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}{t.sendOtpBtn}
          </Button>
        </form>
      )}

      {mode === "forgot" && otpSent && (
        <form onSubmit={doReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.otpLabel}</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" required disabled={busy} dir="ltr" inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.newPwdLabel}</Label>
            <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={t.newPwdPh} required disabled={busy} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.confirmPwdLabel}</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={busy} dir="ltr" />
          </div>
          <TurnstileWidget onToken={setCaptcha} className="origin-top-right" />
          <Button type="submit" disabled={busy || !captcha} className="gap-2 w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}{t.resetBtn}
          </Button>
          <button type="button" onClick={() => { setOtpSent(false); setInfo(""); setMsg({ type: "", text: "" }); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowRight size={14} style={{ transform: isRtl ? "none" : "scaleX(-1)" }} /> {t.back}
          </button>
        </form>
      )}
    </div>
  );
}