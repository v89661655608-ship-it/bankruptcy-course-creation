#!/usr/bin/env python3
"""
Скрипт для экспорта всех неиспользованных токенов из базы данных.

Использование:
    export DATABASE_URL="postgresql://user:password@host:port/database"
    python3 export_all_tokens.py

Результат:
    Файл chat_tokens_1000.txt с одним токеном на строку
"""

import os
import sys
import psycopg2

def export_tokens():
    """
    Экспортирует все неиспользованные токены из базы данных в файл.
    
    Returns:
        int: Количество экспортированных токенов
    """
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("Ошибка: переменная окружения DATABASE_URL не установлена")
        print("\nИспользование:")
        print('  export DATABASE_URL="postgresql://user:password@host:port/database"')
        print("  python3 export_all_tokens.py")
        sys.exit(1)
    
    conn = None
    try:
        print(f"Подключение к базе данных...")
        conn = psycopg2.connect(database_url)
        print("Подключение успешно установлено")
        print("")
        
        with conn.cursor() as cur:
            # Выполняем SQL запрос для получения ВСЕХ токенов
            print("Выполнение SQL запроса:")
            print("  SELECT token FROM chat_tokens_pool")
            print("  WHERE is_used = false")
            print("  ORDER BY created_at DESC")
            print("")
            
            cur.execute("""
                SELECT token 
                FROM chat_tokens_pool 
                WHERE is_used = false 
                ORDER BY created_at DESC
            """)
            
            # Получаем ВСЕ строки (fetchall без ограничений)
            print("Получение всех строк из базы данных...")
            rows = cur.fetchall()
            print(f"Получено строк: {len(rows)}")
            print("")
            
            # Записываем токены в файл
            output_file = 'chat_tokens_1000.txt'
            print(f"Запись токенов в файл: {output_file}")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                for row in rows:
                    # Записываем только сам токен (row[0]) без кавычек
                    f.write(f"{row[0]}\n")
            
            # Возвращаем точное количество записанных токенов
            token_count = len(rows)
            print(f"Успешно записано токенов: {token_count}")
            print("")
            print(f"Файл сохранен: {os.path.abspath(output_file)}")
            
            return token_count
            
    except psycopg2.Error as e:
        print(f"Ошибка базы данных: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Ошибка при экспорте токенов: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            print("Соединение с базой данных закрыто")

if __name__ == "__main__":
    print("=" * 70)
    print("ЭКСПОРТ ТОКЕНОВ ИЗ БАЗЫ ДАННЫХ")
    print("=" * 70)
    print("")
    
    count = export_tokens()
    
    print("")
    print("=" * 70)
    print(f"ИТОГО: {count} токенов экспортировано")
    print("=" * 70)
