// مرجع سياسة العمل والإنذارات — مبني على نظام العمل السعودي
export const VIOLATION_CATEGORIES = [
  {
    id: "absence_short",
    ar: "الغياب بدون عذر (يوم إلى يومين)",
    en: "Unexcused absence (1–2 days)",
    articleAr: "المادة 76 — لصاحب العمل خصم أجر أيام الغياب، ولا يجوز الخصم أكثر من أجر خمسة أيام في الشهر.",
    articleEn: "Article 76 — the employer may deduct wages for the days of absence, not exceeding five days' wages per month.",
    consequenceAr: "إنذار أول + خصم أيام الغياب.",
    consequenceEn: "First warning + deduction of absence days.",
    severity: "medium",
  },
  {
    id: "absence_repeated",
    ar: "تكرار الغياب بدون عذر",
    en: "Repeated unexcused absence",
    articleAr: "المادة 80/4 — يجوز لصاحب العمل فسخ العقد دون مكافأة إذا تكرر الغياب رغم إنذارين متتاليين.",
    articleEn: "Article 80(4) — the employer may terminate without gratuity if absence is repeated despite two consecutive warnings.",
    consequenceAr: "إنذار ثانٍ ثم ثالث، يفضي إلى الفصل عند التكرار.",
    consequenceEn: "Second then third warning, leading to termination on recurrence.",
    severity: "high",
  },
  {
    id: "absence_long",
    ar: "الغياب أكثر من 7 أيام متصلة / 30 يوماً متفرقة",
    en: "Absence >7 consecutive / 30 separate days",
    articleAr: "المادة 80/2 — انتهاء عقد العمل دون تعويض أو مكافأة إذا غاب العامل أكثر من 30 يوماً متفرقة أو أكثر من 15 يوماً متصلة في السنة.",
    articleEn: "Article 80(2) — contract ends without compensation if the worker is absent more than 30 separate days or more than 15 consecutive days per year.",
    consequenceAr: "فسخ العقد (فصل) مباشرة.",
    consequenceEn: "Immediate contract termination.",
    severity: "termination",
  },
  {
    id: "tardiness",
    ar: "التأخر المتكرر عن الدوام",
    en: "Repeated tardiness",
    articleAr: "لائحة تنظيم العمل الداخلية — الالتزام بمواعيد الدوام (وفق المادة 41).",
    articleEn: "Internal work regulations — adherence to working hours (per Article 41).",
    consequenceAr: "إنذار تصاعدي حسب التكرار.",
    consequenceEn: "Progressive warning per recurrence.",
    severity: "medium",
  },
  {
    id: "sleeping",
    ar: "النوم أثناء ساعات العمل",
    en: "Sleeping during working hours",
    articleAr: "المادة 41 — واجبات العامل والالتزام بالتعليمات وأداء العمل بعناية.",
    articleEn: "Article 41 — worker obligations and adherence to instructions and performing work with care.",
    consequenceAr: "إنذار أول، يتصاعد مع التكرار.",
    consequenceEn: "First warning, escalates with recurrence.",
    severity: "medium",
  },
  {
    id: "product_damage",
    ar: "إتلاف/تلف منتجات أو ممتلكات العمل",
    en: "Damage to products or company property",
    articleAr: "المادة 77 و80/6 — التعويض عن الضرر والفسخ عند العمد أو الإهمال الجسيم.",
    articleEn: "Article 77 and 80(6) — compensation for damage and termination on intent or gross negligence.",
    consequenceAr: "إنذار/فصل + التعويض عن التلف.",
    consequenceEn: "Warning/termination + compensation for damage.",
    severity: "high",
  },
  {
    id: "disobedience",
    ar: "عدم تنفيذ الأوامر أو مخالفة التعليمات",
    en: "Failure to follow lawful orders",
    articleAr: "المادة 41 — الالتزام بأوامر صاحب العمل المشروعة وأداء العمل وفق التعليمات.",
    articleEn: "Article 41 — compliance with lawful employer orders and performing work per instructions.",
    consequenceAr: "إنذار تصاعدي.",
    consequenceEn: "Progressive warning.",
    severity: "medium",
  },
  {
    id: "disclosure",
    ar: "إفشاء أسرار العمل",
    en: "Disclosing work secrets",
    articleAr: "المادة 41 و80/5 — واجب المحافظة على أسرار العمل والفسخ عند الإخلال.",
    articleEn: "Article 41 and 80(5) — duty to preserve work secrets and termination on breach.",
    consequenceAr: "إنذار/فصل حسب جسامة الإخلال.",
    consequenceEn: "Warning/termination per severity of breach.",
    severity: "high",
  },
  {
    id: "assault",
    ar: "الاعتداء على مدير أو زميل عمل",
    en: "Assault on a manager or colleague",
    articleAr: "المادة 80/7 — الفسخ دون مكافأة إذا ارتكب العامل اعتداءً على صاحب العمل أو مديره أو رئيسه.",
    articleEn: "Article 80(7) — termination without gratuity if the worker assaults the employer, manager, or supervisor.",
    consequenceAr: "فسخ العقد (فصل).",
    consequenceEn: "Contract termination.",
    severity: "termination",
  },
  {
    id: "safety",
    ar: "مخالفة قواعد السلامة والصحة المهنية",
    en: "Occupational safety violation",
    articleAr: "المادة 41 ونظام السلامة — واجب الالتزام بتعليمات الوقاية والسلامة.",
    articleEn: "Article 41 and safety regulations — duty to follow prevention and safety instructions.",
    consequenceAr: "إنذار تصاعدي، قد يفضي للفصل.",
    consequenceEn: "Progressive warning, may lead to termination.",
    severity: "medium",
  },
  {
    id: "other",
    ar: "مخالفة أخرى وفق لائحة تنظيم العمل",
    en: "Other violation per internal regulations",
    articleAr: "لائحة تنظيم العمل الداخلية المعتمدة لدى مكتب العمل.",
    articleEn: "Internal work regulations registered with the Labor Office.",
    consequenceAr: "حسب قواعد الائحة.",
    consequenceEn: "Per internal regulations.",
    severity: "low",
  },
];

export const WARNING_LEVELS = [
  { id: "first", ar: "إنذار أول", en: "First warning", cls: "bg-amber-50 text-amber-700 border-amber-200", sev: "low" },
  { id: "second", ar: "إنذار ثانٍ", en: "Second warning", cls: "bg-orange-50 text-orange-700 border-orange-200", sev: "medium" },
  { id: "third", ar: "إنذار ثالث (نهائي)", en: "Third (final) warning", cls: "bg-rose-50 text-rose-700 border-rose-200", sev: "high" },
  { id: "termination", ar: "فسخ العقد (فصل)", en: "Contract termination", cls: "bg-red-600 text-white border-red-700", sev: "termination" },
];

const ORDER = ["first", "second", "third", "termination"];

export function suggestLevel(existingCount, category) {
  if (!category) return "first";
  if (category.severity === "termination") return "termination";
  return ORDER[Math.min(existingCount, ORDER.length - 1)];
}

export function categoryById(id, lang) {
  const c = VIOLATION_CATEGORIES.find((x) => x.id === id);
  if (!c) return null;
  const isAr = lang === "ar";
  return { ...c, label: isAr ? c.ar : c.en, article: isAr ? c.articleAr : c.articleEn, consequence: isAr ? c.consequenceAr : c.consequenceEn };
}

export function levelById(id, lang) {
  const l = WARNING_LEVELS.find((x) => x.id === id) || WARNING_LEVELS[0];
  const isAr = lang === "ar";
  return { ...l, label: isAr ? l.ar : l.en };
}

export const LABOR_POLICY_INTRO = {
  ar: "تستند سياسة العمل والإنذارات إلى نظام العمل السعودي ولائحة تنظيم العمل الداخلية المعتمدة لدى مكتب العمل. يُصدر الإنذار بعد إجراء جلسة وتحقق من ثبوت المخالفة على الموظف، ويُرسل مباشرة إلى بوابة الموظف الذاتية دون الحاجة لموافقة الموظف — إذ يُعتبر الإنسذار نافذاً ومعتمداً بمجرد إرساله، ولا يُحتجج به على الموظف إلا بعد تحقيق واثبات.",
  en: "The labor policy and warnings are based on the Saudi Labor Law and the internal work regulations registered with the Labor Office. A warning is issued after a session is held and the violation against the employee is established; it is sent directly to the employee self-service portal without requiring the employee's approval — the warning is effective upon sending, and cannot be held against the worker without investigation and proof.",
};