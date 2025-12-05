-- Set password "Lizik110808!" for admin user melni-v@yandex.ru (id=1)
UPDATE t_p19166386_bankruptcy_course_cr.users 
SET password_hash = '$2b$12$VXJxGmqJ7K8LZvWRKZzxWeQNBTYvB7EKxWLxK4VJ6F0nC5M9.0.rS',
    password_changed_by_user = TRUE
WHERE id = 1;
