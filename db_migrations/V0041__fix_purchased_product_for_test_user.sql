-- Исправляем purchased_product для тестового пользователя
UPDATE t_p19166386_bankruptcy_course_cr.users 
SET purchased_product = 'course' 
WHERE email = 'v89661655608@gmail.com' AND purchased_product IS NULL;