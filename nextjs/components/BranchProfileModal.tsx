'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  X, Server, Monitor, Printer, HardDrive, Cpu, Camera, 
  MapPin, Phone, Wifi, ShieldCheck, CheckCircle2, AlertCircle, 
  RefreshCw, Map, ScanBarcode, Network 
} from 'lucide-react';

interface BranchProfileModalProps {
  branchId: string | number;
  branchName?: string;
  onClose: () => void;
}

export default function BranchProfileModal({ branchId, branchName, onClose }: BranchProfileModalProps) {
  const [dbData, setDbData] = useState<any>(null);
  const [hwData, setHwData] = useState<any>(null);
  const [compData, setCompData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // 1. Fetch from Supabase (server_data)
        const { data: serverRecord } = await (supabase as any)
          .from('server_data')
          .select('*')
          .eq('رقم_الفرع', branchId)
          .single();

        if (serverRecord) setDbData(serverRecord);

        // 2. Fetch from Hardware Inventory API
        const hwRes = await fetch('/api/hardware-inventory');
        const hwJson = await hwRes.json();
        if (hwJson.success) {
          const hwMatch = hwJson.data.find((r: any) => String(r['الفرع']).trim() === String(branchId).trim());
          if (hwMatch) setHwData(hwMatch);
        }

        // 3. Fetch from Computers Inventory API
        const compRes = await fetch('/api/computers-inventory');
        const compJson = await compRes.json();
        if (compJson.success) {
          const compMatch = compJson.data.find((r: any) => String(r['رقم الفرع']).trim() === String(branchId).trim());
          if (compMatch) setCompData(compMatch);
        }
      } catch (error) {
        console.error('Error fetching branch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchAllData();
    }
  }, [branchId]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const displayName = branchName || dbData?.اسم_الفرع_ar || hwData?.اسم_الفرع || compData?.['اسم الفرع'] || `فرع رقم ${branchId}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-l from-indigo-700 to-indigo-600 dark:from-indigo-900 dark:to-indigo-800 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Server className="w-6 h-6 text-indigo-50" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                الملف الشامل: {displayName}
              </h2>
              <div className="flex items-center gap-3 text-indigo-100 text-xs font-semibold mt-1">
                <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                  رقم الفرع: {branchId}
                </span>
                {dbData?.تصنيف_الفرع && (
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                    {dbData.تصنيف_الفرع}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 dark:bg-slate-900/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold text-lg">جاري تجميع بيانات الفرع...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* العمود الأول: بيانات السيرفر الأساسية */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-100/80 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 font-bold text-gray-800 dark:text-slate-200">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    بيانات النظام (Supabase)
                  </div>
                  {dbData ? (
                    <div className="p-4 space-y-3 text-sm">
                      <DetailRow label="اسم الفرع (إنجليزي)" value={dbData.اسم_الفرع_en} />
                      <DetailRow label="حالة اليوزر" value={dbData.حالة_اليوزر} 
                        valueClass={dbData.حالة_اليوزر === 'يعمل' ? 'text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded' : 'text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded'} />
                      <DetailRow label="اسم اليوزر" value={dbData.اسم_اليوزر} />
                      <DetailRow label="الباسوورد" value={dbData.باسوورد} isCode />
                      <DetailRow label="الرقم الضريبي" value={dbData.الرقم_الضريبي} />
                      <DetailRow label="طابعة A4" value={dbData.طابعة_a4} />
                      <DetailRow label="طابعة فواتير" value={dbData.طابعة_فواتير} />
                      <DetailRow label="المدينة" value={dbData.اسم_المدينة} icon={<MapPin className="w-3.5 h-3.5" />} />
                      <DetailRow label="الشارع" value={dbData.اسم_الشارع} />
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm font-semibold flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-yellow-500" />
                      لا توجد بيانات مسجلة في قاعدة بيانات السيرفر
                    </div>
                  )}
                </div>
              </div>

              {/* العمود الثاني والثالث: الأجهزة والكمبيوترات */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* كارت جرد الكمبيوتر والملحقات */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-cyan-200 dark:border-cyan-900/50 overflow-hidden">
                  <div className="px-4 py-3 bg-cyan-50 dark:bg-slate-800/80 border-b border-cyan-100 dark:border-cyan-900/50 flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300">
                    <Monitor className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    مواصفات الكمبيوتر وملحقاته (من الشيت المخصص)
                  </div>
                  {compData ? (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <DetailRow label="الكمبيوتر" value={compData['الكمبيوتر']} icon={<Cpu className="w-3.5 h-3.5" />} />
                      <DetailRow label="الشاشة" value={compData['الشاشة']} icon={<Monitor className="w-3.5 h-3.5" />} />
                      <DetailRow label="المعالج" value={compData['المعالج']} />
                      <DetailRow label="الرام" value={compData['الرام']} />
                      <DetailRow label="الهارد" value={compData['الهارد']} icon={<HardDrive className="w-3.5 h-3.5" />} />
                      <DetailRow label="الطابعة الكبيرة" value={compData['الطابعة الكبيرة']} icon={<Printer className="w-3.5 h-3.5" />} />
                      <DetailRow label="الطابعة الصغيرة" value={compData['الطابعة الصغيرة']} icon={<Printer className="w-3.5 h-3.5" />} />
                      <DetailRow label="الماسح الضوئي" value={compData['الماسح الضوئي']} icon={<ScanBarcode className="w-3.5 h-3.5" />} />
                      <DetailRow label="نوع الانترنت" value={compData['نوع الانترنت']} icon={<Wifi className="w-3.5 h-3.5" />} />
                      <DetailRow label="جهاز الكاميرات" value={compData['جهاز الكاميرات']} icon={<Camera className="w-3.5 h-3.5" />} />
                      <DetailRow label="رقم الهاتف" value={compData['رقم الهاتف']} icon={<Phone className="w-3.5 h-3.5" />} dir="ltr" />
                      {compData['الموقع'] && compData['الموقع'].startsWith('http') && (
                        <div className="flex justify-between items-center py-1 sm:col-span-2 bg-gray-50/50 dark:bg-slate-800/50 px-2 rounded">
                          <span className="text-gray-500 font-bold flex items-center gap-1.5 text-xs"><Map className="w-3.5 h-3.5" />الموقع الجغرافي</span>
                          <a href={compData['الموقع']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold text-[11px]">
                            فتح في خرائط جوجل
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm font-semibold flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-yellow-500" />
                      لم يتم العثور على بيانات في شيت "كمبيوتر وملحقات"
                    </div>
                  )}
                </div>

                {/* كارت جرد الأجهزة العام */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-900/50 overflow-hidden">
                  <div className="px-4 py-3 bg-emerald-50 dark:bg-slate-800/80 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
                    <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    بيانات الجرد الأساسية (شيت جرد الأجهزة)
                  </div>
                  {hwData ? (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <DetailRow label="الكمبيوتر" value={hwData['الكمبيرتر']} />
                      <DetailRow label="الكيبورد" value={hwData['الكيبورد']} />
                      <DetailRow label="الماوس" value={hwData['الماوس']} />
                      <DetailRow label="قارئ الباركود" value={hwData[' قارئ الباركود']} />
                      <DetailRow label="قارئ VIP" value={hwData[' قارئ VIP']} />
                      <DetailRow label="السكنر A4" value={hwData['السكنر A4']} />
                      <DetailRow label="شاشة داخلية" value={hwData['شاشة داخلية']} />
                      <DetailRow label="شاشة خارجية" value={hwData['شاشة خارجية']} />
                      <DetailRow label="عدد الكاميرات" value={hwData['عدد الكاميرات']} />
                      <DetailRow label="شاشة للكاميرات" value={hwData['شاشة للكاميرات']} />
                      <DetailRow label="DVR" value={hwData['DVR']} />
                      <DetailRow label="سويتش" value={hwData['سويتش']} icon={<Network className="w-3.5 h-3.5" />} />
                      <DetailRow label="اسم المسئول" value={hwData['اسم المسئول']} />
                      <DetailRow label="جوال" value={hwData['جوال']} />
                      <DetailRow label="ملاحظات" value={hwData['ملاحظات']} className="sm:col-span-2 text-red-500 font-bold" />
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm font-semibold flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-yellow-500" />
                      لم يتم العثور على بيانات في شيت "جرد الأجهزة"
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// مكون مساعد لعرض سطر بيانات
function DetailRow({ 
  label, value, icon, className = '', isCode = false, dir = 'rtl', valueClass = 'text-gray-800 dark:text-slate-200'
}: { 
  label: string, value: any, icon?: React.ReactNode, className?: string, isCode?: boolean, dir?: string, valueClass?: string 
}) {
  if (value === undefined || value === null || value === '') {
    value = '—';
  }
  
  return (
    <div className={`flex justify-between items-start py-1 border-b border-gray-50 dark:border-slate-700/30 last:border-0 ${className}`}>
      <span className="text-gray-500 dark:text-slate-400 font-bold flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </span>
      <span 
        className={`text-[11px] font-semibold text-left max-w-[65%] leading-tight break-words ${isCode ? 'font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400 tracking-wider' : valueClass}`}
        dir={dir}
      >
        {value}
      </span>
    </div>
  );
}
