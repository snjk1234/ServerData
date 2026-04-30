-- Add printer columns to server_data table
ALTER TABLE public."server_data" ADD COLUMN IF NOT EXISTS "طابعة_a4" TEXT;
ALTER TABLE public."server_data" ADD COLUMN IF NOT EXISTS "طابعة_فواتير" TEXT;
