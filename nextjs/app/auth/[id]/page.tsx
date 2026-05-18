import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/misc/AuthForm';
import { AuthState } from '@/utils/types';

export default async function SignIn(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ disable_button: boolean }>;
  }
) {
  const params = await props.params;
  if (!Object.values(AuthState).includes(params.id as AuthState)) {
    redirect('/auth');
  }
  const currState = params.id as AuthState;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && currState !== 'update_password') {
    return redirect('/');
  } else if (!user && currState === 'update_password') {
    return redirect('/auth');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-6" dir="rtl">
      {/* Container - Simplified Gray Aesthetic */}
      <div className="max-w-md w-full bg-gray-200 rounded-[2.5rem] shadow-2xl border border-gray-300 relative overflow-hidden">
        
        {/* Title Area - Darker Background as requested */}
        <div className="bg-gray-300 py-8 text-center border-b border-gray-400/30">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
             {currState === AuthState.Signin ? 'Sign In' : currState === AuthState.Signup ? 'Sign Up' : 'Reset'}
          </h1>
          <div className="h-1 w-12 bg-gray-400 mx-auto mt-2 rounded-full opacity-50" />
        </div>

        <div className="p-10 pt-8 relative">
          <AuthForm state={currState} />
        </div>
      </div>
    </div>
  );
}
