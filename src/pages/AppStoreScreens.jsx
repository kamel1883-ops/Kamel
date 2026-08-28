import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Upload, Download, Smartphone, Tablet, X, Images, Wand2, Link2, Info
} from "lucide-react";
import { Link } from "react-router-dom";

// المقاسات الرسمية المطلوبة من Apple App Store (عمودي Portrait، PNG/JPEG بدون شفافية)
const PRESETS = [
  { key: "65-p1242", label: '6.5" عمودي — 1242 × 2688', w: 1242, h: 2688, icon: Smartphone, hint: "خانة 6.5\" / مقبول أيضاً لخانة 6.7\"" },
  { key: "65-l2688", label: '6.5" أفقي — 2688 × 1242', w: 2688, h: 1242, icon: Smartphone },
  { key: "61-p1284", label: '6.1" عمودي — 1284 × 2778', w: 1284, h: 2778, icon: Smartphone, hint: "مقبول ضمن خانة 6.5\"" },
  { key: "61-l2778", label: '6.1" أفقي — 2778 × 1284', w: 2778, h: 1284, icon: Smartphone },
  { key: "67-p1290", label: '6.7" عمودي — 1290 × 2796', w: 1290, h: 2796, icon: Smartphone, hint: "إلزامي لكل تطبيق جديد", required: true },
  { key: "67-l2796", label: '6.7" أفقي — 2796 × 1290', w: 2796, h: 1290, icon: Smartphone },
  { key: "55-p1242", label: '5.5" عمودي — 1242 × 2208', w: 1242, h: 2208, icon: Smartphone },
  { key: "55-l2208", label: '5.5" أفقي — 2208 × 1242', w: 2208, h: 1242, icon: Smartphone },
  { key: "ipad-p2048", label: 'iPad 12.9" عمودي — 2048 × 2732', w: 2048, h: 2732, icon: Tablet },
  { key: "ipad-l2732", label: 'iPad 12.9" أفقي — 2732 × 2048', w: 2732, h: 2048, icon: Tablet },
];

const FIT_MODES = [
  { value: "cover", label: "تغطية — قص لملء الإطار بالكامل (الأ Recommended)" },
  { value: "fit", label: "احتواء — الصورة كاملة مع هوامش بلون الخلفية" },
  { value: "fill", label: "تمديد — مطّ الصورة لملء الإطار (قد تشوه)" },
];

let _id = 0;

export default function AppStoreScreens() {
  const [preset, setPreset] = useState("65-p1242");
  const [fit, setFit] = useState("cover");
  const [bg, setBg] = useState("#ffffff");
  const [caption, setCaption] = useState("");
  const [captionColor, setCaptionColor] = useState("#0B2545");
  const [format, setFormat] = useState("png");
  const [items, setItems] = useState([]); // {id, src, name, w, h, out?: {url, blob, w, h}}
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const dirRef = useRef(null);

  const active = PRESETS.find((p) => p.key === preset);

  const onFiles = useCallback((files) => {
    const next = Array.from(files || [])
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => {
        const url = URL.createObjectURL(f);
        return { id: ++_id, src: url, file: f, name: f.name, w: 0, h: 0, out: null };
      });
    setItems((s) => [...s, ...next]);
    // preload dimensions
    next.forEach((it) => {
      const img = new Image();
      img.onload = () => {
        setItems((s) => s.map((x) => x.id === it.id ? { ...x, w: img.width, h: img.height } : x));
      };
      img.src = it.src;
    });
  }, []);

  const removeItem = (id) => {
    setItems((s) => {
      const it = s.find((x) => x.id === id);
      if (it) { URL.revokeObjectURL(it.src); if (it.out) URL.revokeObjectURL(it.out.url); }
      return s.filter((x) => x.id !== id);
    });
  };

  const renderItem = async (it) => {
    const img = new Image();
    img.src = it.src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = active.w;
    canvas.height = active.h;
    const ctx = canvas.getContext("2d");
    // خلفية غير شفافة (App Store يرفض الشفافية)
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, active.w, active.h);

    let dw = active.w, dh = active.h, dx = 0, dy = 0;
    if (fit === "fill") {
      dw = active.w; dh = active.h;
    } else if (fit === "fit") {
      const s = Math.min(active.w / img.width, active.h / img.height);
      dw = img.width * s; dh = img.height * s;
      dx = (active.w - dw) / 2; dy = (active.h - dh) / 2;
    } else { // cover
      const s = Math.max(active.w / img.width, active.h / img.height);
      dw = img.width * s; dh = img.height * s;
      dx = (active.w - dw) / 2; dy = (active.h - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);

    // عنوان عربي أسفل الصورة
    if (caption.trim()) {
      const fontSize = Math.round(active.h * 0.05);
      ctx.fillStyle = captionColor;
      ctx.font = `bold ${fontSize}px Tajawal, "IBM Plex Sans Arabic", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.direction = "rtl";
      ctx.fillText(caption.trim(), active.w / 2, active.h - Math.round(active.h * 0.05));
    }

    const blob = await new Promise((res) =>
      canvas.toBlob(res, format === "png" ? "image/png" : "image/jpeg", 0.92)
    );
    const url = URL.createObjectURL(blob);
    return { url, blob, w: active.w, h: active.h };
  };

  const generateAll = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const outs = [];
      for (const it of items) {
        const out = await renderItem(it);
        if (it.out) URL.revokeObjectURL(it.out.url);
        outs.push({ id: it.id, out });
      }
      setItems((s) => s.map((x) => {
        const o = outs.find((o) => o.id === x.id);
        return o ? { ...x, out: o.out } : x;
      }));
    } finally { setBusy(false); }
  };

  const downloadOne = (it) => {
    if (!it.out) return;
    const a = document.createElement("a");
    a.href = it.out.url;
    a.download = `${it.name.replace(/\.[^.]+$/, "")}_${active.w}x${active.h}.${format}`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const downloadAll = () => {
    items.filter((x) => x.out).forEach((it, i) => {
      setTimeout(() => downloadOne(it), i * 250);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (dirRef.current) dirRef.current.classList.remove("ring-violet-400", "bg-violet-50");
    onFiles(e.dataTransfer.files);
  };

  const generatedCount = items.filter((x) => x.out).length;

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir="rtl">
      {/* شريط علوي بسيط — مساحة عمل المالك فقط */}
      <header className="sticky top-0 z-40 bg-[#0b1120] text-white border-b border-white/10" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Images size={22} className="text-amber-400" />
            <div>
              <div className="text-sm font-bold">مولّد صور App Store</div>
              <div className="text-[11px] text-white/50">أداة خاصة بمساحة العمل — تحويل الصور للمقاسات الرسمية</div>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition">
            <Link2 size={15} /> الرجوع للموقع
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* شريط معلومات */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            ارفع صورك (سكرين من الجوال أو أي صورة)، اختر المقاس الرسمي المطلوب من Apple، ثم حمّلها جاهزة بدقة البكسل —
            المعالجة تتم بالكامل داخل متصفحك ولا تُرفع أي صورة لأي خادم. App Store يشترط صور <b>غير شفافة</b> (PNG أو JPG) بهذه المقاسات تماماً.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* لوحة الإعدادات */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Smartphone size={16} className="text-violet-600" /> المقاس المستهدف</h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">اختر الجهاز</Label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        <span className="flex items-center gap-2">
                          <p.icon size={14} className="text-muted-foreground" />
                          {p.label}
                          {p.required && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">إلزامي</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-muted-foreground">
                المخرجات: <b className="text-foreground tabular-nums">{active.w} × {active.h}</b> بكسل · {format.toUpperCase()}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold">إعدادات المعالجة</h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">نمط الملاءمة</Label>
                <Select value={fit} onValueChange={setFit}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIT_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">لون الخلفية</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-12 rounded-md border border-input cursor-pointer" />
                    <Input value={bg} onChange={(e) => setBg(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">الصيغة</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (موصى به)</SelectItem>
                      <SelectItem value="jpeg">JPG / JPEG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold">عنوان عربي (اختياري)</h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">نص يظهر أسفل كل صورة</Label>
                <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="مثال: إدارة الموارد البشرية بسهولة" maxLength={60} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-muted-foreground w-20">لون النص</Label>
                <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="h-9 w-12 rounded-md border border-input cursor-pointer" />
                <Input value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="font-mono text-xs flex-1" />
              </div>
            </div>
          </div>

          {/* لوحة الرفع والنتائج */}
          <div className="lg:col-span-2 space-y-5">
            <div
              ref={dirRef}
              onDragOver={(e) => { e.preventDefault(); dirRef.current?.classList.add("ring-2", "ring-violet-400", "bg-violet-50"); }}
              onDragLeave={() => dirRef.current?.classList.remove("ring-violet-400", "bg-violet-50")}
              onDrop={onDrop}
              className="rounded-2xl border-2 border-dashed border-border bg-white p-8 text-center cursor-pointer hover:border-violet-400 transition"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
                <Upload size={26} />
              </div>
              <p className="text-sm font-medium">اسحب الصور هنا أو اضغط للاختيار</p>
              <p className="text-xs text-muted-foreground mt-1">يدعم عدة صور دفعة واحدة · PNG / JPG / WEBP</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={generateAll} disabled={!items.length || busy} className="gap-2">
                {busy ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Wand2 size={16} />}
                {busy ? "جارٍ المعالجة..." : `توليد по ${active.w}×${active.h}`}
              </Button>
              <Button variant="outline" onClick={downloadAll} disabled={!generatedCount} className="gap-2">
                <Download size={16} /> تنزيل الكل ({generatedCount})
              </Button>
              {items.length > 0 && (
                <Button variant="ghost" onClick={() => setItems((s) => { s.forEach((it) => { URL.revokeObjectURL(it.src); if (it.out) URL.revokeObjectURL(it.out.url); }); return []; })} className="gap-2 text-rose-600 hover:text-rose-700">
                  <X size={16} /> مسح الكل
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-14 text-center text-muted-foreground text-sm">
                لا توجد صور بعد — ارفع صورة للبدء.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {items.map((it) => (
                  <div key={it.id} className="rounded-2xl border border-border bg-white overflow-hidden group">
                    <div className="relative bg-slate-100 aspect-[9/19.5] flex items-center justify-center">
                      <img src={it.out ? it.out.url : it.src} alt={it.name} className="max-w-full max-h-full object-contain" />
                      <button onClick={() => removeItem(it.id)} className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-sm transition" title="حذف">
                        <X size={14} />
                      </button>
                      {it.out && (
                        <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">جاهزة</span>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <div className="text-xs font-medium truncate" title={it.name}>{it.name}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        الأصلية: {it.w}×{it.h || "—"}
                        {it.out && <span className="text-emerald-600"> · المخرج: {it.out.w}×{it.out.h}</span>}
                      </div>
                      {it.out && (
                        <Button size="sm" variant="outline" onClick={() => downloadOne(it)} className="w-full h-7 text-xs gap-1.5">
                          <Download size={13} /> تنزيل
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}