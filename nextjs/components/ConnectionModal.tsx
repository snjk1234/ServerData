'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Save, Search } from 'lucide-react';

interface ConnectionModalProps {
  mode: 'add' | 'edit';
  branches?: any[];
  connection?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ConnectionModal({ mode, branches, connection, onClose, onSaved }: ConnectionModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(mode === 'edit' && connection ? connection.رقم_الفرع : '');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();
  
  const initialData = mode === 'edit' && connection ? connection : {};
  
  const [formData, setFormData] = useState({
    نوع_الاتصال: initialData.نوع_الاتصال || '',
    مزود_الخدمة: initialData.مزود_الخدمة || '',
    رقم_الخدمة: initialData.رقم_الخدمة || '',
    دورة_التجديد: initialData.دورة_التجديد || '',
    تاريخ_الشراء: initialData.تاريخ_الشراء || '',
    تاريخ_الانتهاء: initialData.تاريخ_الانتهاء || '',
    التكلفة: initialData.التكلفة || '',
    مجموعة_الباقة: initialData.مجموعة_الباقة || '',
    نوع_الشريحة: initialData.نوع_الشريحة || '',
    ملاحظات: initialData.ملاحظات || '',
  });

  // Calculate Expiry Date based on Purchase Date and Renewal Cycle
  useEffect(() => {
    if (formData.تاريخ_الشراء && formData.دورة_التجديد && !initialData.تاريخ_الانتهاء) {
      const date = new Date(formData.تاريخ_الشراء);
      const cycle = formData.دورة_التجديد;
      if (cycle === '1 شهر') date.setMonth(date.getMonth() + 1);
      else if (cycle === '3 أشهر') date.setMonth(date.getMonth() + 3);
      else if (cycle === '4 أشهر') date.setMonth(date.getMonth() + 4);
      else if (cycle === '6 أشهر') date.setMonth(date.getMonth() + 6);
      else if (cycle === '1 سنة') date.setFullYear(date.getFullYear() + 1);
      
      const formattedDate = date.toISOString().split('T')[0];
      if (formattedDate !== formData.تاريخ_الانتهاء) {
        setFormData(prev => ({ ...prev, تاريخ_الانتهاء: formattedDate }));
      }
    }
  }, [formData.تاريخ_الشراء, formData.دورة_التجديد, formData.تاريخ_الانتهاء, initialData.تاريخ_الانتهاء]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (mode === 'add' && !selectedBranchId) {
      alert('يرجى اختيار الفرع أولاً');
      return;
    }
    
    setIsSaving(true);
    try {
      const branchIdToSave = mode === 'add' ? selectedBranchId : connection.رقم_الفرع;
      const payload: any = {
        رقم_الفرع: branchIdToSave,
        ...formData,
        تاريخ_التحديث: new Date().toISOString()
      };

      // Clean up empty strings for dates/numbers to avoid Supabase errors
      if (!payload.تاريخ_الشراء) payload.تاريخ_الشراء = null;
      if (!payload.تاريخ_الانتهاء) payload.تاريخ_الانتهاء = null;
      if (!payload.التكلفة) payload.التكلفة = null;

      if (mode === 'edit' && connection?.connection_id) {
        const { error } = await (supabase as any)
          .from('branch_connections')
          .update(payload)
          .eq('id', connection.connection_id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('branch_connections')
          .insert([payload]);
        if (error) throw error;
      }
      
      onSaved();
      onClose();
    } catch (error: any) {
      alert('تفاصيل الخطأ: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBranches = mode === 'add' && branches 
    ? branches.filter(b => b.اسم_الفرع_ar?.includes(searchQuery) || String(b.رقم_الفرع).includes(searchQuery))
    : [];

  const modalTitle = mode === 'add' ? 'إضافة بيانات اتصال جديدة' : 'تعديل بيانات الاتصال';
  const submitButtonText = mode === 'add' ? 'إضافة بيانات الاتصال' : 'حفظ البيانات';
  const themeColorClass = mode === 'add' ? 'green' : 'orange';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-black text-gray-800 dark:text-slate-100">
              {modalTitle}
            </h2>
            {mode === 'edit' && connection && (
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                الفرع: {connection.رقم_الفرع} - {connection.اسم_الفرع_ar}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* Branch Selection for ADD Mode */}
          {mode === 'add' && (
            <div className="space-y-1.5 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
              <label className="text-sm font-bold text-indigo-800 dark:text-indigo-300">اختيار الفرع *</label>
              <div className="flex gap-2">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- اختر الفرع --</option>
                  {filteredBranches.map(b => (
                    <option key={b.رقم_الفرع} value={b.رقم_الفرع}>
                      {b.رقم_الفرع} - {b.اسم_الفرع_ar}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-indigo-400" />
                <input
                  type="text"
                  placeholder="بحث في الفروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
          {mode === 'add' && <hr className="border-gray-100 dark:border-slate-700" />}

          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">نوع الاتصال</label>
              <select
                name="نوع_الاتصال"
                value={formData.نوع_الاتصال}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}
              >
                <option value="">اختيار...</option>
                <option value="شريحة بيانات">شريحة بيانات</option>
                <option value="فايبر (ألياف)">فايبر (ألياف)</option>
                <option value="نحاسي (DSL)">نحاسي (DSL)</option>
                <option value="5G">راوتر 5G</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">مزود الخدمة</label>
              <select
                name="مزود_الخدمة"
                value={formData.مزود_الخدمة}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}
              >
                <option value="">اختيار...</option>
                <option value="STC">STC</option>
                <option value="Mobily">Mobily</option>
                <option value="Zain">Zain</option>
                <option value="Salam">Salam</option>
                <option value="GO">GO</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">رقم الخدمة / الشريحة</label>
              <input
                type="text"
                name="رقم_الخدمة"
                value={formData.رقم_الخدمة}
                onChange={handleChange}
                placeholder="مثال: 05xxxx أو رقم الحساب"
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">التكلفة (ريال)</label>
              <input
                type="number"
                name="التكلفة"
                value={formData.التكلفة}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}
              />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-700" />

          {/* Section 2: Dates and Renewal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">دورة التجديد</label>
              <select
                name="دورة_التجديد"
                value={formData.دورة_التجديد}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-${themeColorClass}-50 dark:bg-${themeColorClass}-900/10 border border-${themeColorClass}-200 dark:border-${themeColorClass}-900/50 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none font-semibold text-${themeColorClass}-900 dark:text-${themeColorClass}-100`}
              >
                <option value="">بدون تجديد دوري</option>
                <option value="1 شهر">شهري (1 شهر)</option>
                <option value="3 أشهر">ربع سنوي (3 أشهر)</option>
                <option value="4 أشهر">ثلث سنوي (4 أشهر)</option>
                <option value="6 أشهر">نصف سنوي (6 أشهر)</option>
                <option value="1 سنة">سنوي (1 سنة)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-slate-400">تاريخ الشراء / آخر تجديد</label>
              <input
                type="date"
                name="تاريخ_الشراء"
                value={formData.تاريخ_الشراء}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-600 dark:text-red-400 flex justify-between">
                تاريخ الانتهاء
                <span className="text-[9px] bg-red-100 dark:bg-red-900/40 px-1 rounded-sm">يحسب للإنذارات</span>
              </label>
              <input
                type="date"
                name="تاريخ_الانتهاء"
                value={formData.تاريخ_الانتهاء}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-700 dark:text-red-400"
              />
            </div>
          </div>

          {/* Section 3: Shared Packages */}
          {formData.نوع_الاتصال === 'شريحة بيانات' && (
            <>
              <hr className="border-gray-100 dark:border-slate-700" />
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <h3 className="text-xs font-extrabold text-indigo-800 dark:text-indigo-300">إعدادات الباقات المشتركة (إذا كانت الشريحة ضمن باقة)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400">اسم أو رقم الباقة (لربط الفروع معاً)</label>
                    <input
                      type="text"
                      name="مجموعة_الباقة"
                      value={formData.مجموعة_الباقة}
                      onChange={handleChange}
                      placeholder="مثال: باقة رقم 1"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400">نوع الشريحة ضمن الباقة</label>
                    <select
                      name="نوع_الشريحة"
                      value={formData.نوع_الشريحة}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">عادية / غير مشتركة</option>
                      <option value="رئيسية">شريحة رئيسية</option>
                      <option value="إضافية">شريحة إضافية</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400">ملاحظات إضافية</label>
            <textarea
              name="ملاحظات"
              value={formData.ملاحظات}
              onChange={handleChange}
              rows={2}
              className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none resize-none`}
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (mode === 'add' && !selectedBranchId)}
            className={`px-6 py-2 bg-${themeColorClass}-600 hover:bg-${themeColorClass}-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-${themeColorClass}-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50`}
          >
            {isSaving ? (
              <>جاري الحفظ...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
