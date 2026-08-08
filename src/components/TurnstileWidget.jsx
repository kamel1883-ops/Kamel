import React, { useEffect, useRef } from "react";

// مفتاح الموقع العام لـ Cloudflare Turnstile. (مفتاح اختبار يمرّر دائماً — استبدله بمفتاحك الحقيقي من لوحة Cloudflare Turnstile).
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

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
            /* سيُعاد المحاولة */
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

  return <div ref={ref} className={className} style={{ minHeight: 65 }} />;
}