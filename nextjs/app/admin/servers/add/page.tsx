'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import { AlertCircle, ShieldAlert, Printer } from 'lucide-react';

// دالة لتحديد ما هو مطلوب حسب تصنيف الفرع
function getRequiredFields(category: string): { street: boolean; city: boolean; taxNo: boolean } {
  if (category === 'فرنشايز' || category === 'فيلانتو') {
    return { street: true, city: true, taxNo: true };
  } else if (category === 'فلورينا' || category === 'جملة') {
    return { street: false, city: true, taxNo: false };
  } else {
    // اسكتشر، موزع معتمد
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

  // جلب البيانات الحالية لمعرفة التسلسل المتاح
  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase.from('server_data').select('رقم_الفرع, اسم_الفرع_ar, تصنيف_الفرع, serial_number, طابعة_a4, طابعة_فواتير');
      if (data) setAllRecords(data);
    };
    fetchExisting();
  }, []);

  // حساب رقم السيرفر تلقائياً عند تغيير التصنيف
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
    let formattedNo = '';
    if (hasBR) {
      formattedNo = `BR${String(nextNum).padStart(3, '0')}`;
    } else {
      formattedNo = String(nextNum);
    }

    setBranchNo(formattedNo);

    // حساب التسلسل التالي
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
      // جلب البيانات الطازجة للتأكد من عدم التكرار
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

      setConflictRecord(null); // Clear conflict only on success
      router.push('/admin/servers?success=added');
      router.refresh();

    } catch (err: any) {
      const msg = err.message || 'حدث خطأ غير متوقع';
      if (conflictRecord) {
        setModalError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // بادج يوضح ما هو مطلوب حسب التصنيف
  const renderRequirementBadge = () => {
    if (branchCategory === 'فرنشايز' || branchCategory === 'فيلانتو') {
      return (
        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
          يلزم: الشارع + المدينة + الرقم الضريبي
        </span>
      );
    } else if (branchCategory === 'فلورينا' || branchCategory === 'جملة') {
      return (
        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
          يلزم: المدينة فقط
        </span>
      );
    } else {
      return (
        <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
          لا يلزم تعبئة هذه الحقول
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8 font-sans transition-colors duration-300 relative" dir="rtl">
      
      {/* نافذة تنبيه خطأ التنسيق */}
      {validationError && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-100 animate-in slide-in-from-top-10 duration-500">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">خطأ في التنسيق</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                {validationError}
              </p>
              <button
                onClick={() => setValidationError(null)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعارض الطابعة */}
      {conflictRecord && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-top-10 duration-500">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6 text-slate-800 dark:text-slate-100">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black">تعارض في اسم الطابعة</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                {modalError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
                    {modalError}
                  </div>
                )}
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  اسم الطابعة موجود مسبقاً في فرع آخر:
                  <span className="block mt-1 font-bold text-slate-800 dark:text-slate-200">
                    ({conflictRecord.رقم_الفرع}) - {conflictRecord.اسم_الفرع_ar}
                  </span>
                </p>

                <div className="pt-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">تعديل اسم طابعة A4</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                    value={manualA4}
                    onChange={(e) => setManualA4(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConflictRecord(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'تعديل وحفظ'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">إضافة سيرفر فرع جديد</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 font-medium border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* تصنيف الفرع */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">تصنيف الفرع</label>
                <select
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={branchCategory}
                  onChange={(e) => setBranchCategory(e.target.value)}
                >
                  <option value="فلورينا">فلورينا</option>
                  <option value="فرنشايز">فرنشايز</option>
                  <option value="جملة">جملة</option>
                  <option value="موزع معتمد">موزع معتمد</option>
                  <option value="اسكتشر">اسكتشر</option>
                  <option value="فيلانتو">فيلانتو</option>
                </select>
              </div>

              {/* رقم الفرع */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex justify-between items-center">
                  <span>رقم الفرع</span>
                  {branchNoEdited && (
                    <button
                      type="button"
                      onClick={() => setBranchNoEdited(false)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      إعادة التوليد التلقائي
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={branchNo}
                  onChange={(e) => {
                    setBranchNo(e.target.value);
                    setBranchNoEdited(true);
                  }}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  * تم التوليد تلقائياً. يمكنك تعديله يدوياً إذا رغبت.
                </p>
              </div>

              {/* المنطقة */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">المنطقة</label>
                <select
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">-- اختر المنطقة --</option>
                  <option value="1-المدينة المنورة">1 - المدينة المنورة</option>
                  <option value="1-المنطقة الوسطى">1 - المنطقة الوسطى</option>
                  <option value="2-الرياض">2 - الرياض</option>
                  <option value="2-الدمام">2 - الدمام</option>
                  <option value="3-الجنوبية - أبها">3 - الجنوبية - أبها</option>
                  <option value="4-جدة">4 - جدة</option>
                  <option value="4-الغربية - مكة">4 - الغربية - مكة</option>
                  <option value="5-الشمالية تبوك">5 - الشمالية تبوك</option>
                  <option value="5-الطائف">5 - الطائف</option>
                </select>
              </div>

              {/* اسم الفرع بالعربي */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">اسم الفرع (بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرياض"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={branchNameAr}
                  onChange={(e) => setBranchNameAr(e.target.value)}
                />
              </div>

              {/* اسم الفرع بالانجليزي */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">اسم الفرع (باللغة الإنجليزية)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: RIYADH"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  value={branchNameEn}
                  onChange={(e) => setBranchNameEn(e.target.value.toUpperCase())}
                  dir="ltr"
                />
                {branchNameEn && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                    * اسم الطابعه A4 هو {branchNameEn.slice(0, 4)}BIGPRIN1 والفواتير {branchNameEn.slice(0, 4)}SPRI
                  </p>
                )}
              </div>

              {/* الحالة */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">الحالة</label>
                <select
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="الافتتاح قريبا">الافتتاح قريباً</option>
                  <option value="يعمل">يعمل</option>
                  <option value="مغلق مؤقتا">مغلق مؤقتاً</option>
                  <option value="مغلق نهائياً">مغلق نهائياً</option>
                </select>
              </div>

              {/* اسم اليوزر */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">اسم اليوزر</label>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="ltr"
                />
              </div>

              {/* باسوورد */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">كلمة المرور (الباسوورد)</label>
                <input
                  type="text"
                  required
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  * سيتم تشفير كلمة المرور تلقائياً قبل الحفظ ولن يتمكن أحد من رؤيتها بدون الرمز (sols).
                </p>
              </div>

              {/* التسلسل */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">التسلسل (Serial)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  * تم الحساب تلقائياً ويمكنك تعديله.
                </p>
              </div>

            </div>

            {/* ─── قسم البيانات الإضافية (الشارع / المدينة / الرقم الضريبي) ─── */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-700 dark:text-slate-200">البيانات الإضافية</h2>
                {renderRequirementBadge()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* اسم الشارع */}
                <div className={!requiredFields.street && !requiredFields.city ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    اسم الشارع
                    {requiredFields.street && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required={requiredFields.street}
                    placeholder={requiredFields.street ? 'مثال: شارع الملك فهد' : 'غير مطلوب'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    disabled={!requiredFields.street && !requiredFields.city}
                  />
                </div>

                {/* اسم المدينة */}
                <div className={!requiredFields.street && !requiredFields.city ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    اسم المدينة
                    {requiredFields.city && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required={requiredFields.city}
                    placeholder={requiredFields.city ? 'مثال: الرياض' : 'غير مطلوب'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    disabled={!requiredFields.street && !requiredFields.city}
                  />
                </div>

                {/* الرقم الضريبي */}
                <div className={!requiredFields.taxNo ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    الرقم الضريبي
                    {requiredFields.taxNo && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  <input
                    type="text"
                    required={requiredFields.taxNo}
                    placeholder={requiredFields.taxNo ? 'مثال: 3000000000' : 'غير مطلوب'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={taxNo}
                    onChange={(e) => setTaxNo(e.target.value)}
                    disabled={!requiredFields.taxNo}
                    dir="ltr"
                  />
                </div>

              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    حفظ السيرفر الجديد
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
