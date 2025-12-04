-- Добавление поля для отслеживания срока действия доступа к чату с юристами
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS chat_expires_at TIMESTAMP NULL;

COMMENT ON COLUMN users.chat_expires_at IS 'Дата окончания доступа к чату с юристами (NULL = нет доступа)';