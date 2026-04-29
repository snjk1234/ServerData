'use client';

import { useTheme } from 'next-themes';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, Bell, Check, Trash2 } from 'lucide-react';

export default function AdminHeader({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Dummy notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'تم تسجيل دخول مشرف جديد', time: 'منذ 5 دقائق', read: false },
    { id: 2, text: 'تم تحديث بيانات سيرفر الفرع 001', time: 'منذ ساعتين', read: true },
    { id: 3, text: 'هناك سيرفر متوقف عن العمل', time: 'منذ يوم', read: false }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) {
    return (
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 px-6 py-4 shadow-sm h-[73px]">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 px-6 py-4 shadow-sm transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">لوحة تحكم المدير</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-all shadow-sm relative border border-transparent dark:border-slate-700/50"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">الإشعارات</h4>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        title="تحديد الكل كمقروء"
                      >
                        <Check className="w-3.5 h-3.5" />
                        الكل مقروء
                      </button>
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                        title="حذف الكل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                      لا توجد إشعارات جديدة
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => toggleRead(notif.id)}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col gap-1 cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm text-right ${!notif.read ? 'font-semibold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                              {notif.text}
                            </p>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 flex-shrink-0" />}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-slate-500 text-right">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-all shadow-sm border border-transparent dark:border-slate-700/50"
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-all shadow-sm flex items-center gap-2 border border-red-100 dark:border-red-900/50 font-semibold"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
