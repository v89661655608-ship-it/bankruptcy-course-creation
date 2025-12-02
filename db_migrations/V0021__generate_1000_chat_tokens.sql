-- Generate 1000 chat access tokens with 1 year expiration
INSERT INTO chat_tokens_pool (token, expires_at)
SELECT 
    'CHAT_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 32)) AS token,
    CURRENT_TIMESTAMP + INTERVAL '365 days' AS expires_at
FROM generate_series(1, 1000)
ON CONFLICT (token) DO NOTHING;