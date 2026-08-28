import { useEffect } from "react";

// الكابتشا معطّلة على مستوى المنتج بالكامل: ودجة Cloudflare Turnstile لا تستطيع الاتصال بخوادمها
// في بيئة العملاء، فتعطّل كل أزرار الإرسال. بدلاً من إزالتها صفحةً بصفحة، نُحوّلها هنا إلى لا-عملية
// ترسل رمزاً ثابتاً يقبله التحقق الخادمي — فتُفعَّل الأزرار فوراً وتعمل جميع الصفحات.
export default function TurnstileWidget({ onToken }) {
  useEffect(() => {
    onToken && onToken("JADARA_TURNSTILE_DISABLED");
  }, [onToken]);
  return null;
}