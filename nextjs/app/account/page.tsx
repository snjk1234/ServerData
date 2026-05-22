'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import CryptoJS from 'crypto-js';
import Link from 'next/link';
import { Eye, EyeOff, Copy, Printer, Trash2, LayoutGrid, Store, ShieldCheck, ShoppingBag, Layers, Sparkles, Footprints, Edit, Save, AlertTriangle, Key, AlertCircle, Users, BarChart2, Activity, UserX, Check, X, Shield, RefreshCw } from 'lucide-react';
import PrintableBranchFoundation from '@/components/PrintableBranchFoundation';

const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'فلورينا', name: 'فلورينا' },
  { id: 'فرنشايز', name: 'فرنشايز' },
  { id: 'جملة', name: 'جملة' },
  { id: 'موزع معتمد', name: 'موزع معتمد' },
  { id: 'اسكتشر', name: 'اسكتشر' },
  { id: 'فيلانتو', name: 'فيلانتو' },
  { id: 'الإدارة', name: 'الإدارة' }
];

const categoryThemes: Record<string, {
  activeBg: string;
  badgeActive: string;
  badgeInactive: string;
  borderHover: string;
  textActive: string;
  iconBg: string;
  iconColor: string;
}> = {
  all: {
    activeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  'فلورينا': {
    activeBg: 'bg-sky-600 dark:bg-sky-500 text-white shadow-lg shadow-sky-500/20 dark:shadow-none',
    badgeActive: 'bg-sky-700/50 text-sky-100',
    badgeInactive: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    borderHover: 'hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-950/50',
    iconColor: 'text-sky-600 dark:text-sky-400'
  },
  'فرنشايز': {
    activeBg: 'bg-purple-600 dark:bg-purple-500 text-white shadow-lg shadow-purple-500/20 dark:shadow-none',
    badgeActive: 'bg-purple-700/50 text-purple-100',
    badgeInactive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    borderHover: 'hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  'جملة': {
    activeBg: 'bg-amber-500 dark:bg-amber-500 text-white shadow-lg shadow-amber-500/20 dark:shadow-none',
    badgeActive: 'bg-amber-600/50 text-amber-100',
    badgeInactive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  'موزع معتمد': {
    activeBg: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-none',
    badgeActive: 'bg-emerald-700/50 text-emerald-100',
    badgeInactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  'اسكتشر': {
    activeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  'فيلانتو': {
    activeBg: 'bg-rose-600 dark:bg-rose-500 text-white shadow-lg shadow-rose-500/20 dark:shadow-none',
    badgeActive: 'bg-rose-700/50 text-rose-100',
    badgeInactive: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-950/50',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  'الإدارة': {
    activeBg: 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg shadow-slate-500/20 dark:shadow-none',
    badgeActive: 'bg-slate-900/50 text-slate-100',
    badgeInactive: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400',
    borderHover: 'hover:border-slate-500 hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
    textActive: 'text-slate-850 dark:text-slate-300',
    iconBg: 'bg-slate-200 dark:bg-slate-800/50',
    iconColor: 'text-slate-750 dark:text-slate-400'
  },
  stats: {
    activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-550/25',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  users: {
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-555/25',
    badgeActive: 'bg-emerald-700/50 text-emerald-100',
    badgeInactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  }
};

const renderCategoryIcon = (id: string, className = "w-5 h-5") => {
  switch (id) {
    case 'all': return <LayoutGrid className={className} />;
    case 'فلورينا': return <ShoppingBag className={className} />;
    case 'فرنشايز': return <Store className={className} />;
    case 'جملة': return <Layers className={className} />;
    case 'موزع معتمد': return <ShieldCheck className={className} />;
    case 'اسكتشر': return <Footprints className={className} />;
    case 'فيلانتو': return <Sparkles className={className} />;
    case 'الإدارة': return <Users className={className} />;
    case 'stats': return <BarChart2 className={className} />;
    case 'users': return <Users className={className} />;
    default: return <Store className={className} />;
  }
};

export default function AccountServersTable() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // 1. صلاحيات المشرفين وتصفية التبويبات والمستخدم الحالي
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<any[]>(categories);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // 2. حالات التحكم بحذف المستخدمين
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showUserDeleteDialog, setShowUserDeleteDialog] = useState(false);
  const [userDeleteError, setUserDeleteError] = useState('');

  // 3. حالة إظهار كافة كلمات المرور
  const [isAllPasswordsRevealed, setIsAllPasswordsRevealed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // حالات فك التشفير المنفرد
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({});

  // حالات الحذف
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteKey, setDeleteKey] = useState('');
  const [serverToDelete, setServerToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState('');

  // حالات التنبيهات (Toast) والعد التنازلي
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // حالات التعديل والحذف
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [printingRecord, setPrintingRecord] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    رقم_الفرع: '',
    اسم_الفرع_ar: '',
    اسم_الفرع_en: '',
    اسم_اليوزر: '',
    باسوورد: '',
    حالة_اليوزر: '',
    تصنيف_الفرع: '',
    طابعة_a4: '',
    طابعة_فواتير: '',
    اسم_الشارع: '',
    اسم_المدينة: '',
    الرقم_الضريبي: '',
    المنطقة: '',
    serial_number: 100000
  });

  useEffect(() => {
    fetchData();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
        
        // جلب بيانات الحساب الإضافية من جدول المستخدمين
        const { data: profile } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUser(profile);
          const isUserAdmin = profile.role === 'admin';
          setIsAdmin(isUserAdmin);

          let allowed = profile.allowed_categories || [];
          let filteredCats = categories;

          if (isUserAdmin) {
            // إضافة تبويبات الإدارة للمسؤول
            const adminTabs = [
              { id: 'stats', name: 'لوحة الإحصائيات' },
              { id: 'users', name: 'إدارة المستخدمين' }
            ];
            filteredCats = [...categories, ...adminTabs];
          } else {
            // تصفية التبويبات للمستخدم العادي
            const hasAll = allowed.includes('الكل') || allowed.includes('all');
            filteredCats = categories.filter(cat => 
              cat.id === 'all' || hasAll || allowed.includes(cat.id)
            );
          }
          setVisibleCategories(filteredCats);
        }
      } else {
        window.location.href = '/login';
      }
    });
  }, []);

  // تحديث حالة النشاط last_seen للمستخدم الحالي دورياً كل 90 ثانية
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const updateLastSeen = async () => {
      await (supabase as any)
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 90000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // جلب قائمة المستخدمين للمسؤول
  const fetchAdminUsers = async () => {
    if (!isAdmin) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.users) {
        setAdminUsers(json.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if ((activeCategory === 'users' || activeCategory === 'stats') && isAdmin) {
      fetchAdminUsers();
    }
  }, [activeCategory, isAdmin]);

  // تحديث حالة وصلاحيات مستخدم من قبل المدير
  const updateUserStatus = async (user: any, updates: Partial<any>) => {
    try {
      const updatedPayload = {
        userId: user.id,
        role: updates.role !== undefined ? updates.role : user.role,
        is_active: updates.is_active !== undefined ? updates.is_active : user.is_active,
        is_trusted: updates.is_trusted !== undefined ? updates.is_trusted : user.is_trusted,
        allowed_categories: updates.allowed_categories !== undefined ? updates.allowed_categories : user.allowed_categories,
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      const resJson = await res.json();
      if (resJson.success) {
        showToast('تم تحديث صلاحيات المستخدم بنجاح');
        
        // تحديث القائمة محلياً
        setAdminUsers((prev: any) => prev.map((u: any) => u.id === user.id ? { ...u, ...updates } : u));
        
        if (user.id === currentUser?.id) {
          setCurrentUser((prev: any) => ({ ...prev, ...updates }));
          if (updates.role !== undefined) {
            setIsAdmin(updates.role === 'admin');
          }
        }
      } else {
        showToast(resJson.error || 'فشل تحديث الصلاحيات', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ غير متوقع', 'error');
    }
  };

  const handleToggleCategory = (user: any, catId: string) => {
    let currentAllowed = [...(user.allowed_categories || [])];
    if (currentAllowed.includes(catId)) {
      currentAllowed = currentAllowed.filter(c => c !== catId);
    } else {
      currentAllowed.push(catId);
    }
    updateUserStatus(user, { allowed_categories: currentAllowed });
  };

  const handleUserDeleteClick = (user: any) => {
    setUserToDelete(user);
    setShowUserDeleteDialog(true);
    setUserDeleteError('');
  };

  const confirmUserDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: 'DELETE'
      });
      const dataJson = await res.json();
      if (dataJson.success) {
        showToast('تم حذف المستخدم بنجاح من النظام');
        setShowUserDeleteDialog(false);
        setUserToDelete(null);
        fetchAdminUsers();
      } else {
        setUserDeleteError(dataJson.error || 'فشل حذف المستخدم');
      }
    } catch (err) {
      setUserDeleteError('حدث خطأ غير متوقع أثناء الحذف');
    }
  };

  // إظهار وإخفاء كلمات المرور الجماعي للمدير بضغطة واحدة (دون كلمة سر)
  const toggleAllPasswords = () => {
    if (isAllPasswordsRevealed) {
      setDecryptedPasswords({});
      setIsAllPasswordsRevealed(false);
    } else {
      const decrypted: Record<number, string> = {};
      data.forEach((record: any) => {
        try {
          const bytes = CryptoJS.AES.decrypt(record.باسوورد, 'sols');
          const originalText = bytes.toString(CryptoJS.enc.Utf8);
          if (originalText) {
            decrypted[record.id] = originalText;
          }
        } catch (e) {
          console.error(`Failed to decrypt password for branch ${record.رقم_الفرع}:`, e);
        }
      });
      setDecryptedPasswords(decrypted);
      setIsAllPasswordsRevealed(true);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'added') {
      showToast('تم إضافة الفرع الجديد بنجاح');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // إخفاء الباسوورد في حال الضغط في أي مكان آخر بالصفحة (فقط عند العرض الفردي)
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!isAllPasswordsRevealed) {
        setDecryptedPasswords({});
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isAllPasswordsRevealed]);

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
    showToast('تم نسخ كلمة المرور للمحافظة');
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    const { data: records, error } = await (supabase as any)
      .from('server_data')
      .select('*')
      .order('id', { ascending: false });

    if (records) setData(records);
    if (error) console.error("Error fetching data:", error);
    setIsLoadingData(false);
  };

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      رقم_الفرع: record.رقم_الفرع,
      اسم_الفرع_ar: record.اسم_الفرع_ar,
      اسم_الفرع_en: record.اسم_الفرع_en,
      اسم_اليوزر: record.اسم_اليوزر,
      باسوورد: '',
      حالة_اليوزر: record.حالة_اليوزر,
      تصنيف_الفرع: record.تصنيف_الفرع || 'فلورينا',
      طابعة_a4: record.طابعة_a4 || '',
      طابعة_فواتير: record.طابعة_فواتير || '',
      اسم_الشارع: record.اسم_الشارع || '',
      اسم_المدينة: record.اسم_المدينة || '',
      الرقم_الضريبي: record.الرقم_الضريبي || '',
      المنطقة: record.المنطقة || '',
      serial_number: record.serial_number || 100000
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
        تصنيف_الفرع: editForm.تصنيف_الفرع,
        طابعة_a4: editForm.طابعة_a4,
        طابعة_فواتير: editForm.طابعة_فواتير,
        اسم_الشارع: editForm.اسم_الشارع || null,
        اسم_المدينة: editForm.اسم_المدينة || null,
        الرقم_الضريبي: editForm.الرقم_الضريبي || null,
        المنطقة: editForm.المنطقة || null,
        serial_number: parseInt(String(editForm.serial_number)) || 100000
      };

      if (editForm.باسوورد.trim() !== '') {
        updatedData.باسوورد = CryptoJS.AES.encrypt(editForm.باسوورد, 'sols').toString();
      }

      const { error } = await (supabase as any)
        .from('server_data')
        .update(updatedData)
        .eq('id', editingRecord.id);

      if (error) throw error;

      setShowEditModal(false);
      fetchData();
      showToast('تم تحديث بيانات الفرع بنجاح');
    } catch (error: any) {
      alert('حدث خطأ أثناء التعديل: ' + error.message);
    }
  };

  const handleShowPassword = (id: number) => {
    setSelectedRecordId(id);
    setShowPasswordDialog(true);
    setDecryptionKey('');
  };

  const handleDeleteClick = (server: any) => {
    setServerToDelete(server);
    setShowDeleteDialog(true);
    setDeleteKey('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (deleteKey !== 'sols') {
      setDeleteError('كلمة المرور غير صحيحة');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('server_data')
        .delete()
        .eq('id', serverToDelete.id);

      if (error) throw error;

      setData(data.filter(s => s.id !== serverToDelete.id));
      setShowDeleteDialog(false);
      setServerToDelete(null);
      showToast('تم حذف الفرع بنجاح');
    } catch (err: any) {
      setDeleteError(err.message);
    }
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

        setDecryptedPasswords({ [selectedRecordId!]: originalText });
        setShowPasswordDialog(false);

        setCountdown(5);
        setIsExiting(false);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev !== null && prev <= 1) {
              clearInterval(timer);
              setDecryptedPasswords({});
              setIsExiting(true);
              setTimeout(() => {
                setCountdown(null);
                setIsExiting(false);
              }, 1000);
              return 0;
            }
            return prev !== null ? prev - 1 : null;
          });
        }, 1000);
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
    document.body.removeChild(link);
  };

  const handlePrint = (record: any) => {
    const supportedCategories = ['فرنشايز', 'فيلانتو', 'فلورينا', 'جملة', 'اسكتشر', 'موزع معتمد'];
    if (supportedCategories.includes(record.تصنيف_الفرع)) {
      setPrintingRecord(record);
      setTimeout(() => {
        window.print();
        setPrintingRecord(null);
      }, 500);
    } else {
      alert('سيتم تزويد بيانات الطباعة لهذا التصنيف لاحقاً');
    }
  };

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // إحصائيات الفروع المطابقة
  const stats = data.reduce((acc: any, curr: any) => {
    acc[curr.حالة_اليوزر] = (acc[curr.حالة_اليوزر] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = (() => {
    const counts: Record<string, number> = { all: 0 };
    categories.forEach(cat => {
      if (cat.id !== 'all') counts[cat.id] = 0;
    });

    data.forEach(r => {
      const matchesSearch =
        String(r.رقم_الفرع || '').toLowerCase().includes(search.toLowerCase()) ||
        String(r.اسم_الفرع_ar || '').includes(search) ||
        String(r.اسم_الفرع_en || '').toLowerCase().includes(search.toLowerCase()) ||
        String(r.تصنيف_الفرع || '').includes(search) ||
        String(r.المنطقة || '').includes(search) ||
        String(r.اسم_المدينة || '').includes(search);

      const matchesStatus = !statusFilter || r.حالة_اليوزر === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const createdDate = new Date(r.تاريخ_الانشاء);
        if (startDate && createdDate < new Date(startDate)) matchesDate = false;
        if (endDate) {
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
          if (createdDate > end) matchesDate = false;
        }
      }

      if (matchesSearch && matchesStatus && matchesDate) {
        counts.all++;
        const cat = r.تصنيف_الفرع;
        if (cat && cat in counts) {
          counts[cat]++;
        }
      }
    });

    return counts;
  })();

  const filteredData = data.filter(r => {
    // تصفية أمنية للمستخدم العادي لمنعه من رؤية فروع غير مسموح له بها حتى لو كان التبويب "الكل" نشطاً
    if (!isAdmin) {
      if (!currentUser) return false; // عدم إظهار البيانات إذا لم تكتمل بيانات المستخدم
      const allowed = currentUser?.allowed_categories || [];
      const hasAll = allowed.includes('الكل') || allowed.includes('all');
      const branchCategory = r.تصنيف_الفرع || 'فلورينا'; // الافتراضي إذا كان التصنيف فارغاً
      if (!hasAll && !allowed.includes(branchCategory)) {
        return false;
      }
    }

    if (activeCategory && r.تصنيف_الفرع !== activeCategory) return false;

    const matchesSearch =
      String(r.رقم_الفرع || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.اسم_الفرع_ar || '').includes(search) ||
      String(r.اسم_الفرع_en || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.تصنيف_الفرع || '').includes(search) ||
      String(r.المنطقة || '').includes(search) ||
      String(r.اسم_المدينة || '').includes(search);

    if (!matchesSearch) return false;

    if (statusFilter && r.حالة_اليوزر !== statusFilter) return false;

    if (startDate || endDate) {
      const createdDate = new Date(r.تاريخ_الانشاء);
      if (startDate && createdDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        if (createdDate > end) return false;
      }
    }
    return true;
  });

  // حساب إحصائيات لوحة التحكم
  const totalServers = data.length;
  const activeServers = data.filter(r => r.حالة_اليوزر === 'يعمل').length;
  const openingSoonServers = data.filter(r => r.حالة_اليوزر === 'الافتتاح قريبا').length;
  const closedTempServers = data.filter(r => r.حالة_اليوزر === 'مغلق مؤقتا').length;
  const closedPermServers = data.filter(r => r.حالة_اليوزر === 'مغلق نهائياً').length;

  const activePercent = totalServers ? Math.round((activeServers / totalServers) * 100) : 0;
  const openingPercent = totalServers ? Math.round((openingSoonServers / totalServers) * 100) : 0;

  const categoryCountsData = data.reduce((acc: Record<string, number>, curr: any) => {
    if (curr.تصنيف_الفرع) {
      acc[curr.تصنيف_الفرع] = (acc[curr.تصنيف_الفرع] || 0) + 1;
    }
    return acc;
  }, {});

  // شاشة الحجب والحظر الأنيقة للمستخدم الموقوف
  if (currentUser && currentUser.is_active === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-950 dark:to-slate-900 p-4 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-850/80 backdrop-blur-md rounded-2xl border border-red-150 dark:border-red-950/30 p-8 shadow-2xl text-center space-y-6 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-red-50 dark:bg-red-950/40 p-5 rounded-full border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-500 shadow-inner">
                <AlertTriangle className="w-12 h-12 animate-bounce" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-400">حسابك غير نشط</h2>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-350 leading-relaxed">
              لقد تم إيقاف تنشيط حسابك مؤقتاً من قبل إدارة النظام. يرجى التواصل مع المدير المسؤول لتفعيل حسابك مجدداً.
            </p>
          </div>

          <div className="bg-red-50/50 dark:bg-red-950/10 rounded-xl p-4 border border-red-150/40 dark:border-red-900/20 text-xs font-bold text-red-650 dark:text-red-400 font-mono">
            البريد الإلكتروني: {userEmail}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 font-sans"
          >
            <span>تسجيل الخروج والرجوع</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 font-sans bg-gray-100 dark:bg-slate-900 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300" dir="rtl">
      <div className="w-full mx-auto">
        <div className="w-full md:max-w-[996px] bg-white dark:bg-slate-800 px-4 py-2.5 rounded-sm shadow-sm border border-gray-200 dark:border-slate-700 mb-2 flex items-center justify-start">
          <h1 className="text-2xl font-extrabold font-sans text-indigo-850 dark:text-amber-300">
            بيانات السيرفر
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-start">

          {/* القائمة الجانبية للتصنيفات ولوحات المسؤول */}
          <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-slate-800 px-0 py-4 rounded-sm border border-gray-200 dark:border-slate-700 lg:sticky lg:top-4 lg:h-[calc(100vh-80px)] flex flex-col justify-between shadow-sm overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div>
              <h2 className="hidden lg:flex text-sm font-bold text-gray-800 dark:text-slate-200 mb-2 pb-2 border-b border-gray-200 dark:border-slate-700 items-center gap-1.5 px-4">
                <Layers className="w-4 h-4 text-indigo-650 dark:text-indigo-450" />
                القائمة والأقسام
              </h2>

              <div className="flex flex-row overflow-hidden lg:flex-col gap-0 pb-0 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {visibleCategories.map((cat) => {
                  const isActive = activeCategory === (cat.id === 'all' ? null : cat.id);
                  const theme = categoryThemes[cat.id] || categoryThemes.all;
                  const count = categoryCounts[cat.id];

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id === 'all' ? null : cat.id)}
                      className={`group flex items-center justify-between gap-2.5 px-3 py-1.5 border-b text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 lg:w-full active:scale-[0.99] ${isActive
                        ? theme.activeBg + ' text-white border-transparent shadow-inner'
                        : 'border-gray-100 dark:border-slate-700/50 text-gray-700 dark:text-slate-200 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isActive ? 'bg-white/20 text-white' : theme.iconBg + ' ' + theme.iconColor}`}>
                          {renderCategoryIcon(cat.id, "w-4 h-4")}
                        </span>
                        <span className="transition-transform duration-300 group-hover:translate-x-[-3px]">
                          {cat.name}
                        </span>
                      </div>

                      {cat.id !== 'stats' && cat.id !== 'users' ? (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isActive ? theme.badgeActive : theme.badgeInactive}`}>
                          {count}
                        </span>
                      ) : (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isActive ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                          إدارة
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الجزء السفلي من القائمة - المستخدم وتسجيل الخروج */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/60 flex flex-col gap-2.5 px-2.5">
              <div className="flex items-center gap-2.5 px-1 py-0.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm shrink-0 shadow-inner">
                  {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-gray-800 dark:text-slate-200 truncate flex items-center gap-1">
                    {userEmail ? userEmail.split('@')[0] : 'مستخدم سيرفر'}
                    {isAdmin && <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 px-1 rounded-sm text-[8px] font-extrabold">مدير</span>}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                    {userEmail || 'user@server.com'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Link
                  href="/account/settings"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-150 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>الاعدادات</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer w-full text-right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* محتوى الصفحة الرئيسي */}
          <div className="flex-1 min-w-0 w-full">

            {/* أولاً: في حال تفعيل تبويب الإحصائيات الإدارية */}
            {activeCategory === 'stats' && (
              <div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">
                {/* ترويسة الإحصائيات */}
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-750 dark:from-slate-800 dark:to-slate-750 p-6 rounded-2xl border border-indigo-200/20 dark:border-slate-700 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold flex items-center gap-2">
                      <BarChart2 className="w-7 h-7 text-amber-350" />
                      لوحة الإحصائيات والتقارير العامة
                    </h2>
                    <p className="text-xs text-indigo-200 dark:text-slate-350">
                      تحليل مرئي فوري لحالة الفروع وتوزيع السيرفرات وإحصائيات المستخدمين والنشاط الفعلي.
                    </p>
                  </div>
                  <div className="bg-white/10 dark:bg-slate-900/30 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold font-mono text-indigo-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                    تحديث فوري نشط
                  </div>
                </div>

                {/* كروت المؤشرات الفورية */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">إجمالي الفروع</span>
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-xl">
                        <Store className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-sans">{totalServers}</div>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">سيرفر مسجل حالياً</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الفروع النشطة</span>
                      <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-655 dark:text-green-400 rounded-xl">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-sans text-green-600 dark:text-green-400">{activeServers}</div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${activePercent}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{activePercent}% من الإجمالي يعمل</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الافتتاح قريباً</span>
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-sans text-blue-600 dark:text-blue-400">{openingSoonServers}</div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${openingPercent}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{openingPercent}% جاهزة للافتتاح</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">الفروع المغلقة</span>
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-400 rounded-xl">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-sans text-rose-650 dark:text-rose-400">
                        {closedTempServers + closedPermServers}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                        <span>مؤقتاً: {closedTempServers}</span>
                        <span>نهائياً: {closedPermServers}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* توزيع الفروع حسب التصنيف */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      توزيع الفروع بحسب التصنيف والعلامة التجارية
                    </h3>
                    <div className="space-y-3.5">
                      {categories.filter(c => c.id !== 'all' && c.id !== 'stats' && c.id !== 'users').map(cat => {
                        const count = categoryCountsData[cat.id] || 0;
                        const pct = totalServers ? Math.round((count / totalServers) * 100) : 0;
                        const theme = categoryThemes[cat.id] || categoryThemes.all;
                        const barBg = cat.id === 'فلورينا' ? 'bg-sky-500' :
                                      cat.id === 'فرنشايز' ? 'bg-purple-500' :
                                      cat.id === 'جملة' ? 'bg-amber-500' :
                                      cat.id === 'موزع معتمد' ? 'bg-emerald-500' :
                                      cat.id === 'اسكتشر' ? 'bg-indigo-500' :
                                      cat.id === 'فيلانتو' ? 'bg-rose-500' :
                                      'bg-slate-500';
                        
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <div className="flex items-center gap-2">
                                <span className={`p-1 rounded-sm bg-gray-50 dark:bg-slate-900/60 ${theme.iconColor}`}>
                                  {renderCategoryIcon(cat.id, "w-3.5 h-3.5")}
                                </span>
                                <span className="text-gray-700 dark:text-slate-300">{cat.name}</span>
                              </div>
                              <span className="text-gray-500 dark:text-slate-450">{count} فرع ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${barBg}`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* إحصائيات سريعة للحسابات */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      إحصائيات المستخدمين والتفاعل
                    </h3>
                    
                    {isLoadingUsers ? (
                      <div className="h-48 flex items-center justify-center text-xs text-gray-500">جاري التحميل...</div>
                    ) : (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-center space-y-1 border border-slate-100 dark:border-slate-700/40">
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-extrabold block">إجمالي الأعضاء</span>
                            <span className="text-2xl font-black font-mono text-gray-850 dark:text-slate-200">{adminUsers.length}</span>
                          </div>
                          <div className="bg-green-50/40 dark:bg-green-950/10 p-4 rounded-xl text-center space-y-1 border border-green-100/30 dark:border-green-950/20">
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-extrabold block">نشط الآن</span>
                            <span className="text-2xl font-black font-mono text-green-600 dark:text-green-400">
                              {adminUsers.filter(u => {
                                const diff = Date.now() - new Date(u.last_seen).getTime();
                                return diff < 300000;
                              }).length}
                            </span>
                          </div>
                          <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-xl text-center space-y-1 border border-indigo-100/30 dark:border-indigo-950/20">
                            <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold block">الموثوقين</span>
                            <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                              {adminUsers.filter(u => u.is_trusted).length}
                            </span>
                          </div>
                          <div className="bg-rose-50/40 dark:bg-rose-950/10 p-4 rounded-xl text-center space-y-1 border border-rose-100/30 dark:border-rose-950/20">
                            <span className="text-[10px] text-rose-650 dark:text-rose-400 font-extrabold block">المعطلين</span>
                            <span className="text-2xl font-black font-mono text-rose-650 dark:text-rose-400">
                              {adminUsers.filter(u => !u.is_active).length}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveCategory('users')}
                          className="w-full text-center py-2 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-450 font-bold rounded-xl text-xs transition-colors border border-indigo-100/40 dark:border-indigo-900/30 cursor-pointer"
                        >
                          الذهاب لإدارة الصلاحيات والمستخدمين ←
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* آخر فروع مسجلة */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/60 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-500" />
                    آخر 5 فروع تم تسجيلها بالشبكة
                  </h3>
                  <div className="divide-y divide-gray-150 dark:divide-slate-700">
                    {data.slice(0, 5).map(branch => {
                      const theme = categoryThemes[branch.تصنيف_الفرع] || categoryThemes.all;
                      return (
                        <div key={branch.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-sm font-bold border ${theme.badgeInactive}`}>
                              {branch.تصنيف_الفرع}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-gray-800 dark:text-slate-200 font-bold">{branch.اسم_الفرع_ar}</span>
                              <span className="text-[10px] text-gray-400 font-mono">رقم الفرع: {branch.رقم_الفرع}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 font-mono text-gray-500 dark:text-slate-400">
                            <span>{branch.تاريخ_الانشاء ? new Date(branch.تاريخ_الانشاء).toLocaleDateString('ar-EG') : '—'}</span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${branch.حالة_اليوزر === 'يعمل' ? 'bg-green-150 text-green-700' : 'bg-red-150 text-red-700'}`}>
                              {branch.حالة_اليوزر}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ثانياً: في حال تفعيل تبويب إدارة وصلاحيات المستخدمين */}
            {activeCategory === 'users' && (
              <div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">
                {/* ترويسة إدارة المستخدمين */}
                <div className="bg-gradient-to-r from-emerald-900 to-emerald-750 dark:from-slate-800 dark:to-slate-750 p-6 rounded-2xl border border-emerald-200/20 dark:border-slate-700 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold flex items-center gap-2">
                      <Users className="w-7 h-7 text-amber-350" />
                      إدارة المستخدمين وصلاحيات الوصول
                    </h2>
                    <p className="text-xs text-emerald-100 dark:text-slate-350">
                      التحكم الكامل بحسابات الموظفين والمشرفين، تفعيل أو تعطيل الحسابات، وتحديد صلاحيات رؤية التبويبات والأقسام.
                    </p>
                  </div>
                  <button
                    onClick={fetchAdminUsers}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl border border-white/10 text-xs font-bold text-emerald-50 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    تحديث القائمة
                  </button>
                </div>

                {/* جدول المستخدمين والبيانات */}
                <div className="overflow-auto bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-gray-200 dark:border-slate-700">
                  <table className="min-w-full text-right border-collapse">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400">المستخدم</th>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400">تاريخ الانضمام</th>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400">الحالة والنشاط</th>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400">صلاحيات رؤية التبويبات</th>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400 text-center">التحكم</th>
                        <th className="px-4 py-3 text-xs font-black text-gray-500 dark:text-slate-400 text-center">خيارات إضافية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-slate-450">
                            <div className="flex flex-col items-center gap-2">
                              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                              <span className="font-bold">جاري تحميل قائمة الحسابات...</span>
                            </div>
                          </td>
                        </tr>
                      ) : adminUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                            لا يوجد مستخدمون مسجلون حالياً
                          </td>
                        </tr>
                      ) : (
                        adminUsers.map(user => {
                          const isOnline = Date.now() - new Date(user.last_seen).getTime() < 300000;
                          const formattedJoinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '—';

                          return (
                            <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              {/* بطاقة المستخدم الشخصية */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold shadow-sm shrink-0 uppercase">
                                    {user.avatar_url ? (
                                      <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                      user.full_name?.substring(0, 2) || user.email?.substring(0, 2)
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                                      {user.full_name || 'مستخدم سيرفر'}
                                      {user.role === 'admin' && (
                                        <span className="px-1.5 py-0.25 bg-amber-100 text-amber-850 dark:bg-amber-955/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-sm text-[9px] font-black">
                                          مسؤول
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-slate-450 truncate font-mono">{user.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* تاريخ الانضمام */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 font-semibold text-gray-650 dark:text-slate-350">
                                {formattedJoinDate}
                              </td>

                              {/* حالة النشاط */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                                <div className="flex flex-col gap-1">
                                  {isOnline ? (
                                    <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                      </span>
                                      نشط الآن
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                                      خارج الخدمة ({new Date(user.last_seen).toLocaleDateString('ar-EG', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })})
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* صلاحيات الأقسام التفاعلية */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60">
                                <div className="flex flex-wrap gap-1 max-w-xs justify-start">
                                  {['الكل', 'فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'].map(catId => {
                                    const isAllowed = user.allowed_categories?.includes(catId);
                                    return (
                                      <button
                                        key={catId}
                                        onClick={() => handleToggleCategory(user, catId)}
                                        className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                                          isAllowed
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-650 dark:text-indigo-300'
                                            : 'bg-gray-50 border-gray-200 dark:bg-slate-900/20 dark:border-slate-800 text-gray-400 dark:text-slate-600 line-through'
                                        }`}
                                        title={`${isAllowed ? 'إلغاء صلاحية' : 'إعطاء صلاحية'} ${catId}`}
                                      >
                                        {catId}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* التحكم في الحظر والموثوقية */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => updateUserStatus(user, { is_active: !user.is_active })}
                                    className={`px-2.5 py-1 rounded-sm text-xs font-extrabold transition-all cursor-pointer ${
                                      user.is_active
                                        ? 'bg-green-100 hover:bg-green-200 border border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-400'
                                        : 'bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400'
                                    }`}
                                  >
                                    {user.is_active ? 'نشط' : 'محظور'}
                                  </button>

                                  <button
                                    onClick={() => updateUserStatus(user, { is_trusted: !user.is_trusted })}
                                    className={`px-2.5 py-1 rounded-sm text-xs font-extrabold transition-all cursor-pointer ${
                                      user.is_trusted
                                        ? 'bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 dark:bg-amber-955/30 dark:border-amber-900/40 dark:text-amber-400'
                                        : 'bg-gray-150 hover:bg-gray-200 border border-gray-200 text-gray-650 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-450'
                                    }`}
                                  >
                                    {user.is_trusted ? 'موثوق' : 'عادي'}
                                  </button>
                                </div>
                              </td>

                              {/* الخيارات الإضافية مثل حذف الأعضاء والترقية */}
                              <td className="px-4 py-3.5 border-b border-gray-150 dark:border-slate-700/60 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => updateUserStatus(user, { role: user.role === 'admin' ? 'user' : 'admin' })}
                                    className="text-xs bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 border border-gray-200 dark:border-slate-750 px-2 py-1 rounded-sm font-bold transition-colors cursor-pointer text-gray-750 dark:text-slate-350"
                                    title={user.role === 'admin' ? 'تخفيض لمستخدم عادي' : 'ترقية لمسؤول'}
                                  >
                                    {user.role === 'admin' ? 'إلغاء المسؤول' : 'جعله مسؤول'}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleUserDeleteClick(user)}
                                    disabled={user.id === currentUser?.id}
                                    className={`p-1 rounded-sm border transition-colors ${
                                      user.id === currentUser?.id
                                        ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50'
                                        : 'border-red-100 bg-red-50 text-red-650 hover:bg-red-100 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400 cursor-pointer'
                                    }`}
                                    title={user.id === currentUser?.id ? 'لا يمكنك حذف حسابك بنفسك' : 'حذف العضو نهائياً'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ثالثاً: شاشة جداول البيانات والأقسام العادية للفروع (تظهر فقط عندما لا تكون الإحصائيات أو إدارة المستخدمين نشطة) */}
            {activeCategory !== 'stats' && activeCategory !== 'users' && (
              <>
                {/* كروت تصفية الحالات السريعة للفروع */}
                <div className="w-full md:max-w-[996px] flex flex-row gap-2.5 mb-2">
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'يعمل' ? null : 'يعمل')}
                    className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'يعمل'
                      ? 'bg-green-600 border-transparent text-white ring-2 ring-green-500/20'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-green-500 hover:shadow-md'
                      }`}
                  >
                    <span>يعمل</span>
                    <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'يعمل' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-950/40 text-green-650 dark:text-green-400'}`}>
                      {stats['يعمل'] || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter(statusFilter === 'الافتتاح قريبا' ? null : 'الافتتاح قريبا')}
                    className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'الافتتاح قريبا'
                      ? 'bg-blue-600 border-transparent text-white ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-blue-500 hover:shadow-md'
                      }`}
                  >
                    <span>الافتتاح قريبا</span>
                    <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'الافتتاح قريبا' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400'}`}>
                      {stats['الافتتاح قريبا'] || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter(statusFilter === 'مغلق مؤقتا' ? null : 'مغلق مؤقتا')}
                    className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'مغلق مؤقتا'
                      ? 'bg-yellow-500 border-transparent text-white ring-2 ring-yellow-400/20'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-yellow-500 hover:shadow-md'
                      }`}
                  >
                    <span>مغلق مؤقتا</span>
                    <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'مغلق مؤقتا' ? 'bg-white/20 text-white' : 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-650 dark:text-yellow-400'}`}>
                      {stats['مغلق مؤقتا'] || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter(statusFilter === 'مغلق نهائياً' ? null : 'مغلق نهائياً')}
                    className={`flex-1 py-2.5 px-4 rounded-sm shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer text-base font-extrabold ${statusFilter === 'مغلق نهائياً'
                      ? 'bg-red-600 border-transparent text-white ring-2 ring-red-500/20'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-red-500 hover:shadow-md'
                      }`}
                  >
                    <span>مغلق نهائياً</span>
                    <span className={`px-2.5 py-0.5 rounded-sm text-sm font-black ${statusFilter === 'مغلق نهائياً' ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400'}`}>
                      {stats['مغلق نهائياً'] || 0}
                    </span>
                  </button>
                </div>

                {/* حقول وهمية تمنع المتصفح من الملء التلقائي */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input type="text" name="fakeusernameremembered" tabIndex={-1} autoComplete="username" />
                  <input type="password" name="fakepasswordremembered" tabIndex={-1} autoComplete="current-password" />
                </div>

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
                      id="table-search-box"
                      name="table-search-box"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      placeholder="ابحث برقم الفرع، الاسم..."
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

                  {/* نطاق التاريخ المدمج */}
                  <div className="flex items-center bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-sm shrink-0 px-2 h-[34px] gap-2">
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div className="flex items-center gap-1.5 h-full">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 leading-none mt-0.5">من</span>
                      <input
                        type="date"
                        className="bg-transparent text-gray-900 dark:text-slate-100 text-sm focus:outline-none w-[110px] h-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 mx-0.5"></div>
                    <div className="flex items-center gap-1.5 h-full">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-400 leading-none mt-0.5">إلى</span>
                      <input
                        type="date"
                        className="bg-transparent text-gray-900 dark:text-slate-100 text-sm focus:outline-none w-[110px] h-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* الأزرار */}
                  <div className="flex items-center gap-2 shrink-0 h-[34px]">
                    {isAdmin && (
                      <button
                        onClick={toggleAllPasswords}
                        className="h-full px-2 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title={isAllPasswordsRevealed ? "إخفاء كل الباسوردات" : "إظهار كافة كلمات المرور"}
                      >
                        {isAllPasswordsRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <Link
                      href="/account/add"
                      className="bg-green-600 hover:bg-green-700 transition-colors text-white px-2.5 h-full rounded-sm shadow-sm text-sm font-semibold flex items-center gap-1.5 shrink-0"
                      title="إضافة سيرفر جديد"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden xl:inline">إضافة</span>
                    </Link>
                    
                    <button
                      onClick={exportToCSV}
                      className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-2.5 h-full rounded-sm shadow-sm text-sm font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      title="تصدير إلى Excel"
                    >
                      <svg xmlns="http://www.w3.org/2050/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden xl:inline">تصدير</span>
                    </button>
                  </div>
                </div>

                {/* جدول فروع السيرفرات */}
                <div className="overflow-auto max-h-[680px] bg-white dark:bg-slate-800 shadow-sm rounded-sm border border-gray-200 dark:border-slate-700">
                  <table className="min-w-full text-right border-collapse">
                    <thead className="sticky top-0 bg-gray-150 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-600 z-10 shadow-sm">
                      <tr>
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">رقم الفرع</th>
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">الاسم (AR)</th>
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">التصنيف والمنطقة</th>
                        {activeCategory !== 'الإدارة' && (
                          <>
                            <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">العنوان والضريبة</th>
                          </>
                        )}
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">اليوزر</th>
                        {activeCategory !== 'الإدارة' && (
                          <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">اسم الطابعة</th>
                        )}
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">الباسوورد</th>
                        {activeCategory !== 'الإدارة' && (
                          <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">التسلسل</th>
                        )}
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">الحالة</th>
                        <th className="px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">الخيارات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {isLoadingData ? (
                        Array(5).fill(0).map((_, idx) => (
                          <tr key={idx} className="animate-pulse bg-white dark:bg-slate-800">
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div></td>
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-1"></div><div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-16"></div></td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-1"></div><div className="h-3 bg-gray-100 dark:bg-slate-600 rounded w-20"></div></td>
                            )}
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div></td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                            )}
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div></td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-10 mx-auto"></div></td>
                            )}
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div></td>
                            <td className="px-2 py-2 border border-gray-200 dark:border-slate-700/60"><div className="flex gap-1"><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-6"></div><div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-6"></div></div></td>
                          </tr>
                        ))
                      ) : filteredData.length > 0 ? (
                        filteredData.map(row => {
                        const rowBorderClass =
                          row.حالة_اليوزر === 'يعمل' ? 'border-r-2 border-r-green-500' :
                            row.حالة_اليوزر === 'مغلق نهائياً' ? 'border-r-2 border-r-red-500' :
                              row.حالة_اليوزر === 'الافتتاح قريبا' ? 'border-r-2 border-r-blue-500' :
                                'border-r-2 border-r-yellow-500';
                        const rowBgClass =
                          row.تصنيف_الفرع === 'فلورينا' ? 'bg-sky-100/40 dark:bg-sky-950/20' :
                            row.تصنيف_الفرع === 'فرنشايز' ? 'bg-purple-100/40 dark:bg-purple-950/20' :
                              row.تصنيف_الفرع === 'جملة' ? 'bg-amber-100/40 dark:bg-amber-950/20' :
                                row.تصنيف_الفرع === 'موزع معتمد' ? 'bg-emerald-100/40 dark:bg-emerald-950/20' :
                                  row.تصنيف_الفرع === 'اسكتشر' ? 'bg-indigo-100/40 dark:bg-indigo-950/20' :
                                    row.تصنيف_الفرع === 'فيلانتو' ? 'bg-rose-100/40 dark:bg-rose-950/20' :
                                      'bg-white dark:bg-slate-800';

                        const rowBorderColorClass =
                          row.تصنيف_الفرع === 'فلورينا' ? 'border-sky-200 dark:border-sky-900/60' :
                            row.تصنيف_الفرع === 'فرنشايز' ? 'border-purple-200 dark:border-purple-900/60' :
                              row.تصنيف_الفرع === 'جملة' ? 'border-amber-200 dark:border-amber-900/60' :
                                row.تصنيف_الفرع === 'موزع معتمد' ? 'border-emerald-200 dark:border-emerald-900/60' :
                                  row.تصنيف_الفرع === 'اسكتشر' ? 'border-indigo-200 dark:border-indigo-900/60' :
                                    row.تصنيف_الفرع === 'فيلانتو' ? 'border-rose-200 dark:border-rose-900/60' :
                                      row.تصنيف_الفرع === 'الإدارة' ? 'border-slate-300 dark:border-slate-700' :
                                        'border-gray-200 dark:border-slate-700/60';

                        return (
                          <tr key={row.id} className={`border-b ${rowBorderColorClass} ${rowBgClass} hover:bg-indigo-50/40 dark:hover:bg-slate-700/40 transition-colors ${rowBorderClass}`}>
                            <td className="px-2 py-1 text-sm font-bold text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700/60">{row.رقم_الفرع}</td>
                            <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                              <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-slate-100 font-semibold">{row.اسم_الفرع_ar}</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400 uppercase font-mono">{row.اسم_الفرع_en}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                              <div className="flex flex-col">
                                <span className="text-gray-700 dark:text-slate-300 font-semibold">{row.تصنيف_الفرع || '—'}</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{row.المنطقة || '—'}</span>
                              </div>
                            </td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-xs text-gray-600 dark:text-slate-400">
                                    {row.اسم_المدينة || row.اسم_الشارع ? (
                                      <>
                                        {row.اسم_المدينة} {row.اسم_الشارع && ` - ${row.اسم_الشارع}`}
                                      </>
                                    ) : '—'}
                                  </div>
                                  {row.الرقم_الضريبي && (
                                    <div className="text-[11px] bg-gray-100 dark:bg-slate-700 px-1.5 py-0.25 rounded-sm w-fit text-gray-500 font-semibold">
                                      ضريبي: {row.الرقم_الضريبي}
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300 font-mono border border-gray-200 dark:border-slate-700/60">{row.اسم_اليوزر}</td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/60">
                                <div className="flex flex-col gap-0.5 text-xs">
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">A4: {row.طابعة_a4 || '—'}</span>
                                  <span className="text-gray-500 dark:text-slate-400 font-mono">فاتورة: {row.طابعة_فواتير || '—'}</span>
                                </div>
                              </td>
                            )}
                            <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                              {decryptedPasswords[row.id] ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <span className="font-mono text-green-600 dark:text-green-400 font-bold tracking-wider">{decryptedPasswords[row.id]}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(decryptedPasswords[row.id]);
                                    }}
                                    className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                    title="نسخ كلمة المرور"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-gray-400 tracking-widest font-mono">••••••</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowPassword(row.id);
                                    }}
                                    className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                    title="إظهار كلمة المرور"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                            {activeCategory !== 'الإدارة' && (
                              <td className="px-2 py-1 text-sm text-center text-gray-700 dark:text-slate-300 font-mono border border-gray-200 dark:border-slate-700/60">{row.serial_number || '—'}</td>
                            )}
                            <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                              <span className={`px-1.5 py-0.5 rounded-sm text-xs font-bold ${row.حالة_اليوزر === 'يعمل' ? 'bg-green-105 dark:bg-green-950/30 text-green-800 dark:text-green-400 border border-green-200/50 dark:border-green-900/50' :
                                row.حالة_اليوزر === 'مغلق نهائياً' ? 'bg-red-105 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200/50 dark:border-red-900/50' :
                                  row.حالة_اليوزر === 'الافتتاح قريبا' ? 'bg-blue-105 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50' :
                                    'bg-yellow-105 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/50'
                                }`}>
                                {row.حالة_اليوزر}
                              </span>
                            </td>
                            <td className="px-2 py-1 text-sm border border-gray-200 dark:border-slate-700/60">
                              <div className="flex gap-1 items-center justify-center">
                                <button
                                  onClick={() => handleEditClick(row)}
                                  className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-250 bg-indigo-50 dark:bg-indigo-950/50 p-1 rounded-sm border border-indigo-100 dark:border-indigo-900/20 transition-colors cursor-pointer"
                                  title="تعديل"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              <button
                                onClick={() => handlePrint(row)}
                                className="text-blue-650 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/50 p-1 rounded-sm border border-blue-100 dark:border-blue-900/20 transition-colors cursor-pointer"
                                title="طباعة A4"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(row);
                                  }}
                                  className="text-red-650 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 bg-red-50 dark:bg-red-950/50 p-1 rounded-sm border border-red-100 dark:border-red-900/20 transition-colors cursor-pointer"
                                  title="حذف الفرع"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-gray-500 dark:text-slate-400">
                            لا توجد بيانات مطابقة للبحث
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* مودال تأكيد حذف السيرفر فرع */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in px-4">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-sm border border-red-200 dark:border-red-900/50 overflow-hidden transform transition-all">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/10 px-4 py-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400">تأكيد حذف الفرع</h3>
            </div>

            <div className="px-4 pb-4">
              <p className="mb-4 text-xs text-gray-600 dark:text-slate-350 leading-relaxed font-medium">
                أنت على وشك حذف الفرع <span className="font-extrabold text-gray-900 dark:text-white">({serverToDelete?.رقم_الفرع})</span>. هذا الإجراء نهائي ولا يمكن التراجع عنه.
              </p>

              {deleteError && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-605 dark:text-red-400 text-xs font-bold rounded-sm border border-red-200 dark:border-red-900/50 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {deleteError}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-sm border border-gray-200 dark:border-slate-700 mb-4">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gray-400" /> كلمة مرور التأكيد
                </label>
                <input
                  type="password"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-red-500 font-mono tracking-widest text-left"
                  value={deleteKey}
                  onChange={(e) => setDeleteKey(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold py-1.5 rounded-sm transition-colors text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف نهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد حذف مستخدم عضو */}
      {showUserDeleteDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in px-4">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-sm border border-red-200 dark:border-red-900/50 overflow-hidden transform transition-all">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/10 px-4 py-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-sm">
                <AlertTriangle className="w-5 h-5 text-red-650 dark:text-red-500" />
              </div>
              <h3 className="text-sm font-extrabold text-red-750 dark:text-red-400">تأكيد حذف حساب المستخدم</h3>
            </div>

            <div className="px-4 pb-4">
              <p className="mb-4 text-xs text-gray-650 dark:text-slate-300 leading-relaxed font-medium">
                أنت على وشك حذف العضو <span className="font-extrabold text-gray-900 dark:text-white">{userToDelete?.full_name || userToDelete?.email}</span> نهائياً. سيتم حذف حسابه من جدول الإدارات ونظام مصادقة Supabase بالكامل!
              </p>

              {userDeleteError && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-605 dark:text-red-405 text-xs font-bold rounded-sm border border-red-200 dark:border-red-900/50 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {userDeleteError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUserDeleteDialog(false)}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-705 dark:text-slate-300 font-bold py-1.5 rounded-sm transition-colors text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmUserDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال فك تشفير باسوورد سيرفر (فردي) */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in px-4">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-sm border border-indigo-200 dark:border-indigo-900/50 overflow-hidden transform transition-all">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/10 px-4 py-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-sm">
                <ShieldCheck className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-extrabold text-indigo-800 dark:text-indigo-400">الصلاحية مطلوبة</h3>
            </div>

            <div className="px-4 pb-4">
              <p className="mb-4 text-xs text-gray-600 dark:text-slate-300 leading-relaxed font-medium">
                يرجى إدخال كلمة المرور الخاصة بالمشرف لفك تشفير وعرض الباسوورد.
              </p>

              <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-sm border border-gray-200 dark:border-slate-700 mb-4">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gray-400" /> كلمة مرور المشرف
                </label>
                <input
                  type="password"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left font-mono tracking-widest"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && submitDecryption()}
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordDialog(false)}
                  className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold py-1.5 rounded-sm transition-colors text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={submitDecryption}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  عرض البيانات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل بيانات السيرفر */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in px-4">
          <div className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-3xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-sm">
                  <Edit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">تعديل بيانات السيرفر ({editForm.رقم_الفرع})</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-4 custom-scrollbar">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">تصنيف الفرع</label>
                    <select
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editForm.تصنيف_الفرع || 'فلورينا'}
                      onChange={(e) => setEditForm({ ...editForm, تصنيف_الفرع: e.target.value })}
                    >
                      <option value="فلورينا">فلورينا</option>
                      <option value="فرنشايز">فرنشايز</option>
                      <option value="جملة">جملة</option>
                      <option value="موزع معتمد">موزع معتمد</option>
                      <option value="اسكتشر">اسكتشر</option>
                      <option value="فيلانتو">فيلانتو</option>
                      <option value="الإدارة">الإدارة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">رقم الفرع</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
                      value={editForm.رقم_الفرع}
                      onChange={(e) => setEditForm({ ...editForm, رقم_الفرع: e.target.value })}
                      required dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">الحالة</label>
                    <select
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">المنطقة</label>
                    <select
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={editForm.المنطقة || ''}
                      onChange={(e) => setEditForm({ ...editForm, المنطقة: e.target.value })}
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
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">الاسم (AR)</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={editForm.اسم_الفرع_ar}
                          onChange={(e) => setEditForm({ ...editForm, اسم_الفرع_ar: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">الاسم (EN)</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase font-mono tracking-wider text-left"
                          value={editForm.اسم_الفرع_en}
                          onChange={(e) => setEditForm({ ...editForm, اسم_الفرع_en: e.target.value })}
                          required dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-sm border border-indigo-100 dark:border-indigo-900/30 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اليوزر</label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
                        value={editForm.اسم_اليوزر}
                        onChange={(e) => setEditForm({ ...editForm, اسم_اليوزر: e.target.value })}
                        required dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">باسوورد جديد <span className="text-[10px] text-gray-400 font-normal">(اختياري)</span></label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
                        value={editForm.باسوورد}
                        onChange={(e) => setEditForm({ ...editForm, باسوورد: e.target.value })}
                        placeholder="فارغ للاحتفاظ بالقديم"
                        dir="ltr"
                      />
                    </div>
                    {editForm.تصنيف_الفرع !== 'الإدارة' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">التسلسل</label>
                        <input
                          type="number"
                          className="w-full px-2.5 py-1.5 bg-gray-100 dark:bg-slate-900 text-gray-500 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none font-mono text-left"
                          value={editForm.serial_number || ''}
                          onChange={(e) => setEditForm({ ...editForm, serial_number: parseInt(e.target.value) })}
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>

                  {editForm.تصنيف_الفرع !== 'الإدارة' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">الرقم الضريبي</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
                          value={editForm.الرقم_الضريبي || ''}
                          onChange={(e) => setEditForm({ ...editForm, الرقم_الضريبي: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اسم المدينة</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={editForm.اسم_المدينة || ''}
                          onChange={(e) => setEditForm({ ...editForm, اسم_المدينة: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اسم الشارع</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={editForm.اسم_الشارع || ''}
                          onChange={(e) => setEditForm({ ...editForm, اسم_الشارع: e.target.value })}
                        />
                      </div>
                      <div className="lg:col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">طابعة A4</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left tracking-wider"
                          value={editForm.طابعة_a4 || ''}
                          onChange={(e) => setEditForm({ ...editForm, طابعة_a4: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                      <div className="lg:col-span-2 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">طابعة الفواتير</label>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left tracking-wider"
                          value={editForm.طابعة_فواتير || ''}
                          onChange={(e) => setEditForm({ ...editForm, طابعة_فواتير: e.target.value })}
                          dir="ltr"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-sm transition-colors text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-sm transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    تحديث البيانات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {printingRecord && <PrintableBranchFoundation server={printingRecord} />}

      {/* تنبيهات Toast المعلقة */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`px-4 py-2.5 rounded-sm shadow-xl flex items-center gap-2.5 border ${toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/80 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
            }`}>
            {toast.type === 'success' ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span className="font-bold text-xs">{toast.message}</span>
          </div>
        </div>
      )}

      {/* العداد التنازلي التلاشي لفك التشفير */}
      {(countdown !== null || isExiting) && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0 animate-in slide-in-from-top-4 fade-in'
          }`}>
          <div className="px-5 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-indigo-200 dark:border-indigo-900/50 rounded-sm shadow-xl flex flex-col items-center gap-1.5 min-w-[120px]">
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-widest">{countdown ?? 0}</span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">ثانية للإخفاء</span>
          </div>
        </div>
      )}
    </div>
  );
}
