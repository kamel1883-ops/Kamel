import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, MessageCircle, Send, Linkedin, Mail, Globe } from "lucide-react";

export default function ShareJobDialog({ open, onOpenChange, job }) {
  const { toast } = useToast();
  const [url, setUrl] = useState("");

  useEffect(() => { if (job) setUrl(`${window.location.origin}/jobs/${job.id}`); }, [job]);

  const copy = () => { navigator.clipboard?.writeText(url); toast({ title: "تم نسخ الرابط" }); };
  const shareText = `وظيفة شاغرة: ${job?.title || ""}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${shareText} — ${url}`)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const mail = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`تقدّم على الوظيفة عبر الرابط التالي:\n${url}`)}`;

  // منصات التوظيف السعودية — تفتح صفحة النشر/الموقع لصق رابط الإعلان فيها
  const saSites = [
    { name: "إنديد (Indeed)", url: "https://sa.indeed.com/employers/post-job", color: "bg-[#003A9B] hover:bg-[#002e78]" },
    { name: "مرجاني", url: "https://www.marjani.com.sa", color: "bg-amber-600 hover:bg-amber-700" },
    { name: "حراج", url: "https://haraj.com.sa", color: "bg-[#1f7a1f] hover:bg-[#175a17]" },
    { name: "صبار", url: "https://www.sabar.sa", color: "bg-rose-600 hover:bg-rose-700" },
    { name: "بيت.كوم (Bayt)", url: "https://www.bayt.com/ar/employers/post-job/", color: "bg-[#0A6CFF] hover:bg-[#0856cc]" },
    { name: "وظيفة (Wadheefa)", url: "https://www.wadheefa.com", color: "bg-slate-600 hover:bg-slate-700" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>مشاركة إعلان الوظيفة</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs text-muted-foreground">رابط الإعلان</label>
            <div className="flex gap-2 mt-1">
              <Input value={url} readOnly dir="ltr" />
              <Button size="icon" onClick={copy}><Copy size={16} /></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={wa} target="_blank" rel="noreferrer"><Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"><MessageCircle size={16} /> واتساب</Button></a>
            <a href={tg} target="_blank" rel="noreferrer"><Button className="w-full gap-2 bg-sky-500 hover:bg-sky-600"><Send size={16} /> تيليجرام</Button></a>
            <a href={li} target="_blank" rel="noreferrer"><Button className="w-full gap-2 bg-blue-700 hover:bg-blue-800"><Linkedin size={16} /> لينكدإن</Button></a>
            <a href={mail}><Button className="w-full gap-2 bg-slate-700 hover:bg-slate-800"><Mail size={16} /> بريد إلكتروني</Button></a>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe size={14} className="text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground">انشر في منصات التوظيف السعودية</label>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">يُفتح الموقع في نافذة جديدة — انسخ رابط الإعلان أعلاه والصقه في صفحة النشر.</p>
            <div className="grid grid-cols-2 gap-2">
              {saSites.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer">
                  <Button className={`w-full gap-2 text-white ${s.color}`}><Globe size={14} /> {s.name}</Button>
                </a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}