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
    <div className="mx-auto w-full max-w-sm">
      <div className="grid gap-4">
        {currState.description && (
          <p className="text-sm text-gray-500 mb-4 text-center">{currState.description}</p>
        )}
        <div className="grid gap-4">
          {currState.hasEmailField && (
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-gray-100 border-gray-300 rounded-2xl focus:ring-gray-400"
                required
              />
            </div>
          )}
          {currState.hasPasswordField && (
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Password</Label>
                {authState === 'signin' && (
                  <Link
                    href="#"
                    onClick={() => setAuthState(AuthState.ForgotPassword)}
                    className="ml-auto inline-block text-[10px] font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    Forgot?
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
                  className="pr-10 bg-gray-100 border-gray-300 rounded-2xl focus:ring-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (authState === 'signup') {
                      setShowConfirmPassword(!showPassword);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          {authState === 'signup' && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={loading}
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 bg-gray-100 border-gray-300 rounded-2xl focus:ring-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showConfirmPassword);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-black py-6 rounded-2xl transition-all shadow-xl active:scale-[0.97]"
            onClick={currState.onSubmit}
            disabled={loading}
          >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                currState.submitText
              )}
          </Button>
          {authState === 'signin' && (
            <div className="text-center text-[11px] font-bold text-gray-400 mt-4 uppercase">
              Don&apos;t have an account?{' '}
              <Link
                href="#"
                className="text-gray-800 hover:underline"
                onClick={() => setAuthState(AuthState.Signup)}
              >
                Sign up
              </Link>
            </div>
          )}
          {authState === 'signup' && (
            <div className="text-center text-[11px] font-bold text-gray-400 mt-4 uppercase">
              Already have an account?{' '}
              <Link
                href="#"
                className="text-gray-800 hover:underline"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                Sign in
              </Link>
            </div>
          )}
          {authState === 'forgot_password' && (
            <div className="text-center text-[11px] font-bold text-gray-400 mt-4 uppercase">
              Know your password?{' '}
              <Link
                href="#"
                className="text-gray-800 hover:underline"
                onClick={() => setAuthState(AuthState.Signin)}
              >
                Sign in
              </Link>
            </div>
          )}
          {authState === 'verify_email' && (
            <div className="space-y-4">
              <div className="text-center text-xs font-bold text-gray-500">
                Email sent to: <span className="text-gray-800">{email}</span>
              </div>
              <div className="text-center text-[11px] font-bold text-gray-400 uppercase">
                Already verified?{' '}
                <Link
                  href="#"
                  className="text-gray-800 hover:underline"
                  onClick={() => setAuthState(AuthState.Signin)}
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
          {currState.hasOAuth && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                  <span className="bg-gray-200 px-3 text-gray-400">
                    Social Login
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-white/50 border-gray-300 rounded-2xl hover:bg-white transition-all text-xs font-bold"
                  onClick={() => api.oauthSignin('google')}
                >
                  <SiGoogle className="h-3 w-3 mr-2" /> Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/50 border-gray-300 rounded-2xl hover:bg-white transition-all text-xs font-bold"
                  onClick={() => api.oauthSignin('github')}
                >
                  <SiGithub className="h-3 w-3 mr-2" /> Github
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
