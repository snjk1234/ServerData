import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/misc/AuthForm';
import { AuthState } from '@/utils/types';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import { ModeToggle } from '@/components/landing/mode-toggle';

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
    <div className="min-h-screen w-full relative flex font-sans selection:bg-indigo-500/30" dir="rtl">
      
      {/* Mode Toggle */}
      <div className="absolute top-6 left-6 z-50 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-white">
        <ModeToggle />
      </div>
      
      {/* الخلفية تملأ الشاشة بالكامل */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/it-bg.png" 
          alt="IT Background" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        {/* طبقة تظليل لجعل النصوص واضحة */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] bg-gradient-to-br from-indigo-950/80 via-slate-950/60 to-black/90" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 p-6 md:p-12 gap-16 lg:gap-32">
        
        {/* القسم الأيمن (النموذج الشفاف تماماً) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center">
          <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-transparent border-none shadow-none">
            
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-white tracking-widest font-mono drop-shadow-md">
                IT Information
              </h1>
              <p className="text-xs text-indigo-200/80 font-bold">
                {currState === AuthState.Signin ? 'نظام الإدارة وتأمين بيانات السيرفرات' : 
                 currState === AuthState.Signup ? 'أدخل بياناتك لإنشاء حساب إداري جديد' : 
                 'استعادة أو إدارة كلمة المرور الخاصة بك'}
              </p>
            </div>

            <AuthForm state={currState} />

          </div>
        </div>

        {/* القسم الأيسر (النص بتوسيط كامل) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center text-center text-white animate-in fade-in zoom-in-95 duration-1000 delay-150">
          <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight text-white drop-shadow-2xl">
            إدارة البنية التحتية بذكاء وأمان
          </h2>
          <p className="text-base lg:text-lg text-indigo-100/90 leading-relaxed font-medium mb-12 max-w-md mx-auto">
            نظام متكامل صُمم لتسهيل إدارة السيرفرات والفروع، وتتبع الصلاحيات، وحفظ كلمات المرور بشكل مشفر بأعلى المعايير الأمنية.
          </p>

          {/* Decorative stats/badges */}
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span>تشفير متقدم</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
              <LockKeyhole className="w-5 h-5 text-blue-400" />
              <span>أمان عالي</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
