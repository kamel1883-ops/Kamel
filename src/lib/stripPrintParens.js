// إزالة كل علامات الأقواس من المستندات المطبوعة عبر window.print
// (مخالصة نهاية الخدمة، عرض السعر، الفاتورة، العقد، بوابة العميل) لأنها
// تظهر معكوسة/غير مرتبة في الطباعة العربية RTL. يُعاد النص الأصلي بعد الطباعة.
const BRACKET_RE = /[()[\]（）［］【】〚〛⟦⟧⟨⟩⟪⟫]/g;

function strip(root) {
  const snapshot = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const tn of texts) {
    const v = tn.nodeValue;
    if (!v) continue;
    const cleaned = v.replace(BRACKET_RE, "");
    if (cleaned !== v) {
      snapshot.push({ node: tn, original: v });
      tn.nodeValue = cleaned;
    }
  }
  return snapshot;
}

function restore(snapshot) {
  for (const { node, original } of snapshot) {
    if (node) node.nodeValue = original;
  }
}

let currentSnapshot = [];

export function setupPrintParensStripper() {
  window.addEventListener("beforeprint", () => {
    currentSnapshot = [];
    document
      .querySelectorAll(".print-settlement, .print-quote, .print-invoice, .print-client, .print-contract, .print-brochure")
      .forEach((el) => {
        currentSnapshot = currentSnapshot.concat(strip(el));
      });
  });
  window.addEventListener("afterprint", () => {
    restore(currentSnapshot);
    currentSnapshot = [];
  });
}