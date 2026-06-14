'use client';

import React from 'react';
import { Users, RefreshCw, Trash2 } from 'lucide-react';

interface UserManagementTableProps {
  adminUsers: any[];
  isLoadingUsers: boolean;
  fetchAdminUsers: () => Promise<void>;
  handleToggleCategory: (user: any, category: string) => Promise<void>;
  updateUserStatus: (user: any, updates: any) => Promise<void>;
  handleUserDeleteClick: (user: any) => void;
  currentUser: any;
}

export default function UserManagementTable({
  adminUsers,
  isLoadingUsers,
  fetchAdminUsers,
  handleToggleCategory,
  updateUserStatus,
  handleUserDeleteClick,
  currentUser
}: UserManagementTableProps) {
  return (
    <div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">
      {/* شريط عنوان إدارة المستخدمين */}
      <div className="w-fit max-w-full bg-white dark:bg-slate-800 p-2 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-3 flex flex-row flex-nowrap gap-3 items-center justify-start overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex items-center gap-2 shrink-0 h-[34px] px-2 border-l-2 border-emerald-500">
          <Users className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">إدارة المستخدمين وصلاحيات الوصول</span>
        </div>
        <button
          onClick={fetchAdminUsers}
          className="h-[34px] px-2.5 rounded-sm text-gray-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-gray-50 hover:bg-emerald-50 dark:bg-slate-900/50 dark:hover:bg-emerald-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0 gap-1.5"
          title="تحديث القائمة"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold whitespace-nowrap">تحديث</span>
        </button>
      </div>

      {/* جدول المستخدمين والبيانات */}
      <div className="overflow-auto max-h-[680px] bg-white dark:bg-slate-800 shadow-sm rounded-sm border border-gray-200 dark:border-slate-700">
        <table className="min-w-full text-right border-collapse">
          <thead className="sticky top-0 bg-gray-200 dark:bg-slate-900 border-b border-gray-350 dark:border-slate-700 z-10 shadow-sm text-gray-800 dark:text-slate-100">
            <tr>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">المستخدم</th>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">تاريخ الانضمام</th>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">الحالة والنشاط</th>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">صلاحيات رؤية التبويبات</th>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 text-center">التحكم</th>
              <th className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 text-center">خيارات إضافية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {isLoadingUsers ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-slate-450">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="font-bold">جاري تحميل قائمة الحسابات...</span>
                  </div>
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  لا يوجد مستخدمون مسجلون حالياً
                </td>
              </tr>
            ) : (
              adminUsers.map(user => {
                const isOnline = Date.now() - new Date(user.last_seen).getTime() < 300000;
                const formattedJoinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '—';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* بطاقة المستخدم الشخصية */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold shadow-sm shrink-0 uppercase">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            user.full_name?.substring(0, 2) || user.email?.substring(0, 2)
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                            {user.full_name || 'مستخدم سيرفر'}
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.25 bg-amber-100 text-amber-850 dark:bg-amber-955/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-sm text-[9px] font-black">
                                مسؤول
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-450 truncate font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* تاريخ الانضمام */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 font-semibold text-gray-650 dark:text-slate-350">
                      {formattedJoinDate}
                    </td>

                    {/* حالة النشاط */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                      <div className="flex flex-col gap-1">
                        {isOnline ? (
                          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            نشط الآن
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                            خارج الخدمة ({new Date(user.last_seen).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* صلاحيات الأقسام التفاعلية */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                      <div className="flex flex-wrap gap-1 max-w-xs justify-start">
                        {['الكل', 'فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'].map(catId => {
                          const isAllowed = user.allowed_categories?.includes(catId);
                          return (
                            <button
                              key={catId}
                              onClick={() => handleToggleCategory(user, catId)}
                              className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                                isAllowed
                                  ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-650 dark:text-indigo-300'
                                  : 'bg-gray-50 border-gray-200 dark:bg-slate-900/20 dark:border-slate-800 text-gray-400 dark:text-slate-600 line-through'
                              }`}
                              title={`${isAllowed ? 'إلغاء صلاحية' : 'إعطاء صلاحية'} ${catId}`}
                            >
                              {catId}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* التحكم في الحظر والموثوقية */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateUserStatus(user, { is_active: !user.is_active })}
                          className={`px-2.5 py-1 rounded-sm text-xs font-extrabold transition-all cursor-pointer ${
                            user.is_active
                              ? 'bg-green-100 hover:bg-green-200 border border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-400'
                              : 'bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400'
                          }`}
                        >
                          {user.is_active ? 'نشط' : 'محظور'}
                        </button>

                        <button
                          onClick={() => updateUserStatus(user, { is_trusted: !user.is_trusted })}
                          className={`px-2.5 py-1 rounded-sm text-xs font-extrabold transition-all cursor-pointer ${
                            user.is_trusted
                              ? 'bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 dark:bg-amber-955/30 dark:border-amber-900/40 dark:text-amber-400'
                              : 'bg-gray-150 hover:bg-gray-200 border border-gray-200 text-gray-650 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-450'
                          }`}
                        >
                          {user.is_trusted ? 'موثوق' : 'عادي'}
                        </button>
                      </div>
                    </td>

                    {/* الخيارات الإضافية مثل حذف الأعضاء والترقية */}
                    <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => updateUserStatus(user, { role: user.role === 'admin' ? 'user' : 'admin' })}
                          className="text-xs bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 border border-gray-200 dark:border-slate-750 px-2 py-1 rounded-sm font-bold transition-colors cursor-pointer text-gray-750 dark:text-slate-350"
                          title={user.role === 'admin' ? 'تخفيض لمستخدم عادي' : 'ترقية لمسؤول'}
                        >
                          {user.role === 'admin' ? 'إلغاء المسؤول' : 'جعله مسؤول'}
                        </button>
                        
                        <button
                          onClick={() => handleUserDeleteClick(user)}
                          disabled={user.id === currentUser?.id}
                          className={`p-1 rounded-sm border transition-colors ${
                            user.id === currentUser?.id
                              ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50'
                              : 'border-red-100 bg-red-50 text-red-650 hover:bg-red-100 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400 cursor-pointer'
                          }`}
                          title={user.id === currentUser?.id ? 'لا يمكنك حذف حسابك بنفسك' : 'حذف العضو نهائياً'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
