-- Fix password hash for admin user melni-v@yandex.ru (id=1)
-- Password: Lizik110808!
UPDATE t_p19166386_bankruptcy_course_cr.users 
SET password_hash = '$2b$12$Vi.JcJeROybkQrVUCZZcsuVfyt/jPQugz8Xi4Z2jghEe2RNarlnbe',
    password_changed_by_user = TRUE
WHERE id = 1;
