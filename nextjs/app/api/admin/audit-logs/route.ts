import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// دالة للتحقق من أن المستخدم الحالي هو مسؤول (Admin)
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'غير مسجل الدخول', status: 401 };
  }

  // جلب بيانات الصلاحيات من جدول users للتأكد من الرول
  const { data: userDetails } = await (supabase as any)
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!userDetails || userDetails.role !== 'admin' || !userDetails.is_active) {
    return { error: 'صلاحيات غير كافية أو الحساب معطل', status: 403 };
  }

  return { user, supabase };
}

// جلب سجل الحركات الأمنية كاملاً ودمج بيانات البريد الإلكتروني للمستخدمين
export async function GET() {
  try {
    const verification = await verifyAdmin();
    if ('error' in verification) {
      return NextResponse.json({ error: verification.error }, { status: verification.status });
    }

    const adminClient = createAdminClient() as any;

    // 1. جلب سجل النشاطات بالكامل
    const { data: logs, error: logsError } = await adminClient
      .from('audit_logs')
      .select(`
        id, action, entity_name, details, created_at, user_id,
        users (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) throw logsError;

    // 2. جلب قائمة المستخدمين من Auth للحصول على إيميلاتهم
    const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();
    if (authError) {
      console.warn('Could not list auth users, showing only names:', authError.message);
    }

    // 3. دمج البريد الإلكتروني مع بيانات السجل
    const mergedLogs = (logs || []).map((log: any) => {
      const authUser = (authUsers || []).find((u: any) => u.id === log.user_id);
      return {
        ...log,
        user_email: authUser?.email || '—'
      };
    });

    return NextResponse.json({ logs: mergedLogs });
  } catch (error: any) {
    console.error('Error fetching audit logs list:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
