'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons';
import { createApiClient } from '@/utils/supabase/api';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '../ui/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthState, StateInfo } from '@/utils/types';
import { Eye, EyeOff } from 'lucide-react';

export function AuthForm({ state }: { state: AuthState }) {
  const supabase = createClient();
  const { toast } = useToast();
  const api = createApiClient(createClient() as any);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authState, setAuthState] = useState(state);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setTimeout(() => setResendTimeout(resendTimeout - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout]);

  // Listen for auth state changes (e.g. email verification in another tab)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Automatically redirect to account on successful sign in
        router.push('/account');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const stateInfo: Record<AuthState, StateInfo> = {
    signup: {
      title: 'Sign Up',
      submitText: 'Sign Up',
      hasEmailField: true,
      hasPasswordField: true,
      hasOAuth: false,
      onSubmit: async () => {
        if (password !== confirmPassword) {
          toast({
            title: 'Password Error',
            description: 'Passwords do not match',
            variant: 'destructive'
          });
          return;
        }
        setLoading(true);
        try {
          const res = await api.passwordSignup({ email, password });

          // Check for duplicate email - Supabase returns user with empty identities array
          if (res.user && res.user.identities && res.user.identities.length === 0) {
            toast({
              title: 'Email Already Registered',
              description:
                'This email is already associated with an account. Please sign in or use a different email.',
              variant: 'destructive',
              duration: 5000
            });
            setLoading(false);
            return;
          }

          // Check if email is already verified (e.g., OAuth or pre-verified)
          if (res.user?.user_metadata?.email_verified) {
            router.refresh();
          } else {
            setAuthState(AuthState.VerifyEmail);
          }
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }
      }
    },
    signin: {
      title: 'Sign In',
      submitText: 'Sign In',
      hasEmailField: true,
      hasPasswordField: true,
      hasOAuth: true,
      onSubmit: async () => {
        setLoading(true);
        try {
          await api.passwordSignin({ email, password });
          router.refresh();
        } catch (e) {
          if (e instanceof Error) {
            let err_message = e.message;
            if (e.message.includes('Email not confirmed')) {
              err_message =
                'Your email is not verified. Please navigate to Sign Up tab and verify your email before proceeding.';
            }
            toast({
              title: 'Auth Error',
              description: err_message,
              variant: 'destructive',
              duration: 3000
            });
          }
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }
      }
    },
    forgot_password: {
      title: 'Reset Password',
      submitText: 'Send Email',
      hasEmailField: true,
      hasPasswordField: false,
      hasOAuth: false,
      onSubmit: async () => {
        setLoading(true);
        try {
          await api.passwordReset(email);
          toast({
            title: 'Email Sent!',
            description: 'Check your email to reset your password'
          });
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    },
    update_password: {
      title: 'Update Password',
      submitText: 'Update Password',
      hasEmailField: false,
      hasPasswordField: true,
      hasOAuth: false,
      onSubmit: async () => {
        setLoading(true);
        try {
          await api.passwordUpdate(password);
          toast({
            title: 'Password Updated',
            description: 'Redirecting to the home page...'
          });
          setTimeout(() => router.replace('/'), 3000);
          router.replace('/');
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    },
    verify_email: {
      title: 'Verify Your Email',
      description:
        "We've sent you a verification email. Please check your inbox and click the verification link to continue. If you don't see the email, check your spam folder or click below to resend.",
      submitText:
        resendTimeout > 0
          ? `Resend in ${resendTimeout}s`
          : 'Resend Verification Email',
      hasEmailField: false,
      hasPasswordField: false,
      hasOAuth: false,
      onSubmit: async () => {
        if (resendTimeout > 0) return;
        setLoading(true);
        try {
          await api.resendEmailVerification(email);
          setResendTimeout(60);
          toast({
            title: 'Verification Email Sent',
            description: 'Please check your inbox for the verification link.'
          });
        } catch (e) {
          if (e instanceof Error) {
            toast({
              title: 'Auth Error',
              description: e.message,
              variant: 'destructive'
            });
          }
        }
        setLoading(false);
      }
    }
  };

  // add toast if error
  useEffect(() => {
    type ToastVariant = 'destructive' | 'default' | undefined | null;
    const title = searchParams.get('toast_title') || undefined;
    const description = searchParams.get('toast_description') || undefined;
    const variant = searchParams.get('toast_variant') as ToastVariant;
    if (title || description) {
      setTimeout(
        () =>
          toast({
            title,
            description,
            variant
          }),
        100
      );
    }
  }, []);

  const currState = stateInfo[authState];
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="grid gap-3.5">
        {currState.description && (
          <p className="text-sm text-indigo-200/90 mb-4 text-center leading-relaxed font-bold">{currState.description}</p>
        )}
        <div className="grid gap-3">
          {currState.hasEmailField && (
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-xs font-extrabold text-white/90">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-4 pr-4 py-2 bg-transparent border-0 border-b border-white/30 rounded-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all text-sm font-mono text-white placeholder:text-white/30 text-left shadow-none"
                dir="ltr"
                required
              />
            </div>
          )}
          {currState.hasPasswordField && (
            <div className="grid gap-1">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-xs font-extrabold text-white/90">كلمة المرور</Label>
                {authState === 'signin' && (
                  <Link
                    href="#"
                    onClick={() => setAuthState(AuthState.ForgotPassword)}
                    className="ml-auto inline-block text-[11px] font-bold text-indigo-300 hover:text-indigo-100 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent border-0 border-b border-white/30 rounded-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all text-sm font-mono text-white placeholder:text-white/30 tracking-widest text-left shadow-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (authState === 'signup') {
                      setShowConfirmPassword(!showPassword);
                    }
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {authState === 'signup' && (
            <div className="grid gap-1">
              <Label htmlFor="confirmPassword" className="text-xs font-extrabold text-white/90">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={loading}
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent border-0 border-b border-white/30 rounded-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all text-sm font-mono text-white placeholder:text-white/30 tracking-widest text-left shadow-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showConfirmPassword);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              className="w-[75%] h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-0 px-4 text-sm rounded-lg transition-all flex justify-center items-center shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] active:scale-[0.98]"
              onClick={currState.onSubmit}
              disabled={loading}
            >
              {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  currState.submitText === 'Sign In' ? 'تسجيل الدخول' :
                  currState.submitText === 'Sign Up' ? 'إنشاء حساب' :
                  currState.submitText === 'Send Email' ? 'إرسال رابط' :
                  currState.submitText === 'Update Password' ? 'تحديث كلمة المرور' : currState.submitText
                )}
            </Button>
          </div>
          {authState === 'signin' && (
            <div className="text-center text-xs font-bold text-white/70 mt-4">
              ليس لديك حساب؟{' '}
              <Link
                href="#"
                className="text-indigo-300 hover:text-white hover:underline transition-all"
                onClick={() => setAuthState(AuthState.Signup)}
              >
                قم بإنشاء حساب جديد
              </Link>
            </div>
          )}
          {authState === 'signup' && (
            <div className="text-center text-xs font-bold text-white/70 mt-4">
              لديك حساب بالفعل؟{' '}
              <Link
                href="#"
                className="text-indigo-300 hover:text-white hover:underline transition-all"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                قم بتسجيل الدخول
              </Link>
            </div>
          )}
          {authState === 'forgot_password' && (
            <div className="text-center text-xs font-bold text-white/70 mt-4">
              تذكرت كلمة المرور؟{' '}
              <Link
                href="#"
                className="text-indigo-300 hover:text-white hover:underline transition-all"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                قم بتسجيل الدخول
              </Link>
            </div>
          )}
          {authState === 'verify_email' && (
            <div className="space-y-4">
              <div className="text-center text-xs font-bold text-white/70">
                تم إرسال الرابط إلى: <span className="text-white bg-white/10 px-2 py-1 rounded-full font-mono">{email}</span>
              </div>
              <div className="text-center text-xs font-bold text-white/70 mt-4">
                هل قمت بالتفعيل بالفعل؟{' '}
                <Link
                  href="#"
                  className="text-indigo-300 hover:text-white hover:underline transition-all"
                  onClick={() => setAuthState(AuthState.Signin)}
                >
                  قم بتسجيل الدخول
                </Link>
              </div>
            </div>
          )}
          {currState.hasOAuth && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20"></span>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-transparent px-3 text-white/50">
                    أو الدخول باستخدام
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white rounded-lg hover:bg-white/10 hover:text-white transition-all text-xs font-bold h-11 backdrop-blur-sm"
                  onClick={() => api.oauthSignin('google')}
                >
                  <SiGoogle className="h-4 w-4 ml-2" /> جوجل
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white rounded-lg hover:bg-white/10 hover:text-white transition-all text-xs font-bold h-11 backdrop-blur-sm"
                  onClick={() => api.oauthSignin('github')}
                >
                  <SiGithub className="h-4 w-4 ml-2" /> جيتهاب
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
