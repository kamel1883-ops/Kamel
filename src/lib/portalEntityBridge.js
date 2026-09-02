// جسر بيانات بوابة الموظف المُفوّض:
// يسمح بتشغيل صفحات لوحة الشركات نفسها داخل بوابة الموظف — بدل بناء نسخ مصغّرة لكل قسم.
// عند تفعيله، تُوجَّه كل نداءات base44.entities إلى وصلة portalData (entity_op) التي تتحقق
// من صلاحية القسم على الخادم ثم تنفّذ العملية، وتُحقن توثيق «أُعدّت بواسطة» تلقائياً.
let state = null;

const OPS = ["list", "filter", "get", "create", "update", "delete", "bulkCreate", "bulkUpdate", "updateMany", "deleteMany"];

const makeEntity = (entity) => {
  const api = {};
  for (const op of OPS) {
    api[op] = async (...args) => {
      const res = await state.invoke("portalData", {
        token: state.session.token,
        employee_id: state.session.employee_id,
        action: "entity_op",
        entity, op, args,
      });
      const data = res?.data || res;
      if (!data?.ok) throw new Error(data?.error || "portal_entity_error");
      return data.result;
    };
  }
  api.schema = async () => ({ type: "object", properties: {} });
  api.subscribe = () => () => {};
  return api;
};

// يُفعّل الجسر لجلسة موظف مُفوّض. invoke = base44.functions.invoke
export const enablePortalEntities = (session, invoke, employee) => {
  const cache = {};
  state = {
    session, invoke, employee,
    entities: new Proxy({}, {
      get: (_t, name) => {
        const key = String(name);
        if (!cache[key]) cache[key] = makeEntity(key);
        return cache[key];
      },
    }),
  };
};

export const disablePortalEntities = () => { state = null; };

export const getPortalEntities = () => state?.entities || null;

// شاشات لوحة الشركات تقرأ المستخدم الحالي — يُقدَّم لها الموظف المُفوّض بصلاحية مسؤول القسم.
export const getPortalAuth = () => {
  if (!state) return null;
  const e = state.employee || {};
  const me = {
    id: e.id || state.session.employee_id,
    full_name: e.full_name || "", email: e.email || "", role: "admin",
    _portal_delegated: true,
  };
  return {
    me: async () => me,
    updateMe: async () => me,
    isAuthenticated: async () => true,
    logout: async () => {},
    redirectToLogin: () => {},
  };
};