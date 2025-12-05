-- Add purchased_product column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_product VARCHAR(50);

-- Fix chat_expires_at for user_id=1 after combo purchase
UPDATE users 
SET chat_expires_at = TIMESTAMP '2025-12-05 13:32:51' + INTERVAL '30 days',
    purchased_product = 'combo'
WHERE id = 1 AND chat_expires_at IS NULL;