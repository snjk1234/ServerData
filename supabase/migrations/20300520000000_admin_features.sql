-- ============================================
-- إضافة ميزات الصلاحيات والتحكم الإداري للمستخدمين
-- ============================================

-- 1. إضافة الأعمدة الجديدة لجدول المستخدمين لتتبع الحسابات والنشاط والتصنيفات المسموحة
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allowed_categories TEXT[] DEFAULT ARRAY['الكل', 'فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'],
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ترقية حساب المستخدم omarassir12@gmail.com إلى مدير (Admin) في جدول المستخدمين وفي Auth
UPDATE public.users
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'omarassir12@gmail.com');

UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN jsonb_build_object('role', 'admin')
    ELSE raw_user_meta_data || jsonb_build_object('role', 'admin')
  END
WHERE email = 'omarassir12@gmail.com';

-- 3. تحديث دالة Trigger الخاصة بالمستخدمين الجدد لملء الحقول
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url, role, is_active, is_trusted, allowed_categories, last_seen, created_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    TRUE,
    FALSE,
    ARRAY['الكل', 'فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'],
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. إعداد سياسات الـ RLS (Row Level Security) لجدول المستخدمين
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت لتجنب التكرار
DROP POLICY IF EXISTS "Can view own user data." ON public.users;
DROP POLICY IF EXISTS "Can update own user data." ON public.users;
DROP POLICY IF EXISTS "Users can view and update their own details" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users details" ON public.users;

-- سياسة للمستخدم العادي لرؤية وتعديل بياناته الشخصية فقط
CREATE POLICY "Users can view own details"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own details"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- سياسة للمشرف (Admin) للتحكم الكامل بكافة حسابات المستخدمين
CREATE POLICY "Admins can manage all users details"
ON public.users FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR 
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR 
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
