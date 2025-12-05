-- Fix chat_expires_at for user golosova1989@internet.ru (user_id=9)
-- User purchased chat on 2025-12-03, should have 30 days access
UPDATE users 
SET chat_expires_at = TIMESTAMP '2025-12-03 13:32:07' + INTERVAL '30 days',
    purchased_product = 'chat'
WHERE id = 9;