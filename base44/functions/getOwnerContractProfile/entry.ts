import { secrets } from 'base44:runtime';

// يُرجع بيانات الطرف الأول (مالك جدارة) لاستخدامها في صياغة العقد:
// الاسم الكامل ورقم الهوية الوطنية (مخزّنة كأسرار). العقد رسمي وموقّع باسم المؤسسة.
export default async function () {
  const full_name = secrets.get('OWNER_FULL_NAME') || 'كامل إسماعيل';
  const national_id = secrets.get('OWNER_IQAMA') || '';
  return Response.json({ full_name, national_id });
}