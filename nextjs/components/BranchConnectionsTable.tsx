'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, RefreshCw, Edit, AlertTriangle, Calendar, X } from 'lucide-react';
import ConnectionEditModal from './ConnectionEditModal';

export default function BranchConnectionsTable() {
  const [data, setData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null); // 'expiring_soon', 'expired', null
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // جلب بيانات الفروع
      const { data: branchesData, error: branchesError } = await supabase
        .from('server_data')
        .select('رقم_الفرع, اسم_الفرع_ar, اسم_الفرع_en, المنطقة, حالة_اليوزر, تصنيف_الفرع')
        .order('id', { ascending: true });

      if (branchesError) throw branchesError;

      // جلب بيانات الاتصالات
      const { data: connData, error: connError } = await (supabase as any)
        .from('branch_connections')
        .select('*');

      if (connError) throw connError;

      // دمج البيانات
      const mergedData = branchesData.map((branch: any) => {
        const conn = connData?.find((c: any) => String(c.branch_id).trim() === String(branch.رقم_الفرع).trim()) || {};
        return {
          ...branch,
          connection_id: conn.id || null,
          نوع_الاتصال: conn.connection_type || '',
          مزود_الخدمة: conn.provider || '',
          رقم_الخدمة: conn.account_number || conn.landline_number || conn.sim_number || '',
          دورة_التجديد: '', // Not in schema
          تاريخ_الشراء: '', // Not in schema
          تاريخ_الانتهاء: '', // Not in schema
          التكلفة: '', // Not in schema
          مجموعة_الباقة: '', // Not in schema
          نوع_الشريحة: conn.sim_number ? 'بيانات' : '',
          ملاحظات: conn.notes || '',
          تاريخ_الاضافة: conn.created_at || '',
          router_type: conn.router_type || '',
          router_serial: conn.router_serial || ''
        };
      });

      setData(mergedData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const calculateDaysRemaining = (expiryDateStr: string) => {
    if (!expiryDateStr) return null;
    const expiryDate = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (daysRemaining: number | null) => {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
    if (daysRemaining <= 7) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
    if (daysRemaining <= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
  };

  const filteredData = data.filter(row => {
    // فلتر البحث
    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = (
        (row.رقم_الفرع || '').toLowerCase().includes(s) ||
        (row.اسم_الفرع_ar || '').toLowerCase().includes(s) ||
        (row.رقم_الخدمة || '').toLowerCase().includes(s) ||
        (row.مجموعة_الباقة || '').toLowerCase().includes(s) ||
        (row.مزود_الخدمة || '').toLowerCase().includes(s)
      );
      if (!matchesSearch) return false;
    }

    // فلتر الحالة
    if (filterType === 'expiring_soon') {
      const days = calculateDaysRemaining(row.تاريخ_الانتهاء);
      return days !== null && days >= 0 && days <= 30;
    }
    if (filterType === 'expired') {
      const days = calculateDaysRemaining(row.تاريخ_الانتهاء);
      return days !== null && days < 0;
    }

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (sortConfig.key === 'تاريخ_الانتهاء') {
      const aDays = calculateDaysRemaining(aValue) ?? 99999;
      const bDays = calculateDaysRemaining(bValue) ?? 99999;
      return sortConfig.direction === 'asc' ? aDays - bDays : bDays - aDays;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full space-y-3 animate-fade-in" dir="rtl">
      
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
            placeholder="ابحث برقم الفرع، الشريحة، الباقة..."
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

        {/* فلاتر الحالات السريعة */}
        <div className="flex items-center gap-2 shrink-0 h-[34px]">
          <button
            onClick={() => setFilterType(filterType === 'expiring_soon' ? null : 'expiring_soon')}
            className={`h-full px-2.5 rounded-sm text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${filterType === 'expiring_soon' ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            ينتهي خلال 30 يوماً
          </button>
          
          <button
            onClick={() => setFilterType(filterType === 'expired' ? null : 'expired')}
            className={`h-full px-2.5 rounded-sm text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${filterType === 'expired' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            منتهي الصلاحية
          </button>
        </div>

        {/* الأزرار العامة */}
        <div className="flex items-center gap-2 shrink-0 h-[34px]">
          <button
            onClick={fetchData}
            className="h-full px-2 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-auto max-h-[680px] bg-white dark:bg-slate-800 shadow-sm rounded-sm border border-gray-200 dark:border-slate-700">
        <table className="min-w-full text-right border-collapse">
          <thead className="sticky top-0 bg-gray-200 dark:bg-slate-900 border-b border-gray-350 dark:border-slate-700 z-10 shadow-sm text-gray-800 dark:text-slate-100">
            <tr>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('رقم_الفرع')}>
                <span className="flex items-center gap-1 justify-between">الفرع <span className="text-xs text-gray-400">⇅</span></span>
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('نوع_الاتصال')}>
                <span className="flex items-center gap-1 justify-between">نوع الاتصال <span className="text-xs text-gray-400">⇅</span></span>
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('مزود_الخدمة')}>
                <span className="flex items-center gap-1 justify-between">مزود الخدمة <span className="text-xs text-gray-400">⇅</span></span>
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('رقم_الخدمة')}>
                <span className="flex items-center gap-1 justify-between">رقم الخدمة <span className="text-xs text-gray-400">⇅</span></span>
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                الباقة والشريحة
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('تاريخ_الانتهاء')}>
                <span className="flex items-center gap-1 justify-between">التجديد (الانتهاء) <span className="text-xs text-gray-400">⇅</span></span>
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                التكلفة
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                الملاحظات
              </th>
              <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 text-center">
                تعديل
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm font-bold text-gray-500 dark:text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                    جاري التحميل...
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm font-bold text-gray-500 dark:text-slate-400">
                  لا توجد بيانات مطابقة
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => {
                const daysRemaining = calculateDaysRemaining(row.تاريخ_الانتهاء);
                const statusColor = getStatusColor(daysRemaining);
                
                return (
                  <tr key={idx} className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                      <span className="text-indigo-700 dark:text-indigo-400 font-mono ml-1">{row.رقم_الفرع}</span> 
                      - {row.اسم_الفرع_ar}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {row.نوع_الاتصال || '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      {row.مزود_الخدمة || '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 font-mono whitespace-nowrap">
                      {row.رقم_الخدمة || '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {row.مجموعة_الباقة ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400">{row.مجموعة_الباقة}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-500">({row.نوع_الشريحة})</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {row.تاريخ_الانتهاء ? (
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="font-mono">{row.تاريخ_الانتهاء}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-bold ${statusColor}`}>
                            {daysRemaining !== null && daysRemaining < 0 ? `منتهي منذ ${Math.abs(daysRemaining)} يوم` : 
                             daysRemaining === 0 ? 'ينتهي اليوم' : `متبقي ${daysRemaining} يوم`}
                          </span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                      {row.التكلفة ? <span className="font-bold text-green-700 dark:text-green-400">{row.التكلفة}</span> : '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 max-w-[200px] truncate" title={row.ملاحظات}>
                      {row.ملاحظات || '—'}
                    </td>
                    <td className="px-2 py-1 border border-gray-200 dark:border-slate-700 text-center">
                      <button
                        onClick={() => {
                          setSelectedConnection(row);
                          setIsModalOpen(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 px-2 py-1 rounded-sm text-xs font-bold transition-colors cursor-pointer border border-gray-300 dark:border-slate-600 shadow-sm"
                        title="تعديل بيانات الاتصال"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedConnection && (
        <ConnectionEditModal
          connection={selectedConnection}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
