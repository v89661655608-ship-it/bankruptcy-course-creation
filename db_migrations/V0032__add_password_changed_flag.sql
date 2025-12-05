-- Add flag to track if user changed their generated password
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_by_user BOOLEAN DEFAULT FALSE;