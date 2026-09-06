// تاريخ الطباعة/التوليد بميلادي + هجري معاً — يُحسب لحظة الطباعة لكل مستند/تقرير.
// تواريخ المعاملات الأصلية (تقديم الطلب، المباشرة، آخر يوم عمل...) تظل كما هي في أماكنها.
export function genDateBoth(isAr) {
  const now = new Date();
  const opts = { year: "numeric", month: "long", day: "numeric" };
  try {
    if (isAr) {
      const g = now.toLocaleDateString("ar-SA-u-ca-gregory", opts);
      const h = now.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", opts);
      return g + "م / " + h + "هـ";
    }
    const g = now.toLocaleDateString("en-GB", opts);
    const h = now.toLocaleDateString("en-US-u-ca-islamic", opts);
    return g + " / " + h + " AH";
  } catch {
    try { return now.toLocaleDateString(isAr ? "ar-SA" : "en-GB", opts); } catch { return now.toISOString().slice(0, 10); }
  }
}