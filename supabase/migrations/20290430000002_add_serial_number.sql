-- Add serial_number column to server_data table
ALTER TABLE public."server_data" ADD COLUMN IF NOT EXISTS "serial_number" BIGINT DEFAULT 100000;

-- Optional: If we want it to auto-increment from 100000, we could use a sequence, 
-- but the user wants it manually editable in the UI, so we'll handle the default/increment in the app or via a simple max() + 1.
