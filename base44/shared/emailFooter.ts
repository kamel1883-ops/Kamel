// توقيع بريدي موحّد يُلحق بنهاية كل رسالة تُرسلها منصة جدارة.
// صيغة HTML احترافية (مطابقة لهوية جدارة: كحلي + ذهبي) + نسخة نصية احتياطية.

const LOGO_URL = "https://media.base44.com/images/public/6a74edc8f347046365c2e1a4/376a4adfa_generated_image.png";
const SITE_URL = "https://jadara-hr.com";
const EMAIL_ADDR = "info@jadara-hr.com";
const LINKEDIN_URL = "https://www.linkedin.com/company/جدارة-لإدارة-الموارد-البشرية";
const X_URL = "https://x.com/jadarahr";

// التذييل بصيغة HTML (يُستخدم مع بارامتر html في SendEmail)
export const EMAIL_FOOTER_HTML = `
<div dir="rtl" style="margin-top:24px;font-family:'IBM Plex Sans Arabic','Tajawal',Arial,sans-serif;max-width:560px;border:1.5px solid #C5A059;border-radius:10px;overflow:hidden;background:#ffffff">
  <table role="presentation" dir="rtl" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse">
    <tr>
      <!-- شعار جدارة (يمين) -->
      <td style="width:120px;vertical-align:middle;text-align:center;padding:18px 16px;border-left:1.5px solid #C5A059;background:#1a1333">
        <img src="${LOGO_URL}" alt="جدارة" width="64" height="64" style="display:block;margin:0 auto;border-radius:12px" />
        <div style="margin-top:8px;color:#d4af37;font-weight:700;font-size:13px">جدارة</div>
      </td>
      <!-- معلومات التواصل (يسار) -->
      <td style="vertical-align:middle;padding:16px 18px;text-align:right">
        <div style="font-weight:700;font-size:15px;color:#1A2332;margin-bottom:2px">الإدارة العامة</div>
        <div style="font-weight:700;font-size:14px;color:#C5A059;margin-bottom:10px">جدارة لإدارة الموارد البشرية</div>
        <div style="font-size:12.5px;color:#475569;margin-bottom:5px">
          <span style="color:#C5A059">&#127760;</span>
          الموقع الإلكتروني:
          <a href="${SITE_URL}" style="color:#1A2332;text-decoration:none">jadara-hr.com</a>
        </div>
        <div style="font-size:12.5px;color:#475569;margin-bottom:12px">
          <span style="color:#C5A059">&#9993;</span>
          البريد الإلكتروني:
          <a href="mailto:${EMAIL_ADDR}" style="color:#1A2332;text-decoration:none">info@jadara-hr.com</a>
        </div>
        <div style="border-top:1px dashed #d4d4d4;padding-top:10px">
          <a href="${LINKEDIN_URL}" style="display:inline-block;background:#2873AE;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;padding:5px 12px;border-radius:5px;margin-left:6px">LinkedIn</a>
          <a href="${X_URL}" style="display:inline-block;background:#14171A;color:#ffffff;text-decoration:none;font-size:11px;font-weight:600;padding:5px 12px;border-radius:5px">منصة X</a>
        </div>
      </td>
    </tr>
  </table>
</div>`;

// نسخة نصية احتياطية (تُستخدم مع بارامتر text في SendEmail)
export const EMAIL_FOOTER =
  "\n\n— الإدارة العامة — جدارة لإدارة الموارد البشرية —\n" +
  "الموقع الإلكتروني: https://jadara-hr.com\n" +
  "البريد الإلكتروني: info@jadara-hr.com\n" +
  "منصة X: https://x.com/jadarahr\n" +
  "لينكدإن: https://www.linkedin.com/company/جدارة-لإدارة-الموارد-البشرية\n";

// مُغلِّف موحّد: يأخذ نص الرسالة العادي ويُخرج {html, text} جاهزين لـ SendEmail.
// يضع التذييل الموحّد في النسختين.
export function wrapEmailContent(plainBody: string): { html: string; text: string } {
  const safeBody = String(plainBody || "");
  // تحويل الأسطر الجديدة إلى فقرات HTML للعرض
  const htmlBody = safeBody
    .split("\n")
    .map((line) => line.trim() ? `<div style="line-height:1.8;color:#1A2332">${line.replace(/</g, "<")}</div>` : "<div>&nbsp;</div>")
    .join("");
  return {
    html: `<div dir="rtl" style="font-family:'IBM Plex Sans Arabic','Tajawal',Arial,sans-serif;font-size:14px">${htmlBody}${EMAIL_FOOTER_HTML}</div>`,
    text: safeBody + EMAIL_FOOTER,
  };
}