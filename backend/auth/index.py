'''
Business: User authentication API - registration, login, token validation
Args: event with httpMethod, body, headers; context with request_id
Returns: JWT tokens for authenticated users or error messages
'''

import json
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

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
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                return register_user(body_data, headers)
            elif action == 'login':
                return login_user(body_data, headers)
            elif action == 'change_password':
                return change_password(body_data, event, headers)
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters') or {}
            chat_token = params.get('chat_token')
            
            if chat_token:
                return verify_chat_token(chat_token, headers)
            
            auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            if not auth_token:
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'No token provided'}),
                    'isBase64Encoded': False
                }
            
            return validate_token(auth_token, headers)
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"[ERROR] Exception in handler: {str(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    telegram_username = data.get('telegram_username', '').strip()
    
    if not email or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email, password and full_name are required'}),
            'isBase64Encoded': False
        }
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO t_p19166386_bankruptcy_course_cr.users (email, password_hash, full_name, telegram_username) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, is_admin, created_at",
                (email, password_hash, full_name, telegram_username if telegram_username else None)
            )
            user = cur.fetchone()
            conn.commit()
            
            token = generate_token(dict(user))
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'is_admin': user['is_admin']
                    }
                }, default=str),
                'isBase64Encoded': False
            }
    except psycopg2.IntegrityError:
        conn.rollback()
        return {
            'statusCode': 409,
            'headers': headers,
            'body': json.dumps({'error': 'User with this email already exists'}),
            'isBase64Encoded': False
        }
    finally:
        conn.close()

def login_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    
    print(f"[LOGIN] Attempting login for email: {email}")
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email and password are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            print(f"[LOGIN] Executing SELECT query for email: {email}")
            cur.execute(
                "SELECT id, email, password_hash, full_name, is_admin, chat_expires_at, expires_at, password_changed_by_user FROM t_p19166386_bankruptcy_course_cr.users WHERE email = %s",
                (email,)
            )
            user = cur.fetchone()
            
            print(f"[LOGIN] User found: {user is not None}")
            
            if not user:
                print(f"[LOGIN] User not found for email: {email}")
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
            
            print(f"[LOGIN] Checking password for user {user['id']}")
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token(dict(user))
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name'],
                        'is_admin': user['is_admin'],
                        'chat_expires_at': user['chat_expires_at'].isoformat() if user.get('chat_expires_at') else None,
                        'expires_at': user['expires_at'].isoformat() if user.get('expires_at') else None,
                        'password_changed_by_user': user.get('password_changed_by_user', False)
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def validate_token(token: str, headers: Dict[str, str]) -> Dict[str, Any]:
    try:
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'JWT_SECRET not configured'}),
                'isBase64Encoded': False
            }
        
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload['id']
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT COUNT(*) as has_access FROM t_p19166386_bankruptcy_course_cr.user_purchases WHERE user_id = %s AND payment_status = 'completed' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
                    (user_id,)
                )
                access_check = cur.fetchone()
                has_course_access = access_check['has_access'] > 0 or payload.get('is_admin', False)
                
                # Получаем chat_expires_at и expires_at из users
                cur.execute(
                    "SELECT chat_expires_at, expires_at FROM t_p19166386_bankruptcy_course_cr.users WHERE id = %s",
                    (user_id,)
                )
                user_data = cur.fetchone()
        finally:
            conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'valid': True,
                'user': {
                    'id': payload['id'],
                    'email': payload['email'],
                    'full_name': payload['full_name'],
                    'is_admin': payload['is_admin'],
                    'has_course_access': has_course_access,
                    'chat_expires_at': user_data['chat_expires_at'].isoformat() if user_data and user_data.get('chat_expires_at') else None,
                    'expires_at': user_data['expires_at'].isoformat() if user_data and user_data.get('expires_at') else None
                }
            }),
            'isBase64Encoded': False
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Token expired'}),
            'isBase64Encoded': False
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }

def generate_token(user: Dict[str, Any]) -> str:
    jwt_secret = os.environ['JWT_SECRET']
    
    payload = {
        'id': user['id'],
        'email': user['email'],
        'full_name': user['full_name'],
        'is_admin': user.get('is_admin', False),
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    
    return jwt.encode(payload, jwt_secret, algorithm='HS256')

def change_password(data: Dict[str, Any], event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not new_password or len(new_password) < 6:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'New password must be at least 6 characters'}),
            'isBase64Encoded': False
        }
    
    try:
        jwt_secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
        user_id = payload['id']
    except:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT password_hash FROM t_p19166386_bankruptcy_course_cr.users WHERE id = %s",
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
            
            if old_password and not bcrypt.checkpw(old_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Current password is incorrect'}),
                    'isBase64Encoded': False
                }
            
            new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur.execute(
                "UPDATE t_p19166386_bankruptcy_course_cr.users SET password_hash = %s, password_changed_by_user = TRUE WHERE id = %s",
                (new_password_hash, user_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'Password updated successfully'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def verify_chat_token(token: str, headers: Dict[str, str]) -> Dict[str, Any]:
    if not token:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Token is required', 'valid': False}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT ct.id, ct.user_id, ct.email, ct.product_type, ct.expires_at, ct.is_active, ct.created_at,
                          u.full_name
                   FROM t_p19166386_bankruptcy_course_cr.chat_tokens ct
                   JOIN t_p19166386_bankruptcy_course_cr.users u ON ct.user_id = u.id
                   WHERE ct.token = %s""",
                (token,)
            )
            token_data = cur.fetchone()
            
            if not token_data:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token not found', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            if not token_data['is_active']:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token is deactivated', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            if token_data['expires_at'] < datetime.now():
                cur.execute(
                    "UPDATE t_p19166386_bankruptcy_course_cr.chat_tokens SET is_active = false WHERE id = %s",
                    (token_data['id'],)
                )
                conn.commit()
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token expired', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "UPDATE chat_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = %s",
                (token_data['id'],)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'valid': True,
                    'user_id': token_data['user_id'],
                    'email': token_data['email'],
                    'full_name': token_data['full_name'],
                    'product_type': token_data['product_type'],
                    'expires_at': token_data['expires_at'].isoformat(),
                    'created_at': token_data['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'valid': False}),
            'isBase64Encoded': False
        }
    finally:
        conn.close()