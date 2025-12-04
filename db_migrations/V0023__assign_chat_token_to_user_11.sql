-- Назначение токена чата пользователю golosova.2026@inbox.ru за покупку combo
-- Берем первый свободный токен и назначаем пользователю #11

-- Обновляем токен в пуле (отмечаем как использованный)
UPDATE chat_tokens_pool 
SET is_used = true, 
    used_by_user_id = 11, 
    used_by_email = 'golosova.2026@inbox.ru',
    used_at = CURRENT_TIMESTAMP
WHERE id = (
    SELECT id FROM chat_tokens_pool 
    WHERE is_used = false 
    ORDER BY id ASC 
    LIMIT 1
);

-- Вставляем токен в таблицу активных токенов
INSERT INTO chat_tokens (user_id, email, token, product_type, expires_at, created_at)
SELECT 
    11 as user_id,
    'golosova.2026@inbox.ru' as email,
    token,
    'combo' as product_type,
    expires_at,
    CURRENT_TIMESTAMP as created_at
FROM chat_tokens_pool
WHERE used_by_user_id = 11 AND used_by_email = 'golosova.2026@inbox.ru'
ORDER BY used_at DESC
LIMIT 1;