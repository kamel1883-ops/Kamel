// طباعة آمنة للشعارات: تنتظر اكتمال تحميل كل صور حاوية الطباعة قبل إطلاق window.print،
// لمنع تأخّر ظهور شعارات المنشأة وجدارة في معاينة الطباعة.

const _logoCache = new Set();

// يخزّن رابط الشعار مسبقًا في ذاكرة المتصفح (cache) فور توفر بيانات المنشأة،
// حتى يظهر فورًا عند فتح أي مستند دون انتظار تحميل شبكي.
export function preloadLogo(url) {
  if (!url || _logoCache.has(url)) return;
  _logoCache.add(url);
  try {
    const pre = new Image();
    pre.crossOrigin = "anonymous";
    pre.src = url;
  } catch (e) {}
}

// ينتظر اكتمال كل صور العنصر (أو كامل الصفحة) مع حد أقصى لانتهاء المهلة.
export function whenImagesReady(root, timeout = 4000) {
  const imgs = Array.from((root || document.body).querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            const done = () => res();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, timeout);
          })
    )
  );
}

// ينتظر رسم الحاوية ثم اكتمال الصور ثم يطلق الطباعة.
export async function safePrint(root) {
  await new Promise((r) => setTimeout(r, 60));
  await whenImagesReady(root);
  window.print();
}