'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import CryptoJS from 'crypto-js';
import Link from 'next/link';
import { Eye, Copy } from 'lucide-react';

export default function ServersTable() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // حالات فك التشفير
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({});

  // حالات التعديل والحذف
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    رقم_الفرع: '',
    اسم_الفرع_ar: '',
    اسم_الفرع_en: '',
    اسم_اليوزر: '',
    باسوورد: '',
    حالة_اليوزر: '',
    تصنيف_الفرع: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // إخفاء الباسوورد في حال الضغط في أي مكان آخر بالصفحة
  useEffect(() => {
    const handleGlobalClick = () => {
      setDecryptedPasswords({});
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const fetchData = async () => {
    const { data: records, error } = await supabase
      .from('server_data')
      .select('*')
      .order('id', { ascending: false });

    if (records) setData(records);
    if (error) console.error("Error fetching data:", error);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً؟')) return;
    const { error } = await supabase.from('server_data').delete().eq('id', id);
    if (error) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    } else {
      fetchData();
    }
  };

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      رقم_الفرع: record.رقم_الفرع,
      اسم_الفرع_ar: record.اسم_الفرع_ar,
      اسم_الفرع_en: record.اسم_الفرع_en,
      اسم_اليوزر: record.اسم_اليوزر,
      باسوورد: '', // نترك الباسوورد فارغاً إلا إذا أراد المستخدم تحديثه
      حالة_اليوزر: record.حالة_اليوزر,
      تصنيف_الفرع: record.تصنيف_الفرع || 'فلورينا'
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedData: any = {
        رقم_الفرع: editForm.رقم_الفرع,
        اسم_الفرع_ar: editForm.اسم_الفرع_ar,
        اسم_الفرع_en: editForm.اسم_الفرع_en.toUpperCase(),
        اسم_اليوزر: editForm.اسم_اليوزر,
        حالة_اليوزر: editForm.حالة_اليوزر,
        تصنيف_الفرع: editForm.تصنيف_الفرع
      };

      // إذا قام المستخدم بكتابة باسوورد جديد، نقوم بتشفيره
      if (editForm.باسوورد.trim() !== '') {
        updatedData.باسوورد = CryptoJS.AES.encrypt(editForm.باسوورد, 'sols').toString();
      }

      const { error } = await supabase
        .from('server_data')
        .update(updatedData)
        .eq('id', editingRecord.id);

      if (error) throw error;

      setShowEditModal(false);
      fetchData();
    } catch (error: any) {
      alert('حدث خطأ أثناء التعديل: ' + error.message);
    }
  };

  const handleShowPassword = (id: number) => {
    setSelectedRecordId(id);
    setShowPasswordDialog(true);
    setDecryptionKey('');
  };

  const submitDecryption = () => {
    if (decryptionKey !== 'sols') {
      alert('كلمة المرور غير صحيحة');
      return;
    }

    const record = data.find(r => r.id === selectedRecordId);
    if (record) {
      try {
        const bytes = CryptoJS.AES.decrypt(record.باسوورد, 'sols');
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (!originalText) throw new Error('فشل فك التشفير');

        setDecryptedPasswords(prev => ({
          ...prev,
          [selectedRecordId!]: originalText
        }));
        setShowPasswordDialog(false);

        // إخفاء تلقائي بعد 5 ثواني
        setTimeout(() => {
          setDecryptedPasswords({});
        }, 5000);
      } catch (e) {
        alert('حدث خطأ أثناء فك التشفير');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'رقم الفرع', 'اسم الفرع AR', 'اسم الفرع EN', 'اسم اليوزر', 'الحالة', 'تاريخ الانشاء'];
    const rows = data.map(r => [
      r.id, r.رقم_الفرع, r.اسم_الفرع_ar, r.اسم_الفرع_en, r.اسم_اليوزر, r.حالة_اليوزر, r.تاريخ_الانشاء
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "servers_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  // حالات التقارير والفلترة بالتاريخ
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // تقرير بعدد اليوزرات حسب الحالة
  const stats = data.reduce((acc: any, curr: any) => {
    acc[curr.حالة_اليوزر] = (acc[curr.حالة_اليوزر] || 0) + 1;
    return acc;
  }, {});

  const filteredData = data.filter(r => {
    const matchesSearch =
      String(r.رقم_الفرع || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.اسم_الفرع_ar || '').includes(search) ||
      String(r.اسم_الفرع_en || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.حالة_اليوزر || '').includes(search);

    if (!matchesSearch) return false;

    if (statusFilter && r.حالة_اليوزر !== statusFilter) return false;

    if (startDate || endDate) {
      const createdDate = new Date(r.تاريخ_الانشاء);
      if (startDate && createdDate < new Date(startDate)) return false;
      // نزيد يوماً واحداً على تاريخ النهاية ليشمل اليوم كاملاً
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        if (createdDate > end) return false;
      }
    }
    return true;
  });

  return (
    <div className="p-8 font-sans bg-gray-50 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            بيانات السيرفر
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/servers/add"
              className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-2.5 rounded-lg shadow-md font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة سيرفر جديد
            </Link>
            <button
              onClick={exportToCSV}
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-6 py-2.5 rounded-lg shadow-md font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              تصدير إلى Excel
            </button>
          </div>
        </div>

        {/* قسم الإحصائيات (التقارير) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter(statusFilter === 'يعمل' ? null : 'يعمل')}
            className={`p-4 rounded-xl shadow-sm border flex flex-col items-center transition-all cursor-pointer ${statusFilter === 'يعمل'
              ? 'bg-green-50 dark:bg-green-950/20 border-green-500 dark:border-green-500 ring-2 ring-green-500/20'
              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/50 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md'
              }`}
          >
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">يعمل</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats['يعمل'] || 0}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'الافتتاح قريبا' ? null : 'الافتتاح قريبا')}
            className={`p-4 rounded-xl shadow-sm border flex flex-col items-center transition-all cursor-pointer ${statusFilter === 'الافتتاح قريبا'
              ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md'
              }`}
          >
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">الافتتاح قريبا</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats['الافتتاح قريبا'] || 0}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'مغلق مؤقتا' ? null : 'مغلق مؤقتا')}
            className={`p-4 rounded-xl shadow-sm border flex flex-col items-center transition-all cursor-pointer ${statusFilter === 'مغلق مؤقتا'
              ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 dark:border-yellow-500 ring-2 ring-yellow-500/20'
              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/50 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-md'
              }`}
          >
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">مغلق مؤقتا</span>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats['مغلق مؤقتا'] || 0}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'مغلق نهائياً' ? null : 'مغلق نهائياً')}
            className={`p-4 rounded-xl shadow-sm border flex flex-col items-center transition-all cursor-pointer ${statusFilter === 'مغلق نهائياً'
              ? 'bg-red-50 dark:bg-red-950/20 border-red-500 dark:border-red-500 ring-2 ring-red-500/20'
              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/50 hover:border-red-500 dark:hover:border-red-500 hover:shadow-md'
              }`}
          >
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">مغلق نهائياً</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats['مغلق نهائياً'] || 0}</span>
          </button>
        </div>

        {/* حقول وهمية تمنع المتصفح من الملء التلقائي */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input type="text" name="fakeusernameremembered" tabIndex={-1} autoComplete="username" />
          <input type="password" name="fakepasswordremembered" tabIndex={-1} autoComplete="current-password" />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50 mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">بحث</label>
            <input
              type="text"
              id="table-search-box"
              name="table-search-box"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              placeholder="ابحث برقم الفرع، الاسم، أو الحالة..."
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">من تاريخ الإنشاء</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">إلى تاريخ الإنشاء</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto max-h-[600px] bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-100 dark:border-slate-700/50">
          <table className="min-w-full text-right border-collapse">
            <thead className="sticky top-0 bg-gray-100 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">رقم الفرع</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">الاسم (AR)</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">التصنيف</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">الاسم (EN)</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">اليوزر</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">الباسوورد</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">الحالة</th>
                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-slate-300">الخيارات</th>
              </tr> 
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredData.map(row => {
                const rowBorderClass =
                  row.حالة_اليوزر === 'يعمل' ? 'border-r-4 border-r-green-500' :
                    row.حالة_اليوزر === 'مغلق نهائياً' ? 'border-r-4 border-r-red-500' :
                      row.حالة_اليوزر === 'الافتتاح قريبا' ? 'border-r-4 border-r-blue-500' :
                        'border-r-4 border-r-yellow-500';

                const rowBgClass =
                  row.تصنيف_الفرع === 'فلورينا' ? 'bg-sky-100/70 dark:bg-sky-950/30' :
                  row.تصنيف_الفرع === 'فرنشايز' ? 'bg-purple-100/70 dark:bg-purple-950/30' :
                  row.تصنيف_الفرع === 'جملة' ? 'bg-amber-100/70 dark:bg-amber-950/30' :
                  row.تصنيف_الفرع === 'موزع معتمد' ? 'bg-emerald-100/70 dark:bg-emerald-950/30' :
                  row.تصنيف_الفرع === 'اسكتشر' ? 'bg-indigo-100/70 dark:bg-indigo-950/30' :
                  row.تصنيف_الفرع === 'فيلانتو' ? 'bg-rose-100/70 dark:bg-rose-950/30' :
                  'bg-white dark:bg-slate-800';

                const rowBorderColorClass =
                  row.تصنيف_الفرع === 'فلورينا' ? 'border-sky-300 dark:border-sky-700' :
                  row.تصنيف_الفرع === 'فرنشايز' ? 'border-purple-300 dark:border-purple-700' :
                  row.تصنيف_الفرع === 'جملة' ? 'border-amber-300 dark:border-amber-700' :
                  row.تصنيف_الفرع === 'موزع معتمد' ? 'border-emerald-300 dark:border-emerald-700' :
                  row.تصنيف_الفرع === 'اسكتشر' ? 'border-indigo-300 dark:border-indigo-700' :
                  row.تصنيف_الفرع === 'فيلانتو' ? 'border-rose-300 dark:border-rose-700' :
                  'border-gray-200 dark:border-slate-700';

                return (
                  <tr key={row.id} className={`border-b-2 ${rowBorderColorClass} ${rowBgClass} hover:bg-indigo-50/30 dark:hover:bg-slate-700/30 transition-colors ${rowBorderClass}`}>
                    <td className="p-4 font-medium text-gray-900 dark:text-slate-100">{row.رقم_الفرع}</td>
                    <td className="p-4 text-gray-700 dark:text-slate-300">{row.اسم_الفرع_ar}</td>
                    <td className="p-4 text-gray-700 dark:text-slate-300 font-medium">{row.تصنيف_الفرع || '—'}</td>
                    <td className="p-4 text-gray-700 dark:text-slate-300">{row.اسم_الفرع_en}</td>
                    <td className="p-4 text-gray-700 dark:text-slate-300">{row.اسم_اليوزر}</td>
                    <td className="p-4">
                      {decryptedPasswords[row.id] ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="font-mono text-green-600 dark:text-green-400 font-bold tracking-wider">{decryptedPasswords[row.id]}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(decryptedPasswords[row.id]);
                              setDecryptedPasswords({});
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-xl transition-all hover:scale-110 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30"
                            title="نسخ كلمة المرور"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <span className="text-gray-400 tracking-widest">••••••</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowPassword(row.id);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-xl transition-all hover:scale-110 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30"
                            title="إظهار كلمة المرور"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.حالة_اليوزر === 'يعمل' ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50' :
                          row.حالة_اليوزر === 'مغلق نهائياً' ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50' :
                            row.حالة_اليوزر === 'الافتتاح قريبا' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' :
                              'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50'
                        }`}>
                        {row.حالة_اليوزر}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-slate-400">
                    لا توجد بيانات مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPasswordDialog && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-slate-700 transform transition-all scale-100">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-slate-100">الصلاحية مطلوبة</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">الرجاء إدخال كلمة المرور الآمنة (sols) لعرض بيانات الدخول:</p>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left font-mono tracking-widest mb-6"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder="••••"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitDecryption()}
            />
            <div className="flex gap-3">
              <button
                onClick={submitDecryption}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                تأكيد
              </button>
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 font-medium py-2.5 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل البيانات (Edit Modal) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">تعديل بيانات السيرفر</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">تصنيف الفرع</label>
                  <select
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.تصنيف_الفرع || 'فلورينا'}
                    onChange={(e) => setEditForm({ ...editForm, تصنيف_الفرع: e.target.value })}
                  >
                    <option value="فلورينا">فلورينا</option>
                    <option value="فرنشايز">فرنشايز</option>
                    <option value="جملة">جملة</option>
                    <option value="موزع معتمد">موزع معتمد</option>
                    <option value="اسكتشر">اسكتشر</option>
                    <option value="فيلانتو">فيلانتو</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">رقم الفرع</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.رقم_الفرع}
                    onChange={(e) => setEditForm({ ...editForm, رقم_الفرع: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">الحالة</label>
                  <select
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.حالة_اليوزر}
                    onChange={(e) => setEditForm({ ...editForm, حالة_اليوزر: e.target.value })}
                  >
                    <option value="الافتتاح قريبا">الافتتاح قريبا</option>
                    <option value="يعمل">يعمل</option>
                    <option value="مغلق مؤقتا">مغلق مؤقتا</option>
                    <option value="مغلق نهائياً">مغلق نهائياً</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">الاسم (AR)</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.اسم_الفرع_ar}
                    onChange={(e) => setEditForm({ ...editForm, اسم_الفرع_ar: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">الاسم (EN)</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.اسم_الفرع_en}
                    onChange={(e) => setEditForm({ ...editForm, اسم_الفرع_en: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">اليوزر</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.اسم_اليوزر}
                    onChange={(e) => setEditForm({ ...editForm, اسم_اليوزر: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">باسوورد جديد (اختياري)</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editForm.باسوورد}
                    onChange={(e) => setEditForm({ ...editForm, باسوورد: e.target.value })}
                    placeholder="اتركه فارغاً للاحتفاظ بالقديم"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  تحديث البيانات
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 font-medium py-2.5 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
