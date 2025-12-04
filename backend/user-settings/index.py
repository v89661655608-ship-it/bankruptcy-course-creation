'''
Управление настройками пользователя
Args: event с httpMethod, headers (X-Auth-Token), queryStringParameters, body
Returns: Настройки пользователя, обновление настроек
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_token(token: str) -> Dict[str, Any] | None:
    try:
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return None
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except:
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers_out = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    auth_token = event.get('headers', {}).get('x-auth-token') or event.get('headers', {}).get('X-Auth-Token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers_out,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    user = get_user_from_token(auth_token)
    if not user:
        return {
            'statusCode': 401,
            'headers': headers_out,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'get_settings')
        
        if action == 'get_settings':
            return get_settings(user['user_id'], headers_out)
        elif action == 'update_settings':
            return update_settings(event, user['user_id'], headers_out)
        
        return {
            'statusCode': 400,
            'headers': headers_out,
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'traceback': traceback.format_exc()
            }),
            'isBase64Encoded': False
        }

def get_settings(user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT email_notifications_enabled FROM t_p19166386_bankruptcy_course_cr.users WHERE id = %s",
                (user_id,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'email_notifications_enabled': user['email_notifications_enabled'] if user['email_notifications_enabled'] is not None else True
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def update_settings(event: Dict[str, Any], user_id: int, headers: Dict[str, str]) -> Dict[str, Any]:
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    body_data = json.loads(body)
    
    email_notifications_enabled = body_data.get('email_notifications_enabled')
    
    if email_notifications_enabled is None:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'email_notifications_enabled is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE t_p19166386_bankruptcy_course_cr.users SET email_notifications_enabled = %s WHERE id = %s",
                (bool(email_notifications_enabled), user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
