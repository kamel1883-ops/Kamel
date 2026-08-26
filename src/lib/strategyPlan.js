// الخطة الاستراتيجية لمنصة جدارة — مرجع موحّد لقسم "الخطة الاستراتيجية" داخل النظام
// Jadara strategic plan — single source for the in-app Strategy section.
// المحتوى مبني على: النظام (SaaS موارد بشرية سعودي)، الباقات الخمس وأسعارها، السوق المستهدف، وبرنامج الشركاء 7%.

export const IDENTITY = {
  vision: {
    ar: "أن تكون جدارة المنصة السعودية الأولى التي تعتمد عليها المنشآت الصغيرة والمتوسطة في إدارة موظفيها ورواتبها وامتثالها العمالي بالكامل.",
    en: "To be the leading Saudi platform SMEs rely on for managing their people, payroll and labor compliance end-to-end.",
  },
  mission: {
    ar: "تمكين المنشآت من إدارة الموارد البشرية باحترافية المؤسسات الكبرى وبتكلفة تناسب حجمها — بنظام سحابي عربي متكامل، متوافق مع نظام العمل السعودي، لا يحتاج خبرة تقنية.",
    en: "Enable every organization to run HR at enterprise quality and SME cost — an integrated Arabic cloud system aligned with Saudi labor law, with zero technical setup.",
  },
  positioning: {
    ar: "نظام موارد بشرية سعودي متكامل (18 وحدة) + بوابة موظف ذاتية بسبع لغات + بوابة موافقات — بسعر سنوي واحد يبدأ من 1,900 ر.س وبدون رسوم تأسيس.",
    en: "A complete Saudi HR system (18 modules) + a 7-language self-service employee portal + an approvals portal — one annual price from SAR 1,900 with no setup fees.",
  },
  market: {
    ar: "السعودية أولاً (الرياض، جدة، الدمام والمنطقة الشرقية) ثم التوسّع الخليجي (الإمارات، الكويت، قطر، البحرين، عُمان). القطاعات الأولى: المقاولات والصيانة، التجزئة والمطاعم، النقل واللوجستيك، الخدمات الطبية، مكاتب الخدمات والاستشارات.",
    en: "Saudi Arabia first (Riyadh, Jeddah, Dammam & the Eastern Province), then GCC expansion (UAE, Kuwait, Qatar, Bahrain, Oman). Priority sectors: contracting & maintenance, retail & F&B, transport & logistics, medical services, business services.",
  },
  icp: {
    ar: "منشأة من 10 إلى 400 موظف، لديها التزامات قوى وحماية أجور (مدد) وتأمينات، وتدير الموارد البشرية حالياً بالإكسل أو يدوياً.",
    en: "Companies with 10–400 employees, with Qiwa/WPS (Mudad) and GOSI obligations, currently running HR on spreadsheets or manually.",
  },
};

export const EDGE = [
  { ar: "عربي أصلاً (RTL) ومصمّم لنظام العمل السعودي — لا ترجمة لنظام أجنبي.", en: "Arabic-native (RTL), built for Saudi labor law — not a translated foreign product." },
  { ar: "سعر سنوي واحد بدون رسوم تأسيس ولا رسوم لكل موظف.", en: "One annual price — no setup fees, no per-employee pricing." },
  { ar: "كل المميزات في كل الباقات — الفارق في حجم المنشأة فقط.", en: "All features in every tier — the only difference is company size." },
  { ar: "بوابة موظف ذاتية بسبع لغات مع بصمة موقع جغرافي.", en: "7-language self-service portal with geo-fenced clock-in." },
  { ar: "احتساب تلقائي للرواتب والتأمينات ونهاية الخدمة ومخالصة الإجازات.", en: "Automatic payroll, GOSI, end-of-service and leave settlement." },
  { ar: "مستندات رسمية جاهزة (قرارات، إنذارات، مخالصات، عقود، كشوف مدد).", en: "Ready official documents (decisions, warnings, settlements, contracts, Mudad files)." },
  { ar: "تجربة مجانية 30 يوماً بلا بطاقة بنكية + عقد اشتراك رسمي رقمي.", en: "30-day free trial with no card + a formal digital subscription contract." },
  { ar: "برنامج شركاء بعمولة 7% من أول اشتراك — نمو بقنوات غير مدفوعة.", en: "7% first-subscription affiliate program — growth beyond paid channels." },
];

export const PILLARS = [
  {
    id: "growth", ar: "النمو السوقي والاستحواذ", en: "Market growth & acquisition",
    ar_desc: "بناء قمع تسويقي متوقّع يحوّل الزيارات إلى تجارب مجانية ثم إلى اشتراكات سنوية.",
    en_desc: "Build a predictable funnel turning visits into free trials, then annual subscriptions.",
  },
  {
    id: "retention", ar: "تجربة العميل والاحتفاظ", en: "Customer experience & retention",
    ar_desc: "تفعيل سريع، دعم قريب، واستبيانات رضا — لضمان تجديد سنوي مرتفع.",
    en_desc: "Fast onboarding, close support and satisfaction surveys to drive high renewals.",
  },
  {
    id: "product", ar: "تميّز المنتج والامتثال", en: "Product excellence & compliance",
    ar_desc: "تعميق الوحدات الأكثر أثراً (الرواتب، الحضور، الامتثال) وإطلاق تحسينات دورية.",
    en_desc: "Deepen the highest-impact modules (payroll, attendance, compliance) with regular releases.",
  },
  {
    id: "finance", ar: "الكفاءة المالية والتشغيلية", en: "Financial & operational efficiency",
    ar_desc: "رفع متوسط قيمة الاشتراك وخفض تكلفة اكتساب العميل مع ضبط المصروفات الثابتة.",
    en_desc: "Raise average subscription value, cut acquisition cost, control fixed expenses.",
  },
];

// أهداف محددة (SMART) مرتبطة بالهدف الاستراتيجي (pillar)
export const OBJECTIVES = [
  { pillar: "growth", ar: "الوصول إلى 40 عميلاً مشتركاً في السنة الأولى", en: "Reach 40 paying clients in year one", target: { ar: "40 عميل / 12 شهر", en: "40 clients / 12 months" }, owner: { ar: "المالك — المبيعات", en: "Owner — Sales" } },
  { pillar: "growth", ar: "توليد 25 طلب تجربة مجانية شهرياً", en: "Generate 25 free-trial requests per month", target: { ar: "25 تجربة / شهر", en: "25 trials / month" }, owner: { ar: "التسويق", en: "Marketing" } },
  { pillar: "growth", ar: "تفعيل 15 شريكاً تسويقياً نشطاً برابط إحالة", en: "Activate 15 affiliates with live referral links", target: { ar: "15 شريك نشط", en: "15 active partners" }, owner: { ar: "برنامج الشركاء", en: "Affiliate program" } },
  { pillar: "growth", ar: "تصدّر نتائج البحث لـ 10 كلمات مفتاحية عمالية سعودية", en: "Rank on page one for 10 Saudi HR keywords", target: { ar: "10 كلمات / 6 أشهر", en: "10 keywords / 6 months" }, owner: { ar: "المدونة والمحتوى", en: "Content" } },
  { pillar: "retention", ar: "رفع نسبة تحويل التجربة إلى اشتراك", en: "Increase trial-to-paid conversion", target: { ar: "≥ 35%", en: "≥ 35%" }, owner: { ar: "المالك — المبيعات", en: "Owner — Sales" } },
  { pillar: "retention", ar: "تفعيل حساب العميل وتدريبه خلال 3 أيام عمل", en: "Onboard and train each client within 3 business days", target: { ar: "≤ 3 أيام", en: "≤ 3 days" }, owner: { ar: "الدعم والتفعيل", en: "Onboarding" } },
  { pillar: "retention", ar: "الحفاظ على تجديد سنوي لا يقل عن 85%", en: "Maintain annual renewal rate of 85%+", target: { ar: "≥ 85%", en: "≥ 85%" }, owner: { ar: "المالك — نجاح العميل", en: "Customer success" } },
  { pillar: "retention", ar: "قياس رضا كل عميل مرتين سنوياً عبر بوابة الاستبيانات", en: "Survey every client twice a year via the survey portal", target: { ar: "2 استبيان / عميل", en: "2 surveys / client" }, owner: { ar: "تجربة العميل", en: "CX" } },
  { pillar: "product", ar: "إطلاق تحديث ميزات كل 30 يوماً", en: "Ship a feature release every 30 days", target: { ar: "12 إصدار / سنة", en: "12 releases / year" }, owner: { ar: "المنتج", en: "Product" } },
  { pillar: "product", ar: "إغلاق أي ملاحظة عميل حرجة خلال 48 ساعة", en: "Close critical client issues within 48 hours", target: { ar: "≤ 48 ساعة", en: "≤ 48 hours" }, owner: { ar: "الدعم الفني", en: "Support" } },
  { pillar: "product", ar: "تحديث محتوى الامتثال مع كل تعديل في نظام العمل", en: "Update compliance content with every labor-law change", target: { ar: "100% تغطية", en: "100% coverage" }, owner: { ar: "المحتوى النظامي", en: "Legal content" } },
  { pillar: "finance", ar: "رفع متوسط قيمة الاشتراك السنوي", en: "Raise average annual subscription value", target: { ar: "≥ 3,500 ر.س", en: "≥ SAR 3,500" }, owner: { ar: "المالك", en: "Owner" } },
  { pillar: "finance", ar: "خفض تكلفة اكتساب العميل", en: "Reduce customer acquisition cost", target: { ar: "≤ 450 ر.س", en: "≤ SAR 450" }, owner: { ar: "التسويق", en: "Marketing" } },
  { pillar: "finance", ar: "إبقاء المصروفات الثابتة ضمن 30% من الإيراد", en: "Keep fixed expenses within 30% of revenue", target: { ar: "≤ 30%", en: "≤ 30%" }, owner: { ar: "العمليات المالية", en: "Finance" } },
];

export const KPIS = [
  { pillar: "growth", ar: "عدد العملاء المشتركين", en: "Paying clients", target: "40", unit: { ar: "عميل / سنة 1", en: "clients / Y1" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "growth", ar: "طلبات التجربة المجانية", en: "Free-trial requests", target: "25", unit: { ar: "طلب / شهر", en: "per month" }, freq: { ar: "أسبوعي", en: "Weekly" } },
  { pillar: "growth", ar: "زيارات الموقع المؤهلة", en: "Qualified website visits", target: "3,000", unit: { ar: "زيارة / شهر", en: "per month" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "growth", ar: "نسبة العملاء القادمين من الشركاء", en: "Clients from affiliates", target: "25%", unit: { ar: "من إجمالي العملاء", en: "of all clients" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "retention", ar: "تحويل التجربة إلى اشتراك", en: "Trial-to-paid conversion", target: "35%", unit: { ar: "من التجارب", en: "of trials" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "retention", ar: "معدل التجديد السنوي", en: "Annual renewal rate", target: "85%", unit: { ar: "من العملاء", en: "of clients" }, freq: { ar: "ربع سنوي", en: "Quarterly" } },
  { pillar: "retention", ar: "زمن تفعيل العميل", en: "Time to activate a client", target: "3", unit: { ar: "أيام عمل", en: "business days" }, freq: { ar: "لكل عميل", en: "Per client" } },
  { pillar: "retention", ar: "رضا العميل (مؤشر الترشيح NPS)", en: "Customer satisfaction (NPS)", target: "+50", unit: { ar: "نقطة", en: "points" }, freq: { ar: "نصف سنوي", en: "Bi-annual" } },
  { pillar: "product", ar: "عدد الإصدارات المُطلقة", en: "Feature releases shipped", target: "12", unit: { ar: "إصدار / سنة", en: "per year" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "product", ar: "زمن إغلاق التذاكر الحرجة", en: "Critical ticket resolution", target: "48", unit: { ar: "ساعة", en: "hours" }, freq: { ar: "أسبوعي", en: "Weekly" } },
  { pillar: "product", ar: "عدد موظفي العملاء المُدارين في النظام", en: "Employees managed on the platform", target: "6,000", unit: { ar: "موظف", en: "employees" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "finance", ar: "متوسط قيمة الاشتراك", en: "Average subscription value", target: "3,500", unit: { ar: "ر.س / عميل", en: "SAR / client" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "finance", ar: "تكلفة اكتساب العميل", en: "Customer acquisition cost", target: "450", unit: { ar: "ر.س / عميل", en: "SAR / client" }, freq: { ar: "شهري", en: "Monthly" } },
  { pillar: "finance", ar: "هامش الربح الصافي", en: "Net profit margin", target: "55%", unit: { ar: "من الإيراد", en: "of revenue" }, freq: { ar: "ربع سنوي", en: "Quarterly" } },
];

// مستهدف العملاء والإيراد — متوسط قيمة الاشتراك 3,200 ر.س (باقة الناشئة)
export const GROWTH = {
  avgValue: 3200,
  years: [
    { ar: "السنة الأولى — التأسيس", en: "Year 1 — Foundation", clients: 40, trials: 300, revenue: 128000, focus: { ar: "إثبات النموذج، أول 40 عميلاً، بناء المحتوى وبرنامج الشركاء.", en: "Prove the model, land the first 40 clients, build content and the affiliate program." } },
    { ar: "السنة الثانية — التوسّع", en: "Year 2 — Expansion", clients: 120, trials: 700, revenue: 384000, focus: { ar: "توسّع في الرياض وجدة والدمام، شراكات مكاتب الخدمات، إعلانات مدفوعة مُحسّنة.", en: "Scale Riyadh/Jeddah/Dammam, service-office partnerships, optimized paid ads." } },
    { ar: "السنة الثالثة — الترسيخ", en: "Year 3 — Consolidation", clients: 300, trials: 1400, revenue: 960000, focus: { ar: "باقات المنشآت الكبرى، ربط API، وأول خطوة توسّع خليجي.", en: "Enterprise tiers, API integrations, first GCC expansion step." } },
  ],
  monthlyRamp: [
    { ar: "الربع الأول", en: "Q1", clients: 5, trials: 45 },
    { ar: "الربع الثاني", en: "Q2", clients: 8, trials: 65 },
    { ar: "الربع الثالث", en: "Q3", clients: 12, trials: 85 },
    { ar: "الربع الرابع", en: "Q4", clients: 15, trials: 105 },
  ],
};

export const CHANNELS = [
  {
    id: "video", ar: "فيديوهات قصيرة (ريلز / تيك توك / سناب)", en: "Short videos (Reels / TikTok / Snap)",
    ar_desc: "مقاطع 20–40 ثانية: «كيف تصرف رواتب منشأتك عبر مدد في 3 دقائق»، «احتساب نهاية الخدمة تلقائياً»، «الموظف يطلب إجازته من جواله». مقطعان أسبوعياً بنفس الهوية الكحلي/الذهبي.",
    en_desc: "20–40s clips: 'Run Mudad payroll in 3 minutes', 'Automatic end-of-service', 'Employees request leave from their phone'. Two clips a week in the navy/gold identity.",
    ar_kpi: "معدل مشاهدة كامل ≥ 45% — 5 تجارب شهرياً من هذه القناة", en_kpi: "≥45% completion — 5 trials/month from this channel",
  },
  {
    id: "google", ar: "إعلانات جوجل (نية شرائية عالية)", en: "Google Ads (high purchase intent)",
    ar_desc: "كلمات: نظام موارد بشرية، برنامج رواتب، حماية الأجور مدد، برنامج حضور وانصراف، حساب نهاية الخدمة. صفحات هبوط مخصصة موجودة أصلاً في الموقع لكل موضوع.",
    en_desc: "Keywords: HR system, payroll software, Mudad WPS, attendance software, end-of-service calculator — mapped to the dedicated landing pages already on the site.",
    ar_kpi: "تكلفة التجربة ≤ 90 ر.س — تكلفة العميل ≤ 450 ر.س", en_kpi: "Cost per trial ≤ SAR 90 — CAC ≤ SAR 450",
  },
  {
    id: "meta", ar: "ميتا وسناب (استهداف أصحاب المنشآت)", en: "Meta & Snap (business-owner targeting)",
    ar_desc: "استهداف جغرافي (الرياض، جدة، الدمام) + اهتمامات: إدارة أعمال، مقاولات، مطاعم، لوجستيك. عرض واضح: تجربة 30 يوماً بلا بطاقة.",
    en_desc: "Geo-targeting (Riyadh, Jeddah, Dammam) plus business/contracting/F&B/logistics interests. One clear offer: 30-day trial, no card.",
    ar_kpi: "8 تجارب شهرياً — تكلفة النقرة ≤ 3 ر.س", en_kpi: "8 trials/month — CPC ≤ SAR 3",
  },
  {
    id: "linkedin", ar: "لينكدإن (المنشآت المتوسطة والكبرى)", en: "LinkedIn (mid & large companies)",
    ar_desc: "استهداف مدراء الموارد البشرية والمالية في منشآت 150+ موظف، ورسائل مباشرة مع دعوة لعرض تجريبي مباشر.",
    en_desc: "Target HR and finance managers at 150+ employee firms with direct outreach and live-demo invites.",
    ar_kpi: "10 عروض تجريبية شهرياً", en_kpi: "10 live demos per month",
  },
  {
    id: "seo", ar: "المدونة والمحتوى النظامي (SEO)", en: "Blog & compliance content (SEO)",
    ar_desc: "مقال أسبوعي في القانون العمالي السعودي: الإجازات، نهاية الخدمة، الإنذارات، السعودة، مدد. المحتوى النظامي يجلب زيارات مجانية مستمرة ويبني الثقة.",
    en_desc: "A weekly Saudi labor-law article (leaves, end of service, warnings, Saudization, Mudad) — compounding free traffic and trust.",
    ar_kpi: "3,000 زيارة شهرياً — 10 كلمات في الصفحة الأولى", en_kpi: "3,000 monthly visits — 10 page-one keywords",
  },
  {
    id: "affiliate", ar: "برنامج الشركاء (عمولة 7%)", en: "Affiliate program (7% commission)",
    ar_desc: "استقطاب مستشاري موارد بشرية، مكاتب محاسبة، ومسوّقين رقميين — كل شريك برابط إحالة وعمولة 7% من أول اشتراك تُصرف مرة واحدة.",
    en_desc: "Recruit HR consultants, accounting offices and digital marketers — each with a referral link and a one-time 7% first-subscription commission.",
    ar_kpi: "15 شريكاً نشطاً — 25% من العملاء الجدد", en_kpi: "15 active partners — 25% of new clients",
  },
  {
    id: "partnerships", ar: "شراكات مكاتب الخدمات والمحاسبة", en: "Service & accounting office partnerships",
    ar_desc: "مكاتب تعقيب المعاملات ومحاسبة الشركات تتعامل مع عشرات المنشآت — اتفاقية إحالة مقابل عمولة أو سعر خاص لعملائها.",
    en_desc: "Government-services and accounting offices each serve dozens of companies — referral agreements or preferred pricing for their clients.",
    ar_kpi: "5 مكاتب شراكة — 20 عميلاً محالاً سنوياً", en_kpi: "5 partner offices — 20 referred clients/year",
  },
  {
    id: "events", ar: "المعارض والملتقيات", en: "Events & expos",
    ar_desc: "المشاركة في ملتقيات الموارد البشرية ومعارض المنشآت الصغيرة (بيبان وما شابه) ببروشور جدارة وبطاقات العمل والعرض التجريبي المباشر.",
    en_desc: "Attend HR summits and SME expos (Biban and similar) with the Jadara brochure, business cards and a live demo.",
    ar_kpi: "معرضان سنوياً — 60 عميلاً محتملاً لكل معرض", en_kpi: "2 events/year — 60 leads each",
  },
  {
    id: "whatsapp", ar: "واتساب بزنس والمتابعة المباشرة", en: "WhatsApp Business & direct follow-up",
    ar_desc: "متابعة كل طلب تجربة خلال ساعة، رسالة تفعيل، وتذكير قبل انتهاء التجربة بـ7 أيام مع عرض العقد الرسمي.",
    en_desc: "Follow every trial within one hour, send an activation message, and remind 7 days before trial end with the formal contract.",
    ar_kpi: "زمن أول تواصل ≤ 60 دقيقة", en_kpi: "First response ≤ 60 minutes",
  },
  {
    id: "seasonal", ar: "الحملات الموسمية", en: "Seasonal campaigns",
    ar_desc: "اليوم الوطني، رمضان، بداية السنة المالية، ونهاية العام — كودات خصم محدودة المدة وهوية بصرية موسمية على صفحة الهبوط.",
    en_desc: "National Day, Ramadan, fiscal-year start and year-end — time-boxed discount codes with a seasonal landing-page identity.",
    ar_kpi: "4 حملات سنوياً — 20% من اشتراكات السنة", en_kpi: "4 campaigns/year — 20% of annual subscriptions",
  },
];

export const RISKS = [
  { ar: "منافسة منصات عالمية بأسعار لكل موظف", en: "Global per-employee-priced competitors", mitig: { ar: "التمسّك بالسعر السنوي الثابت وشمول كل المميزات في كل باقة.", en: "Hold the flat annual price with all features in every tier." } },
  { ar: "تغيّر أنظمة العمل والامتثال", en: "Changes in labor & compliance rules", mitig: { ar: "تحديث محتوى الامتثال والمستندات مع كل تعديل نظامي.", en: "Update compliance content and documents with every regulatory change." } },
  { ar: "اعتماد النمو على قناة واحدة", en: "Over-reliance on one growth channel", mitig: { ar: "توزيع النمو على 4 قنوات: بحث، فيديو، شركاء، شراكات مكاتب.", en: "Spread growth across search, video, affiliates and office partnerships." } },
  { ar: "ضعف التفعيل بعد التجربة", en: "Weak post-trial activation", mitig: { ar: "تفعيل مُرشد خلال 3 أيام واستبيان رضا مبكر.", en: "Guided onboarding within 3 days plus an early satisfaction survey." } },
];