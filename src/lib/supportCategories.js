// تصنيفات الدعم الفني — مبنية على وحدات نظام جدارة HR.
// كل فئة: { key, ar, en, subs: [{ key, ar, en }] }
export const SUPPORT_CATEGORIES = [
  {
    key: "login_access", ar: "تسجيل الدخول والوصول", en: "Login & Access",
    subs: [
      { key: "forgot_password", ar: "نسيان كلمة المرور", en: "Forgot password" },
      { key: "no_otp", ar: "عدم استلام رمز التحقق", en: "Didn't receive OTP" },
      { key: "account_locked", ar: "حساب موقوف/مقفل", en: "Account locked" },
      { key: "wrong_permissions", ar: "صلاحيات غير صحيحة", en: "Wrong permissions" },
    ],
  },
  {
    key: "employees", ar: "الموظفين", en: "Employees",
    subs: [
      { key: "add_edit", ar: "إضافة/تعديل موظف", en: "Add/edit employee" },
      { key: "wrong_data", ar: "بيانات غير صحيحة", en: "Incorrect data" },
      { key: "tenant_link", ar: "ربط الموظف بالمنشأة", en: "Link to organization" },
      { key: "import_employees", ar: "استيراد الموظفين", en: "Import employees" },
    ],
  },
  {
    key: "attendance", ar: "الحضور والانصراف", en: "Attendance",
    subs: [
      { key: "check_in_issue", ar: "تسجيل الحضور/الانصراف", en: "Check-in/out issue" },
      { key: "work_hours", ar: "حساب ساعات العمل", en: "Work hours calculation" },
      { key: "leaves_tardiness", ar: "التأخير والغياب", en: "Tardiness & absence" },
      { key: "import_attendance", ar: "استيراد بيانات الحضور", en: "Import attendance" },
    ],
  },
  {
    key: "payroll", ar: "الرواتب", en: "Payroll",
    subs: [
      { key: "salary_calc", ar: "حساب الراتب", en: "Salary calculation" },
      { key: "deductions_allowances", ar: "الخصومات والبدلات", en: "Deductions & allowances" },
      { key: "payroll_sheet", ar: "كشف الرواتب", en: "Payroll sheet" },
      { key: "mudad_export", ar: "تصدير ملف مدد", en: "Mudad file export" },
    ],
  },
  {
    key: "gosi", ar: "التأمينات الاجتماعية (GOSI)", en: "GOSI",
    subs: [
      { key: "gosi_calc", ar: "حساب الاشتراكات", en: "Contributions calc" },
      { key: "saudi_non_saudi", ar: "سعودي/غير سعودي", en: "Saudi vs non-Saudi" },
      { key: "gosi_report", ar: "تقرير التأمينات", en: "GOSI report" },
    ],
  },
  {
    key: "leaves", ar: "الإجازات", en: "Leaves",
    subs: [
      { key: "leave_balance", ar: "رصيد الإجازات", en: "Leave balance" },
      { key: "leave_request", ar: "طلب إجازة", en: "Leave request" },
      { key: "leave_approval", ar: "موافقة الإجازة", en: "Leave approval" },
      { key: "leave_settlement", ar: "تصفية الإجازات", en: "Leave settlement" },
    ],
  },
  {
    key: "end_of_service", ar: "نهاية الخدمة", en: "End of Service",
    subs: [
      { key: "eos_calc", ar: "حساب المكافأة", en: "EOS calculation" },
      { key: "settlement", ar: "تصفية المستحقات", en: "Settlement" },
      { key: "eos_letter", ar: "مخالصة نهاية الخدمة", en: "EOS letter" },
    ],
  },
  {
    key: "business_trips", ar: "رحلات العمل", en: "Business Trips",
    subs: [
      { key: "trip_request", ar: "طلب رحلة عمل", en: "Trip request" },
      { key: "per_diem", ar: "بدل الانتداب", en: "Per diem" },
      { key: "trip_approval", ar: "موافقة الرحلة", en: "Trip approval" },
    ],
  },
  {
    key: "performance", ar: "الأداء والتقييم", en: "Performance",
    subs: [
      { key: "review", ar: "تقييم موظف", en: "Employee review" },
      { key: "goals_competencies", ar: "الأهداف والكفاءات", en: "Goals & competencies" },
      { key: "performance_report", ar: "تقرير الأداء", en: "Performance report" },
    ],
  },
  {
    key: "training", ar: "التدريب والتطوير", en: "Training",
    subs: [
      { key: "training_plan", ar: "خطة تدريب", en: "Training plan" },
      { key: "training_tracking", ar: "متابعة التدريب", en: "Training tracking" },
    ],
  },
  {
    key: "recruitment", ar: "التوظيف", en: "Recruitment",
    subs: [
      { key: "job_post", ar: "إعلان وظيفة", en: "Job posting" },
      { key: "applicants", ar: "المتقدمون", en: "Applicants" },
      { key: "trial_eval", ar: "تقييم فترة التجربة", en: "Trial evaluation" },
    ],
  },
  {
    key: "fleet", ar: "الأسطول والمركبات", en: "Fleet",
    subs: [
      { key: "add_vehicle", ar: "إضافة مركبة", en: "Add vehicle" },
      { key: "driving_delegation", ar: "تفويض قيادة", en: "Driving delegation" },
      { key: "vehicle_insurance", ar: "تأمين المركبات", en: "Vehicle insurance" },
    ],
  },
  {
    key: "equipment", ar: "العهد والمعدات", en: "Equipment",
    subs: [
      { key: "assign_equipment", ar: "تسليم عهدة", en: "Assign equipment" },
      { key: "return_equipment", ar: "استرجاع عهدة", en: "Return equipment" },
      { key: "damage_deduction", ar: "خصم التلف", en: "Damage deduction" },
    ],
  },
  {
    key: "complaints_warnings", ar: "الشكاوى والإنذارات", en: "Complaints & Warnings",
    subs: [
      { key: "raise_complaint", ar: "رفع شكوى", en: "Raise complaint" },
      { key: "employee_warning", ar: "إنذار موظف", en: "Employee warning" },
      { key: "complaint_confidentiality", ar: "سرية الشكوى", en: "Complaint confidentiality" },
    ],
  },
  {
    key: "approvals", ar: "الموافقات", en: "Approvals",
    subs: [
      { key: "manager_approval", ar: "موافقة المدير", en: "Manager approval" },
      { key: "hr_approval", ar: "موافقة الموارد البشرية", en: "HR approval" },
      { key: "finance_approval", ar: "موافقة المالية", en: "Finance approval" },
    ],
  },
  {
    key: "settings", ar: "الإعدادات", en: "Settings",
    subs: [
      { key: "org_data", ar: "بيانات المنشأة", en: "Organization data" },
      { key: "branches", ar: "الفروع", en: "Branches" },
      { key: "licenses", ar: "التراخيص", en: "Licenses" },
      { key: "users_permissions", ar: "المستخدمون والصلاحيات", en: "Users & permissions" },
    ],
  },
  {
    key: "subscriptions", ar: "الاشتراكات والفوترة", en: "Subscriptions & Billing",
    subs: [
      { key: "renewal", ar: "تجديد الاشتراك", en: "Renewal" },
      { key: "invoices", ar: "الفواتير", en: "Invoices" },
      { key: "payment_methods", ar: "طرق الدفع", en: "Payment methods" },
      { key: "cancellation", ar: "إلغاء الاشتراك", en: "Cancellation" },
    ],
  },
  {
    key: "employee_portal", ar: "بوابة الموظف", en: "Employee Portal",
    subs: [
      { key: "portal_login", ar: "دخول البوابة", en: "Portal login" },
      { key: "view_requests", ar: "عرض الطلبات", en: "View requests" },
      { key: "portal_password", ar: "كلمة مرور البوابة", en: "Portal password" },
    ],
  },
  {
    key: "other", ar: "أخرى / عام", en: "Other",
    subs: [
      { key: "suggestion", ar: "اقتراح/ملاحظة", en: "Suggestion" },
      { key: "general_issue", ar: "مشكلة عامة", en: "General issue" },
      { key: "feature_request", ar: "طلب ميزة", en: "Feature request" },
    ],
  },
];

export const findCategory = (key) => SUPPORT_CATEGORIES.find((c) => c.key === key) || null;
export const findSub = (catKey, subKey) => {
  const c = findCategory(catKey);
  if (!c) return null;
  return c.subs.find((s) => s.key === subKey) || null;
};