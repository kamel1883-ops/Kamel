// إدارة فيديو الواجهة الموسمي بصفحة الهبوط.
// كل موسم له نطاق تواريخ ميلادي (YYYY-MM-DD) ورابط فيديو خاص به.
// خارج أي نطاق موسمي تُرجّع الدالة الفيديو الافتراضي تلقائياً.

const DEFAULT_HERO_VIDEO =
  "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/3e3373378_Hero_Saudi_Thobe_Shamagh.mp4";

// أضف موسماً جديداً هنا فقط — الدالة تتكفّل بالباقي.
const SEASONS = [
  {
    key: "national_day_96",
    titleAr: "اليوم الوطني السعودي 96 — عزنا بطبعنا",
    titleEn: "Saudi National Day 96 — Our Pride is Our Nature",
    start: "2026-08-24",
    // آخر يوم للفيديو الموسمي 22-10-2026 — وبتاريخ 23-10-2026 يعود فيديو جدارة الأساسي تلقائياً
    end: "2026-10-22",
    video:
      "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/5285be590_Riyadh_Real_Footage_v2.mp4",
  },
];

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// الفيديو الفعّال الآن (الموسمي داخلالنطاق، أو الافتراضي خارجه).
export function getHeroVideo() {
  const today = todayStr();
  const s = SEASONS.find((x) => today >= x.start && today <= x.end);
  return (s && s.video) || DEFAULT_HERO_VIDEO;
}

// الموسم الفعّال الآن (إن وُجد) — لعرض العنوان الموسمي فوق الفيديو لو رغبت.
export function getActiveSeason() {
  const today = todayStr();
  return SEASONS.find((x) => today >= x.start && today <= x.end) || null;
}