# Инструкция по экспорту токенов из базы данных

## Задача
Получить ВСЕ неиспользованные токены из таблицы `chat_tokens_pool` и сохранить их в текстовый файл `chat_tokens_1000.txt` (один токен на строку).

## SQL запрос
```sql
SELECT token 
FROM chat_tokens_pool 
WHERE is_used = false 
ORDER BY created_at DESC
```

## Способ 1: Python скрипт (РЕКОМЕНДУЕТСЯ)

### Требования
- Python 3
- Библиотека psycopg2

### Установка зависимостей
```bash
pip install psycopg2-binary
```

### Использование

1. Установите переменную окружения DATABASE_URL:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

2. Запустите скрипт:
```bash
python3 export_all_tokens.py
```

Или используйте bash-скрипт (проверяет все зависимости):
```bash
chmod +x export_tokens.sh
./export_tokens.sh
```

### Результат
- Файл: `chat_tokens_1000.txt`
- Формат: один токен на строку, без кавычек
- Скрипт выведет точное количество экспортированных токенов

### Пример вывода
```
======================================================================
ЭКСПОРТ ТОКЕНОВ ИЗ БАЗЫ ДАННЫХ
======================================================================

Подключение к базе данных...
Подключение успешно установлено

Выполнение SQL запроса:
  SELECT token FROM chat_tokens_pool
  WHERE is_used = false
  ORDER BY created_at DESC

Получение всех строк из базы данных...
Получено строк: 998

Запись токенов в файл: chat_tokens_1000.txt
Успешно записано токенов: 998

Файл сохранен: /path/to/chat_tokens_1000.txt
Соединение с базой данных закрыто

======================================================================
ИТОГО: 998 токенов экспортировано
======================================================================
```

## Способ 2: Node.js скрипт (через API)

### Требования
- Node.js
- Токен администратора (JWT токен с флагом is_admin)

### Использование

1. Получите токен администратора (JWT токен с is_admin=true)

2. Запустите скрипт:
```bash
ADMIN_TOKEN=your_jwt_token_here node export_tokens_from_db.mjs
```

### Результат
- Файл: `chat_tokens_1000.txt`
- Формат: один токен на строку
- Скрипт выведет точное количество экспортированных токенов

### Пример вывода
```
Fetching all unused tokens from database...

Status: 200 OK

Successfully fetched 998 tokens

Tokens saved to: chat_tokens_1000.txt
Total tokens exported: 998

Done!
```

## Способ 3: SQL файл (для выполнения вручную)

Если у вас есть прямой доступ к базе данных через psql или другой клиент:

1. Используйте файл `export_tokens.sql`:
```bash
psql $DATABASE_URL -f export_tokens.sql > tokens_output.txt
```

2. Обработайте вывод, чтобы оставить только токены (удалить заголовки и разделители)

## Backend функция (для Способа 2)

Была добавлена новая функция в `backend/admin/index.py`:

### Эндпоинт
```
GET https://functions.poehali.dev/94be9de0-6f48-41a7-98b1-708c24fb05ad?resource=export-tokens
Headers: X-Auth-Token: <admin_jwt_token>
```

### Ответ
```json
{
  "success": true,
  "count": 998,
  "tokens": [
    "CHAT_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    "CHAT_X1Y2Z3W4V5U6T7S8R9Q0P1O2N3M4L5K6",
    ...
  ]
}
```

## Структура таблицы chat_tokens_pool

```sql
CREATE TABLE chat_tokens_pool (
    id SERIAL PRIMARY KEY,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_user_id INTEGER,
    used_by_email VARCHAR(255),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Файлы в проекте

1. **export_all_tokens.py** - Python скрипт для прямого подключения к БД (РЕКОМЕНДУЕТСЯ)
2. **export_tokens.sh** - Bash-скрипт с проверками и запуском Python скрипта
3. **export_tokens_from_db.mjs** - Node.js скрипт для работы через API
4. **export_tokens.sql** - SQL запрос для ручного выполнения
5. **backend/admin/index.py** - Обновленная backend функция с эндпоинтом export-tokens (развернута)
6. **db_migrations/V0022__create_chat_tokens_pool_table.sql** - Миграция для создания таблицы (если не существует)

## Примечания

- Все скрипты получают ВСЕ токены без ограничений (не используется LIMIT)
- Формат вывода: один токен на строку, только сам токен без кавычек  
- Скрипты возвращают точное количество экспортированных токенов
- Токены сортируются по дате создания (от новых к старым)
- В примерах показано 998 токенов, так как 2 токена уже могли быть использованы

## Как использовать экспортированные токены

После экспорта токенов в файл `chat_tokens_1000.txt`, вы можете:

1. Отправить файл клиенту
2. Импортировать токены в другую систему
3. Использовать токены для массовой активации доступа
4. Создать резервную копию неиспользованных токенов

Каждая строка файла содержит один токен в формате:
```
CHAT_A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
CHAT_X1Y2Z3W4V5U6T7S8R9Q0P1O2N3M4L5K6
...
```
