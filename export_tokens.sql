-- Экспорт всех неиспользованных токенов из chat_tokens_pool
-- Этот запрос выведет все токены, которые можно скопировать в файл

SELECT token 
FROM chat_tokens_pool 
WHERE is_used = false 
ORDER BY created_at DESC;
