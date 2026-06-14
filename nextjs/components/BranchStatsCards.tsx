'use client';

import React from 'react';
import { Store, Activity, Sparkles, AlertTriangle, Layers, Users } from 'lucide-react';
import { categories, categoryThemes, renderCategoryIcon } from '@/components/SidebarMenu';

interface BranchStatsCardsProps {
  data: any[];
  totalServers: number;
  activeServers: number;
  activePercent: number;
  openingSoonServers: number;
  openingPercent: number;
  closedTempServers: number;
  closedPermServers: number;
  categoryCountsData: Record<string, number>;
  isLoadingUsers: boolean;
  adminUsers: any[];
  setActiveCategory: (cat: string | null) => void;
}

export default function BranchStatsCards({
  data,
  totalServers,
  activeServers,
  activePercent,
  openingSoonServers,
  openingPercent,
  closedTempServers,
  closedPermServers,
  categoryCountsData,
  isLoadingUsers,
  adminUsers,
  setActiveCategory
}: BranchStatsCardsProps) {
  return (
    <div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">
      {/* شريط عنوان الإحصائيات */}
      <div className="w-fit max-w-full bg-white dark:bg-slate-800 p-2 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-3 flex flex-row flex-nowrap gap-3 items-center justify-start overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex items-center gap-2 shrink-0 h-[34px] px-2 border-l-2 border-indigo-500">
          <Activity className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">لوحة الإحصائيات والتقارير</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 h-[34px] bg-green-50 dark:bg-green-900/20 px-2.5 rounded-sm border border-green-200 dark:border-green-800/50">
          <Activity className="w-3.5 h-3.5 text-green-600 dark:text-green-400 animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 dark:text-green-400 whitespace-nowrap">تحديث فوري نشط</span>
        </div>
      </div>

      {/* كروت المؤشرات الفورية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">إجمالي الفروع</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-sans">{totalServers}</div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">سيرفر مسجل حالياً</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الفروع النشطة</span>
            <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-655 dark:text-green-400 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-sans text-green-600 dark:text-green-400">{activeServers}</div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: `${activePercent}%` }}></div>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{activePercent}% من الإجمالي يعمل</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الافتتاح قريباً</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-sans text-blue-600 dark:text-blue-400">{openingSoonServers}</div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${openingPercent}%` }}></div>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{openingPercent}% جاهزة للافتتاح</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الفروع المغلقة</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-sans text-rose-650 dark:text-rose-400">
              {closedTempServers + closedPermServers}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
              <span>مؤقتاً: {closedTempServers}</span>
              <span>نهائياً: {closedPermServers}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* توزيع الفروع حسب التصنيف */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            توزيع الفروع بحسب التصنيف والعلامة التجارية
          </h3>
          <div className="space-y-3.5">
            {categories.filter(c => c.id !== 'all' && c.id !== 'stats' && c.id !== 'users' && c.id !== 'audit').map(cat => {
              const count = categoryCountsData[cat.id] || 0;
              const pct = totalServers ? Math.round((count / totalServers) * 100) : 0;
              const theme = categoryThemes[cat.id] || categoryThemes.all;
              const barBg = cat.id === 'فلورينا' ? 'bg-sky-500' :
                            cat.id === 'فرنشايز' ? 'bg-purple-500' :
                            cat.id === 'جملة' ? 'bg-amber-500' :
                            cat.id === 'موزع معتمد' ? 'bg-emerald-500' :
                            cat.id === 'اسكتشر' ? 'bg-indigo-500' :
                            cat.id === 'فيلانتو' ? 'bg-rose-500' :
                            'bg-slate-500';
              
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-sm bg-gray-50 dark:bg-slate-900/60 ${theme.iconColor}`}>
                        {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                      </span>
                      <span className="text-gray-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <span className="text-gray-500 dark:text-slate-450">{count} فرع ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${barBg}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* إحصائيات سريعة للحسابات */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            إحصائيات المستخدمين والتفاعل
          </h3>
          
          {isLoadingUsers ? (
            <div className="h-48 flex items-center justify-center text-xs text-gray-500">جاري التحميل...</div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-center space-y-1 border border-slate-100 dark:border-slate-700/40">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold block">إجمالي الأعضاء</span>
                  <span className="text-2xl font-black font-mono text-gray-850 dark:text-slate-200">{adminUsers.length}</span>
                </div>
                <div className="bg-green-50/40 dark:bg-green-950/10 p-4 rounded-xl text-center space-y-1 border border-green-100/30 dark:border-green-950/20">
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-extrabold block">نشط الآن</span>
                  <span className="text-2xl font-black font-mono text-green-600 dark:text-green-400">
                    {adminUsers.filter(u => {
                      const diff = Date.now() - new Date(u.last_seen).getTime();
                      return diff < 300000;
                    }).length}
                  </span>
                </div>
                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-xl text-center space-y-1 border border-indigo-100/30 dark:border-indigo-950/20">
                  <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold block">الموثوقين</span>
                  <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {adminUsers.filter(u => u.is_trusted).length}
                  </span>
                </div>
                <div className="bg-rose-50/40 dark:bg-rose-950/10 p-4 rounded-xl text-center space-y-1 border border-rose-100/30 dark:border-rose-950/20">
                  <span className="text-[10px] text-rose-650 dark:text-rose-400 font-extrabold block">المعطلين</span>
                  <span className="text-2xl font-black font-mono text-rose-650 dark:text-rose-400">
                    {adminUsers.filter(u => !u.is_active).length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveCategory('users')}
                className="w-full text-center py-2 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-450 font-bold rounded-xl text-xs transition-colors border border-indigo-100/40 dark:border-indigo-900/30 cursor-pointer"
              >
                الذهاب لإدارة الصلاحيات والمستخدمين ←
              </button>
            </div>
          )}
        </div>
      </div>

      {/* آخر فروع مسجلة */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
          <Store className="w-4 h-4 text-amber-500" />
          آخر 5 فروع تم تسجيلها بالشبكة
        </h3>
        <div className="divide-y divide-gray-150 dark:divide-slate-700">
          {data.slice(0, 5).map(branch => {
            const theme = categoryThemes[branch.تصنيف_الفرع] || categoryThemes.all;
            return (
              <div key={branch.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-sm font-bold border ${theme.badgeInactive}`}>
                    {branch.تصنيف_الفرع}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-slate-200 font-bold">{branch.اسم_الفرع_ar}</span>
                    <span className="text-[10px] text-gray-400 font-mono">رقم الفرع: {branch.رقم_الفرع}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono text-gray-500 dark:text-slate-400">
                  <span>{branch.تاريخ_الانشاء ? new Date(branch.تاريخ_الانشاء).toLocaleDateString('ar-EG') : '—'}</span>
                  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${branch.حالة_اليوزر === 'يعمل' ? 'bg-green-150 text-green-700' : 'bg-red-150 text-red-700'}`}>
                    {branch.حالة_اليوزر}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
