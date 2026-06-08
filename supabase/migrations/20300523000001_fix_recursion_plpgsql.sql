-- 1. إضافة عمود الإيميل لجدول المستخدمين إذا لم يكن موجوداً
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. تحديث إيميلات المستخدمين من جدول auth.users (للمستخدمين الحاليين)
UPDATE public.users pu
SET email = au.email
FROM auth.users au
WHERE pu.id = au.id AND pu.email IS NULL;

-- 3. حل مشكلة Recursion بشكل جذري باستخدام plpgsql لمنع الـ Inlining
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 4. إعطاء الصلاحية لجدول المستخدمين
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
TO authenticated
USING ( public.is_admin() );

-- 5. إعطاء الصلاحية لجدول سجل النشاطات لمنع تكرار البحث (Recursion)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING ( public.is_admin() );

-- 6. إضافة المستخدمين القدامى الذين ليسوا في جدول users
INSERT INTO public.users (id, email, role, is_active, created_at)
SELECT id, email, 'user', true, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
