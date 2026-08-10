import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Loader2, Copy, Check, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// دعوة معتمد ذاتية التسجيل: لا نُنشئ حساباً مسبقاً. نُولّد رابط تسجيل يفتحه المعتمد بنفسه
// وينشئ حسابه ويختار كلمة مروره. لا يمكن إرسال الرابط آلياً بالبريد إلا لبريد مسجّل مسبقاً
// على المنصة، لذا يُعرض الرابط للأدمن لنسخه وإرساله عبر واتساب عند تعذّر الإرسال الآلي.
export default function InviteApproverDialog() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    btn: "دعوة معتمد",
    title: "دعوة مدير مباشر / مالية",
    email: "بريد المعتمد",
    roleM: "مدير مباشر (موافقات الإجازات)",
    roleF: "مالية (الصرف النهائي)",
    note: "لا نُنشئ حساباً مسبقاً. نُولّد رابط تسجيل يفتحه المعتمد بنفسه وينشئ حسابه ويختار كلمة مروره. لا يمكن إرساله آلياً بالبريد إلا لبريد مسجّل مسبقاً على المنصة — لذا انسخ الرابط وأرسله عبر واتساب عند تعذّر الإرسال الآلي.",
    send: "توليد رابط الدعوة", cancel: "إلغاء", invalid: "بريد غير صالح",
    ok: (e) => `تم توليد رابط الدعوة لـ «${e}».`,
    emailed: "وصل الرابط آلياً إلى بريده (مسجّل مسبقاً).",
    notEmailed: "تعذّر الإرسال الآلي (بريده غير مسجّل) — انسخ الرابط وأرسله عبر واتساب.",
    linkLabel: "رابط التسجيل المخصّص",
    copy: "نسخ", copied: "تم النسخ",
    wa: "مشاركة عبر واتساب",
    err: (m) => `تعذّر: ${m}`,
    done: "تم",
  } : {
    btn: "Invite approver",
    title: "Invite direct manager / finance",
    email: "Approver email",
    roleM: "Direct manager (leave approvals)",
    roleF: "Finance (final payment)",
    note: "No account is pre-created. We generate a sign-up link the approver opens themselves to create their account and pick their password. It can't be auto-emailed unless their email is already registered on the platform — so copy the link and send it via WhatsApp if auto-email fails.",
    send: "Generate invite link", cancel: "Cancel", invalid: "Invalid email",
    ok: (e) => `Invite link generated for "${e}".`,
    emailed: "The link was emailed automatically (already registered).",
    notEmailed: "Auto-email failed (not registered) — copy the link and send it via WhatsApp.",
    linkLabel: "Dedicated sign-up link",
    copy: "Copy", copied: "Copied",
    wa: "Share via WhatsApp",
    err: (m) => `Failed: ${m}`,
    done: "Done",
  };

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [link, setLink] = useState("");
  const [emailed, setEmailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const reset = () => { setErr(""); setOk(""); setLink(""); setEmailed(false); setCopied(false); };

  const waShare = () => {
    const text = encodeURIComponent((isAr ? "رابط إنشاء حسابك في بوابة المعتمدين بجدارة: " : "Your Jadara approvers-portal sign-up link: ") + link);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) {}
  };

  const submit = async () => {
    setErr(""); setOk(""); setLink(""); setEmailed(false); setCopied(false);
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setErr(t.invalid); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createApproverInvite", { email: em, role });
      const rd = res?.data || res;
      if (!rd?.ok && rd?.error) throw new Error(rd.error);
      setLink(rd.link || "");
      setEmailed(!!rd.emailed);
      setOk(t.ok(em));
    } catch (e) { setErr(t.err(e?.message || "")); }
    finally { setBusy(false); }
  };

  const close = () => { setOpen(false); setTimeout(reset, 200); setEmail(""); setRole("manager"); };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-9">
        <UserPlus size={15} /> {t.btn}
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) close(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.email}</Label>
              <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" disabled={!!link} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "الدور" : "Role"}</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" disabled={!!link}>
                <option value="manager">{t.roleM}</option>
                <option value="finance">{t.roleF}</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-3 leading-relaxed">{t.note}</div>
            {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-2.5">{err}</div>}
            {ok && (
              <div className="space-y-2.5">
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  {ok} {emailed ? t.emailed : t.notEmailed}
                </div>
                {link && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t.linkLabel}</Label>
                    <div className="flex items-center gap-2">
                      <Input dir="ltr" readOnly value={link} className="text-xs" onFocus={(e) => e.target.select()} />
                      <Button type="button" size="icon" variant="outline" onClick={copy} title={t.copy}>
                        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </Button>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={waShare} className="gap-1.5 w-full">
                      <Send size={15} /> {t.wa}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={busy}>{link ? t.done : t.cancel}</Button>
            {!link && (
              <Button onClick={submit} disabled={busy || !email.trim()} className="gap-1.5">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} {t.send}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}