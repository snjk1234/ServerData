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

// 1. جلب قائمة المستخدمين كاملة للمسؤول
export async function GET() {
  try {
    const verification = await verifyAdmin();
    if ('error' in verification) {
      return NextResponse.json({ error: verification.error }, { status: verification.status });
    }

    const adminClient = createAdminClient() as any;

    // جلب قائمة الحسابات من Auth (للحصول على البريد الإلكتروني وتواريخ الدخول)
    const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();
    if (authError) throw authError;

    // جلب بيانات الحسابات الإضافية من جدول public.users
    const { data: publicUsers, error: publicError } = await adminClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (publicError) throw publicError;

    // دمج البيانات (الاعتماد على authUsers كمصدر رئيسي)
    const mergedUsers = (authUsers || []).map((a: any) => {
      const p = (publicUsers || []).find((u: any) => u.id === a.id) || {};
      return {
        id: a.id,
        full_name: p.full_name || a.user_metadata?.full_name || 'مستخدم سيرفر',
        avatar_url: p.avatar_url || a.user_metadata?.avatar_url,
        email: a.email || '—',
        role: p.role || a.user_metadata?.role || 'user',
        is_active: p.is_active !== false,
        is_trusted: p.is_trusted === true,
        allowed_categories: p.allowed_categories || ['الكل', 'فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'],
        last_seen: p.last_seen || a.last_sign_in_at || new Date().toISOString(),
        created_at: p.created_at || a.created_at || new Date().toISOString(),
        last_sign_in_at: a.last_sign_in_at || null,
      };
    });

    return NextResponse.json({ users: mergedUsers });
  } catch (error: any) {
    console.error('Error fetching admin users list:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}

// 2. تحديث صلاحيات وحالة حساب المستخدم
export async function POST(request: Request) {
  try {
    const verification = await verifyAdmin();
    if ('error' in verification) {
      return NextResponse.json({ error: verification.error }, { status: verification.status });
    }

    const { userId, role, is_active, is_trusted, allowed_categories } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const adminClient = createAdminClient() as any;

    // تحديث البيانات في جدول public.users
    const { error: profileError } = await adminClient
      .from('users')
      .update({
        role,
        is_active,
        is_trusted,
        allowed_categories,
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // تحديث الـ user_metadata الخاصة بـ Auth لضمان اتساق الصلاحيات في التوكن JWT
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { role }
      }
    );
    if (authError) {
      console.warn('Could not update auth user metadata, but profile was updated:', authError.message);
    }

    return NextResponse.json({ success: true, message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح' });
  } catch (error: any) {
    console.error('Error updating user privileges:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تحديث الصلاحيات' }, { status: 500 });
  }
}

// 3. حذف المستخدم نهائياً
export async function DELETE(request: Request) {
  try {
    const verification = await verifyAdmin();
    if ('error' in verification) {
      return NextResponse.json({ error: verification.error }, { status: verification.status });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // منع المدير من حذف نفسه
    if (userId === verification.user.id) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك الحالي بنفسك' }, { status: 400 });
    }

    const adminClient = createAdminClient() as any;

    // حذف السجلات التابعة إن وجدت أولاً (مثل الاشتراكات والعملاء إذا وجدت)
    await adminClient.from('customers').delete().eq('id', userId);
    await adminClient.from('subscriptions').delete().eq('user_id', userId);
    await adminClient.from('checkout_sessions').delete().eq('user_id', userId);

    // حذف الملف الشخصي للمستخدم في public.users
    const { error: profileDeleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId);
    if (profileDeleteError) throw profileDeleteError;

    // حذف الحساب من نظام مصادقة Supabase Auth بالكامل
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (authDeleteError) throw authDeleteError;

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح من النظام' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حذف المستخدم' }, { status: 500 });
  }
}
