'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Cpu } from 'lucide-react';
import BranchProfileModal from './BranchProfileModal';

export default function HardwareInventoryTable() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<{ id: string | number; name: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hardware-inventory');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setHeaders(json.headers);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch hardware inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // تحديث تلقائي كل 60 ثانية
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = data.filter(row => {
    if (!search) return true;
    const s = search.toLowerCase();
    // البحث في الأعمدة الهامة
    return (
      (row['الفرع'] || '').toLowerCase().includes(s) ||
      (row['المنطقة'] || '').toLowerCase().includes(s) ||
      (row['المشرف'] || '').toLowerCase().includes(s) ||
      (row['اسم المسئول'] || '').toLowerCase().includes(s)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    // معالجة خاصة لعمود الوقت - فرز بالتاريخ (سنة → شهر → يوم → وقت)
    if (sortConfig.key === 'وقت') {
      const parseDate = (val: string): Date => {
        if (!val) return new Date(0);
        
        // تنظيف الفراغات المتكررة وتوحيدها
        let cleanVal = val.trim().replace(/\s+/g, ' ');
        
        // استكشاف صباحاً/مساءً باللغة العربية والإنجليزية
        const isPM = cleanVal.includes('م') || cleanVal.toLowerCase().includes('pm') || cleanVal.includes('??');
        const isAM = cleanVal.includes('ص') || cleanVal.toLowerCase().includes('am');
        
        // حذف مؤشرات الصباح والمساء لتسهيل التحليل الرقمي
        cleanVal = cleanVal.replace(/[مصص\?]|pm|am/gi, '').trim();
        
        const parts = cleanVal.split(' ');
        let datePart = '';
        let timePart = '';
        
        parts.forEach(part => {
          if (part.includes('/') || part.includes('-')) {
            datePart = part;
          } else if (part.includes(':')) {
            timePart = part;
          }
        });
        
        let year = 1970, month = 0, day = 1;
        let hours = 0, minutes = 0, seconds = 0;
        
        if (datePart) {
          const dParts = datePart.split(/[\/-]/);
          if (dParts.length === 3) {
            const p1 = parseInt(dParts[0], 10) || 0;
            const p2 = parseInt(dParts[1], 10) || 0;
            const p3 = parseInt(dParts[2], 10) || 0;
            
            if (p1 > 100) {
              // YYYY-MM-DD
              year = p1;
              month = p2 - 1;
              day = p3;
            } else if (p3 > 100) {
              // DD/MM/YYYY or MM/DD/YYYY
              year = p3;
              if (p2 > 12) {
                // MM/DD/YYYY
                month = p1 - 1;
                day = p2;
              } else {
                // Default to DD/MM/YYYY
                month = p2 - 1;
                day = p1;
              }
            }
          }
        }
        
        if (timePart) {
          const tParts = timePart.split(':');
          hours = parseInt(tParts[0], 10) || 0;
          minutes = parseInt(tParts[1], 10) || 0;
          seconds = parseInt(tParts[2], 10) || 0;
          
          if (isPM && hours < 12) {
            hours += 12;
          } else if (isAM && hours === 12) {
            hours = 0;
          }
        }
        
        const parsedDate = new Date(year, month, day, hours, minutes, seconds);
        return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
      };

      const aDate = parseDate(aValue);
      const bDate = parseDate(bValue);
      // عكس الاتجاه لعمود الوقت: asc = الاحدث اولا, desc = الاقدم اولا
      return sortConfig.direction === 'asc'
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();
    }

    // محاولة تحويل القيم إلى أرقام إذا كانت كذلك لفرزها بشكل صحيح
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full space-y-4 animate-fade-in" dir="rtl">
      {/* شريط البحث والفلترة وأزرار التحكم في صف واحد دائمًا */}
      <div className="w-fit max-w-full bg-white dark:bg-slate-800 p-2 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-3 flex flex-row flex-nowrap gap-3 items-center justify-start overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex items-center gap-2 shrink-0 h-[34px] px-2 border-l-2 border-blue-500">
          <Cpu className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">جرد ملحقات الكمبيوتر والكاميرات</span>
        </div>
        
        {/* البحث */}
        <div className="w-[220px] md:w-[280px] shrink-0 relative h-[34px]">
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="بحث بالفرع، المنطقة، المشرف..."
            className="w-full h-full pr-9 pl-8 py-1.5 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* الأزرار العامة */}
        <div className="flex items-center gap-2 shrink-0 h-[34px]">
          <button
            onClick={fetchData}
            className="h-full px-2 rounded-sm text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-gray-50 hover:bg-blue-50 dark:bg-slate-900/50 dark:hover:bg-blue-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* معلومات التحديث */}
        <div className="flex items-center gap-2 shrink-0 h-[34px] px-2 text-[10px] font-mono text-gray-500 dark:text-slate-400">
          آخر تحديث: {lastFetch ? lastFetch.toLocaleTimeString('ar-EG') : '...'}
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="overflow-auto max-h-[680px] bg-white dark:bg-slate-800 shadow-sm rounded-sm border border-gray-200 dark:border-slate-700 custom-scrollbar">
        <table className="min-w-full text-right border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-200 dark:bg-slate-900 border-b border-gray-350 dark:border-slate-700 z-10 shadow-sm text-gray-800 dark:text-slate-100">
            <tr>
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  onClick={() => handleSort(header)}
                  className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-800 transition-colors select-none group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{header}</span>
                    <span className={`text-[10px] ${sortConfig?.key === header ? 'text-blue-600 dark:text-blue-400 font-bold opacity-100' : 'text-gray-400 opacity-30 group-hover:opacity-70'}`}>
                      {sortConfig?.key === header ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '⇅'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm">
            {isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 20} className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="font-bold">جاري تحميل البيانات من منصة Google Sheets...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 20} className="px-6 py-16 text-center text-gray-500 font-bold">
                  لا توجد بيانات مطابقة للبحث
                </td>
              </tr>
            ) : (
              sortedData.map((row, rIdx) => (
                <tr 
                  key={rIdx} 
                  onClick={() => {
                    const branchId = row['الفرع'];
                    if (branchId) {
                      setSelectedBranch({ id: branchId, name: row['اسم_الفرع'] || row['اسم الفرع'] || row['الفرع'] });
                    }
                  }}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {headers.map((header, cIdx) => {
                    const value = row[header];
                    // تلوين بعض الحالات
                    const isYes = value === 'نعم' || value === 'USB' || value === 'فايبر';
                    const isNo = value === 'لا' || value === 'لايوجد' || value === 'لا يوجد' || value === 'بدون';
                    const isWarning = value === 'عطلان' || value === 'خربان' || value === 'معطل' || value === 'غير متصل';

                    return (
                      <td key={cIdx} className={`px-2 py-1 border border-gray-200 dark:border-slate-700 text-sm ${
                        header === 'الفرع' || header === 'رقم الفرع' ? 'text-indigo-700 dark:text-indigo-400 font-mono font-bold' : 
                        isYes ? 'text-green-600 dark:text-green-400 font-bold bg-green-50/30 dark:bg-green-900/10' : 
                        isNo ? 'text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/30' : 
                        isWarning ? 'text-red-600 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-900/10' : 
                        'text-gray-800 dark:text-slate-300'
                      }`}>
                        {value || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Profile */}
      {selectedBranch && (
        <BranchProfileModal
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
