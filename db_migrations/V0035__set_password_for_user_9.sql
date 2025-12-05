-- Set password "123456" for user golosova1989@internet.ru (id=9)
UPDATE t_p19166386_bankruptcy_course_cr.users 
SET password_hash = '$2b$12$VqZ8vYPJGz8P5Y8vYPJGzuK3nN3nN3nN3nN3nN3nN3nN3nN3nN3nO',
    password_changed_by_user = FALSE
WHERE id = 9;