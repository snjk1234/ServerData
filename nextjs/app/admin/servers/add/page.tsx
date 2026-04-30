'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';

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

  const [allRecords, setAllRecords] = useState<any[]>([]);

  // جلب البيانات الحالية لمعرفة التسلسل المتاح
  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase.from('server_data').select('رقم_الفرع, تصنيف_الفرع');
      if (data) setAllRecords(data);
    };
    fetchExisting();
  }, []);

  // حساب رقم السيرفر تلقائياً عند تغيير التصنيف
  useEffect(() => {
    if (branchNoEdited) return; // عدم إعادة التوليد إذا تم التعديل يدوياً

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
  }, [branchCategory, allRecords, branchNoEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // تشفير كلمة المرور قبل إرسالها لقاعدة البيانات باستخدام كلمة السر 'sols'
      const encryptedPassword = CryptoJS.AES.encrypt(password, 'sols').toString();

      const { error: insertError } = await supabase
        .from('server_data')
        .insert([
          {
            رقم_الفرع: branchNo,
            تصنيف_الفرع: branchCategory,
            اسم_الفرع_ar: branchNameAr,
            اسم_الفرع_en: branchNameEn.toUpperCase(), // إجبار الحروف الكبيرة
            اسم_اليوزر: username,
            باسوورد: encryptedPassword,
            حالة_اليوزر: status,
            طابعة_a4: `${branchNameEn.slice(0, 4)}BIGPRIN1`,
            طابعة_فواتير: `${branchNameEn.slice(0, 4)}SPRI`,
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('رقم الفرع مسجل مسبقاً، الرجاء استخدام رقم آخر.');
        }
        throw new Error(insertError.message);
      }

      // بعد النجاح، نعود إلى صفحة الجدول
      router.push('/admin/servers');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8 font-sans transition-colors duration-300" dir="rtl">
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
