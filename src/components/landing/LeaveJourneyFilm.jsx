import React, { useState } from "react";

const scenes = [
  { src: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/8328186d7__.mp4", eyebrow: "بوابة الموظفين", title: "رفع طلب إجازة", detail: "تم إرسال الطلب بنجاح" },
  { src: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/3072c8041___.mp4", eyebrow: "الإجازات والموافقات", title: "تمت الموافقة", detail: "بانتظار المالية للسداد" },
  { src: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/76a2b9801__.mp4", eyebrow: "إشعار بنكي", title: "تم تحويل مستحقات إجازتك", detail: "وصل التحويل بنجاح" },
  { src: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/89a71c774__.mp4", eyebrow: "رحلة أسهل", title: "من موقع العمل إلى بوابة السفر", detail: "كل الإجراءات اكتملت بسلاسة" },
  { src: "https://media.base44.com/videos/public/6a74edc8f347046365c2e1a4/85d6b88e7__.mp4", eyebrow: "جدارة", title: "مع جدارة، كل إدارة الموارد البشرية صارت أسهل", detail: "منصة واحدة، تجربة متكاملة" },
];

export default function LeaveJourneyFilm() {
  const [index, setIndex] = useState(0);
  const scene = scenes[index];

  return (
    <div className="absolute inset-0">
      <video key={scene.src} src={scene.src} autoPlay muted playsInline preload="auto"
        onEnded={() => setIndex((index + 1) % scenes.length)}
        className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-primary/30" />
      <div className="absolute bottom-8 left-6 right-6 mx-auto max-w-xl rounded-2xl border border-white/20 bg-primary/85 p-5 text-center shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-violet-300">{scene.eyebrow}</p>
        <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{scene.title}</p>
        <p className="mt-1 text-sm text-white/70">{scene.detail}</p>
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {scenes.map((item, i) => <span key={item.src} className={`h-1 rounded-full ${i === index ? "w-7 bg-violet-300" : "w-3 bg-white/30"}`} />)}
      </div>
    </div>
  );
}