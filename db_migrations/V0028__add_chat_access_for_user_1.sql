-- Add chat access for user melni-v@yandex.ru (user_id = 1)
-- Based on combo purchase with expires_at = 2028-11-17
INSERT INTO t_p19166386_bankruptcy_course_cr.chat_access (
    client_name,
    client_email,
    client_phone,
    telegram_username,
    access_start,
    access_end,
    is_active,
    payment_amount,
    notes,
    created_at,
    updated_at,
    user_id
) VALUES (
    'Пользователь',
    'melni-v@yandex.ru',
    NULL,
    NULL,
    NOW(),
    '2028-11-17 07:54:05.347651',
    true,
    '5999.00',
    'Восстановлен доступ к чату для combo-подписки',
    NOW(),
    NOW(),
    1
);