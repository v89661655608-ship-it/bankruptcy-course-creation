-- Create chat_tokens_pool table for storing pre-generated chat access tokens
-- This table is used as a pool of tokens that can be assigned to users upon purchase

CREATE TABLE IF NOT EXISTS chat_tokens_pool (
    id SERIAL PRIMARY KEY,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_user_id INTEGER,
    used_by_email VARCHAR(255),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_chat_tokens_pool_token ON chat_tokens_pool(token);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_pool_is_used ON chat_tokens_pool(is_used);
CREATE INDEX IF NOT EXISTS idx_chat_tokens_pool_used_by ON chat_tokens_pool(used_by_user_id, used_by_email);

-- Comment
COMMENT ON TABLE chat_tokens_pool IS 'Pool of pre-generated chat access tokens that can be assigned to users';
COMMENT ON COLUMN chat_tokens_pool.is_used IS 'Flag indicating if token has been assigned to a user';
COMMENT ON COLUMN chat_tokens_pool.used_by_user_id IS 'ID of user who received this token';
COMMENT ON COLUMN chat_tokens_pool.used_by_email IS 'Email of user who received this token';
COMMENT ON COLUMN chat_tokens_pool.used_at IS 'Timestamp when token was assigned to user';
