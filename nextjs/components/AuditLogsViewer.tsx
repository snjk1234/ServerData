"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shield, Clock, User, FileText, CheckCircle, Edit, Trash2 } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_name: string;
  details: any;
  created_at: string;
  users: {
    full_name: string;
  };
}

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchLogs();

    // Subscribe to new logs for real-time updates
    const channel = supabase
      .channel('audit-logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        () => {
          fetchLogs(); // Refetch when a new log is added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id, action, entity_name, details, created_at, user_id,
          users (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionStyle = (action: string) => {
    if (action.includes('إضافة')) return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
    if (action.includes('تعديل')) return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
    if (action.includes('حذف')) return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
    return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('إضافة')) return <CheckCircle className="w-3.5 h-3.5" />;
    if (action.includes('تعديل')) return <Edit className="w-3.5 h-3.5" />;
    if (action.includes('حذف')) return <Trash2 className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-bold">جاري تحميل سجل النشاطات...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-sm text-indigo-600 dark:text-indigo-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-100">سجل المراقبة الأمنية</h2>
          <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-0.5">يعرض هذا السجل كل الحركات والتغييرات التي حدثت في النظام مع حفظ تفاصيلها</p>
        </div>
      </div>

      <div className="overflow-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600">
        <table className="w-full text-sm text-right">
          <thead className="text-xs font-black text-gray-500 uppercase bg-gray-50 dark:bg-slate-700/50 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 border-b dark:border-slate-700">المستخدم</th>
              <th className="px-4 py-3 border-b dark:border-slate-700">نوع الحركة</th>
              <th className="px-4 py-3 border-b dark:border-slate-700">الفرع (الكيان)</th>
              <th className="px-4 py-3 border-b dark:border-slate-700">التفاصيل</th>
              <th className="px-4 py-3 border-b dark:border-slate-700">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-bold bg-white dark:bg-slate-800">
                  لا توجد سجلات حتى الآن
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-sm bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-800 dark:text-slate-200">
                        {log.users?.full_name || 'مدير النظام (غير محدد)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`flex w-max items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-black ${getActionStyle(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-700 dark:text-slate-300">
                    {log.entity_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                    {log.action === 'تعديل فرع' ? 'تم تغيير بيانات الفرع' : (log.action === 'إضافة فرع' ? 'تم تسجيل الفرع في قاعدة البيانات' : 'تم مسح الفرع نهائياً')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.created_at).toLocaleString('ar-SA')}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
