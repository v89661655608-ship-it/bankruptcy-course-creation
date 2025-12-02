-- Inserting 1000 tokens into chat_tokens_pool
-- This file is generated, tokens are unique and valid for 365 days

INSERT INTO chat_tokens_pool (token, expires_at) VALUES
('CHAT_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', CURRENT_TIMESTAMP + INTERVAL '365 days')
ON CONFLICT (token) DO NOTHING;
