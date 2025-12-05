-- Complete database structure restoration
-- This migration consolidates all previous migrations to prevent data loss

-- Users table with all fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    telegram_username VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    chat_expires_at TIMESTAMP,
    password_changed_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES course_modules(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    sort_order INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id),
    module_id INTEGER REFERENCES course_modules(id),
    title VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_kb INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    product_type VARCHAR(100),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    expires_at TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    watch_time_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- Course files table
CREATE TABLE IF NOT EXISTS course_files (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_data TEXT,
    module_id INTEGER REFERENCES course_modules(id),
    lesson_id INTEGER REFERENCES lessons(id),
    is_welcome_video BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat tokens table
CREATE TABLE IF NOT EXISTS chat_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP
);

-- Chat tokens pool table
CREATE TABLE IF NOT EXISTS chat_tokens_pool (
    id SERIAL PRIMARY KEY,
    token VARCHAR(100) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    assigned_user_id INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    image_url TEXT,
    files TEXT,
    reply_to_id INTEGER REFERENCES support_messages(id),
    is_from_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_by_admin BOOLEAN DEFAULT false,
    read_by_user BOOLEAN DEFAULT false
);

-- Support message reactions table
CREATE TABLE IF NOT EXISTS support_message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL REFERENCES support_messages(id),
    user_id INT NOT NULL REFERENCES users(id),
    reaction VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create all indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_materials_lesson_id ON materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_materials_module_id ON materials(module_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_files_uploaded_at ON course_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_files_module_id ON course_files(module_id);
CREATE INDEX IF NOT EXISTS idx_course_files_lesson_id ON course_files(lesson_id);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_token ON chat_tokens(token);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_user_id ON chat_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_email ON chat_tokens(email);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_expires_at ON chat_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_pool_token ON chat_tokens_pool(token);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_pool_is_used ON chat_tokens_pool(is_used);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_message_reactions_message_id ON support_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Create admin user
INSERT INTO users (email, password_hash, full_name, is_admin) 
VALUES (
    'melni-v@yandex.ru', 
    '$2b$12$LQv3c1yqBwgrHkDn.B633uNHZ8xGh4b6SipYVPQ8ZSJKHlKc5K3ne',
    'Владимир',
    true
)
ON CONFLICT (email) DO UPDATE 
SET is_admin = true, password_hash = EXCLUDED.password_hash;