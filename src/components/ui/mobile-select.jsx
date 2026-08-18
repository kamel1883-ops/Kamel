import * as React from "react";
import { Drawer } from "vaul";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select, SelectContent, SelectTrigger, SelectValue, SelectItem
} from "@/components/ui/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * MobileSelect — drop-in replacement for the Radix Select used in this app.
 *
 * - Desktop (>= 768px): renders the standard Radix Select overlay (unchanged UX).
 * - Mobile (< 768px): renders a native-style bottom-sheet picker powered by
 *   the `vaul` Drawer library, which is more ergonomic on touch / WebView.
 *
 * API mirrors Select: `<MobileSelect value onValueChange placeholder>`
 * with `<MobileSelectItem value="...">label</MobileSelectItem>` children
 * (MobileSelectItem is an alias for the Radix SelectItem, so desktop renders
 *  receive proper SelectItem elements).
 */
export function MobileSelect({ value, onValueChange, placeholder, children, className, disabled }) {
  const isMobile = useIsMobile();

  if (!isMobile) {
  return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    );
  }

  const items = React.Children.toArray(children).filter(Boolean);
  const selected = items.find((c) => c?.props?.value === value);
  const selectedLabel = selected?.props?.children;

  return (
    <MobileSheet
      value={value}
      onValueChange={onValueChange}
      items={items}
      disabled={disabled}
      className={className}
      selectedLabel={selectedLabel}
      placeholder={placeholder}
    />
  );
}

function MobileSheet({ value, onValueChange, items, disabled, className, selectedLabel, placeholder }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
        >
          <span className={cn(!selectedLabel && "text-muted-foreground")}>{selectedLabel || placeholder}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border rounded-t-2xl outline-none will-change-transform">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
          <div className="max-h-[72vh] overflow-y-auto overscroll-contain p-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] space-y-1">
            {items.map((item) => {
              const v = item.props?.value;
              const label = item.props?.children;
              const itemDisabled = item.props?.disabled;
              const itemCls = item.props?.className;
              const active = v === value;
              return (
                <button
                  key={v}
                  type="button"
                  disabled={itemDisabled}
                  onClick={() => { onValueChange?.(v); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-start transition-colors",
                    active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/60",
                    itemDisabled && "opacity-50 pointer-events-none"
                  )}
                >
                  <span className={itemCls}>{label}</span>
                  {active && <Check className="h-4 w-4 text-violet-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const MobileSelectItem = SelectItem;