import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { Loader2, Send, Paperclip, X, Upload, ChevronDown, ChevronLeft, Inbox, MessageCircle, FileText } from "lucide-react";

const STATUS_META = {
  open: { ar: "نشطة", en: "Open", cls: "bg-blue-100 text-blue-700 ring-blue-200" },
  pending_info: { ar: "بانتظار المستندات", en: "Pending info", cls: "bg-amber-100 text-amber-700 ring-amber-200" },
  resolved: { ar: "تمت المعالجة", en: "Resolved", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  closed: { ar: "مغلقة", en: "Closed", cls: "bg-slate-200 text-slate-600 ring-slate-300" },
};

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

// خيط المحادثة: الرسالة الأولى (وصف التذكرة) ثم ردود الدعم وردود العميل بالترتيب
function Thread({ ticket, isAr }) {
  const items = [];
  // الرسالة الافتتاضية من العميل
  items.push({
    role: "client",
    label: isAr ? "أنت" : "You",
    at: ticket.created_date,
    message: ticket.description,
    attachments: ticket.attachment_urls || [],
    kind: "initial",
  });
  (ticket.reply_history || []).forEach((h) => {
    if (h.type === "reply" || h.type === "info_request") {
      items.push({ role: "support", label: isAr ? "الدعم الفني" : "Support", at: h.at, message: h.message, attachments: h.attachments || [], kind: h.type });
    } else if (h.type === "client_reply") {
      items.push({ role: "client", label: isAr ? "أنت" : "You", at: h.at, message: h.message, attachments: h.attachments || [], kind: "client_reply" });
    } else if (h.type === "closed") {
      items.push({ role: "system", label: isAr ? "تم الإغلاق" : "Closed", at: h.at, kind: "closed" });
    }
  });

  return (
    <div className="space-y-3 py-2">
      {items.map((m, i) => {
        if (m.role === "system") {
          return (
            <div key={i} className="text-center">
              <span className="inline-block text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                {isAr ? "أُغلقت التذكرة" : "Ticket closed"} — {fmtDate(m.at)}
              </span>
            </div>
          );
        }
        const mine = m.role === "client";
        return (
          <div key={i} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${mine ? "bg-violet-600 text-white rounded-tl-sm" : "bg-white border border-border text-foreground rounded-tr-sm"}`}>
              <div className={`text-[11px] font-semibold mb-1 ${mine ? "text-violet-100" : "text-slate-500"}`}>
                {m.label} {m.kind === "info_request" ? (isAr ? "· طلب مستندات" : "· info request") : ""}
              </div>
              <div className={`text-sm whitespace-pre-wrap leading-relaxed ${mine ? "text-white" : "text-foreground"}`}>{m.message}</div>
              {m.attachments && m.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.attachments.map((u, j) => (
                    <a key={j} href={u} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-white/30 bg-black/10">
                      <Image src={u} fittingType="fill" className="w-full h-full" alt="مرفق" />
                    </a>
                  ))}
                </div>
              )}
              <div className={`text-[10px] mt-1 ${mine ? "text-violet-200" : "text-slate-400"}`}>{fmtDate(m.at)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SupportMyTickets({ user }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const t = isAr ? {
    title: "تذاكري السابقة", loading: "جارٍ التحميل…", empty: "لا توجد تذاكر سابقة بعد",
    emptySub: "ستظهر هنا كل تذاكرك الدعم الفني وحالتها وخيط المحادثة مع فريق الدعم.",
    expand: "فتح المحادثة", collapse: "إغلاق", replyPh: "اكتب ردّك أو ارفع المستندات المطلوبة…",
    send: "إرسال الرد", sending: "جارٍ الإرسال…", addAtt: "إرفاق صورة", closed: "هذه التذكرة مغلقة. لفتح تذكرة جديدة انتقل لتبويب «تذكرة جديدة».",
    err: "تعذّر الإرسال", retry: "إعادة المحاولة", lastAct: "آخر نشاط",
  } : {
    title: "My tickets", loading: "Loading…", empty: "No tickets yet",
    emptySub: "Your support tickets and their status will appear here with the full conversation thread.",
    expand: "Open thread", collapse: "Close", replyPh: "Type your reply or attach the requested documents…",
    send: "Send reply", sending: "Sending…", addAtt: "Attach image", closed: "This ticket is closed. Open a new one from the «New ticket» tab.",
    err: "Failed to send", retry: "Retry", lastAct: "Last activity",
  };

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyBusy, setReplyBusy] = useState({});
  const [replyErr, setReplyErr] = useState({});
  const [attachments, setAttachments] = useState({});
  const [uploading, setUploading] = useState({});
  const fileRefs = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("mySupportTickets", { action: "list" });
      const d = res?.data || res;
      if (d?.ok) setTickets(d.tickets || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onFiles = async (id, files) => {
    const cur = attachments[id] || [];
    const list = Array.from(files || []).slice(0, 6 - cur.length);
    if (!list.length) return;
    setUploading((u) => ({ ...u, [id]: true }));
    try {
      const added = [];
      for (const f of list) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: f });
        const dd = res?.data || res;
        if (dd?.file_url) added.push(dd.file_url);
      }
      setAttachments((a) => ({ ...a, [id]: [...(a[id] || []), ...added].slice(0, 6) }));
    } catch { setReplyErr((e) => ({ ...e, [id]: isAr ? "فشل رفع المرفقات" : "Upload failed" })); }
    finally {
      setUploading((u) => ({ ...u, [id]: false }));
      if (fileRefs.current[id]) fileRefs.current[id].value = "";
    }
  };

  const sendReply = async (id) => {
    const msg = (replyText[id] || "").trim();
    if (!msg && !(attachments[id] || []).length) return;
    setReplyBusy((b) => ({ ...b, [id]: true }));
    setReplyErr((e) => ({ ...e, [id]: "" }));
    try {
      const res = await base44.functions.invoke("mySupportTickets", {
        action: "reply", ticket_id: id, message: msg || "—", attachment_urls: attachments[id] || [],
      });
      const d = res?.data || res;
      if (!d?.ok) throw new Error(d?.error || "fail");
      setReplyText((r) => ({ ...r, [id]: "" }));
      setAttachments((a) => ({ ...a, [id]: [] }));
      await load();
    } catch (e) {
      const err = String(e?.message || "");
      setReplyErr((x) => ({ ...x, [id]: err === "closed" ? t.closed : t.err }));
    } finally { setReplyBusy((b) => ({ ...b, [id]: false })); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground gap-2"><Loader2 size={18} className="animate-spin" /> {t.loading}</div>;
  }

  if (!tickets.length) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
          <Inbox size={26} className="text-violet-400" />
        </div>
        <div className="font-semibold mb-1">{t.empty}</div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{t.emptySub}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((tk) => {
        const open = expandedId === tk.id;
        const st = STATUS_META[tk.status] || STATUS_META.open;
        const lastAct = (tk.reply_history || []).at(-1)?.at || tk.created_date;
        const isClosed = tk.status === "closed";
        return (
          <div key={tk.id} className="rounded-xl border border-border overflow-hidden bg-card">
            {/* رأس التذكرة */}
            <button onClick={() => setExpandedId(open ? null : tk.id)} className="w-full flex items-center gap-3 p-3 text-start hover:bg-muted/50 transition">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                {isClosed ? <FileText size={18} className="text-slate-400" /> : <MessageCircle size={18} className="text-violet-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-violet-700">{tk.ticket_number}</span>
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ring-1 ${st.cls}`}>{isAr ? st.ar : st.en}</span>
                </div>
                <div className="text-sm font-medium truncate mt-0.5">{tk.subject || tk.category_label}</div>
                <div className="text-[11px] text-muted-foreground">{tk.category_label}{tk.subcategory_label ? ` · ${tk.subcategory_label}` : ""} · {t.lastAct} {fmtDate(lastAct)}</div>
              </div>
              {open ? <ChevronDown size={18} className="text-muted-foreground shrink-0" /> : <ChevronLeft size={18} className="text-muted-foreground shrink-0 rotate-180" />}
            </button>

            {/* خيط المحادثة + الرد */}
            {open && (
              <div className="border-t border-border bg-muted/30 px-3">
                <Thread ticket={tk} isAr={isAr} />
                {isClosed ? (
                  <div className="text-center text-xs text-muted-foreground bg-slate-100 rounded-lg py-2.5 mb-3">{t.closed}</div>
                ) : (
                  <div className="py-3 border-t border-border/60">
                    <Textarea
                      value={replyText[tk.id] || ""}
                      onChange={(e) => setReplyText((r) => ({ ...r, [tk.id]: e.target.value }))}
                      placeholder={t.replyPh}
                      rows={2}
                      maxLength={5000}
                      className="bg-card"
                    />
                    {(attachments[tk.id] || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(attachments[tk.id] || []).map((u, j) => (
                          <div key={j} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
                            <Image src={u} fittingType="fill" className="w-full h-full" alt="مرفق" />
                            <button onClick={() => setAttachments((a) => ({ ...a, [tk.id]: (a[tk.id] || []).filter((_, k) => k !== j) }))} className="absolute top-0.5 left-0.5 bg-black/60 text-white rounded-full p-0.5"><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRefs.current[tk.id]?.click()} disabled={uploading[tk.id] || (attachments[tk.id] || []).length >= 6}>
                        {uploading[tk.id] ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} <span className="text-xs">{t.addAtt}</span>
                      </Button>
                      <input ref={(el) => (fileRefs.current[tk.id] = el)} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(tk.id, e.target.files)} />
                      <Button type="button" size="sm" className="gap-1.5 mr-auto" onClick={() => sendReply(tk.id)} disabled={replyBusy[tk.id]}>
                        {replyBusy[tk.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} <span className="text-xs">{replyBusy[tk.id] ? t.sending : t.send}</span>
                      </Button>
                    </div>
                    {replyErr[tk.id] && <div className="text-xs text-rose-600 mt-2">{replyErr[tk.id]}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}