import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление пользователями для администратора
    
    Args:
        event - dict с httpMethod, body
        context - object с request_id, function_name, etc
    Returns: 
        HTTP response dict с списком пользователей или результатом удаления
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    if not action:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Action required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        print(f'[DEBUG] Action: {action}')
        print(f'[DEBUG] Body data: {body_data}')
        
        conn = psycopg2.connect(dsn)
        print('[DEBUG] Database connected')
        
        if action == 'list':
            return list_users(conn)
        elif action == 'delete':
            user_id = body_data.get('user_id')
            print(f'[DEBUG] Deleting user_id: {user_id}')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            return delete_user(conn, user_id)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Unknown action: {action}'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        print(f'[ERROR] Exception occurred: {str(e)}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()
            print('[DEBUG] Database connection closed')


def list_users(conn) -> Dict[str, Any]:
    '''Получить список всех пользователей с информацией о подписках'''
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        query = '''
            SELECT 
                id,
                email,
                full_name,
                is_admin,
                created_at,
                chat_expires_at,
                purchased_product,
                password_changed_by_user
            FROM t_p19166386_bankruptcy_course_cr.users
            ORDER BY created_at DESC
        '''
        
        cur.execute(query)
        users = cur.fetchall()
        
        users_list = []
        for user in users:
            users_list.append({
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'is_admin': user['is_admin'],
                'created_at': user['created_at'].isoformat() if user['created_at'] else None,
                'chat_expires_at': user['chat_expires_at'].isoformat() if user['chat_expires_at'] else None,
                'purchased_product': user['purchased_product'],
                'password_changed_by_user': user['password_changed_by_user']
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'users': users_list}),
            'isBase64Encoded': False
        }


def delete_user(conn, user_id: int) -> Dict[str, Any]:
    '''Безопасное удаление пользователя и всех связанных данных'''
    
    print(f'[DEBUG] Starting delete_user for ID: {user_id}')
    
    # Используем autocommit для Simple Query Protocol
    conn.autocommit = True
    
    with conn.cursor() as cur:
        # Проверяем, не является ли пользователь админом
        query = f"SELECT is_admin FROM t_p19166386_bankruptcy_course_cr.users WHERE id = {user_id}"
        print(f'[DEBUG] Executing query: {query}')
        cur.execute(query)
        result = cur.fetchone()
        
        if not result:
            print(f'[DEBUG] User not found: {user_id}')
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        if result[0]:  # is_admin = True
            print(f'[DEBUG] Cannot delete admin user: {user_id}')
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot delete admin user'}),
                'isBase64Encoded': False
            }
        
        print(f'[DEBUG] Starting cascade delete for user: {user_id}')
        
        # Удаляем связанные данные в правильном порядке (от дочерних к родительским)
        
        # 1. Токены сброса пароля
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.password_reset_tokens WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted password_reset_tokens')
        
        # 2. Реакции на сообщения поддержки (сначала реакции, потом сами сообщения)
        cur.execute(f"""
            DELETE FROM t_p19166386_bankruptcy_course_cr.support_message_reactions 
            WHERE message_id IN (
                SELECT id FROM t_p19166386_bankruptcy_course_cr.support_messages 
                WHERE user_id = {user_id}
            )
        """)
        print(f'[DEBUG] Deleted support_message_reactions')
        
        # 3. Сообщения поддержки
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.support_messages WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted support_messages')
        
        # 4. Токены чата
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.chat_tokens WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted chat_tokens')
        
        # 5. Пул токенов чата
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.chat_tokens_pool WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted chat_tokens_pool')
        
        # 6. Доступ к чату
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.chat_access WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted chat_access')
        
        # 7. Прогресс пользователя
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.user_progress WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted user_progress')
        
        # 8. Покупки пользователя
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.user_purchases WHERE user_id = {user_id}")
        print(f'[DEBUG] Deleted user_purchases')
        
        # 9. Наконец, удаляем самого пользователя
        cur.execute(f"DELETE FROM t_p19166386_bankruptcy_course_cr.users WHERE id = {user_id}")
        print(f'[DEBUG] Deleted user')
        
        print(f'[DEBUG] User {user_id} successfully deleted')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'User deleted successfully'}),
            'isBase64Encoded': False
        }