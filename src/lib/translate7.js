import { base44 } from "@/api/base44Client";

const LANGS = ["ar", "en", "hi", "ne", "bn", "fil", "ur"];

// يُترجم عنواناً ونصاً بالعربية إلى 7 لغات عبر InvokeLLM، ويُعيد:
// { title: {ar,en,hi,ne,bn,fil,ur}, body: {ar,en,hi,ne,bn,fil,ur} }
// مع ضمان وجود كل اللغات (تتراجع للعربية عند الفقد).
export async function translateTo7(arTitle, arBody) {
  const titleSafe = (arTitle || "").toString().trim() || "—";
  const bodySafe = (arBody || "").toString().trim() || "—";
  const prompt =
    "You are a professional HR/legal translator. Translate the following Arabic administrative document TITLE and BODY into English, Hindi, Nepali, Bengali, Filipino (Tagalog), and Urdu. Use an official, clear HR tone. Preserve all numbers, dates, amounts, currency, and names exactly. Return ONLY a JSON object. " +
    "Arabic TITLE: " + titleSafe + "\n" +
    "Arabic BODY: " + bodySafe;
  let res;
  try {
    res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_hi: { type: "string" },
          title_ne: { type: "string" },
          title_bn: { type: "string" },
          title_fil: { type: "string" },
          title_ur: { type: "string" },
          body_en: { type: "string" },
          body_hi: { type: "string" },
          body_ne: { type: "string" },
          body_bn: { type: "string" },
          body_fil: { type: "string" },
          body_ur: { type: "string" },
        },
      },
    });
  } catch (e) {
    return fallback(titleSafe, bodySafe);
  }
  const d = res && res.data ? res.data : res || {};
  const title = { ar: titleSafe };
  const body = { ar: bodySafe };
  for (const l of LANGS) {
    if (l === "ar") continue;
    title[l] = (d["title_" + l] || titleSafe);
    body[l] = (d["body_" + l] || bodySafe);
  }
  return { title, body };
}

function fallback(title, body) {
  const t = { ar: title }, b = { ar: body };
  for (const l of LANGS) if (l !== "ar") { t[l] = title; b[l] = body; }
  return { title: t, body: b };
}