import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/account');
    }

    redirect('/auth/signin');
}
