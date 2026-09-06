// طباعة قائمة الموظفين (النشطين أو غير النشطين) كمستند PDF عبر طباعة المتصفح — تعتمد على كلاس print-report المُعرّف في index.css.
import { formatCurrency, statusEmployeeLabel } from "@/lib/hr";
import { roleLabel } from "@/lib/orgTree";
import { reasonMeta } from "@/lib/eos";

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

function fmtMoney(n) {
  try { return formatCurrency(n || 0); } catch { return String(n == null ? "" : n); }
}

function cell(cls, html) { return "<td class=\"" + cls + "\">" + html + "</td>"; }

export function printEmployeeList({ list, title, subtitle, isAr, org, kind }) {
  const dir = isAr ? "rtl" : "ltr";
  const lang = isAr ? "ar" : "en";
  const now = new Date();
  const dateStr = isAr
    ? now.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" })
    : now.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const orgName = org && org.name ? org.name : (isAr ? "جدارة — الموارد البشرية" : "Jadara HR");
  const NA = "—";

  const L = isAr ? {
    no: "الرقم", name: "الاسم", nat: "الهوية/الإقامة", pos: "المسمى", dept: "الإدارة",
    branch: "الفرع", role: "المستوى", status: "الحالة", salary: "الراتب",
    termReason: "سبب الإنهاء", termDate: "تاريخ الإنهاء",
    generated: "تاريخ التوليد", count: "عدد السجلات",
  } : {
    no: "No.", name: "Name", nat: "National ID", pos: "Title", dept: "Department",
    branch: "Branch", role: "Level", status: "Status", salary: "Salary",
    termReason: "Termination reason", termDate: "Termination date",
    generated: "Generated", count: "Records",
  };

  let head = "";
  let body = "";
  if (kind === "active") {
    head = [L.no, L.name, L.nat, L.pos, L.dept, L.branch, L.role, L.status, L.salary]
      .map((h) => "<th>" + esc(h) + "</th>").join("");
    body = list.map((emp, i) => {
      const total = (emp.base_salary || 0) + (emp.housing_allowance || 0) + (emp.transport_allowance || 0) + (emp.other_allowances || 0);
      const status = statusEmployeeLabel(emp.status);
      const role = emp.role_level ? roleLabel(emp.role_level, lang) : NA;
      return "<tr>" + [
        cell("num", i + 1),
        cell("name", esc(emp.full_name)),
        cell("num", esc(emp.national_id) || NA),
        cell("", esc(emp.position)),
        cell("muted", esc(emp.department)),
        cell("", emp.branch_name ? esc(emp.branch_name) : NA),
        cell("", esc(role)),
        cell("status", "<span class=\"badge " + esc(status.cls) + "\">" + esc(status.label) + "</span>"),
        cell("num", fmtMoney(total)),
      ].join("") + "</tr>";
    }).join("");
  } else {
    head = [L.no, L.name, L.nat, L.pos, L.dept, L.status, L.termReason, L.termDate]
      .map((h) => "<th>" + esc(h) + "</th>").join("");
    body = list.map((emp, i) => {
      const status = statusEmployeeLabel(emp.status);
      const meta = emp.termination_reason && emp.termination_reason !== "none" ? reasonMeta(emp.termination_reason) : null;
      return "<tr>" + [
        cell("num", i + 1),
        cell("name", esc(emp.full_name)),
        cell("num", esc(emp.national_id) || NA),
        cell("", esc(emp.position)),
        cell("muted", esc(emp.department)),
        cell("status", "<span class=\"badge " + esc(status.cls) + "\">" + esc(status.label) + "</span>"),
        cell("", meta ? esc(meta.label) : NA),
        cell("num", esc(emp.termination_date) || NA),
      ].join("") + "</tr>";
    }).join("");
  }

  const styleBlock = [
    ".print-report{font-family:'IBM Plex Sans Arabic','Tajawal',ui-sans-serif,system-ui,sans-serif;padding:24px;color:#0f172a;}",
    ".print-report .report-head{text-align:" + (isAr ? "right" : "left") + ";margin-bottom:14px;border-bottom:2px solid #0B2545;padding-bottom:10px;}",
    ".print-report .org{font-size:12pt;font-weight:700;color:#0B2545;}",
    ".print-report .report-title{font-size:16pt;font-weight:800;margin-top:4px;}",
    ".print-report .report-sub{font-size:11pt;color:#475569;margin-top:2px;}",
    ".print-report .report-meta{font-size:9pt;color:#64748b;margin-top:6px;}",
    ".print-report table{width:100%;border-collapse:collapse;margin-top:10px;font-size:9pt;table-layout:fixed;}",
    ".print-report th{background:#0B2545;color:#fff;padding:6px 8px;text-align:" + (isAr ? "right" : "left") + ";font-weight:600;font-size:8.5pt;}",
    ".print-report td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:break-word;}",
    ".print-report td.num,.print-report th{white-space:nowrap;}",
    ".print-report td.muted{color:#64748b;}",
    ".print-report tr:nth-child(even) td{background:#f8fafc;}",
    ".print-report .badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:8pt;font-weight:600;}",
    "@media print{@page{size:A4;margin:12mm;}}",
  ].join("");

  const html = "<div class=\"print-report\" dir=\"" + dir + "\">"
    + "<div class=\"report-head\">"
    + "<div class=\"org\">" + esc(orgName) + "</div>"
    + "<div class=\"report-title\">" + esc(title) + "</div>"
    + (subtitle ? "<div class=\"report-sub\">" + esc(subtitle) + "</div>" : "")
    + "<div class=\"report-meta\">" + esc(L.generated) + ": " + esc(dateStr) + " · " + esc(L.count) + ": " + list.length + "</div>"
    + "</div>"
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