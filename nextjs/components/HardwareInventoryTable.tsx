'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Cpu } from 'lucide-react';

export default function HardwareInventoryTable() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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
      {/* الترويسة وأدوات التحكم */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-750 dark:from-slate-800 dark:to-slate-750 p-6 rounded-2xl border border-blue-200/20 dark:border-slate-700 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Cpu className="w-7 h-7 text-blue-300" />
            جرد ملحقات الكمبيوتر والكاميرات
          </h2>
          <p className="text-xs text-blue-100 dark:text-slate-350 flex items-center gap-2">
            يتم جلب وتحديث البيانات تلقائياً من Google Sheets. آخر تحديث:{' '}
            <span className="font-mono bg-blue-950/50 px-2 py-0.5 rounded text-blue-200">
              {lastFetch ? lastFetch.toLocaleTimeString('ar-EG') : '...'}
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="بحث بالفرع، المنطقة، المشرف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[250px] pr-8 pl-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm placeholder-blue-200 focus:outline-none focus:bg-white/20 transition-all font-semibold"
            />
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-blue-200" />
          </div>
          <button
            onClick={fetchData}
            className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="overflow-auto bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-gray-200 dark:border-slate-700 max-h-[650px] custom-scrollbar">
        <table className="min-w-full text-right border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-100 dark:bg-slate-900 border-b border-gray-300 dark:border-slate-700 z-10">
            <tr>
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  onClick={() => handleSort(header)}
                  className="px-4 py-3 text-[11px] font-black text-gray-700 dark:text-slate-200 border-l border-gray-200 dark:border-slate-700 last:border-l-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors select-none group"
                >
                  <div className="flex items-center justify-between gap-2">
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
                <tr key={rIdx} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  {headers.map((header, cIdx) => {
                    const value = row[header];
                    // تلوين بعض الحالات
                    const isYes = value === 'نعم' || value === 'USB' || value === 'فايبر';
                    const isNo = value === 'لا' || value === 'لا يوجد' || value === 'لايوجد';
                    
                    return (
                      <td key={cIdx} className="px-4 py-2 border-l border-gray-150 dark:border-slate-700/60 last:border-l-0 text-gray-800 dark:text-slate-300 text-[11px] font-semibold">
                        <span className={`px-1.5 py-0.5 rounded-sm ${isYes ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : isNo ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}`}>
                          {value || '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
