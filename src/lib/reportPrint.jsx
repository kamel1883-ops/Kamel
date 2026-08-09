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
  if (org?.commercial_register) {
    const c = document.createElement("div");
    c.textContent = "س.ت: " + org.commercial_register;
    Object.assign(c.style, { fontSize: "10px", color: "#666" });
    right.appendChild(c);
  }

  const left = document.createElement("div");
  Object.assign(left.style, { display: "flex", flexDirection: "column", alignItems: "flex-start" });
  const badge = document.createElement("div");
  badge.textContent = "ج";
  Object.assign(badge.style, {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "linear-gradient(135deg,#0b0f19,#2e2448)", color: "#f5d77a", fontWeight: "800",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
  });
  left.appendChild(badge);
  const jt = document.createElement("div"); jt.textContent = "جدارة";
  Object.assign(jt.style, { fontWeight: "800", fontSize: "13px", marginTop: "6px", color: "#0b1120" });
  left.appendChild(jt);
  const js = document.createElement("div"); js.textContent = "لإدارة الموارد البشرية";
  Object.assign(js.style, { fontSize: "9px", color: "#666" });
  left.appendChild(js);

  wrap.appendChild(right);
  wrap.appendChild(left);
  return wrap;
}

function buildTitle(title, subtitle) {
  const c = document.createElement("div");
  Object.assign(c.style, { textAlign: "center", marginBottom: "18px" });
  const t = document.createElement("div"); t.textContent = title;
  Object.assign(t.style, { fontWeight: "800", fontSize: "18px", color: "#0b1120" });
  const s = document.createElement("div"); s.textContent = subtitle;
  Object.assign(s.style, { fontSize: "11px", color: "#666", marginTop: "4px" });
  const d = document.createElement("div");
  d.textContent = new Date().toLocaleDateString("ar-SA");
  Object.assign(d.style, { fontSize: "10px", color: "#999", marginTop: "4px" });
  c.appendChild(t); c.appendChild(s); c.appendChild(d);
  return c;
}

export async function printReport(node, { org, title, subtitle }) {
  if (!node) return;
  const width = Math.min(900, node.offsetWidth || 900);
  const wrapper = document.createElement("div");
  wrapper.dir = "rtl";
  Object.assign(wrapper.style, {
    position: "fixed", top: "0", right: "-99999px", width: width + "px",
    background: "#ffffff", padding: "24px", zIndex: "-1",
  });
  document.body.appendChild(wrapper);

  wrapper.appendChild(buildBrandHeader(org));
  if (title) wrapper.appendChild(buildTitle(title, subtitle));

  const clone = node.cloneNode(true);
  clone.style.width = "100%";
  clone.querySelectorAll('[class*="overflow-auto"],[class*="overflow-x-auto"]').forEach((el) => {
    el.style.overflow = "visible";
    el.style.maxWidth = "none";
  });
  wrapper.appendChild(clone);

  try {
    const blob = await elementToPdfBlob(wrapper);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    wrapper.remove();
  }
}