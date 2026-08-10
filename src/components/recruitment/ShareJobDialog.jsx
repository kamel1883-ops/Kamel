import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, MessageCircle, Send, Linkedin, Mail } from "lucide-react";

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
        </div>
      </DialogContent>
    </Dialog>
  );
}