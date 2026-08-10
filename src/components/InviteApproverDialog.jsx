import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// زرّ دعوة مدير مباشر / مالية — يستخدمه الأدمن (الموارد البشرية/المالك) لدعوة حسابات الموافقات ببريد + دور.
export default function InviteApproverDialog() {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    btn: "دعوة معتمد",
    title: "دعوة مدير مباشر / مالية",
    email: "بريد المعتمد",
    roleM: "مدير مباشر (موافقات الإجازات)",
    roleF: "مالية (الصرف النهائي)",
    note: "يصله بريدان: رسالة المنصة الافتراضية + رسالة مُموَّهة من «جدارة» تحوي شعارنا وبيانات التواصل ورابط بوابة المعتمدين وطريقة ضبط كلمة المرور. للمدير المباشر: اربط بريده بسجل موظفه (الموظفون ← تعديل ← بريد العمل)، ثم اجعل مرؤوسيه يشيرون إليه في حقل «المدير المباشر». للمالية: يكفيه الدخول لبوابة الاعتمادات بعد ضبط كلمة المرور.",
    brandedSent: "(وصل بريد جدارة المُموَّه بشعارنا وبيانات التواصل لضبط كلمة المرور).",
    brandedFail: "(تعذّر إرسال بريد جدارة المُموَّه آلياً — استخدم رابط الدعوة من رسالة المنصة).",
    send: "إرسال الدعوة", cancel: "إلغاء", invalid: "بريد غير صالح",
    ok: (e, r) => `تمت دعوة «${e}» بدور ${r}.`,
    partial: (e) => `تمت دعوة «${e}»، لكن تعذّر تعيين الدور المخصّص تلقائياً — يرجى إعادة المحاولة.`,
    err: (m) => `تعذّر: ${m}`,
  } : {
    btn: "Invite approver",
    title: "Invite direct manager / finance",
    email: "Approver email",
    roleM: "Direct manager (leave approvals)",
    roleF: "Finance (final payment)",
    note: "They'll receive two emails: the platform's default invite + a branded Jadara email with our logo, contact info, the approvers-portal link and how to set a password. For a manager: link their email to their employee record (Employees → edit → work email), then set them as their subordinates' direct manager. For finance: they just sign in to the approvals portal after setting their password.",
    brandedSent: "(A branded Jadara email with our logo and contact info was sent for password setup).",
    brandedFail: "(Couldn't send the branded Jadara email automatically — use the invite link from the platform message.)",
    send: "Send invite", cancel: "Cancel", invalid: "Invalid email",
    ok: (e, r) => `Invited "${e}" as ${r}.`,
    partial: (e) => `Invited "${e}", but couldn't set the custom role automatically — please retry.`,
    err: (m) => `Failed: ${m}`,
  };

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async () => {
    setErr(""); setOk("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setErr(t.invalid); return; }
    setBusy(true);
    try {
      // منصة Base44 تقبل فقط user/admin في inviteUser؛ ندعوه user ثم نعيّن دوره المخصّص.
      await base44.users.inviteUser(em, "user");
      let roleOk = true;
      try {
        let uid = null;
        const users = await base44.entities.User.list("-created_date", 500);
        const target = users.find((u) => (u.email || "").toLowerCase() === em);
        uid = target?.id || null;
        if (uid) await base44.entities.User.update(uid, { role });
      } catch (e2) { roleOk = false; }
      let brandedOk = true;
      try { await base44.functions.invoke("sendApproverInvite", { email: em, role }); }
      catch (e3) { brandedOk = false; }
      const baseOk = roleOk ? t.ok(em, role === "manager" ? t.roleM : t.roleF) : t.partial(em);
      setOk(baseOk + " " + (brandedOk ? t.brandedSent : t.brandedFail));
      setEmail("");
      setTimeout(() => setOpen(false), 1500);
    } catch (e) { setErr(t.err(e?.message || "")); }
    finally { setBusy(false); }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-9">
        <UserPlus size={15} /> {t.btn}
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setErr(""); setOk(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t.email}</Label>
              <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{isAr ? "الدور" : "Role"}</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="manager">{t.roleM}</option>
                <option value="finance">{t.roleF}</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground bg-slate-50 border border-border rounded-lg p-3 leading-relaxed">{t.note}</div>
            {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-2.5">{err}</div>}
            {ok && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">{ok}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>{t.cancel}</Button>
            <Button onClick={submit} disabled={busy || !email.trim()} className="gap-1.5">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} {t.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}