-- إضافة عمود تصنيف الفرع إلى جدول بيانات السيرفرات
ALTER TABLE public."server_data" ADD COLUMN IF NOT EXISTS "تصنيف_الفرع" TEXT;
