'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import { AlertCircle, ShieldAlert, Printer } from 'lucide-react';

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
      const { data } = await supabase.from('server_data').select('رقم_الفرع, اسم_الفرع_ar, تصنيف_الفرع, serial_number, طابعة_a4, طابعة_فواتير');
      if (data) setAllRecords(data);
    };
    fetchExisting();
  }, []);

  useEffect(() => {
    if (branchNoEdited) return;

    let startNum = 1;
    if (branchCategory === 'اسكتشر') startNum = 300;
    else if (branchCategory === 'فرنشايز') startNum = 500;
    else if (branchCategory === 'موزع معتمد') startNum = 600;
    else if (branchCategory === 'فيلانتو') startNum = 900;

    const categoryNumbers = allRecords
      .filter(r => r.تصنيف_الفرع === branchCategory)
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
    let formattedNo = hasBR ? `BR${String(nextNum).padStart(3, '0')}` : String(nextNum);
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
    
    const a4Printer = manualA4 || `${branchNameEn.slice(0, 4)}BIGPRIN1`;
    const billPrinter = manualBill || `${branchNameEn.slice(0, 4)}SPRI`;

    if (branchNameEn.length < 4) {
      setError('يجب أن يكون اسم الفرع بالإنجليزية 4 أحرف على الأقل.');
      return;
    }

    if (a4Printer.length !== 12) {
      setValidationError('يجب أن يتكون اسم طابعة A4 من 4 أحرف للفرع متبوعة بـ BIGPRIN1 (الإجمالي 12 حرف).');
      return;
    }

    setLoading(true);
    setError(null);
    setModalError(null);
    setValidationError(null);

    try {
      const { data: freshRecords, error: fetchError } = await supabase
        .from('server_data')
        .select('رقم_الفرع, اسم_الفرع_ar, طابعة_a4, طابعة_فواتير');
      
      if (fetchError) throw new Error('فشل جلب البيانات للتحقق من التكرار.');

      if (freshRecords) {
        setAllRecords(freshRecords);
        const duplicate = freshRecords.find(r => r.طابعة_a4 === a4Printer || r.طابعة_فواتير === billPrinter);
        if (duplicate) {
          setConflictRecord(duplicate);
          setManualA4(a4Printer);
          setManualBill(billPrinter);
          setLoading(false);
          return;
        }
      }

      const encryptedPassword = CryptoJS.AES.encrypt(password, 'sols').toString();
      const { error: insertError } = await supabase
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
            الرقم_الضريبي: taxNo || null,
            المنطقة: region || null,
            serial_number: serialNumber,
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8 font-sans transition-colors duration-300 relative" dir="rtl">
      
      {/* Validation Error Modal */}
      {validationError && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-100 p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4"><AlertCircle className="text-amber-500 w-8 h-8" /></div>
            <h3 className="text-xl font-bold mb-2">خطأ في التنسيق</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{validationError}</p>
            <button onClick={() => setValidationError(null)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-all">موافق</button>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {conflictRecord && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden p-8">
            <div className="flex items-center gap-3 mb-6"><div className="bg-amber-100 p-2 rounded-full"><AlertCircle className="h-6 w-6 text-amber-600" /></div><h3 className="text-xl font-black">تعارض في اسم الطابعة</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">اسم الطابعة موجود مسبقاً في فرع: <span className="font-bold">({conflictRecord.رقم_الفرع}) - {conflictRecord.اسم_الفرع_ar}</span></p>
            <div className="mb-6"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">تعديل اسم طابعة A4</label><input type="text" className="w-full px-4 py-2 bg-slate-50 border rounded-xl" value={manualA4} onChange={(e) => setManualA4(e.target.value)} /></div>
            <div className="flex gap-3"><button onClick={() => setConflictRecord(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">إلغاء</button><button onClick={() => handleSubmit()} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md">{loading ? 'جاري الحفظ...' : 'تعديل وحفظ'}</button></div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">إضافة سيرفر فرع جديد</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">تصنيف الفرع</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={branchCategory} onChange={(e) => setBranchCategory(e.target.value)}>
                  <option value="فلورينا">فلورينا</option><option value="فرنشايز">فرنشايز</option><option value="جملة">جملة</option><option value="موزع معتمد">موزع معتمد</option><option value="اسكتشر">اسكتشر</option><option value="فيلانتو">فيلانتو</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center"><span>رقم الفرع</span>{branchNoEdited && <button type="button" onClick={() => setBranchNoEdited(false)} className="text-xs text-indigo-600 hover:underline">إعادة التوليد</button>}</label>
                <input type="text" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" value={branchNo} onChange={(e) => { setBranchNo(e.target.value); setBranchNoEdited(true); }} dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المنطقة</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">-- اختر المنطقة --</option><option value="1-المدينة المنورة">1 - المدينة المنورة</option><option value="1-المنطقة الوسطى">1 - المنطقة الوسطى</option><option value="2-الرياض">2 - الرياض</option><option value="2-الدمام">2 - الدمام</option><option value="3-الجنوبية - أبها">3 - الجنوبية - أبها</option><option value="4-جدة">4 - جدة</option><option value="4-الغربية - مكة">4 - الغربية - مكة</option><option value="5-الشمالية تبوك">5 - الشمالية تبوك</option><option value="5-الطائف">5 - الطائف</option>
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">اسم الفرع (بالعربية)</label><input type="text" required placeholder="مثال: الرياض" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={branchNameAr} onChange={(e) => setBranchNameAr(e.target.value)} /></div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الفرع (بالإنجليزي)</label>
                <input type="text" required placeholder="مثال: RIYADH" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase" value={branchNameEn} onChange={(e) => setBranchNameEn(e.target.value.toUpperCase())} dir="ltr" />
                {branchNameEn && <p className="text-xs text-indigo-600 mt-2 font-medium">* اسم الطابعه A4 هو {branchNameEn.slice(0, 4)}BIGPRIN1</p>}
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="الافتتاح قريبا">الافتتاح قريباً</option><option value="يعمل">يعمل</option><option value="مغلق مؤقتا">مغلق مؤقتاً</option><option value="مغلق نهائياً">مغلق نهائياً</option>
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">اسم اليوزر</label><input type="text" required placeholder="Username" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label><input type="text" required placeholder="Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" /><p className="text-xs text-gray-500 mt-2">* سيتم تشفير كلمة المرور تلقائياً قبل الحفظ.</p></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">التسلسل (Serial)</label><input type="number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" value={serialNumber} onChange={(e) => setSerialNumber(parseInt(e.target.value))} /><p className="text-xs text-gray-500 mt-2">* تم الحساب تلقائياً.</p></div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4"><h2 className="text-base font-bold text-gray-700">البيانات الإضافية</h2>{renderRequirementBadge()}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={!requiredFields.street && !requiredFields.city ? 'opacity-40 pointer-events-none' : ''}><label className="block text-sm font-semibold text-gray-700 mb-2">اسم الشارع</label><input type="text" required={requiredFields.street} placeholder={requiredFields.street ? 'مثال: شارع الملك فهد' : 'غير مطلوب'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={streetName} onChange={(e) => setStreetName(e.target.value)} disabled={!requiredFields.street && !requiredFields.city} /></div>
                <div className={!requiredFields.street && !requiredFields.city ? 'opacity-40 pointer-events-none' : ''}><label className="block text-sm font-semibold text-gray-700 mb-2">اسم المدينة</label><input type="text" required={requiredFields.city} placeholder={requiredFields.city ? 'مثال: الرياض' : 'غير مطلوب'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={cityName} onChange={(e) => setCityName(e.target.value)} disabled={!requiredFields.street && !requiredFields.city} /></div>
                <div className={!requiredFields.taxNo ? 'opacity-40 pointer-events-none' : ''}><label className="block text-sm font-semibold text-gray-700 mb-2">الرقم الضريبي</label><input type="text" required={requiredFields.taxNo} placeholder={requiredFields.taxNo ? 'مثال: 3000000000' : 'غير مطلوب'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={taxNo} onChange={(e) => setTaxNo(e.target.value)} disabled={!requiredFields.taxNo} dir="ltr" /></div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex justify-center items-center gap-2">{loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : 'حفظ السيرفر الجديد'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
