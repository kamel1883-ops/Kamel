// ملخّص مالي موحّد لعرض السعر والعقد والفاتورة — شفافية كاملة في القيمة السنوية والخصم ورسوم التأسيس وإجمالي السنة الأولى.
// يُستخدم في QuoteDoc و SubscriptionContractDoc و SubscriptionInvoiceDoc وصفحة عرض السعر الحيّة.
export function computeBreakdown({ tier = null, quotedAmount = 0, discountPercent = 0, discountCode = "" } = {}) {
  const baseAnnual = tier ? Number(tier.yearly) || 0 : 0;
  const finalAnnual = Number(quotedAmount) || baseAnnual;
  const discountAmount = Math.max(0, baseAnnual - finalAnnual);
  const hasDiscount =
    discountAmount > 0 || (Number(discountPercent) > 0 && String(discountCode || "").trim() !== "");
  const setup = tier ? Number(tier.setup) || 0 : 0;
  const isCustom = tier ? !!tier.custom : false;
  const totalYear1 = isCustom ? finalAnnual : finalAnnual + setup;
  return {
    tier,
    baseAnnual,
    finalAnnual,
    discountAmount,
    discountPercent: Number(discountPercent) || 0,
    discountCode: String(discountCode || ""),
    hasDiscount,
    setup,
    isCustom,
    totalYear1,
  };
}