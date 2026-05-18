'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ShareButton } from '@/components/ui/ShareButton';
import { Server, Lock, Mail, Activity, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create a supabase client for the browser
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

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30" dir="rtl">
      
      {/* القسم الأيمن (النموذج) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10 bg-white dark:bg-slate-900 shadow-[20px_0_40px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_60px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 transform rotate-3 transition-transform hover:rotate-6">
              <Server className="w-8 h-8 text-white -rotate-3" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-widest font-mono">
              IT Information
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-bold">
              {isLogin ? 'نظام الإدارة وتأمين بيانات السيرفرات' : 'أدخل بياناتك لإنشاء حساب إداري جديد'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-4 rounded-sm mb-6 text-xs font-bold border border-red-200 dark:border-red-900/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 p-4 rounded-sm mb-6 text-xs font-bold border border-green-200 dark:border-green-900/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 dark:text-slate-300">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm font-mono text-gray-900 dark:text-slate-100 text-left"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 dark:text-slate-300">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-sm font-mono text-gray-900 dark:text-slate-100 tracking-widest text-left"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-sm transition-all flex justify-center items-center shadow-md shadow-indigo-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors"
            >
              {isLogin ? 'هل تود إنشاء حساب مشرف جديد؟' : 'لديك حساب بالفعل؟ العودة لتسجيل الدخول'}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">أو شارك التطبيق</span>
              <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
            </div>

            <ShareButton floating={false} className="w-full flex justify-center py-2.5 rounded-sm border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 text-xs font-bold transition-all text-gray-600 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* القسم الأيسر (الصورة والخلفية) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Image Setup */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/it-bg.png" 
            alt="IT Background" 
            fill 
            className="object-cover opacity-50 mix-blend-overlay object-center"
            priority
          />
          {/* Gradients to blend image into the theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-900/80 to-slate-950/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        </div>
        
        {/* Floating Content */}
        <div className="relative z-10 text-center text-white px-12 max-w-xl animate-in fade-in zoom-in-95 duration-1000 delay-150">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/10 shadow-2xl ring-1 ring-white/20">
            <Activity className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="text-3xl font-black mb-5 leading-tight text-white drop-shadow-lg">
            إدارة البنية التحتية بذكاء وأمان
          </h2>
          <p className="text-sm text-indigo-100/80 leading-relaxed font-medium mb-10">
            نظام متكامل صُمم لتسهيل إدارة السيرفرات والفروع، وتتبع الصلاحيات، وحفظ كلمات المرور بشكل مشفر بأعلى المعايير الأمنية.
          </p>

          {/* Decorative stats/badges */}
          <div className="flex items-center justify-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>تشفير متقدم</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Server className="w-4 h-4 text-blue-400" />
              <span>إدارة مركزية</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
