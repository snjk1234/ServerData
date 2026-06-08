-- ============================================
-- Fix: Allow admins to view all users without infinite recursion or JWT issues
-- ============================================

-- 1. Create a SECURITY DEFINER function to securely check if the current user is an admin
-- This bypasses RLS on the users table and prevents infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Recreate the policy using the new function
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
TO authenticated
USING ( public.is_admin() );

-- 3. Sync existing users from auth.users to public.users
-- This ensures users registered before the trigger was created are visible
INSERT INTO public.users (id, email, role, is_active, created_at)
SELECT id, email, 'user', true, created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
