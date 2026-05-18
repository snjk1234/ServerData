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
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 px-4 py-2 shadow-sm h-[52px]">
        <div className="w-full mx-auto flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
              DB
            </div>
            <span className="text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              لوحة إدارة السيرفرات
            </span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-150 dark:border-slate-850 sticky top-0 z-40 px-4 py-2 shadow-sm transition-colors duration-300" dir="rtl">
      <div className="w-full mx-auto flex justify-between items-center">
        {/* Logo / System Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            DB
          </div>
          <span className="text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            لوحة إدارة السيرفرات
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-all shadow-sm relative border border-gray-200 dark:border-slate-700/50"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-sm flex items-center justify-center font-bold animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-sm shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">الإشعارات</h4>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        title="تحديد الكل كمقروء"
                      >
                        <Check className="w-3 h-3" />
                        الكل مقروء
                      </button>
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
                        title="حذف الكل"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500 dark:text-slate-400">
                      لا توجد إشعارات جديدة
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => toggleRead(notif.id)}
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col gap-0.5 cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-xs text-right ${!notif.read ? 'font-bold text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                              {notif.text}
                            </p>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-sm bg-blue-600 dark:bg-blue-400 mt-1 flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 text-right">{notif.time}</span>
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
            className="p-1.5 rounded-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-all shadow-sm border border-gray-200 dark:border-slate-700/50"
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>
    </header>
  );
}
