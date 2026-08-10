import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OwnerPortalPanel from "@/components/portal/OwnerPortalPanel";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import TurnstileWidget from "@/components/TurnstileWidget";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, ShieldCheck, Loader2, LogOut, ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalSession } from "@/lib/portalSession";

// بوابة المالك الذاتية — مستقلة عن بوابة الموظف. خاص بالمالك فقط (role_level = "owner")
// لإدارة العملاء والاشتراكات. الدخول برقم الإقامة وتاريخ الميلاد (نفس آلية التحقق).
export default function OwnerPortal() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    brandSub: "بوابة المالك الذاتية",
    back: "العودة للموقع", logout: "خروج",
    gTitle: "دخول بوابة المالك", gSubtitle: "بوابة خاصة بمالك منصة جدارة فقط",
    gDesc: "أدخل رقم إقامتك وتاريخ ميلادك للتحقق. خاص بالمالك لإدارة العملاء والاشتراكات، دون أي خدمات الموظف.",
    gIdLabel: "رقم الإقامة / الهوية الوطنية", gIdPh: "مثال: 2345678901",
    gBirthLabel: "تاريخ الميلاد", gBtn: "دخول البوابة",
    gFail: "البيانات غير مطابقة لسجل مالك مسجّل في النظام.",
    gInactive: "حالتك لا تسمح بالدخول للبوابة.",
    gCaptcha: "يرجى إكمال التحقق البشري أولاً.",
    gNote: "هذه البوابة خاصة بمالك النظام فقط.",
    notOwnerTitle: "هذه ليست صلاحيتك",
    notOwnerDesc: "هذه البوابة مخصّصة لمالك النظام فقط. إن كنت موظفاً فاستخدم بوابة الموظف.",
    goEmployee: "الانتقال إلى بوابة الموظف",
    loading: "جارٍ التحقق…",
  } : {
    brandSub: "Owner Self‑Service Portal",
    back: "Back to site", logout: "Sign out",
    gTitle: "Owner portal sign-in", gSubtitle: "For the Jadara platform owner only",
    gDesc: "Enter your Iqama/National ID number and your date of birth. Owner-only portal to manage clients and subscriptions, no employee services.",
    gIdLabel: "Iqama / National ID number", gIdPh: "e.g. 2345678901",
    gBirthLabel: "Date of birth", gBtn: "Sign in",
    gFail: "These credentials do not match a registered owner.",
    gInactive: "Your status does not allow portal access.",
    gCaptcha: "Please complete the human verification first.",
    gNote: "This portal is for the system owner only.",
    notOwnerTitle: "Not your portal",
    notOwnerDesc: "This portal is for the system owner only. If you are an employee, use the employee portal.",
    goEmployee: "Go to employee portal",
    loading: "Verifying…",
  };

  const [session, setSession] = useState(() => portalSession.load());
  const [employee, setEmployee] = useState(session?.employee || null);
  const [refreshing, setRefreshing] = useState(false);

  // عند وجود جلسة محفوظة، نُتحقق منها خادمياً ونُحدّث بيانات المالك (role_level)
  // من المصدر — الجلسات القديمة قد تفتقد role_level أو تكون منتهية/بسرّ مُستبدل.
  // إن كان الرمز غير صالح نُفرغ الجلسة ليعود المالك لشاشة الدخول بدل التعليق.
  useEffect(() => {
    if (!session) return;
    setRefreshing(true);
    base44.functions.invoke("portalData", {
      token: session.token, employee_id: session.employee_id, action: "fetch",
    }).then((res) => {
      const d = res?.data || res;
      if (d?.ok && d.employee) {
        const updated = { ...session, employee: d.employee };
        portalSession.save(updated);
        setSession(updated);
        setEmployee(d.employee);
      } else if (d?.error === "invalid_session") {
        portalSession.clear();
        setSession(null); setEmployee(null);
      }
    }).catch(() => {}).finally(() => setRefreshing(false));
  }, [session?.token, session?.employee_id]);

  const [nid, setNid] = useState("");
  const [birth, setBirth] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    const id = nid.trim(), bd = birth.trim();
    if (!id || !bd) return;
    if (!captchaToken) { setMsg({ type: "err", text: t.gCaptcha }); return; }
    setSigningIn(true); setMsg({ type: "", text: "" });
    try {
      const res = await base44.functions.invoke("verifyEmployeePortal", {
        national_id: id, birth_date: bd, captcha_token: captchaToken,
      });
      const data = res?.data || res;
      if (data?.ok) {
        portalSession.save({
          token: data.token,
          employee_id: data.employee.id,
          employee: data.employee,
          org: data.org,
          expires_at: data.expires_at,
        });
        setSession(portalSession.load());
        setEmployee(data.employee);
        setNid(""); setBirth(""); setCaptchaToken("");
      } else {
        setMsg({ type: "err", text: data?.error === "inactive" ? t.gInactive : t.gFail });
      }
    } catch (err) {
      setMsg({ type: "err", text: err?.response?.data?.error || err?.message || t.gFail });
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = () => {
    portalSession.clear();
    setSession(null); setEmployee(null);
    setMsg({ type: "", text: "" });
  };

  const isOwner = employee?.role_level === "owner";

  const Header = () => (
    <header className="sticky top-0 z-40 bg-[#0b1120] text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo tone="light" size={40} />
          <span className="hidden sm:inline text-sm text-white/70 border-r border-white/15 pr-3">{t.brandSub}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link to="/" className="text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg hidden sm:block">{t.back}</Link>
          {session && (
            <button type="button" onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <LogOut size={15} /> {t.logout}
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // ——— شاشة الدخول ———
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <Header />
        <div className="max-w-xl mx-auto px-5 py-12">
          <div className="bg-white rounded-2xl border border-border p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Crown size={22} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">{t.gTitle}</h3>
                <p className="text-xs text-muted-foreground">{t.gSubtitle}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">{t.gDesc}</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t.gIdLabel}</Label>
                <Input value={nid} onChange={(e) => setNid(e.target.value)} placeholder={t.gIdPh} required disabled={signingIn} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.gBirthLabel}</Label>
                <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required disabled={signingIn} dir="ltr" />
              </div>
              <TurnstileWidget onToken={setCaptchaToken} className="origin-top-right" />
              {msg.text && (
                <div className={cn("text-sm rounded-lg p-3 leading-relaxed", msg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                  {msg.text}
                </div>
              )}
              <Button type="submit" disabled={signingIn || !captchaToken} className="gap-2">
                {signingIn ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {t.gBtn}
              </Button>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.gNote}</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ——— جلسة لكن نتحقق من صلاحية المالك ———
  if (session && !employee?.role_level) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
          {refreshing && <Loader2 className="animate-spin" size={24} />}
          <p className="text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ——— جلسة لكن صلاحية غير مالك ———
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <Header />
        <div className="max-w-xl mx-auto px-5 py-16">
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} className="text-rose-500" />
            </div>
            <h3 className="font-semibold text-lg">{t.notOwnerTitle}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.notOwnerDesc}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Link to="/portal">
                <Button variant="outline" className="gap-2"><ArrowRight size={16} /> {t.goEmployee}</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="gap-2"><LogOut size={16} /> {t.logout}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ——— لوحة المالك ———
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-6xl mx-auto px-5 py-8">
        <OwnerPortalPanel session={session} employee={employee} />
      </div>
    </div>
  );
}