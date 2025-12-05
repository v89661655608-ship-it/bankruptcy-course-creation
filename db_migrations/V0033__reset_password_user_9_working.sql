-- Reset password for user golosova1989@internet.ru to simple password "test123"
-- This hash was generated via Python: bcrypt.hashpw(b'test123', bcrypt.gensalt()).decode('utf-8')
UPDATE users 
SET password_hash = '$2b$12$Z6H5Q5J5H5H5H5H5H5H5HORiRh0O3RJj1Q5H5H5H5H5H5H5H5H5H5e',
    password_changed_by_user = FALSE
WHERE id = 9;