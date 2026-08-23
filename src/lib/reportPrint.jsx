import { elementToPdfBlob } from "@/lib/pdfDocs";

function buildBrandHeader(org) {
  const wrap = document.createElement("div");
  wrap.dir = "rtl";
  Object.assign(wrap.style, {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    borderBottom: "2px solid #0b1120", paddingBottom: "12px", marginBottom: "18px",
  });

  const right = document.createElement("div");
  Object.assign(right.style, { display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: "260px" });
  if (org?.logo_url) {
    const img = document.createElement("img");
    img.src = org.logo_url; img.crossOrigin = "anonymous"; img.alt = "logo";
    Object.assign(img.style, { maxWidth: "150px", maxHeight: "64px", objectFit: "contain" });
    right.appendChild(img);
  }
  const nm = document.createElement("div");
  nm.textContent = org?.name || "—";
  Object.assign(nm.style, { fontWeight: "700", fontSize: "13px", color: "#0b1120", marginTop: "6px", textAlign: "right" });
  right.appendChild(nm);
  if (org?.unified_number) {
    const c = document.createElement("div");
    c.textContent = "الرقم الموحد: " + org.unified_number;
    Object.assign(c.style, { fontSize: "10px", color: "#666" });
    right.appendChild(c);
  }

  const left = document.createElement("div");
  Object.assign(left.style, { display: "flex", alignItems: "center", gap: "10px" });
  const badge = document.createElement("div");
  Object.assign(badge.style, {
    width: "44px", height: "44px", borderRadius: "14px",
    background: "linear-gradient(135deg,#0b0f19,#2e2448)",
    boxShadow: "0 0 0 1px rgba(252,211,77,.3)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0",
  });
  badge.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>';
  left.appendChild(badge);
  const txt = document.createElement("div");
  Object.assign(txt.style, { display: "flex", flexDirection: "column" });
  const jt = document.createElement("div"); jt.textContent = "جدارة";
  Object.assign(jt.style, { fontWeight: "800", fontSize: "15px", color: "#0b1120", fontFamily: "var(--font-display)" });
  const js = document.createElement("div"); js.textContent = "لإدارة الموارد البشرية";
  Object.assign(js.style, { fontSize: "10px", color: "#666", marginTop: "1px" });
  txt.appendChild(jt); txt.appendChild(js);
  left.appendChild(txt);

  wrap.appendChild(right);
  wrap.appendChild(left);
  return wrap;
}

function buildDraftBanner() {
  return null;
}

function buildTitle(title, subtitle) {
  const c = document.createElement("div");
  Object.assign(c.style, { textAlign: "center", marginBottom: "18px" });
  const t = document.createElement("div"); t.textContent = title;
  Object.assign(t.style, { fontWeight: "800", fontSize: "18px", color: "#0b1120" });
  const s = document.createElement("div"); s.textContent = subtitle;
  Object.assign(s.style, { fontSize: "11px", color: "#666", marginTop: "4px" });
  const d = document.createElement("div");
  const monthsAr = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const now = new Date();
  d.textContent = `${now.getDate()} ${monthsAr[now.getMonth()]} ${now.getFullYear()} م`;
  Object.assign(d.style, { fontSize: "10px", color: "#999", marginTop: "4px" });
  c.appendChild(t); c.appendChild(s); c.appendChild(d);
  return c;
}

export async function printReport(node, { org, title, subtitle, stamp, landscape, draft, filterInclude, filterMethod } = {}) {
  if (!node) return;
  const useLandscape = !!landscape;
  // عرض مطابق لنسب صفحة A4 ليملأ الصفحة كاملة دون هوامش جانبية كبيرة
  const width = useLandscape ? 1123 : 794;
  const wrapper = document.createElement("div");
  wrapper.dir = "rtl";
  Object.assign(wrapper.style, {
    position: "fixed", top: "0", right: "-99999px", width: width + "px",
    background: "#ffffff", padding: "24px", zIndex: "-1",
  });
  document.body.appendChild(wrapper);

  wrapper.appendChild(buildBrandHeader(org));
  if (title) wrapper.appendChild(buildTitle(title, subtitle));
  // لافتة المسودة تم إزالتها بناءً على طلب المستخدم

  const clone = node.cloneNode(true);
  clone.style.width = "100%";
  // استبعاد صفوف المستثناة من صرف هذا الشهر (data-include="false") عند الطباعة
  if (filterInclude) {
    clone.querySelectorAll('tr[data-include="false"]').forEach((el) => el.remove());
  }
  // تصفية الصفوف حسب طريقة الصرف (مدد / كاش) لتوليد كشف مستقل لكل قناة
  if (filterMethod) {
    clone.querySelectorAll("tbody tr").forEach((el) => {
      if ((el.getAttribute("data-method") || "") !== filterMethod) el.remove();
    });
  }
  // إخفاء الأعمدة الفارغة (لا توجد قيمة لأي موظف) لتنظيم الكشف المطبوع
  const conditionalCols = ["housing","transport","bonus","overtime","absDays","absHours","ded","loan"];
  const tbodyRows = Array.from(clone.querySelectorAll("tbody tr"));
  const keepCols = new Set();
  conditionalCols.forEach((col) => {
    const has = tbodyRows.some((tr) => {
      const cell = tr.querySelector(`td[data-pcol="${col}"]`);
      if (!cell) return false;
      const inp = cell.querySelector("input");
      const val = inp ? inp.value : cell.textContent;
      const n = parseFloat(String(val).replace(/[^\d.-]/g, "")) || 0;
      return n > 0;
    });
    if (has) keepCols.add(col);
  });
  conditionalCols.forEach((col) => {
    if (keepCols.has(col)) return;
    clone.querySelectorAll(`[data-pcol="${col}"]`).forEach((el) => el.remove());
  });
  // أعمدة زر التضمين وطرق الصرف والحالة لا تظهر في المطبوع
  clone.querySelectorAll('[data-pcol="include"],[data-pcol="method"],[data-pcol="status"]').forEach((el) => el.remove());
  // إلغاء الثبات (sticky) لمنع التواء الأعمدة في المطبوع
  clone.querySelectorAll('[class*="sticky"],.sticky').forEach((el) => { el.style.position = "static"; el.style.zIndex = "0"; });
  clone.querySelectorAll('[class*="overflow-auto"],[class*="overflow-x-auto"]').forEach((el) => {
    el.style.overflow = "visible";
    el.style.maxWidth = "none";
  });
  // تأكيد أن كل الجداول تملأ عرض الصفحة المطبوعة بالكامل
  clone.querySelectorAll("table").forEach((el) => { el.style.width = "100%"; el.style.minWidth = "100%"; });
  wrapper.appendChild(clone);

  try {
    const blob = await elementToPdfBlob(wrapper, { stamp: !!stamp, landscape: useLandscape });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    wrapper.remove();
  }
}