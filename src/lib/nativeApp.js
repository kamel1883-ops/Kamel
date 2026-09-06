// كشف بيئة التطبيق الأصلي (WebView داخل تطبيق iOS/Android المُرفوع لمتجر التطبيقات)
// لتمييزها عن المتصفح العادي وتطبيق قيود الشراء/التسجيل وفق إرشادات Apple 3.1.1
export function isNativeApp() {
  if (typeof window === "undefined" || !navigator) return false;
  const ua = navigator.userAgent || "";
  // iOS WKWebView داخل التطبيق: AppleWebKit بدون توكن Safari (عكس متصفح Safari العادي)
  const isIOSWebview = /(iPad|iPhone|iPod).*AppleWebKit(?!.*Safari)/i.test(ua);
  // iPadOS قد يُبلغ عن UA يشبه Mac لكن يبقى جهاز لمسي داخل WebView بدون Safari
  const isIPadMacWebview =
    /Macintosh.*AppleWebKit(?!.*Safari)/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  // Android WebView (العلامة الصريحة wv)
  const isAndroidWV = /Android/i.test(ua) && /; wv\)/i.test(ua);
  return isIOSWebview || isIPadMacWebview || isAndroidWV;
}