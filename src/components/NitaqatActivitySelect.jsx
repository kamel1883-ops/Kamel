import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Search } from "lucide-react";
import { NITAQAT_ACTIVITIES } from "@/lib/nitaqat";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// منتقي النشاط الرسمي لنطاقات المطور — بحث بالرمز أو باسم النشاط (عربي/إنجليزي)
export default function NitaqatActivitySelect({ value, onChange, placeholder, className }) {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const current = NITAQAT_ACTIVITIES.find((a) => a.code === String(value)) || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-right hover:bg-accent min-h-[44px]",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <Search size={15} className="text-muted-foreground shrink-0" />
            {current ? (
              <span className="truncate">
                <span className="text-muted-foreground tabular-nums ltr-num">{current.code}</span>
                {" — "}
                {isAr ? current.ar : current.en}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder || (isAr ? "ابحث بالرمز أو الاسم…" : "Search by code or name…")}</span>
            )}
          </span>
          <ChevronDown size={16} className="text-muted-foreground shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" dir={isAr ? "rtl" : "ltr"}>
        <Command>
          <CommandInput placeholder={isAr ? "ابحث برمز النشاط أو باسمه…" : "Search by code or name…"} />
          <CommandList className="max-h-72">
            <CommandEmpty>{isAr ? "لا نتائج" : "No results"}</CommandEmpty>
            <CommandGroup>
              {NITAQAT_ACTIVITIES.map((a) => (
                <CommandItem
                  key={a.code}
                  value={`${a.code} ${a.ar} ${a.en}`}
                  onSelect={() => { onChange(a.code); setOpen(false); }}
                  className="gap-2"
                >
                  <Check size={15} className={cn("shrink-0", current?.code === a.code ? "opacity-100 text-violet-600" : "opacity-0")} />
                  <span className="text-muted-foreground tabular-nums w-7 ltr-num">{a.code}</span>
                  <span className="truncate">{isAr ? a.ar : a.en}</span>
                  {a.verified && <span className="ms-auto text-[10px] text-emerald-600 font-medium">{isAr ? "موثّق" : "verified"}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}