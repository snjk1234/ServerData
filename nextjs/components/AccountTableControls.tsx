'use client';

import React from 'react';
import Link from 'next/link';
import { X, Eye, EyeOff } from 'lucide-react';

interface AccountTableControlsProps {
  stats: Record<string, number>;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  search: string;
  setSearch: (search: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  isAdmin: boolean;
  isAllPasswordsRevealed: boolean;
  toggleAllPasswords: () => void;
  exportToCSV: () => void;
}

export default function AccountTableControls({
  stats,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isAdmin,
  isAllPasswordsRevealed,
  toggleAllPasswords,
  exportToCSV
}: AccountTableControlsProps) {
  return (
    <>
      {/* كروت تصفية الحالات السريعة للفروع */}
      <div className="w-full md:max-w-[996px] flex flex-row gap-2.5 mb-2">
        <button
          onClick={() => setStatusFilter(statusFilter === 'يعمل' ? null : 'يعمل')}
          className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'يعمل'
            ? 'bg-green-600 border-transparent text-white ring-2 ring-green-500/20'
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-green-500 hover:shadow-md'
            }`}
        >
          <span>يعمل</span>
          <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'يعمل' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-950/40 text-green-650 dark:text-green-400'}`}>
            {stats['يعمل'] || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'الافتتاح قريبا' ? null : 'الافتتاح قريبا')}
          className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'الافتتاح قريبا'
            ? 'bg-blue-600 border-transparent text-white ring-2 ring-blue-500/20'
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-blue-500 hover:shadow-md'
            }`}
        >
          <span>الافتتاح قريبا</span>
          <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'الافتتاح قريبا' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400'}`}>
            {stats['الافتتاح قريبا'] || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'مغلق مؤقتا' ? null : 'مغلق مؤقتا')}
          className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'مغلق مؤقتا'
            ? 'bg-yellow-500 border-transparent text-white ring-2 ring-yellow-400/20'
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-yellow-500 hover:shadow-md'
            }`}
        >
          <span>مغلق مؤقتا</span>
          <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'مغلق مؤقتا' ? 'bg-white/20 text-white' : 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-650 dark:text-yellow-400'}`}>
            {stats['مغلق مؤقتا'] || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'مغلق نهائياً' ? null : 'مغلق نهائياً')}
          className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'مغلق نهائياً'
            ? 'bg-red-600 border-transparent text-white ring-2 ring-red-500/20'
            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-red-500 hover:shadow-md'
            }`}
        >
          <span>مغلق نهائياً</span>
          <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'مغلق نهائياً' ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400'}`}>
            {stats['مغلق نهائياً'] || 0}
          </span>
        </button>
      </div>

      {/* حقول وهمية تمنع المتصفح من الملء التلقائي */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input type="text" name="fakeusernameremembered" tabIndex={-1} autoComplete="username" />
        <input type="password" name="fakepasswordremembered" tabIndex={-1} autoComplete="current-password" />
      </div>

      {/* شريط البحث والفلترة وأزرار التحكم في صف واحد دائمًا */}
      <div className="w-fit max-w-full bg-white dark:bg-slate-800 p-2 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-3 flex flex-row flex-nowrap gap-3 items-center justify-start overflow-x-auto overflow-y-hidden custom-scrollbar">
        
        {/* البحث */}
        <div className="w-[220px] md:w-[280px] shrink-0 relative h-[34px]">
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="table-search-box"
            name="table-search-box"
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
            placeholder="ابحث برقم الفرع، الاسم..."
            className="w-full h-full pr-9 pl-8 py-1.5 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* نطاق التاريخ المدمج */}
        <div className="flex items-center bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-sm shrink-0 px-2 h-[34px] gap-2">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <div className="flex items-center gap-1.5 h-full">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 leading-none mt-0.5">من</span>
            <input
              type="date"
              className="bg-transparent text-gray-900 dark:text-slate-100 text-sm focus:outline-none w-[110px] h-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-0.5"></div>
          <div className="flex items-center gap-1.5 h-full">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 leading-none mt-0.5">إلى</span>
            <input
              type="date"
              className="bg-transparent text-gray-900 dark:text-slate-100 text-sm focus:outline-none w-[110px] h-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-2 shrink-0 h-[34px]">
          {isAdmin && (
            <button
              onClick={toggleAllPasswords}
              className="h-full px-2 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={isAllPasswordsRevealed ? "إخفاء كل الباسوردات" : "إظهار كافة كلمات المرور"}
            >
              {isAllPasswordsRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          <Link
            href="/account/add"
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-2.5 h-full rounded-sm shadow-sm text-sm font-semibold flex items-center gap-1.5 shrink-0"
            title="إضافة سيرفر جديد"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden xl:inline">إضافة</span>
          </Link>
          
          <button
            onClick={exportToCSV}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-2.5 h-full rounded-sm shadow-sm text-sm font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="تصدير إلى Excel"
          >
            <svg xmlns="http://www.w3.org/2050/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden xl:inline">تصدير</span>
          </button>
        </div>
      </div>
    </>
  );
}
