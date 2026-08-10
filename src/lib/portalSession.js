// مدير جلسة بوابة الموظف (localStorage) — يعزل البيانات عن نظام Base44
const KEY = "jadara_portal_session";

export const portalSession = {
  save(session) {
    try {
      localStorage.setItem(KEY, JSON.stringify(session));
    } catch {}
  },
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.token || !s.employee_id) return null;
      if (s.expires_at && Date.now() > s.expires_at) {
        localStorage.removeItem(KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};