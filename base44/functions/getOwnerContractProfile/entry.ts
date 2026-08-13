import { secrets } from 'base44:runtime';

// يُرجع بيانات الطرف الأول (مالك منصة جدارة) لاستخدامها في صياغة العقد.
// الاسم يُعاد بالعربية دائماً (العقد عربي)، والرقم «إقامة».
export default async function () {
  const raw = secrets.get('OWNER_FULL_NAME') || 'KAMEL ELSHIKH';
  const full_name = /[\u0600-\u06FF]/.test(raw) ? raw : 'كامل إسماعيل';
  // لا نُرجع الإقامة (إحدى عوامل دخول المالك وبيانات حساسة) لطالب مجهول — العقد
  // يُكتفي فيه باسم الممثّل والتوقيع/الختم.
  return Response.json({ full_name });
}