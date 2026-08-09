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

// يحوّل عنصر DOM إلى Blob PDF (A4، عربي RTL عبر html2canvas)
export async function elementToPdfBlob(node) {
  await waitForImages(node);
  const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const img = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210, pageH = 297;
  const imgH = (canvas.height * pageW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
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