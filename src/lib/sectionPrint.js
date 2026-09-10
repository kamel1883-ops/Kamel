// طباعة عامة لجدول بيانات كمستند PDF عبر طباعة المتصفح — تستخدمها أقسام الأداء/التدريب/تخطيط القوى العاملة/التعاقب.
import { fetchOrg, brandHeaderHtml, brandHeaderCss } from "@/lib/printBrand";
import { genDateBoth } from "@/lib/printDate";
const AMP = String.fromCharCode(38);
const SEMI = String.fromCharCode(59);
const ENT = {
  38: AMP + "amp" + SEMI,
  60: AMP + "lt" + SEMI,
  62: AMP + "gt" + SEMI,
  34: AMP + "quot" + SEMI,
  39: AMP + "#39" + SEMI,
};
function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ENT[c.charCodeAt(0)]);
}

function fmtNum(n) {
  const x = Number(n) || 0;
  return x.toLocaleString("en-US");
}

export async function printSection({ title, subtitle, isAr, org, columns, rows, summary }) {
  const dir = isAr ? "rtl" : "ltr";
  const dateStr = genDateBoth(isAr);

  const orgData = org || (await fetchOrg());
  const orgName = orgData && orgData.name ? orgData.name : (isAr ? "جداره — الموارد البشرية" : "Jadara HR");
  const brandHtml = brandHeaderHtml(orgData, isAr);
  const L = isAr ? { generated: "تاريخ التوليد", count: "عدد السجلات" } : { generated: "Generated", count: "Records" };

  const head = columns.map((c) => "<th>" + esc(c.label) + "</th>").join("");
  const body = rows.map((r) => "<tr>" + r.map((cell, ci) => {
    const cls = columns[ci] && columns[ci].num ? "num" : (columns[ci] && columns[ci].muted ? "muted" : "");
    const val = typeof cell === "number" ? fmtNum(cell) : esc(cell);
    return "<td class=\"" + cls + "\">" + val + "</td>";
  }).join("") + "</tr>").join("");

  const summaryHtml = summary && summary.length
    ? "<div class=\"summary\">" + summary.map((s) => "<div class=\"chip\"><span class=\"k\">" + esc(s.label) + "</span><span class=\"v\">" + esc(s.value) + "</span></div>").join("") + "</div>"
    : "";

  const styleBlock = [
    ".print-report{font-family:'IBM Plex Sans Arabic','Tajawal',ui-sans-serif,system-ui,sans-serif;padding:24px;color:#0f172a;}",
    ".print-report .report-head{text-align:" + (isAr ? "right" : "left") + ";margin-bottom:14px;}",
    ".print-report .org{font-size:12pt;font-weight:700;color:#0B2545;}",
    ".print-report .report-title{font-size:16pt;font-weight:800;margin-top:4px;}",
    ".print-report .report-sub{font-size:11pt;color:#475569;margin-top:2px;}",
    ".print-report .report-meta{font-size:9pt;color:#64748b;margin-top:6px;}",
    ".print-report .summary{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;}",
    ".print-report .chip{display:inline-flex;gap:6px;align-items:center;background:#f5f3ff;border:1px solid #e9d8fd;border-radius:9999px;padding:4px 12px;font-size:9pt;}",
    ".print-report .chip .k{color:#6d28d9;font-weight:600;}",
    ".print-report .chip .v{font-weight:700;color:#0f172a;}",
    ".print-report table{width:100%;border-collapse:collapse;margin-top:10px;font-size:9pt;table-layout:fixed;}",
    ".print-report th{background:#0B2545;color:#fff;padding:6px 8px;text-align:" + (isAr ? "right" : "left") + ";font-weight:600;font-size:8.5pt;}",
    ".print-report td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:break-word;}",
    ".print-report td.num,.print-report th{white-space:nowrap;}",
    ".print-report td.muted{color:#64748b;}",
    ".print-report tr:nth-child(even) td{background:#f8fafc;}",
    "@media print{@page{size:A4; margin:12mm;}}",
  ].join("");

  const html = "<div class=\"print-report\" dir=\"" + dir + "\">"
    + "<div class=\"report-head\">"
    + brandHtml
    + "<div class=\"report-title\">" + esc(title) + "</div>"
    + (subtitle ? "<div class=\"report-sub\">" + esc(subtitle) + "</div>" : "")
    + "<div class=\"report-meta\">" + esc(L.generated) + ": " + esc(dateStr) + " · " + esc(L.count) + ": " + rows.length + "</div>"
    + "</div>"
    + "<style>" + brandHeaderCss + "</style>"
    + summaryHtml
    + "<table><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table>"
    + "<style>" + styleBlock + "</style>"
    + "</div>";

  const host = document.createElement("div");
  host.innerHTML = html;
  const node = host.firstElementChild;
  document.body.appendChild(node);
  const cleanup = () => { if (node.parentNode) node.parentNode.removeChild(node); };
  window.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(() => {
    window.print();
    setTimeout(cleanup, 1500);
  }, 60);
}