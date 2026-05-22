-- ============================================
-- نظام مراقبة سجل النشاطات (Audit Logs)
-- ============================================

-- 1. إنشاء جدول سجل النشاطات
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'إضافة فرع', 'تعديل فرع', 'حذف فرع'
    entity_name TEXT NOT NULL, -- اسم الفرع أو تفاصيله للتعرف عليه
    details JSONB, -- تفاصيل الحركة كاملة
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. إعداد سياسات الأمان (RLS) للجدول (للمدراء فقط للرؤية)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR 
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 3. دالة تسجيل الحركات التلقائية للعمليات (Triggers)
CREATE OR REPLACE FUNCTION public.log_server_data_action()
RETURNS trigger AS $$
DECLARE
    current_user_id UUID;
    v_entity_name TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        v_entity_name := NEW."اسم_الفرع";
        INSERT INTO public.audit_logs (user_id, action, entity_name, details)
        VALUES (current_user_id, 'إضافة فرع', v_entity_name, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_entity_name := NEW."اسم_الفرع";
        INSERT INTO public.audit_logs (user_id, action, entity_name, details)
        VALUES (current_user_id, 'تعديل فرع', v_entity_name, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_entity_name := OLD."اسم_الفرع";
        INSERT INTO public.audit_logs (user_id, action, entity_name, details)
        VALUES (current_user_id, 'حذف فرع', v_entity_name, row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ربط المشغل (Trigger) بجدول server_data
DROP TRIGGER IF EXISTS audit_server_data_trigger ON public.server_data;
CREATE TRIGGER audit_server_data_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.server_data
FOR EACH ROW EXECUTE FUNCTION public.log_server_data_action();
