-- Добавить поля для файлов, редактирования и ответов на сообщения
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS reply_to_id INT REFERENCES support_messages(id);

CREATE INDEX IF NOT EXISTS idx_support_messages_reply_to ON support_messages(reply_to_id);