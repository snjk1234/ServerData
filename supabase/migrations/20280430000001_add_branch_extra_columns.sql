-- إضافة أعمدة جديدة لجدول server_data
ALTER TABLE server_data
  ADD COLUMN IF NOT EXISTS اسم_الشارع   TEXT,
  ADD COLUMN IF NOT EXISTS اسم_المدينة  TEXT,
  ADD COLUMN IF NOT EXISTS الرقم_الضريبي TEXT,
  ADD COLUMN IF NOT EXISTS المنطقة       TEXT;
