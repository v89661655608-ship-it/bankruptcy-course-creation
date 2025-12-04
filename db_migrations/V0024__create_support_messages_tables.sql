-- Таблица для хранения сообщений службы поддержки
CREATE TABLE IF NOT EXISTS support_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    image_url TEXT,
    is_from_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_by_admin BOOLEAN DEFAULT false,
    read_by_user BOOLEAN DEFAULT false
);

-- Таблица для хранения реакций на сообщения
CREATE TABLE IF NOT EXISTS support_message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL REFERENCES support_messages(id),
    user_id INT NOT NULL REFERENCES users(id),
    reaction VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_message_reactions_message_id ON support_message_reactions(message_id);