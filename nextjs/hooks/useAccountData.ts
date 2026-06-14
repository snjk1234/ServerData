import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { categories } from '@/components/SidebarMenu';

export function useAccountData() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  
  const [extraData, setExtraData] = useState<Record<string, { connections?: any[], computers?: any, hardware?: any }>>({});
  const [isFetchingExtra, setIsFetchingExtra] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<any[]>(categories);
  const [userEmail, setUserEmail] = useState<string>('');

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // 1. Fetch User Session and Permissions
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
              { id: 'users', name: 'إدارة المستخدمين' },
              { id: 'audit', name: 'سجل النشاطات' },
              { id: 'hardware', name: 'جرد الأجهزة' }
            ];
            filteredCats = [...categories.filter(c => c.id !== 'كمبيوتر وملحقات'), ...adminTabs, { id: 'كمبيوتر وملحقات', name: 'كمبيوتر وملحقات' }];
          } else {
            // تصفية التبويبات للمستخدم العادي
            const hasAll = allowed.includes('الكل') || allowed.includes('all');
            filteredCats = [...categories.filter(cat =>
              cat.id !== 'كمبيوتر وملحقات' && (cat.id === 'all' || hasAll || allowed.includes(cat.id))
            ), { id: 'hardware', name: 'جرد الأجهزة' }, { id: 'كمبيوتر وملحقات', name: 'كمبيوتر وملحقات' }];
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
  const fetchAdminUsers = useCallback(async () => {
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
  }, [isAdmin]);

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

  // جلب البيانات الإضافية في الخلفية
  const fetchExtraData = async () => {
    if (data.length === 0) return;
    setIsFetchingExtra(true);
    try {
      // Fetch branch connections
      const { data: conns } = await (supabase as any).from('branch_connections').select('*');
      
      // Fetch computers
      const compRes = await fetch('/api/computers-inventory');
      const compData = await compRes.json();
      
      // Fetch hardware
      const hardRes = await fetch('/api/hardware-inventory');
      const hardData = await hardRes.json();

      const newExtra: Record<string, any> = {};
      data.forEach(row => {
        const branchIdStr = String(row.رقم_الفرع).trim();
        const branchConns = conns?.filter((c: any) => String(c.branch_id).trim() === branchIdStr) || [];
        
        // Find computer
        let comp = null;
        if (compData.success && compData.data) {
           comp = compData.data.find((c: any) => String(c['رقم الفرع'] || c['الفرع']).trim() === branchIdStr);
        }

        // Find hardware
        let hard = null;
        if (hardData.success && hardData.data) {
           const targetName = String(row.اسم_الفرع_ar || '').trim().toLowerCase();
           const targetId = String(row.رقم_الفرع || '').trim().toLowerCase();
           
           hard = hardData.data.find((h: any) => {
             const cellBranch = String(h['الفرع'] || h['رقم الفرع'] || '').trim().toLowerCase();
             if (!cellBranch) return false;
             return (targetName && (cellBranch.includes(targetName) || targetName.includes(cellBranch))) || 
                    (cellBranch === targetId);
           });
        }

        newExtra[branchIdStr] = {
          connections: branchConns.length > 0 ? branchConns : undefined,
          computers: comp,
          hardware: hard
        };
      });

      setExtraData(newExtra);
    } catch (err) {
      console.error('Error fetching extra data:', err);
    } finally {
      setIsFetchingExtra(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      fetchExtraData();
    }
  }, [data]);

  return {
    data,
    setData,
    isLoadingData,
    extraData,
    currentUser,
    setCurrentUser,
    isAdmin,
    setIsAdmin,
    visibleCategories,
    userEmail,
    adminUsers,
    setAdminUsers,
    isLoadingUsers,
    fetchAdminUsers,
    fetchData,
    supabase
  };
}
