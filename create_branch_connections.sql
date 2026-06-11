CREATE TABLE IF NOT EXISTS public.branch_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  رقم_الفرع TEXT REFERENCES public.server_data(رقم_الفرع) ON DELETE CASCADE,
  نوع_الاتصال TEXT,
  مزود_الخدمة TEXT,
  رقم_الخدمة TEXT,
  دورة_التجديد TEXT, -- 1 شهر، 3 أشهر، 4 أشهر، 6 أشهر، سنة
  تاريخ_الشراء DATE,
  تاريخ_الانتهاء DATE,
  التكلفة DECIMAL(10, 2),
  مجموعة_الباقة TEXT,
  نوع_الشريحة TEXT,
  ملاحظات TEXT,
  تاريخ_الاضافة TIMESTAMPTZ DEFAULT NOW(),
  تاريخ_التحديث TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.branch_connections ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (قراءة وكتابة للمستخدمين المسجلين)
CREATE POLICY "Allow authenticated users to read connections" ON public.branch_connections
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert connections" ON public.branch_connections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update connections" ON public.branch_connections
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete connections" ON public.branch_connections
  FOR DELETE USING (auth.role() = 'authenticated');
