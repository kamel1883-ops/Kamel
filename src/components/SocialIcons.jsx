import React from "react";

// أيقونات مخصّصة لمنصات لا توفّرها مكتبة lucide-react (تيك توك والسناب شات).
// كل مكوّن يقبل size و className و style ليتوافق مع باقي أيقونات المنصة.

export function TiktokIcon({ size = 18, className = "", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.44a2.6 2.6 0 0 1-2.6 2.6 2.6 2.6 0 1 1 1.5-4.74V10.3a5.7 5.7 0 0 0-1.5-.2 5.69 5.69 0 1 0 5.69 5.69V8.86a7.35 7.35 0 0 0 4.3 1.38V7.15a4.28 4.28 0 0 1-2.74-1.33z" />
    </svg>
  );
}

export function SnapchatIcon({ size = 18, className = "", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 2c2.5 0 4.3 1.9 4.3 4.3 0 .5 0 1-.1 1.5.4.2.9.3 1.3.3.6 0 1.1-.3 1.4-.3.4 0 .7.5.4.9-.3.4-1.4.8-2.4 1.1-.2.5.6 2 2 2.6.3.1.4.5.2.8-.4.6-1.4.6-1.9.6-.1.3-.2.7-.5.9-.4.2-.9 0-1.4-.1-.5 0-1.2.2-2 .9-.7.6-1.3.9-1.9.9s-1.2-.3-1.9-.9c-.8-.7-1.5-.9-2-.9-.5.1-1 .3-1.4.1-.3-.2-.4-.6-.5-.9-.5 0-1.5 0-1.9-.6-.2-.3-.1-.7.2-.8 1.4-.6 2.2-2.1 2-2.6-1-.3-2.1-.7-2.4-1.1-.3-.4 0-.9.4-.9.3 0 .8.3 1.4.3.4 0 .9-.1 1.3-.3-.1-.5-.1-1-.1-1.5C7.7 3.9 9.5 2 12 2z" />
    </svg>
  );
}