-- ملف الترحيل (Migration) الثالث: تحديث سياسات الأمان لتفادي خطأ RLS

-- حذف السياسة السابقة لتعديلها
DROP POLICY IF EXISTS "Admins can manage server data" ON public."server_data";

-- إنشاء سياسة جديدة تسمح لأي مستخدم مسجل الدخول (Authenticated) بإجراء كافة العمليات (قراءة، إضافة، تعديل، حذف)
CREATE POLICY "Authenticated users can manage server data" 
ON public."server_data" 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
