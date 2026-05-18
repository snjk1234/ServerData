import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AdminHeader from '@/components/ui/AdminHeader';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase as any);

  // We rely on proxy.ts for route protection. 
  // If there's a user, we show the header.
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {user && <AdminHeader user={user} />}
      {children}
    </div>
  );
}
