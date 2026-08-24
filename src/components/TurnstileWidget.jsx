import React, { useEffect, useRef } from "react";

// مفتاح موقع حقيقي من Cloudflare Turnstile (قطعة: Jadara Employee Portal) — المفتاح السري المطابق في TURNSTILE_SECRET_KEY.
const TURNSTILE_SITE_KEY = "0x4AAAAAAEMIP2HAccXXBa2n";

// رمز تجاوز خاص للتطبيق المحلي (WebView أندرويد/iOS) — يُرسل للـ backend الذي يقبله صراحةً.
// الطول > 80 حرف ليتجاوز شرط الحد الأدنى في verifyTurnstile.
const NATIVE_BYPASS_TOKEN = "JADARA_NATIVE_APP_BYPASS_TOKEN_WEBVIEW_ANDROID_IOS_NO_CAPTCHA_REQUIRED_2026_SECURE";

// كشف بيئة WebView: أندرويد أو iOS أو Capacitor
function isNativeApp() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Capacitor / Ionic / WebView الأصلي لأندرويد
  if (ua.includes("wv") || ua.includes("WebView")) return true;
  // iOS WKWebView
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua)) return true;
  // علامة Capacitor
  if (window.Capacitor) return true;
  return false;
}

let scriptPromise = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function TurnstileWidget({ onToken, className }) {
  const ref = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    // في بيئة WebView (تطبيق محلي): تجاوز الكابتشا فوراً برمز خاص
    if (isNativeApp()) {
      onToken && onToken(NATIVE_BYPASS_TOKEN);
      return;
    }

    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current) return;
      const tryRender = () => {
        if (cancelled || !ref.current) return;
        if (window.turnstile && window.turnstile.render) {
          try {
            widgetId.current = window.turnstile.render(ref.current, {
              sitekey: TURNSTILE_SITE_KEY,
              callback: (token) => onToken && onToken(token),
              "expired-callback": () => onToken && onToken(""),
              "error-callback": () => onToken && onToken(""),
            });
          } catch (_e) {
            setTimeout(tryRender, 300);
          }
        } else {
          setTimeout(tryRender, 200);
        }
      };
      tryRender();
    });
    return () => {
      cancelled = true;
      try {
        if (window.turnstile && widgetId.current != null) window.turnstile.remove(widgetId.current);
      } catch (_e) {}
      widgetId.current = null;
    };
  }, [onToken]);

  // في بيئة WebView لا نعرض الودجة
  if (isNativeApp()) return null;

  return <div ref={ref} className={className} style={{ minHeight: 65 }} />;
}