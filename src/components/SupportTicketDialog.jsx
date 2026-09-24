import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { SUPPORT_CATEGORIES } from "@/lib/supportCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { MobileSelect, MobileSelectItem } from "@/components/ui/mobile-select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import SupportMyTickets from "@/components/SupportMyTickets";
import { Headphones, Paperclip, X, Loader2, CheckCircle2, Upload, UserCircle, Mail, Phone, PlusCircle, ListChecks } from "lucide-react";

// نافذة رفع تذكرة دعم فني داخل بوابة الشركات (للعملاء المسجّلين فقط).
// تُعبّأ بيانات مقدّم الطلب تلقائياً من جلسته، ولا تتطلب كابتشا.
export default function SupportTicketDialog({ open, onClose, user }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "الدعم الفني", sub: "أخبرنا عن إشكاليتك وسيتواصل معك فريق الدعم عبر بريدك الإلكتروني",
    youLabel: "مقدّم الطلب", catLabel: "فئة المشكلة *", catPh: "اختر القسم المتأثر به",
    subLabel: "نوع المشكلة", subPh: "اختر النوع",
    subjectLabel: "عنوان مختصر", subjectPh: "ملخص الإشكالية بكلمات قليلة",
    descLabel: "وصف الإشكالية *", descPh: "اشرح المشكلة بالتفصيل، الخطوات، والنتيجة المتوقعة…",
    phoneLabel: "الجوال (للتواصل)", phonePh: "(اختياري)",
    attachLabel: "مرفقات (صور توضح المشكلة)", attachHint: "حتى 6 صور",
    submit: "إرسال التذكرة", sending: "جارٍ الإرسال…",
    okTitle: "تم استلام تذكرتك", okDesc: "رقم تذكرتك هو",
    okNote: "تم تحويلها لفريق الدعم الفني، وسيصلك الرد على بريدك الإلكتروني المسجّل.",
    newTicket: "تذكرة جديدة", close: "إغلاق", err: "تعذّر الإرسال",
  } : {
    title: "Technical Support", sub: "Tell us your issue and our team will reply via email",
    youLabel: "Submitted by", catLabel: "Issue category *", catPh: "Select affected module",
    subLabel: "Issue type", subPh: "Select type",
    subjectLabel: "Short subject", subjectPh: "Briefly summarize the issue",
    descLabel: "Description *", descPh: "Describe the issue in detail, steps, and expected result…",
    phoneLabel: "Phone (for follow-up)", phonePh: "(optional)",
    attachLabel: "Attachments (screenshots)", attachHint: "Up to 6 images",
    submit: "Submit ticket", sending: "Sending…",
    okTitle: "Ticket received", okDesc: "Your ticket number is",
    okNote: "It was forwarded to our support team; a reply will arrive at your registered email.",
    newTicket: "New ticket", close: "Close", err: "Failed to submit",
  };

  const [catKey, setCatKey] = useState("");
  const [subKey, setSubKey] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [phone, setPhone] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const [tab, setTab] = useState("new");
  const fileRef = useRef(null);

  const cat = SUPPORT_CATEGORIES.find((c) => c.key === catKey) || null;

  // إعادة ضبط الحالة عند الفتح
  useEffect(() => {
    if (open) {
      setCatKey(""); setSubKey(""); setSubject(""); setDesc("");
      setPhone(""); setAttachments([]); setErr(""); setDone(null); setTab("new");
    }
  }, [open]);

  const onFiles = async (files) => {
    const list = Array.from(files || []).slice(0, 6 - attachments.length);
    if (!list.length) return;
    setUploading(true);
    try {
      for (const f of list) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: f });
        const d = res?.data || res;
        const url = d?.file_url;
        if (url) setAttachments((a) => [...a, { url, name: f.name }].slice(0, 6));
      }
    } catch { setErr(isAr ? "فشل رفع المرفقات" : "Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!catKey || !desc) { setErr(t.err); return; }
    setBusy(true);
    try {
      const sub = cat && subKey ? cat.subs.find((s) => s.key === subKey) : null;
      const payload = {
        category: catKey,
        category_label: cat ? (isAr ? cat.ar : cat.en) : catKey,
        subcategory: subKey,
        subcategory_label: sub ? (isAr ? sub.ar : sub.en) : "",
        subject,
        description: desc,
        client_phone: phone,
        attachment_urls: attachments.map((a) => a.url),
      };
      const res = await base44.functions.invoke("submitCompanySupportTicket", payload);
      const d = res?.data || res;
      if (!d?.ok) throw new Error(d?.error || "fail");
      setDone(d.ticket_number);
    } catch (e2) { setErr(e2?.message || t.err); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t.okTitle}</h2>
            <p className="text-muted-foreground mb-3">{t.okDesc}</p>
            <div className="inline-block bg-white border border-violet-200 rounded-xl px-6 py-3 text-2xl font-bold text-violet-700 tracking-wider mb-4">{done}</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">{t.okNote}</p>
            <Button onClick={onClose} className="gap-2">{t.close}</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Headphones size={22} className="text-violet-700" />
                </div>
                <div>
                  <DialogTitle>{t.title}</DialogTitle>
                  <DialogDescription>{t.sub}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* تبويبات: تذكرة جديدة / تذاكري السابقة */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-1">
              <button type="button" onClick={() => setTab("new")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${tab === "new" ? "bg-card text-violet-700 shadow-sm" : "text-muted-foreground"}`}>
                <PlusCircle size={15} /> {isAr ? "تذكرة جديدة" : "New ticket"}
              </button>
              <button type="button" onClick={() => setTab("list")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${tab === "list" ? "bg-card text-violet-700 shadow-sm" : "text-muted-foreground"}`}>
                <ListChecks size={15} /> {isAr ? "تذاكري السابقة" : "My tickets"}
              </button>
            </div>

            {tab === "list" ? (
              <SupportMyTickets user={user} />
            ) : (
            <form onSubmit={submit} className="space-y-4">
              {/* مقدّم الطلب — بيانات الجلسة (للقراءة فقط) */}
              <div className="rounded-xl border border-violet-200/70 bg-violet-50/50 p-3">
                <div className="text-xs font-semibold text-violet-700 mb-2">{t.youLabel}</div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCircle size={15} className="text-violet-500 shrink-0" />
                    <span className="truncate text-foreground">{user?.full_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={15} className="text-violet-500 shrink-0" />
                    <span dir="ltr" className="truncate text-foreground">{user?.email || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t.catLabel}</Label>
                  <MobileSelect value={catKey} onValueChange={(v) => { setCatKey(v); setSubKey(""); }} placeholder={t.catPh}>
                    {SUPPORT_CATEGORIES.map((c) => <MobileSelectItem key={c.key} value={c.key}>{isAr ? c.ar : c.en}</MobileSelectItem>)}
                  </MobileSelect>
                </div>
                <div className="space-y-1.5">
                  <Label>{t.subLabel}</Label>
                  <MobileSelect value={subKey} onValueChange={setSubKey} placeholder={t.subPh} disabled={!cat}>
                    {cat ? cat.subs.map((s) => <MobileSelectItem key={s.key} value={s.key}>{isAr ? s.ar : s.en}</MobileSelectItem>) : null}
                  </MobileSelect>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t.subjectLabel}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t.subjectPh} maxLength={200} />
              </div>

              <div className="space-y-1.5">
                <Label>{t.descLabel}</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.descPh} rows={5} maxLength={5000} required />
              </div>

              <div className="space-y-1.5">
                <Label>{t.phoneLabel}</Label>
                <div className="relative">
                  <Phone size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
                  <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePh} className="ps-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t.attachLabel}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploading || attachments.length >= 6}>
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {isAr ? "إضافة صور" : "Add images"}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Paperclip size={12} /> {t.attachHint}</span>
                </div>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {attachments.map((a, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                        <Image src={a.url} fittingType="fill" className="w-full h-full" alt={a.name} />
                        <button type="button" onClick={() => setAttachments((arr) => arr.filter((_, j) => j !== i))} className="absolute top-1 left-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {err && <div className="text-sm rounded-lg p-3 bg-rose-50 text-rose-700">{err}</div>}

              <Button type="submit" disabled={busy} className="gap-2 w-full">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Headphones size={16} />} {busy ? t.sending : t.submit}
              </Button>
            </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}