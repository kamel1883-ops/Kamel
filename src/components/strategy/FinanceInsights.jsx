import React from "react";
import { Lightbulb, Target } from "lucide-react";
import { formatCurrency } from "@/lib/hr";
import { AFFILIATE_RATE } from "@/lib/strategyFinance";

// استنتاجات وأهداف مبنية على الأرقام الفعلية — تتحدّث تلقائياً مع كل إيراد أو مصروف جديد.
export default function FinanceInsights({ snap }) {
  const arpu = snap.arpu || 0;
  const netPerClient = arpu * (1 - AFFILIATE_RATE / 100);
  const targetNet = snap.fixedYearly * 3;
  const clientsForTarget = netPerClient > 0 ? Math.ceil((targetNet + snap.fixedYearly) / netPerClient) : 0;

  const insights = [
    `متوسط قيمة الاشتراك الفعلي لديك ${formatCurrency(arpu)} سنوياً، وبعد خصم عمولة الشريك ${AFFILIATE_RATE}% يبقى ${formatCurrency(netPerClient)} صافياً لكل عميل محال.`,
    `العبء الثابت السنوي (اشتراكات ومنصات وخدمات) ${formatCurrency(snap.fixedYearly)} — أي أنك تحتاج ${snap.breakEvenClients || "—"} عميلاً سنوياً لتغطية التكاليف قبل تحقيق أي ربح.`,
    `هامش الربح الحالي ${snap.margin.toFixed(1)}% من إيراد السنة (${formatCurrency(snap.yearRevenue)}) — الهدف الاستراتيجي إبقاؤه فوق 55% بتثبيت المصروفات مع نمو الإيراد.`,
    snap.commissions.total > 0
      ? `عمولات الشركاء المستحقة حتى الآن ${formatCurrency(snap.commissions.total)} عن ${snap.commissions.items.length} عميلاً محالاً — تُصرف مرة واحدة من أول اشتراك فقط.`
      : `لا يوجد عميل محال عبر رابط شريك بعد — تفعيل الشركاء هو أرخص قناة نمو لديك (بلا تكلفة إعلانية، ${AFFILIATE_RATE}% من أول اشتراك فقط).`,
    `للوصول إلى صافي سنوي ${formatCurrency(targetNet)} بنفس متوسط السعر الحالي تحتاج نحو ${clientsForTarget || "—"} عميلاً مشتركاً — هذا هو مستهدف المبيعات الحقيقي.`,
    `المصروف الأعلى حالياً: ${snap.categories[0] ? `${snap.categories[0].label} بمبلغ ${formatCurrency(snap.categories[0].amount)}` : "لا توجد مصروفات مسجّلة"} — يُراجع سنوياً قبل التجديد لخفض التكلفة أو التفاوض عليها.`,
  ];

  const actions = [
    `تسعير: عدم النزول تحت ${formatCurrency(Math.max(arpu * 0.85, 1900))} للاشتراك السنوي حتى لا ينخفض الهامش الحالي.`,
    `عمولات: إبقاء عمولة الشركاء ${AFFILIATE_RATE}% مرة واحدة من أول اشتراك فقط، والتجديدات بلا عمولة.`,
    `مصروفات: تثبيت العبء الثابت السنوي عند ${formatCurrency(snap.fixedYearly)} أو أقل خلال العام القادم مهما زاد عدد العملاء.`,
    `نقدية: تحصيل الاشتراك سنوياً مقدماً بالتحويل البنكي لتغطية العبء الثابت من أول الربع.`,
    `مراجعة: قراءة تقرير الإيراد الشهري في بوابة المالك مطلع كل شهر ومقارنته بمستهدف العملاء.`,
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={17} className="text-amber-600" />
          <h3 className="font-semibold text-sm">قراءة الأرقام — أساس الخطة</h3>
        </div>
        <ul className="space-y-2.5">
          {insights.map((t, i) => (
            <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">{i + 1}.</span><span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={17} className="text-[#0B2545]" />
          <h3 className="font-semibold text-sm">قرارات مالية ملزمة في الخطة</h3>
        </div>
        <ul className="space-y-2.5">
          {actions.map((t, i) => (
            <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
              <span className="text-[#0B2545] font-bold shrink-0">•</span><span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}