// طباعة التقارير على مقاس A4 كامل (عرضي افتراضياً) بحيث تُحتوى كل الأعمدة والصفوف والإجماليات في الصفحة.
export function printA4(landscape = true) {
  const style = document.createElement("style");
  style.id = "a4-print-style";
  style.textContent = `@page { size: A4 ${landscape ? "landscape" : "portrait"}; margin: 8mm; }`;
  document.head.appendChild(style);
  const cleanup = () => {
    try { style.remove(); } catch (e) {}
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => { window.print(); setTimeout(cleanup, 1500); }, 60);
}