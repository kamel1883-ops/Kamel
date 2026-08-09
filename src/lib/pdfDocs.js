import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { base44 } from "@/api/base44Client";

function waitForImages(node) {
  const imgs = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
            setTimeout(res, 2000);
          })
    )
  );
}

// يرسم ختم "PAID" كبير شبه شفاف ومائل في منتصف الصفحة الحالية
function drawPaidStamp(pdf, pageW, pageH) {
  try { pdf.setGState(new pdf.GState({ opacity: 0.14 })); } catch (e) {}
  pdf.setTextColor(5, 150, 105);
  try { pdf.setFont("helvetica", "bold"); pdf.setFontSize(96); } catch (e) {}
  try { pdf.text("PAID", pageW / 2, pageH / 2 + 22, { align: "center", angle: 32 }); } catch (e) {}
  try {
    pdf.setDrawColor(5, 150, 105);
    pdf.setLineWidth(1.2);
    pdf.ellipse(pageW / 2, pageH / 2 - 2, 52, 26, "S");
  } catch (e) {}
  try { pdf.setGState(new pdf.GState({ opacity: 1 })); } catch (e) {}
}

// يحوّل عنصر DOM إلى Blob PDF (A4، عربي RTL عبر html2canvas)
// options.stamp = true يضع ختم "تم الدفع / PAID" كبير على كل صفحة
export async function elementToPdfBlob(node, options = {}) {
  await waitForImages(node);
  // html2canvas يفكّك أحرف العربية (أشكال معزولة) عند أي letter-spacing غير صفري،
  // لذا نصفّر المسافة لكل العناصر داخل العنصر المُلتقط (يُصلح عناوين <h3> ... إلخ)
  // كما نضمن خطاً عربياً مدعوماً ليُطبَّق التشكيل/الوصل بصورة صحيحة.
  try {
    node.querySelectorAll("*").forEach((el) => {
      if (!el.style) return;
      if (el.style.letterSpacing !== "normal") el.style.letterSpacing = "normal";
      if (el.tagName === "TEXT" || el.tagName === "TSPAN") {
        el.setAttribute("letter-spacing", "normal");
      }
    });
  } catch (e) {}
  const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const img = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210, pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
  if (options.stamp) drawPaidStamp(pdf, pageW, pageH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
    if (options.stamp) drawPaidStamp(pdf, pageW, pageH);
    heightLeft -= pageH;
  }
  return pdf.output("blob");
}

export async function uploadPdfBlob(blob, filename) {
  const file = new File([blob], filename, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

// يعرض مكوّن React خارج الشاشة، يلتقطه PDF، ثم ينظّف
export async function renderToPdfBlob(component) {
  const host = document.createElement("div");
  host.dir = "rtl";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.right = "-99999px";
  host.style.width = "794px";
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";
  document.body.appendChild(host);
  const root = createRoot(host);
  await new Promise((resolve) => {
    root.render(component);
    setTimeout(resolve, 350);
  });
  let blob;
  try {
    blob = await elementToPdfBlob(host);
  } finally {
    setTimeout(() => {
      try { root.unmount(); } catch (e) {}
      host.remove();
    }, 200);
  }
  return blob;
}