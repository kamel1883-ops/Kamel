import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// يُرجع الرابط فقط إذا كان http/https — يمنع XSS عبر javascript:/data: في حقول الكيانات المخزّنة
export const safeHref = (url) =>
  typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? url.trim() : "#";