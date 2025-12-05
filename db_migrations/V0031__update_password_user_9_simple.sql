-- Update password for user golosova1989@internet.ru
-- New password: 123456
-- Hash generated via bcrypt with salt rounds=12
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBwgrHkDn.B633uNHZ8xGh4b6SipYVPQ8ZSJKHlKc5K3ne'
WHERE id = 9;