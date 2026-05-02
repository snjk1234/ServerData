import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminLoginPageClient from './AdminLoginPageClient';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, go to the new dashboard location
  if (user) {
    return redirect('/account');
  }

  // If not logged in, show the login form directly at /admin
  return <AdminLoginPageClient />;
}
