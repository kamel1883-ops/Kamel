import React, { useEffect, useRef, useState } from "react";

// مفتاح موقع حقيقي من Cloudflare Turnstile (قطعة: Jadara Employee Portal) — المفتاح السري المطابق في TURNSTILE_SECRET_KEY.
const TURNSTILE_SITE_KEY = "0x4AAAAAAEMIP2HAccXXBa2n";

// علامة تخطّي تُرسل للـ backend عند فشل تحميل الودجت (WebView في تطبيق iOS الأصلي يمنع الاتصال بـ Cloudflare).
// الـ backend يقبلها ويعتمد على الـ rate limiter للحماية من الهجمات الآلية.
export const TURNSTILE_FALLBACK = "__TS_NATIVE_SKIP__";

// يكتشف أننا داخل تطبيق أصلي (iOS/Android WebView) — Turnstile معطل فيها افتراضياً.
function isNativeApp() {
  if (typeof window === "undefined") return false;
  const ua = (navigator.userAgent || "").toLowerCase();
  return (
    !!window.capacitor ||
    !!window.cordova ||
    /wv|webview|jadara\/app/i.test(ua) ||
    (/iphone|ipad|ipod/.test(ua) && !/safari/.test(ua) && !/crios|fxios/.test(ua))
  );
}

let scriptPromise = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script-load-failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function TurnstileWidget({ onToken, className }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    // تطبيق أصي: تعطيل Turnstile فوراً وإرسال علامة التخطّي
    if (isNativeApp()) {
      setFailed(true);
      onToken && onToken(TURNSTILE_FALLBACK);
      return;
    }

    // متصفح: محاولة تحميل الودجت، مع مهلة 7 ثوانٍ كاحتياط
    timer = setTimeout(() => {
      if (!cancelled) {
        setFailed(true);
        onToken && onToken(TURNSTILE_FALLBACK);
      }
    }, 7000);

    loadScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        clearTimeout(timer);
        const tryRender = () => {
          if (cancelled || !ref.current) return;
          if (window.turnstile && window.turnstile.render) {
            try {
              widgetId.current = window.turnstile.render(ref.current, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token) => { if (!cancelled) { setFailed(false); onToken && onToken(token); } },
                "expired-callback": () => onToken && onToken(""),
                "error-callback": () => { if (!cancelled) { setFailed(true); onToken && onToken(TURNSTILE_FALLBACK); } },
              });
            } catch (_e) {
              setTimeout(tryRender, 300);
            }
          } else {
            setTimeout(tryRender, 200);
          }
        };
        tryRender();
      })
      .catch(() => {
        if (!cancelled) { setFailed(true); onToken && onToken(TURNSTILE_FALLBACK); }
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      try {
        if (window.turnstile && widgetId.current != null) window.turnstile.remove(widgetId.current);
      } catch (_e) {}
      widgetId.current = null;
    };
  }, [onToken]);

  if (failed) return null;
  return <div ref={ref} className={className} style={{ minHeight: 65 }} />;
}