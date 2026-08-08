import { secrets } from "base44:runtime";

// سر مشترك للتحقق من أن استدعاء الدالة جاء من مجدول المنصة (scheduled workflow)
// وليس من طلب HTTP مجهول. تُخزَّن قيمته في إدارة أسرار البيئة (CRON_SECRET) ولا تُكتب في المصدر.
// يتم التحقق بمطابقة آمنة: يُشترط أن يكون السر مُعدّاً وغير فارغ، وأن يطابق ما يُمرّر تماماً.
export function verifyCronSecret(provided) {
  const secret = String(secrets.get("CRON_SECRET") || "");
  if (!secret || secret.length < 16) return false;
  const p = String(provided || "");
  if (!p || p.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ p.charCodeAt(i);
  return diff === 0;
}

export const RENEWAL_AMOUNT = 700;

const BANK = {
  beneficiary: "كامل الشيخ / KAMEL ELSHIKH",
  bank: "بنك إس تي سي (STC Bank)",
  iban: "SA75780000000001285607287",
  account: "1285607287",
};
const SIG = "المدير العام — كامل إسماعيل";
const WA = "+966 594700782";

function iso(d) { return new Date(d).toISOString().slice(0, 10); }
function addYears(d, y) { const r = new Date(d); r.setFullYear(r.getFullYear() + y); return r; }

export function emailBody(tenant, start, end, today, toOwner) {
  const head = toOwner
    ? "(نسخة المالك) — عرض تجديد سنوي تم توليده للعميل التالي:"
    : "السلام عليكم ورحمة الله وبركاته،";
  return [
    head, "",
    "السادة / " + tenant.name + "  المحترمون", "",
    "يسعدنا في منصة «جدارة لإدارة الموارد البشرية» أن نقدم لكم عرض تجديد الاشتراك السنوي:",
    "— نوع الاشتراك: سنوي",
    "— رسوم التجديد السنوي: " + RENEWAL_AMOUNT + " ريال سعودي",
    "— فترة التجديد: " + start + "  إلى  " + end,
    "— تاريخ إصدار العرض: " + today, "",
    "بيانات التحويل البنكي:",
    "المستفيد: " + BANK.beneficiary,
    "البنك: " + BANK.bank,
    "رقم الحساب: " + BANK.account,
    "رقم الآيبان (IBAN): " + BANK.iban, "",
    "ملاحظة مهمة: بعد إتمام تحويل رسوم التجديد، يرجى إرسال صورة من إيصال التحويل على واتساب: " + WA + " لتأكيد التجديد وتمديد اشتراككم السنوي.", "",
    "مع خالص التقدير،",
    SIG,
    "جدارة لإدارة الموارد البشرية",
    "التاريخ: " + today,
  ].join("\n");
}

export async function issueRenewalOffer(base44, tenant, opts = {}) {
  const today = new Date();
  const todayStr = iso(today);
  const cur = tenant.subscription_end ? new Date(tenant.subscription_end) : today;
  const periodStart = iso(cur);
  const periodEnd = iso(addYears(cur, 1));

  const pendings = await base44.asServiceRole.entities.Subscription.filter({ tenant_id: tenant.id, status: "pending" });
  const already = (pendings || []).find((s) => s.period_start === periodStart);
  if (already) {
    if (opts.resend) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: tenant.contact_email,
          subject: "عرض تجديد الاشتراك السنوي — منصة جدارة",
          body: emailBody(tenant, periodStart, periodEnd, todayStr, false),
        });
      } catch (_) {}
    }
    return { ok: true, already: true, subscription_id: already.id, period_end: periodEnd };
  }

  const sub = await base44.asServiceRole.entities.Subscription.create({
    tenant_id: tenant.id,
    tenant_name: tenant.name,
    plan: "annual",
    amount: RENEWAL_AMOUNT,
    period_start: periodStart,
    period_end: periodEnd,
    payment_method: "direct",
    status: "pending",
    notes: "عرض تجديد سنوي — " + todayStr,
  });

  let emailed = false;
  const to = String(tenant.contact_email || "").trim();
  if (to) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: "عرض تجديد الاشتراك السنوي — منصة جدارة",
        body: emailBody(tenant, periodStart, periodEnd, todayStr, false),
      });
      emailed = true;
    } catch (_) {}
  }
  const ownerEmail = secrets.get("OWNER_EMAIL");
  if (ownerEmail) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ownerEmail,
        subject: "توليد عرض تجديد سنوي — " + tenant.name,
        body: emailBody(tenant, periodStart, periodEnd, todayStr, true),
      });
    } catch (_) {}
  }
  return { ok: true, subscription_id: sub.id, emailed, period_end: periodEnd };
}