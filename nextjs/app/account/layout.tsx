import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';
import AdminHeader from '@/components/ui/AdminHeader';

export default async function AccountLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  // If no user, redirect to login
  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <AdminHeader user={user} />
      {children}
    </div>
  );
}
