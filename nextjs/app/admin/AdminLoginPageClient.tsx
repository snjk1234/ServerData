'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ShareButton } from '@/components/ui/ShareButton';

export default function AdminLoginPageClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'بيانات الدخول غير صحيحة' : error.message);
        setLoading(false);
      } else {
        router.push('/account');
        router.refresh();
      }
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        if (data?.user?.identities?.length === 0) {
          setError('هذا الحساب موجود بالفعل');
        } else {
          setSuccessMsg('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
          setIsLogin(true);
        }
        setLoading(false);
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/account');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-6" dir="rtl">
      {/* Container - Improved Gray Aesthetic */}
      <div className="max-w-md w-full bg-gray-200 rounded-[2.5rem] shadow-2xl border border-gray-300 relative overflow-hidden">
        
        {/* Title Area - Darker Background as requested */}
        <div className="bg-gray-300 py-8 text-center border-b border-gray-400/30">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          <div className="h-1 w-12 bg-gray-400 mx-auto mt-2 rounded-full opacity-50" />
        </div>

        <div className="p-10 pt-8">
          {error && (
            <div className="bg-red-500/10 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-200/20 text-center animate-in zoom-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 text-green-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-green-200/20 text-center animate-in zoom-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 mr-2 uppercase tracking-widest">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition-all text-sm placeholder-gray-400"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 mr-2 uppercase tracking-widest">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-white transition-all text-sm text-left placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                dir="ltr"
              />
            </div>

            {/* Button - Lightened as requested (from gray-800 to gray-500) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-xl active:scale-[0.97] flex justify-center items-center gap-3"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-sm tracking-wide">{isLogin ? 'Sign In' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-8">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-[11px] text-gray-500 hover:text-black font-black transition-colors uppercase tracking-tight"
            >
              {isLogin ? 'إنشاء حساب جديد ؟' : 'العودة لتسجيل الدخول'}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">أو شارك التطبيق</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <ShareButton floating={false} className="w-full flex justify-center py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-white/40 transition-all text-xs font-bold text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
