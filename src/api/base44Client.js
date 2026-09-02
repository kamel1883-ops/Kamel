import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { getPortalEntities, getPortalAuth } from '@/lib/portalEntityBridge';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
const client = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// عندما يفتح موظف مُفوّض قسماً إدارياً من بوابته، تُوجَّه نداءات البيانات والمستخدم الحالي
// إلى جسر البوابة (portalData) بدل مسار Base44 المحمي — فتعمل شاشات لوحة الشركات كما هي.
export const base44 = new Proxy(client, {
  get(target, prop) {
    if (prop === 'entities') return getPortalEntities() || target.entities;
    if (prop === 'auth') return getPortalAuth() || target.auth;
    return target[prop];
  },
});