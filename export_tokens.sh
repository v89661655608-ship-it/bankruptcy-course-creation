#!/bin/bash

# Скрипт для экспорта всех неиспользованных токенов из базы данных
# 
# Использование:
#   ./export_tokens.sh
#
# Требования:
#   - Установлен Python 3
#   - Установлена библиотека psycopg2 (pip install psycopg2-binary)
#   - Установлена переменная окружения DATABASE_URL

echo "======================================================================"
echo "ЭКСПОРТ ТОКЕНОВ ИЗ БАЗЫ ДАННЫХ"
echo "======================================================================"
echo ""

# Проверяем наличие DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "Ошибка: переменная окружения DATABASE_URL не установлена"
    echo ""
    echo "Пожалуйста, установите DATABASE_URL:"
    echo '  export DATABASE_URL="postgresql://user:password@host:port/database"'
    echo ""
    echo "Затем запустите этот скрипт снова:"
    echo "  ./export_tokens.sh"
    echo ""
    exit 1
fi

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    echo "Ошибка: Python 3 не найден"
    echo "Пожалуйста, установите Python 3"
    exit 1
fi

# Проверяем наличие psycopg2
if ! python3 -c "import psycopg2" 2>/dev/null; then
    echo "Ошибка: библиотека psycopg2 не установлена"
    echo ""
    echo "Установите psycopg2:"
    echo "  pip install psycopg2-binary"
    echo ""
    exit 1
fi

# Запускаем скрипт экспорта
echo "Запуск скрипта экспорта токенов..."
echo ""

python3 export_all_tokens.py

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo "Экспорт завершен успешно!"
    echo ""
    if [ -f "chat_tokens_1000.txt" ]; then
        token_count=$(wc -l < chat_tokens_1000.txt)
        echo "Файл: chat_tokens_1000.txt"
        echo "Токенов: $token_count"
        echo ""
        echo "Первые 5 токенов:"
        head -5 chat_tokens_1000.txt
    fi
else
    echo "Экспорт завершился с ошибкой (код: $exit_code)"
fi

echo ""
echo "======================================================================"
