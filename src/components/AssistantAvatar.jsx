import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Mic, MicOff, Volume2, Loader2, Headphones, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSpeechInput, useSpeechOutput } from "@/hooks/useSpeech";
import { Image } from "@/components/ui/image";

const AVATAR_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/a3dc65c7a_generated_image.png";

const WELCOME = {
  public: "أهلاً 👋 أنا «مساعد جدارة». اسألني عن المنصة والباقات وكيف تبدأ تجربتك أو تسجّل الدخول للشركات/الموظفين. أوجّهك للخطوات الصحيحة ولا أنفّذ شيئاً عنك. اكتب أو اضغط الميكروفون وتحدّث معي.",
  employee: "أهلاً 👋 أنا مرشدك في بوابة الموظف. اسألني كيف تطلب إجازة/سلفة/انتداب، أين تتابع طلباتك، كيف تسجّل حضورك أو تطبع مخالصتك. أشرح لك الخطوات ولا أنفّذ عنك. اكتب أو تحدّث معي صوتياً.",
};

function Bubble({ message, onSpeak, hideListen }) {
  const isUser = message.role === "user";
  return (
    <div className={"flex " + (isUser ? "justify-end" : "justify-start")}>
      <div className={"max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm " + (isUser ? "bg-violet-600 text-white" : "bg-white border border-border")}>
        {message.content && (isUser
          ? <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          : <div className="prose prose-sm max-w-none leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"><ReactMarkdown>{message.content}</ReactMarkdown></div>)}
        {!isUser && message.content && !hideListen && (
          <button onClick={() => onSpeak(message.content)} className="mt-1.5 inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800">
            <Volume2 size={13} /> استماع
          </button>
        )}
      </div>
    </div>
  );
}

export default function AssistantAvatar({ mode = "public", session = null, tone = "light" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const fromMicRef = useRef(false); // هل آخر إرسال صدر من الميكروفون (محادثة صوتية)؟
  const stopLoopRef = useRef(false); // طلب إيقاف حلقة الاستماع التلقائي

  // عند انتهاء نطق الرد: إن كانت المحادثة صوتية ولم يُطلب الإيقاف → استمع تلقائياً للسؤال التالي
  const onSpokeEnd = useCallback(() => {
    if (fromMicRef.current && !stopLoopRef.current) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { speak, speaking, stopSpeak } = useSpeechOutput({ onEnded: onSpokeEnd });

  const handleTranscript = useCallback((t) => {
    if (!t) return;
    fromMicRef.current = true;
    stopLoopRef.current = false;
    sendText(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { listening, start, stop, supported: micSupported } = useSpeechInput({
    lang: "ar-SA",
    onTranscript: handleTranscript,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const canRun = mode === "employee" ? !!(session?.token && session?.employee_id) : true;

  const sendText = async (override) => {
    const text = (override !== undefined ? override : input).trim();
    if (!text || sending || !canRun) return;
    const next = [...messages, { role: "user", content: override !== undefined ? override : text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const history = next.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      let payload, fnName;
      if (mode === "employee") {
        fnName = "employeeAssistant";
        payload = { token: session.token, employee_id: session.employee_id, message: text, history };
      } else {
        fnName = "publicAssistant";
        payload = { message: text, history };
      }
      const res = await base44.functions.invoke(fnName, payload);
      const data = res?.data || res;
      const reply = (data?.reply || "تعذّر الرد الآن. حاول مجدداً.").trim();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      // إن جاء الرد من محادثة صوتية → انطقه صوتياً (سيُستمع تلقائياً بعده)
      if (fromMicRef.current) speak(reply);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "تعذّر الاتصال بالمساعد. تأكد من اتصالك ثم حاول مجدداً." }]);
    } finally {
      setSending(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      stopLoopRef.current = true; // إيقاف حلقة الاستماع التلقائي
      stop();
    } else {
      fromMicRef.current = true;
      stopLoopRef.current = false;
      start();
    }
  };

  const typeSend = () => {
    fromMicRef.current = false;
    stopLoopRef.current = true;
    if (speaking) stopSpeak();
    sendText();
  };

  const close = () => {
    stopLoopRef.current = true;
    if (listening) stop();
    if (speaking) stopSpeak();
    setOpen(false);
  };

  if (mode === "employee" && !session) return null;

  const ringOnLight = tone === "light"; // on dark backgrounds vs light
  const btnRing = ringOnLight
    ? "ring-2 ring-amber-300/60 shadow-lg shadow-amber-900/20"
    : "ring-2 ring-violet-300/60 shadow-lg shadow-violet-900/20";

  return (
    <>
      {/* علامة المساعد — شخصية سعودية في أعلى الصفحة */}
      <button
        onClick={() => setOpen(true)}
        className={"fixed top-20 left-4 z-40 group flex flex-col items-center gap-1 transition active:scale-95 " }
        title="مساعد جدارة الذكي"
        aria-label="مساعد جدارة الذكي"
      >
        <span className={"relative flex h-14 w-14 rounded-full overflow-hidden bg-slate-200 " + btnRing}>
          <Image src={AVATAR_URL} fittingType="fill" className="h-full w-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
        </span>
        <span className={"text-[10px] font-medium px-1.5 rounded-full " + (ringOnLight ? "bg-amber-50/90 text-amber-700" : "bg-white/90 text-violet-700")}>مساعد جدارة</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div className="absolute inset-0 bg-black/30" onClick={close} />
          <div className="relative w-full sm:max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col" dir="rtl">
            <div className="h-16 flex items-center justify-between px-4 border-b bg-[#0b1120] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-amber-300/50">
                  <Image src={AVATAR_URL} fittingType="fill" className="h-full w-full object-cover" />
                </span>
                <div className="leading-tight">
                  <div className="font-semibold text-sm">مساعد جدارة الذكي</div>
                  <div className="text-[11px] text-white/50">مرشد إرشادي — صوتي وكتابي</div>
                </div>
              </div>
              <button onClick={close} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
              {messages.length === 0 && !sending && (
                <div className="text-center text-muted-foreground text-sm mt-8 px-4 leading-relaxed">
                  {WELCOME[mode]}
                  <div className="mt-3 text-xs text-muted-foreground/80">💡 جرّب: اضغط الميكروفون وتحدّث، وسأرد عليك بالصوت ثم أستمع لسؤالك التالي تلقائياً.</div>
                </div>
              )}
              {messages.map((m, i) => <Bubble key={i} message={m} onSpeak={speak} hideListen={m.role === "assistant" && fromMicRef.current} />)}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> يدوّن الرد…
                  </div>
                </div>
              )}
              {speaking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl px-3.5 py-2.5 text-sm text-violet-600 flex items-center gap-2">
                    <Volume2 size={14} className="animate-pulse" /> ينطق الرد…
                  </div>
                </div>
              )}
            </div>

            {/* شريط الإدخال */}
            <div className="border-t bg-background p-2.5 flex items-end gap-2 shrink-0">
                <button
                  onClick={toggleMic}
                  className={"shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border " + (listening ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100")}
                  title={listening ? "إيقاف الاستماع" : "تحدّث (محادثة صوتية)"}
                >
                  {listening ? <Square size={16} /> : <Mic size={18} />}
                </button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); typeSend(); } }}
                placeholder="اكتب رسالتك أو تحدّث معي…"
                rows={1}
                className="resize-none max-h-32 flex-1"
              />
              <Button onClick={typeSend} disabled={!input.trim() || sending} size="sm" className="h-10 w-10 p-0 shrink-0"><Send size={18} /></Button>
            </div>
            <div className="px-3 pb-2 text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
              <Headphones size={12} />
              {listening ? "أستمع الآن… تحدّث واتركني أردّ عليك" : speaking ? "أردّ عليك بالصوت…" : "اضغط الميكروفون لمحادثة صوتية حقيقية — أسأل وأردّ بالصوت تلقائياً"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}