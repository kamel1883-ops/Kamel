import React from "react";
import LegalPage from "@/components/legal/LegalPage";
import { useI18n } from "@/lib/i18n";

export default function RefundPolicy() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const ar = {
    title: "شروط وسياسة الاسترداد",
    updated: "2026",
    intro: "تُطبَّق هذه الشروط على اشتراكات منصة «جدارة» لإدارة الموارد البشرية، وهي صياغة تفصيلية لما نصّت عليه المادة (5) «فترة التجربة والاسترداد» والمادة (6) «التجديد السنوي وإلغاء الاشتراك» من عقد الاشتراك السنوي المبرم بين الطرفين، وتُعدّ جزءاً مكمّلاً له.",
    sections: [
      { title: "مدة الاسترداد — شهر من تاريخ التفعيل", body: "يحق للعميل (الطرف الثاني) استخدام النظام لمدة شهر (30 يوماً) من تاريخ تفعيل الاشتراك. فإن لم يناسبه النظام خلال هذه المدة، جاز له المطالبة برد الرسوم المدفوعة وفق أحكام هذه السياسة." },
      { title: "انقضاء مدة الاسترداد", body: "بمضي شهر التجربة (30 يوماً) من تاريخ التفعيل يُصبح الاشتراك السنوي سارياً ونافذاً وفعّالاً، ولا يحق للعميل بعدها المطالبة بالاسترداد كلياً أو جزئياً، ويُلزم بالخضوع وتقديم الإمتثال لجميع الجهات النظامية المختصة." },
      { title: "آلية تقديم طلب الاسترداد", items: [
        "يُرسل الطلب كتابياً عبر البريد الإلكتروني الرسمي: info@jadara-hr.com خلال مدة الشهر.",
        "يُذكر في الطلب: اسم المنشأة، الرقم الوطني الموحّد، رقم العقد، وتاريخ التفعيل، وسبب عدم مناسبة النظام.",
        "يُعتد بتاريخ وصول الطلب إلى بريد الدعم لا بتاريخ إعداده.",
      ] },
      { title: "مدة معالجة الاسترداد ووسيلة الرد", body: "تُراجع «جدارة» الطلب وتُصدر قرارها خلال مدة لا تتجاوز عشرة (10) أيام عمل من تاريخ استلامه. وتُردّ المبالغ المستحقة بتحويل بنكي إلى نفس الحساب الذي تم السداد منه، خلال مدة لا تتجاوز أربعة عشر (14) يوم عمل من إقرار الاسترداد." },
      { title: "المبالغ غير القابلة للاسترداد", body: "لا تشمل مبالغ الاسترداد ما يلي:", items: [
        "رسوم نقل بيانات المنشأة داخل النظام إذا تولّاها الطرف الأول وفق المادة (4) من العقد، كونها خدمة نُفّذت فعلاً.",
        "رسوم أي طلبات أو تكاملات إضافية خارج المميزات المعتمدة وفق المادة (10) من العقد، والمتفق عليها باتفاق خطي مستقل.",
        "أي رسوم بنكية أو رسوم تحويل تخصمها الجهات البنكية.",
      ] },
      { title: "حالات لا يُستحق فيها الاسترداد", items: [
        "ورود الطلب بعد انقضاء الشهر من تاريخ التفعيل.",
        "الاحتجاج بنقص ميزة أو وظيفة لم تُذكر صراحةً في ملحق العقد، وذلك لإقرار العميل في المادة (9) باطلاعه الكامل على مميزات المنصة وقبولها كما هي وقت التعاقد.",
        "إيقاف الاشتراك بسبب تجاوز عدد الموظفين نطاق الباقة وعدم سداد فرق الترقية وفق المادة (7).",
        "إخلال العميل بالتزاماته التعاقدية أو استخدامه النظام على وجه مخالف للأنظمة." ,
      ] },
      { title: "إلغاء الاشتراك وعدم التجديد", body: "يتجدد العقد سنوياً بنفس الشروط. ولإلغاء الاشتراك على العميل إشعار «جدارة» كتابياً قبل انتهاء العقد بستين (60) يوماً على الأقل، وإلا تجدد تلقائياً لنفس المدة وبنفس الشروط. ولا يُعدّ إشعار الإلغاء مطالبةً بالاسترداد، ويستمر العميل في الاستفادة من الخدمة حتى نهاية المدة المدفوعة." },
      { title: "التجديد السنوي", body: "رسوم التجديد السنوي تُحتسب وفق القيمة المعتمدة وقت التجديد كما في المادة (2) من العقد، ولا تخضع رسوم التجديد لمدة استرداد جديدة لكون الخدمة قائمة ومُستخدمة أصلاً." },
      { title: "أثر الاسترداد على البيانات", body: "عند إقرار الاسترداد يتوقّف الاشتراك ويُعطّل الوصول للمنصة. ويحق للعميل طلب تصدير بيانات منشأته قبل التعطيل، وتُحذف البيانات نهائياً خلال ثلاثين (30) يوماً من تاريخ الطلب وفقاً لسياسة الخصوصية." },
      { title: "حل النزاعات", body: "أي نزاع ينشأ حول تفسير أو تطبيق هذه السياسة وتعذّر حله ودياً يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية وفقاً للأنظمة المعمول بها، تطبيقاً لمادة حل النزاعات في العقد." },
    ],
  };

  const en = {
    title: "Refund Terms & Policy",
    updated: "2026",
    intro: "These terms apply to Jadara HR platform subscriptions and are a detailed statement of Article (5) “Trial Period & Refund” and Article (6) “Annual Renewal & Cancellation” of the annual subscription agreement, forming an integral part of it.",
    sections: [
      { title: "Refund window — one month from activation", body: "The client (Second Party) may use the system for one month (30 days) from the subscription activation date. If the system does not suit them within that period, they may request a refund of the fees paid under this policy." },
      { title: "Expiry of the refund window", body: "After the one-month (30-day) trial from activation, the annual subscription becomes fully valid and effective, and no full or partial refund may be claimed thereafter; the client remains bound to comply with all competent regulatory authorities." },
      { title: "How to submit a refund request", items: [
        "Send a written request to the official email info@jadara-hr.com within the one-month window.",
        "Include: company name, national unified number, contract number, activation date, and the reason the system is unsuitable.",
        "The date the request reaches the support email governs, not the date it was drafted.",
      ] },
      { title: "Processing time and refund method", body: "Jadara reviews the request and issues its decision within no more than ten (10) business days of receipt. Approved amounts are refunded by bank transfer to the same account used for payment within no more than fourteen (14) business days of approval." },
      { title: "Non-refundable amounts", body: "Refunds do not cover the following:", items: [
        "Data migration fees where performed by the First Party under Article (4) of the agreement, as a service already delivered.",
        "Fees for additional requests or integrations outside the approved features under Article (10), agreed in a separate written agreement.",
        "Any bank or transfer charges deducted by banking institutions.",
      ] },
      { title: "Cases where no refund is due", items: [
        "Requests received after the one-month window from activation.",
        "Claims of a missing feature not expressly listed in an annex, given the client's acknowledgment in Article (9) of having fully reviewed and accepted the platform as-is at contracting.",
        "Suspension due to exceeding the package headcount without paying the upgrade difference under Article (7).",
        "Client breach of contractual obligations or unlawful use of the system.",
      ] },
      { title: "Cancellation and non-renewal", body: "The agreement renews annually on the same terms. To cancel, the client must notify Jadara in writing at least sixty (60) days before expiry; otherwise it renews automatically for the same term and terms. A cancellation notice is not a refund claim, and the client continues to use the service until the end of the paid term." },
      { title: "Annual renewal", body: "Renewal fees are calculated at the value approved at renewal time per Article (2) of the agreement, and renewal fees are not subject to a new refund window since the service is already live and in use." },
      { title: "Effect of a refund on data", body: "Upon refund approval the subscription stops and platform access is disabled. The client may request an export of its data before disabling; data is permanently deleted within thirty (30) days of the request per the Privacy Policy." },
      { title: "Dispute resolution", body: "Any dispute over the interpretation or application of this policy that cannot be settled amicably is referred to the competent authorities in the Kingdom of Saudi Arabia under applicable regulations, per the agreement's dispute-resolution article." },
    ],
  };

  const c = isAr ? ar : en;
  return <LegalPage isAr={isAr} title={c.title} updated={c.updated} intro={c.intro} sections={c.sections} />;
}