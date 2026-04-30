import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';
import AdminHeader from '@/components/ui/AdminHeader';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  // إذا لم يكن المستخدم مسجلاً الدخول، يتم توجيهه إلى صفحة الدخول
  if (!user) {
    return redirect('/admin/login');
  }

  // هنا يمكننا أيضاً إضافة شرط للتحقق من أن المستخدم لديه صلاحية "admin"
  // مثال (يُفترض أن يتم تخزين الـ role في user_metadata أو جدول منفصل):
  // const { data: roleData } = await supabase.from('users').select('role').eq('id', user.id).single();
  // if (roleData?.role !== 'admin') { return redirect('/'); }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <AdminHeader user={user} />
      {children}
    </div>
  );
}

