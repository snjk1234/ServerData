'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import { AlertCircle, Save, ArrowRight, Building2, MapPin, Hash, Key, User, ToggleLeft, Globe, Map, CreditCard, ShieldCheck, Printer } from 'lucide-react';

function getRequiredFields(category: string): { street: boolean; city: boolean; taxNo: boolean } {
  if (category === 'فرنشايز' || category === 'فيلانتو') {
    return { street: true, city: true, taxNo: true };
  } else if (category === 'فلورينا' || category === 'جملة') {
    return { street: false, city: true, taxNo: false };
  } else {
    return { street: false, city: false, taxNo: false };
  }
}

export default function AddServerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [branchNo, setBranchNo] = useState('');
  const [branchNoEdited, setBranchNoEdited] = useState(false);
  const [branchCategory, setBranchCategory] = useState('فلورينا');
  const [branchNameAr, setBranchNameAr] = useState('');
  const [branchNameEn, setBranchNameEn] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('يعمل');

  // الحقول الجديدة
  const [streetName, setStreetName] = useState('');
  const [cityName, setCityName] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [region, setRegion] = useState('');
  const [serialNumber, setSerialNumber] = useState(100000);

  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [conflictRecord, setConflictRecord] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [manualA4, setManualA4] = useState('');
  const [manualBill, setManualBill] = useState('');

  const requiredFields = getRequiredFields(branchCategory);

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await (supabase as any).from('server_data').select('رقم_الفرع, اسم_الفرع_ar, تصنيف_الفرع, serial_number, طابعة_a4, طابعة_فواتير');
      if (data) setAllRecords(data);
    };

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profile } = await (supabase as any)
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        router.push('/account');
      }
    };

    fetchExisting();
    checkAdmin();
  }, []);

  useEffect(() => {
    if (branchNoEdited) return;

    let startNum = 1;
    if (branchCategory === 'اسكتشر') startNum = 300;
    else if (branchCategory === 'فرنشايز') startNum = 500;
    else if (branchCategory === 'موزع معتمد') startNum = 600;
    else if (branchCategory === 'فيلانتو') startNum = 900;
    else if (branchCategory === 'الإدارة') startNum = 1;

    const categoryNumbers = allRecords
      .filter(r => {
        if (branchCategory === 'فلورينا' || branchCategory === 'جملة') {
          return r.تصنيف_الفرع === 'فلورينا' || r.تصنيف_الفرع === 'جملة';
        }
        return r.تصنيف_الفرع === branchCategory;
      })
      .map(r => {
        const numStr = String(r.رقم_الفرع).replace(/\D/g, '');
        return parseInt(numStr, 10);
      })
      .filter(n => !isNaN(n));

    let nextNum = startNum;
    if (categoryNumbers.length > 0) {
      nextNum = Math.max(...categoryNumbers) + 1;
    }

    const hasBR = allRecords.some(r => r.رقم_الفرع.startsWith('BR'));
    let formattedNo = branchCategory === 'الإدارة' ? `h-${nextNum}` : (hasBR ? `BR${String(nextNum).padStart(3, '0')}` : String(nextNum));
    setBranchNo(formattedNo);

    let nextSerial = 100000;
    if (allRecords.length > 0) {
      const maxSerial = Math.max(...allRecords.map(r => r.serial_number || 0));
      nextSerial = Math.max(100000, maxSerial + 100000);
    }
    setSerialNumber(nextSerial);
  }, [branchCategory, allRecords, branchNoEdited]);

  const [modalError, setModalError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const a4Printer = branchCategory === 'الإدارة' ? null : (manualA4 || `${branchNameEn.slice(0, 4)}BIGPRIN1`);
    const billPrinter = branchCategory === 'الإدارة' ? null : (manualBill || `${branchNameEn.slice(0, 4)}SPRI`);

    if (branchCategory !== 'الإدارة' && branchNameEn.length < 4) {
      setError('يجب أن يكون اسم الفرع بالإنجليزية 4 أحرف على الأقل.');
      return;
    }

    if (branchCategory !== 'الإدارة' && a4Printer && a4Printer.length !== 12) {
      setValidationError('يجب أن يتكون اسم طابعة A4 من 4 أحرف للفرع متبوعة بـ BIGPRIN1 (الإجمالي 12 حرف).');
      return;
    }

    setLoading(true);
    setError(null);
    setModalError(null);
    setValidationError(null);

    try {
      const { data: freshRecords, error: fetchError } = await (supabase as any)
        .from('server_data')
        .select('رقم_الفرع, اسم_الفرع_ar, طابعة_a4, طابعة_فواتير');
      
      if (fetchError) throw new Error('فشل جلب البيانات للتحقق من التكرار.');

      if (freshRecords) {
        setAllRecords(freshRecords);
        if (branchCategory !== 'الإدارة') {
          const duplicate = freshRecords.find((r: any) => r.طابعة_a4 === a4Printer || r.طابعة_فواتير === billPrinter);
          if (duplicate) {
            setConflictRecord(duplicate);
            setManualA4(a4Printer || '');
            setManualBill(billPrinter || '');
            setLoading(false);
            return;
          }
        }
      }

      const encryptedPassword = CryptoJS.AES.encrypt(password, 'sols').toString();
      const { error: insertError } = await (supabase as any)
        .from('server_data')
        .insert([
          {
            رقم_الفرع: branchNo,
            تصنيف_الفرع: branchCategory,
            اسم_الفرع_ar: branchNameAr,
            اسم_الفرع_en: branchNameEn.toUpperCase(),
            اسم_اليوزر: username,
            باسوورد: encryptedPassword,
            حالة_اليوزر: status,
            طابعة_a4: a4Printer,
            طابعة_فواتير: billPrinter,
            اسم_الشارع: streetName || null,
            اسم_المدينة: cityName || null,
            الرقم_الضريبي: branchCategory === 'الإدارة' ? null : taxNo || null,
            المنطقة: region || null,
            serial_number: branchCategory === 'الإدارة' ? null : serialNumber,
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') throw new Error('رقم الفرع مسجل مسبقاً.');
        throw new Error(insertError.message);
      }

      router.push('/account?success=added');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const renderRequirementBadge = () => {
    if (branchCategory === 'فرنشايز' || branchCategory === 'فيلانتو') {
      return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">يلزم: الشارع + المدينة + الرقم الضريبي</span>;
    } else if (branchCategory === 'فلورينا' || branchCategory === 'جملة') {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">يلزم: المدينة فقط</span>;
    } else {
      return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">لا يلزم تعبئة هذه الحقول</span>;
    }
  };

  return (
    <div className="p-3 font-sans bg-gray-100 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300 relative" dir="rtl">
      
      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl max-w-sm w-full overflow-hidden border border-amber-200 dark:border-amber-900/50 p-5 text-center transform transition-all">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="text-amber-600 dark:text-amber-500 w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold mb-2 text-gray-900 dark:text-slate-100">خطأ في التنسيق</h3>
            <p className="text-gray-600 dark:text-slate-400 text-xs mb-5 leading-relaxed font-medium">{validationError}</p>
            <button onClick={() => setValidationError(null)} className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold py-2 rounded-sm transition-all text-sm">موافق</button>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {conflictRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-md overflow-hidden p-6 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-sm">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">تعارض في اسم الطابعة</h3>
            </div>
            <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed mb-4 font-medium">
              اسم الطابعة موجود مسبقاً في فرع: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">({conflictRecord.رقم_الفرع}) - {conflictRecord.اسم_الفرع_ar}</span>
            </p>
            <div className="mb-5 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-sm border border-gray-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                تعديل اسم طابعة A4
              </label>
              <input type="text" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left" value={manualA4} onChange={(e) => setManualA4(e.target.value)} dir="ltr" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConflictRecord(null)} className="flex-1 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm transition-colors">إلغاء</button>
              <button onClick={() => handleSubmit()} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-sm transition-all shadow-sm flex items-center justify-center gap-1.5">
                {loading ? <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-3.5 h-3.5" />}
                {loading ? 'جاري الحفظ...' : 'تعديل وحفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full md:max-w-[850px] mx-auto">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl font-extrabold font-sans text-indigo-800 dark:text-amber-300">
              إضافة سيرفر فرع جديد
            </h1>
          </div>
          <button onClick={() => router.back()} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-slate-600 shadow-sm">
            <ArrowRight className="w-3.5 h-3.5" />
            عودة للقائمة
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-sm mb-3 text-sm font-bold border border-red-200 dark:border-red-900/50 flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-900/20 flex justify-between items-center">
             <h2 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
               <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
               البيانات الأساسية للفرع
             </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">تصنيف الفرع</label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  {['فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBranchCategory(cat)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-sm border transition-all ${branchCategory === cat 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex justify-between items-center">
                  <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5 text-gray-400" /> رقم الفرع</span>
                  {branchNoEdited && <button type="button" onClick={() => setBranchNoEdited(false)} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">إعادة توليد</button>}
                </label>
                <input type="text" required className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-indigo-700 dark:text-indigo-400 transition-colors" value={branchNo} onChange={(e) => { setBranchNo(e.target.value); setBranchNoEdited(true); }} dir="ltr" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Map className="w-3.5 h-3.5 text-gray-400" /> المنطقة
                </label>
                <select className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-slate-200" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">-- اختر المنطقة --</option><option value="1-المدينة المنورة">1 - المدينة المنورة</option><option value="1-المنطقة الوسطى">1 - المنطقة الوسطى</option><option value="2-الرياض">2 - الرياض</option><option value="2-الدمام">2 - الدمام</option><option value="3-الجنوبية - أبها">3 - الجنوبية - أبها</option><option value="4-جدة">4 - جدة</option><option value="4-الغربية - مكة">4 - الغربية - مكة</option><option value="5-الشمالية تبوك">5 - الشمالية تبوك</option><option value="5-الطائف">5 - الطائف</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <ToggleLeft className="w-3.5 h-3.5 text-gray-400" /> الحالة
                </label>
                <select className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-slate-200" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="الافتتاح قريبا">الافتتاح قريباً</option><option value="يعمل">يعمل</option><option value="مغلق مؤقتا">مغلق مؤقتاً</option><option value="مغلق نهائياً">مغلق نهائياً</option>
                </select>
              </div>

              <div className="lg:col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" /> اسم الفرع (عربي)
                </label>
                <input type="text" required placeholder="مثال: فرع العليا" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100" value={branchNameAr} onChange={(e) => setBranchNameAr(e.target.value)} />
              </div>

              <div className="lg:col-span-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-gray-400" /> اسم الفرع (إنجليزي)
                </label>
                <div className="relative">
                  <input type="text" required placeholder="مثال: OLAYA" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 uppercase font-mono tracking-wider" value={branchNameEn} onChange={(e) => setBranchNameEn(e.target.value.toUpperCase())} dir="ltr" />
                </div>
              </div>

            </div>

            <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-sm border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="text-xs font-extrabold text-indigo-800 dark:text-indigo-400 mb-3 flex items-center gap-1.5 border-b border-indigo-100 dark:border-indigo-900/30 pb-2">
                <User className="w-4 h-4" />
                بيانات الدخول (اليوزر والباسوورد)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> اسم اليوزر
                  </label>
                  <input type="text" required placeholder="Username" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 font-mono" value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-gray-400" /> كلمة المرور
                  </label>
                  <input type="text" required placeholder="Password" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 font-mono tracking-widest" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 font-medium">سيتم التشفير قبل الحفظ</p>
                </div>
                {branchCategory !== 'الإدارة' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-gray-400" /> التسلسل (Serial)
                    </label>
                    <input type="number" className="w-full px-2.5 py-1.5 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none font-mono text-gray-500 cursor-not-allowed" value={serialNumber} readOnly />
                  </div>
                )}
              </div>
            </div>

            {branchCategory !== 'الإدارة' && (
              <div className="border-t border-gray-100 dark:border-slate-700/60 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                  <h2 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    البيانات الإضافية والموقع
                  </h2>
                  {renderRequirementBadge()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={!requiredFields.street && !requiredFields.city ? 'opacity-50' : ''}>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اسم الشارع</label>
                    <input type="text" required={requiredFields.street} placeholder={requiredFields.street ? 'مثال: طريق الملك فهد' : 'غير مطلوب'} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100" value={streetName} onChange={(e) => setStreetName(e.target.value)} disabled={!requiredFields.street && !requiredFields.city} />
                  </div>
                  <div className={!requiredFields.street && !requiredFields.city ? 'opacity-50' : ''}>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اسم المدينة</label>
                    <input type="text" required={requiredFields.city} placeholder={requiredFields.city ? 'مثال: الرياض' : 'غير مطلوب'} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100" value={cityName} onChange={(e) => setCityName(e.target.value)} disabled={!requiredFields.street && !requiredFields.city} />
                  </div>
                  <div className={!requiredFields.taxNo ? 'opacity-50' : ''}>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" /> الرقم الضريبي
                    </label>
                    <input type="text" required={requiredFields.taxNo} placeholder={requiredFields.taxNo ? 'مثال: 300000000000003' : 'غير مطلوب'} className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 font-mono tracking-wider" value={taxNo} onChange={(e) => setTaxNo(e.target.value)} disabled={!requiredFields.taxNo} dir="ltr" />
                  </div>
                  <div className="lg:col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-gray-400" /> طابعة A4
                    </label>
                    <input type="text" placeholder="يتم التوليد تلقائياً إن تُرك فارغاً" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 font-mono tracking-wider" value={manualA4} onChange={(e) => setManualA4(e.target.value.toUpperCase())} dir="ltr" />
                  </div>
                  <div className="lg:col-span-2 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5 text-gray-400" /> طابعة الفواتير
                    </label>
                    <input type="text" placeholder="يتم التوليد تلقائياً إن تُرك فارغاً" className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-slate-100 font-mono tracking-wider" value={manualBill} onChange={(e) => setManualBill(e.target.value.toUpperCase())} dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-5 border-t border-gray-100 dark:border-slate-700/60 flex justify-end">
              <button type="submit" disabled={loading} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-8 rounded-sm shadow-md transition-colors flex justify-center items-center gap-2 text-sm">
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ وإضافة السيرفر
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
