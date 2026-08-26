import React from "react";
import LegalPage from "@/components/legal/LegalPage";
import { useI18n } from "@/lib/i18n";

export default function Privacy() {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const ar = {
    title: "سياسة الخصوصية",
    updated: "2026",
    intro: "تلتزم منصة «جدارة» لإدارة الموارد البشرية بحماية خصوصية بيانات منشآت عملائها وموظفيهم، وتُطبّق هذه السياسة على كل استخدام للمنصة وبواباتها (بوابة الشركات، بوابة الموظف الذاتية، بوابة المعتمدين، بوابة المالك)، وتُعدّ مكمّلة لأحكام عقد الاشتراك السنوي المبرم بين الطرفين.",
    sections: [
      { title: "البيانات التي نجمعها", body: "نجمع البيانات اللازمة لتشغيل الخدمة فقط:", items: [
        "بيانات المنشأة: الاسم، الرقم الوطني الموحّد، السجل التجاري، الرقم الضريبي، جهة الاتصال، الشعار.",
        "بيانات الموظفين التي تُدخلها المنشأة: الاسم، الهوية/الإقامة، الجنسية، بيانات الاتصال، المسمى والإدارة، الرواتب والبدلات، الوثائق وتواريخ انتهائها، الحساب البنكي لأغراض صرف الرواتب.",
        "بيانات التشغيل: سجلات الحضور والانصراف وموقع البصمة (نطاق 50 متراً من مقر العمل)، الطلبات والاعتمادات، الإشعارات، وسجلات الدخول التقنية.",
      ] },
      { title: "أساس المعالجة والغرض منها", body: "تُعالَج البيانات لتنفيذ عقد الاشتراك وتقديم خدمات الموارد البشرية: إدارة الموظفين، الحضور، الإجازات والسلف، الرواتب وحماية الأجور، التأمينات الاجتماعية، نهاية الخدمة، التراخيص، والتقارير والتحليلات. ولا تُستخدم البيانات لأي غرض آخر دون موافقة المنشأة." },
      { title: "ملكية البيانات", body: "تبقى جميع بيانات المنشأة وموظفيها ملكاً خالصاً للمنشأة (الطرف الثاني)، وتعمل «جدارة» عليها بوصفها مشغّلاً للخدمة فقط. ولا نبيع بياناتك ولا نؤجّرها ولا نشاركها مع أي طرف ثالث لأغراض تسويقية." },
      { title: "الإفصاح للغير", body: "لا يُفصح عن البيانات إلا في الحالات التالية: بتوجيه من المنشأة نفسها، أو لمزوّدي الاستضافة والبنية التحتية بالقدر اللازم لتشغيل الخدمة وبالتزام سرّية، أو استجابةً لطلب نظامي صادر من جهة مختصة في المملكة العربية السعودية." },
      { title: "أمن المعلومات والاستضافة", body: "تعمل المنصة على خوادم VPS خاصة غير مشتركة، بتقنيات العزل والتشفير وضبط صلاحيات الوصول، مع نسخ احتياطية دورية. وتُقيَّد صلاحيات الاطلاع داخل المنصة بحسب الدور (إدارة، موارد بشرية، مالية، مدير مباشر، موظف)." },
      { title: "خصوصية بوابة الموظف", body: "لا يرى الموظف داخل بوابته إلا بياناته الخاصة وطلباته ومستنداته. ولا تُستخدم بيانات موقع البصمة إلا للتحقق من تواجد الموظف في نطاق مقر العمل لحظة تسجيل الحضور أو الانصراف، ولا تُستخدم للتتبّع خارج ذلك." },
      { title: "مدة الاحتفاظ بالبيانات", body: "نحتفظ بالبيانات مدة سريان الاشتراك وللمدة النظامية اللاحقة اللازمة للإمتثال. وعند انتهاء التعاقد أو إلغائه، يحق للمنشأة طلب تصدير بياناتها أو حذفها نهائياً خلال ثلاثين (30) يوماً من تاريخ الطلب." },
      { title: "حقوق المنشأة والموظف", items: [
        "الاطلاع على البيانات وتصحيح غير الصحيح منها.",
        "طلب تصدير البيانات بصيغة قابلة للقراءة.",
        "طلب حذف البيانات بعد انتهاء العلاقة التعاقدية وفق الأنظمة.",
        "تُوجَّه كافة الطلبات عبر البريد الإلكتروني الرسمي للدعم.",
      ] },
      { title: "استخدام اسم المنشأة وشعارها", body: "وفقاً لما نصّت عليه المادة (11) من عقد الاشتراك، يحق لـ«جدارة» إدراج اسم المنشأة وشعارها ضمن قائمة عملائها وملفها التعريفي لأغراض التعريف فقط، ولا يُنشئ ذلك أي التزام أو شراكة قانونية، ويجوز للمنشأة طلب إزالته كتابياً." },
      { title: "الدعم والتواصل", body: "تُوجَّه كافة الاستفسارات والطلبات المتعلقة بالخصوصية إلى البريد الإلكتروني: info@jadara-hr.com. وأي نزاع ينشأ حول تطبيق هذه السياسة يُحال إلى الجهات النظامية المختصة في المملكة العربية السعودية." },
    ],
  };

  const en = {
    title: "Privacy Policy",
    updated: "2026",
    intro: "Jadara HR is committed to protecting the privacy of client organizations and their employees. This policy applies to all use of the platform and its portals (company portal, employee self-service portal, approvers portal, owner portal) and complements the annual subscription agreement between the parties.",
    sections: [
      { title: "Data we collect", body: "We collect only the data required to operate the service:", items: [
        "Company data: name, national unified number, commercial register, VAT number, contact person, logo.",
        "Employee data entered by the company: name, ID/Iqama, nationality, contact details, position and department, salary and allowances, documents and expiry dates, bank account for payroll.",
        "Operational data: attendance records and check-in location (within 50 meters of the workplace), requests and approvals, notifications, and technical sign-in logs.",
      ] },
      { title: "Basis and purpose of processing", body: "Data is processed to perform the subscription agreement and deliver HR services: employee management, attendance, leaves and loans, payroll and wage protection, GOSI, end of service, licenses, reports and analytics. It is not used for any other purpose without the company's consent." },
      { title: "Data ownership", body: "All company and employee data remains the exclusive property of the company (Second Party); Jadara acts solely as a service operator. We never sell, rent, or share your data with third parties for marketing purposes." },
      { title: "Disclosure to third parties", body: "Data is disclosed only: at the company's instruction; to hosting and infrastructure providers to the extent necessary to run the service under confidentiality obligations; or in response to a lawful request from a competent authority in the Kingdom of Saudi Arabia." },
      { title: "Security and hosting", body: "The platform runs on dedicated (non-shared) VPS servers with isolation, encryption, and access controls, plus periodic backups. In-platform visibility is restricted by role (management, HR, finance, direct manager, employee)." },
      { title: "Employee portal privacy", body: "Inside the portal an employee sees only their own data, requests, and documents. Check-in location data is used solely to verify the employee's presence within the workplace radius at the moment of clock-in/out and never for tracking beyond that." },
      { title: "Data retention", body: "Data is retained for the subscription term and any subsequent statutory period required for compliance. Upon expiry or cancellation, the company may request export or permanent deletion of its data within thirty (30) days of the request." },
      { title: "Company and employee rights", items: [
        "Access data and correct inaccurate information.",
        "Request an export of data in a readable format.",
        "Request deletion of data after the contractual relationship ends, per applicable regulations.",
        "All requests are submitted via the official support email.",
      ] },
      { title: "Use of company name and logo", body: "Per Article (11) of the subscription agreement, Jadara may list the company's name and logo among its clients and in its company profile for identification purposes only. This creates no obligation or legal partnership, and the company may request removal in writing." },
      { title: "Support and contact", body: "All privacy inquiries and requests should be sent to info@jadara-hr.com. Any dispute regarding this policy is referred to the competent authorities in the Kingdom of Saudi Arabia." },
    ],
  };

  const c = isAr ? ar : en;
  return <LegalPage isAr={isAr} title={c.title} updated={c.updated} intro={c.intro} sections={c.sections} />;
}