'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Settings, Shield, Moon, Sun, ArrowRight, User, Key, Save, AlertCircle, CheckCircle2, Download, Database } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'كلمات المرور غير متطابقة', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'تم تحديث كلمة المرور بنجاح', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleExportData = async () => {
    const { data } = await supabase.from('server_data').select('*');
    if (data) {
      const headers = ['ID', 'رقم الفرع', 'اسم الفرع AR', 'اسم الفرع EN', 'اسم اليوزر', 'الحالة', 'تاريخ الانشاء'];
      const rows = data.map(r => [
        r.id, r.رقم_الفرع, r.اسم_الفرع_ar, r.اسم_الفرع_en, r.اسم_اليوزر, r.حالة_اليوزر, r.تاريخ_الانشاء
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "servers_backup.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-gray-100 dark:bg-slate-900" />;

  return (
    <div className="p-3 font-sans bg-gray-100 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300 relative" dir="rtl">
      <div className="w-full md:max-w-[850px] mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl font-extrabold font-sans text-indigo-800 dark:text-amber-300">
              الإعدادات
            </h1>
          </div>
          <button onClick={() => router.back()} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-slate-600 shadow-sm">
            <ArrowRight className="w-3.5 h-3.5" />
            عودة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Settings Column */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Account Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/20 flex items-center gap-1.5">
                 <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                 <h2 className="text-sm font-extrabold text-gray-800 dark:text-slate-200">إعدادات الحساب والأمان</h2>
              </div>
              
              <div className="p-4 space-y-5">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-sm border border-gray-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400">البريد الإلكتروني الحالي</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100" dir="ltr">{userEmail || 'جاري التحميل...'}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h3 className="text-xs font-extrabold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-gray-100 dark:border-slate-700 pb-2">
                    <Key className="w-3.5 h-3.5" /> تغيير كلمة مرور المشرف
                  </h3>

                  {message && (
                    <div className={`p-3 rounded-sm text-xs font-bold flex items-center gap-2 border ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {message.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                      <input type="password" required className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" value={newPassword} onChange={e => setNewPassword(e.target.value)} dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                      <input type="password" required className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} dir="ltr" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-sm shadow-sm transition-colors flex items-center gap-2 text-xs">
                      {loading ? <div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-3.5 h-3.5" />}
                      حفظ التغييرات
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/20 flex items-center gap-1.5">
                 <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                 <h2 className="text-sm font-extrabold text-gray-800 dark:text-slate-200">النسخ الاحتياطي للبيانات</h2>
              </div>
              <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">تصدير كافة بيانات السيرفرات</h3>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mt-1">يُنصح بأخذ نسخة احتياطية بشكل دوري بصيغة Excel (CSV).</p>
                </div>
                <button onClick={handleExportData} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded-sm shadow-sm transition-colors flex justify-center items-center gap-2 text-xs">
                  <Download className="w-3.5 h-3.5" />
                  تحميل نسخة احتياطية
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-4">
            
            {/* Appearance */}
            <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/20 flex items-center gap-1.5">
                 <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                 <h2 className="text-sm font-extrabold text-gray-800 dark:text-slate-200">المظهر</h2>
              </div>
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => setTheme('light')}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm border transition-colors ${theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'} dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-xs font-bold">الوضع الفاتح</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm border transition-colors ${theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'} bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-xs font-bold">الوضع الداكن</span>
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 text-center">
                <div className="w-12 h-12 rounded-sm bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md mx-auto mb-3">
                  DB
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">لوحة إدارة السيرفرات</h3>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 font-bold">الإصدار 1.0.0</p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-slate-400 mt-2 border-t border-gray-100 dark:border-slate-700 pt-2 leading-relaxed">
                  تم تطوير النظام لتسهيل إدارة كلمات المرور وتجهيز بيانات السيرفرات.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
