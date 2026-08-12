import { useState, useRef, useCallback } from "react";

// إدخال صوتي عبر SpeechRecognition (Web API) — مجاني ويعمل في المتصفح
export function useSpeechInput({ lang = "ar-SA", onTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = useCallback(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      alert("هذا المتصفح لا يدعم الإدخال الصوتي. جرّب Chrome أو Edge.");
      return;
    }
    try { if (recRef.current) recRef.current.stop(); } catch {}
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const txt = Array.from(e.results).map((r) => r[0].transcript).join("").trim();
      if (txt) onTranscript && onTranscript(txt);
    };
    recRef.current = rec;
    try { rec.start(); } catch {}
  }, [lang, onTranscript]);

  const stop = useCallback(() => {
    try { if (recRef.current) recRef.current.stop(); } catch {}
    setListening(false);
  }, []);

  const supported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  return { listening, start, stop, supported };
}

// نطق رد المساعد صوتياً عبر توليد الكلام
export function useSpeechOutput({ onEnded, lang = "ar" } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text) => {
    if (!text) return;
    try {
      setSpeaking(true);
      const { base44 } = await import("@/api/base44Client");
      const res = await base44.integrations.Core.GenerateSpeech({ text, language_code: lang, voice: "storm" });
      const url = res?.url || res?.data?.url;
      if (!url) { setSpeaking(false); return; }
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => { setSpeaking(false); if (onEnded) onEnded(); };
        audioRef.current.onerror = () => { setSpeaking(false); };
      } else {
        audioRef.current.onended = () => { setSpeaking(false); if (onEnded) onEnded(); };
      }
      audioRef.current.src = url;
      await audioRef.current.play().catch(() => setSpeaking(false));
    } catch {
      setSpeaking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEnded, lang]);

  const stopSpeak = useCallback(() => {
    try { if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; } } catch {}
    setSpeaking(false);
  }, []);

  return { speaking, speak, stopSpeak };
}