-- ملف الترحيل (Migration) الأول: تنظيف قاعدة البيانات
-- يقوم هذا الملف بمسح جدول server_data وأي سياسات (Policies) متعلقة به إن وُجدت سابقاً لتفادي التكرار.

DROP TABLE IF EXISTS public."server_data" CASCADE;
