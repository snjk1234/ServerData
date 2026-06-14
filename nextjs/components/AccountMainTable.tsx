'use client';

import React from 'react';
import { Wifi, Monitor, Cpu, Eye, EyeOff, Edit, Printer, Trash2, Copy } from 'lucide-react';

interface AccountMainTableProps {
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  handleSort: (key: string) => void;
  activeCategory: string | null;
  isLoadingData: boolean;
  sortedData: any[];
  setSelectedBranch: (branch: { id: string | number; name: string }) => void;
  extraData: Record<string, { connections?: any[], computers?: any, hardware?: any }>;
  handleShowPassword: (id: number) => void;
  decryptedPasswords: Record<number, string>;
  handleEditClick: (item: any) => void;
  handlePrint: (item: any) => void;
  isAdmin: boolean;
  copyToClipboard: (text: string) => void;
  handleDeleteClick: (item: any) => void;
}

export default function AccountMainTable({
  sortConfig,
  handleSort,
  activeCategory,
  isLoadingData,
  sortedData,
  setSelectedBranch,
  extraData,
  handleShowPassword,
  decryptedPasswords,
  handleEditClick,
  handlePrint,
  isAdmin,
  handleDeleteClick,
  copyToClipboard
}: AccountMainTableProps) {
  return (
    <div className="overflow-auto max-h-[680px] bg-white dark:bg-slate-800 shadow-sm rounded-sm border border-gray-200 dark:border-slate-700">
      <table className="min-w-full text-right border-collapse">
        <thead className="sticky top-0 bg-gray-200 dark:bg-slate-900 border-b border-gray-350 dark:border-slate-700 z-10 shadow-sm text-gray-800 dark:text-slate-100">
          <tr>
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[100px]">
                <div 
                  className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                  onClick={() => handleSort('رقم_الفرع')}
                >
                  <span>رقم الفرع</span>
                  <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'رقم_الفرع' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                </div>
              </div>
            </th>
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[150px]">
                <div 
                  className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                  onClick={() => handleSort('اسم_الفرع_ar')}
                >
                  <span>الاسم (AR)</span>
                  <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'اسم_الفرع_ar' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                </div>
              </div>
            </th>
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[150px]">
                <div 
                  className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                  onClick={() => handleSort('تصنيف_الفرع')}
                >
                  <span>التصنيف والمنطقة</span>
                  <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'تصنيف_الفرع' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                </div>
              </div>
            </th>
            {activeCategory !== 'الإدارة' && (
              <>
                <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
                  <div className="resize-x overflow-hidden min-w-[150px]">
                    <div className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 flex items-center h-full">
                      العنوان والضريبة
                    </div>
                  </div>
                </th>
              </>
            )}
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[120px]">
                <div 
                  className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                  onClick={() => handleSort('اسم_اليوزر')}
                >
                  <span>اليوزر</span>
                  <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'اسم_اليوزر' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                </div>
              </div>
            </th>
            {activeCategory !== 'الإدارة' && (
              <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
                <div className="resize-x overflow-hidden min-w-[120px]">
                  <div className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 flex items-center h-full">
                    اسم الطابعة
                  </div>
                </div>
              </th>
            )}
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[120px]">
                <div className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 flex items-center h-full">
                  الباسوورد
                </div>
              </div>
            </th>
            {activeCategory !== 'الإدارة' && (
              <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
                <div className="resize-x overflow-hidden min-w-[120px]">
                  <div 
                    className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                    onClick={() => handleSort('serial_number')}
                  >
                    <span>التسلسل</span>
                    <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'serial_number' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                  </div>
                </div>
              </th>
            )}
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[100px]">
                <div 
                  className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 cursor-pointer select-none hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-between h-full"
                  onClick={() => handleSort('حالة_اليوزر')}
                >
                  <span>الحالة</span>
                  <span className="text-gray-400 dark:text-slate-500 text-xs">{sortConfig?.key === 'حالة_اليوزر' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}</span>
                </div>
              </div>
            </th>
            <th className="p-0 border border-gray-200 dark:border-slate-700 align-top">
              <div className="resize-x overflow-hidden min-w-[140px]">
                <div className="px-2 py-1.5 text-base font-semibold text-gray-700 dark:text-slate-200 flex items-center h-full">
                  الخيارات
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {isLoadingData ? (
            Array(5).fill(0).map((_, idx) => (
              <tr key={idx} className="animate-pulse bg-white dark:bg-slate-800">
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div></td>
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-1"></div><div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-16"></div></td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-1"></div><div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-20"></div></td>
                )}
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div></td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                )}
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div></td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-10 mx-auto"></div></td>
                )}
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="flex gap-1"><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-6"></div><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-6"></div></div></td>
              </tr>
            ))
          ) : sortedData.length > 0 ? (
            sortedData.map(row => {
            const rowBorderClass =
              row.حالة_اليوزر === 'يعمل' ? 'border-r-2 border-r-green-500' :
                row.حالة_اليوزر === 'مغلق نهائياً' ? 'border-r-2 border-r-red-500' :
                  row.حالة_اليوزر === 'الافتتاح قريبا' ? 'border-r-2 border-r-blue-500' :
                    'border-r-2 border-r-yellow-500';
            const rowBgClass =
              row.تصنيف_الفرع === 'فلورينا' ? 'bg-sky-100/40 dark:bg-sky-950/20' :
                row.تصنيف_الفرع === 'فرنشايز' ? 'bg-purple-100/40 dark:bg-purple-950/20' :
                  row.تصنيف_الفرع === 'جملة' ? 'bg-amber-100/40 dark:bg-amber-950/20' :
                    row.تصنيف_الفرع === 'موزع معتمد' ? 'bg-emerald-100/40 dark:bg-emerald-950/20' :
                      row.تصنيف_الفرع === 'اسكتشر' ? 'bg-indigo-100/40 dark:bg-indigo-950/20' :
                        row.تصنيف_الفرع === 'فيلانتو' ? 'bg-rose-100/40 dark:bg-rose-950/20' :
                          'bg-white dark:bg-slate-800';

            const rowBorderColorClass =
              row.تصنيف_الفرع === 'فلورينا' ? 'border-sky-200 dark:border-sky-900/60' :
                row.تصنيف_الفرع === 'فرنشايز' ? 'border-purple-200 dark:border-purple-900/60' :
                  row.تصنيف_الفرع === 'جملة' ? 'border-amber-200 dark:border-amber-900/60' :
                    row.تصنيف_الفرع === 'موزع معتمد' ? 'border-emerald-200 dark:border-emerald-900/60' :
                      row.تصنيف_الفرع === 'اسكتشر' ? 'border-indigo-200 dark:border-indigo-900/60' :
                        row.تصنيف_الفرع === 'فيلانتو' ? 'border-rose-200 dark:border-rose-900/60' :
                          row.تصنيف_الفرع === 'الإدارة' ? 'border-slate-300 dark:border-slate-700' :
                            'border-gray-200 dark:border-slate-700/60';

            return (
              <React.Fragment key={row.id}>
                <tr 
                  onClick={() => setSelectedBranch({ id: row.رقم_الفرع, name: row.اسم_الفرع_ar })}
                  className={`border-b ${rowBorderColorClass} ${rowBgClass} hover:bg-indigo-50/40 dark:hover:bg-slate-700/40 transition-colors ${rowBorderClass} cursor-pointer`}
                >
                <td className="px-2 py-1 text-base font-medium text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700/60">{row.رقم_الفرع}</td>
                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col shrink-0">
                      <span className="text-gray-900 dark:text-slate-100 font-medium text-lg">{row.اسم_الفرع_ar}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 uppercase font-mono">{row.اسم_الفرع_en}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mr-auto pl-1">
                      {/* Inline Indicators */}
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`p-0.5 rounded-sm transition-colors ${extraData[row.رقم_الفرع]?.connections ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-gray-100 text-gray-300 dark:bg-slate-700/30 dark:text-slate-600'}`}
                          title={extraData[row.رقم_الفرع]?.connections ? 'يوجد بيانات اتصال مسجلة' : 'لا يوجد بيانات اتصال'}
                        >
                          <Wifi className="w-3 h-3" />
                        </div>
                        <div 
                          className={`p-0.5 rounded-sm transition-colors ${extraData[row.رقم_الفرع]?.computers ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400' : 'bg-gray-100 text-gray-300 dark:bg-slate-700/30 dark:text-slate-600'}`}
                          title={extraData[row.رقم_الفرع]?.computers ? 'يوجد بيانات كمبيوتر مسجلة' : 'لا يوجد بيانات كمبيوتر'}
                        >
                          <Monitor className="w-3 h-3" />
                        </div>
                        <div 
                          className={`p-0.5 rounded-sm transition-colors ${extraData[row.رقم_الفرع]?.hardware ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-300 dark:bg-slate-700/30 dark:text-slate-600'}`}
                          title={extraData[row.رقم_الفرع]?.hardware ? 'يوجد بيانات جرد أجهزة' : 'لا يوجد بيانات جرد أجهزة'}
                        >
                          <Cpu className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  <div className="flex flex-col">
                    <span className="text-gray-700 dark:text-slate-300 font-medium text-base">{row.تصنيف_الفرع || '—'}</span>
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{row.المنطقة || '—'}</span>
                  </div>
                </td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs text-gray-600 dark:text-slate-400">
                        {row.اسم_المدينة || row.اسم_الشارع ? (
                          <>
                            {row.اسم_المدينة} {row.اسم_الشارع && ` - ${row.اسم_الشارع}`}
                          </>
                        ) : '—'}
                      </div>
                      {row.الرقم_الضريبي && (
                        <div className="text-[11px] bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-sm w-fit text-gray-500 font-semibold">
                          ضريبي: {row.الرقم_الضريبي}
                        </div>
                      )}
                    </div>
                  </td>
                )}
                <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300 font-mono border border-gray-200 dark:border-slate-700/60">
                  {row.اسم_اليوزر}
                </td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/60">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">A4: {row.طابعة_a4 || '—'}</span>
                      <span className="text-gray-500 dark:text-slate-400 font-mono">فاتورة: {row.طابعة_فواتير || '—'}</span>
                    </div>
                  </td>
                )}
                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  {decryptedPasswords[row.id] ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-green-600 dark:text-green-400 font-bold tracking-wider">{decryptedPasswords[row.id]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(decryptedPasswords[row.id]);
                        }}
                        className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="نسخ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-gray-400 tracking-widest font-mono">••••••••</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowPassword(row.id);
                        }}
                        className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="إظهار"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
                {activeCategory !== 'الإدارة' && (
                  <td className="px-2 py-1 text-sm text-center text-gray-700 dark:text-slate-300 font-mono border border-gray-200 dark:border-slate-700/60">
                    {row.serial_number || '—'}
                  </td>
                )}
                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  <span className={`px-1.5 py-0.5 rounded-sm text-xs font-bold ${row.حالة_اليوزر === 'يعمل' ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 border border-green-200/50 dark:border-green-900/50' :
                    row.حالة_اليوزر === 'مغلق نهائياً' ? 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200/50 dark:border-red-900/50' :
                      row.حالة_اليوزر === 'الافتتاح قريبا' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50' :
                        'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/50'
                    }`}>
                    {row.حالة_اليوزر}
                  </span>
                </td>
                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  <div className="flex gap-1 items-center justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
                      className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-250 bg-indigo-50 dark:bg-indigo-950/50 p-1 rounded-sm border border-indigo-100 dark:border-indigo-900/20 transition-colors cursor-pointer"
                      title="تعديل الفرع"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrint(row); }}
                      className="text-blue-650 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/50 p-1 rounded-sm border border-blue-100 dark:border-blue-900/20 transition-colors cursor-pointer"
                      title="طباعة A4"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(row);
                        }}
                        className="text-red-650 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 bg-red-50 dark:bg-red-950/50 p-1 rounded-sm border border-red-100 dark:border-red-900/20 transition-colors cursor-pointer"
                        title="حذف الفرع"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </React.Fragment>
            );
          })
          ) : (
            <tr>
              <td colSpan={10} className="p-8 text-center text-gray-500 dark:text-slate-400">
                لا توجد بيانات مطابقة للبحث
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
