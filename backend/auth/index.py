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
import psycopg2.extensions

def get_db_connection():
    db_url = os.environ['DATABASE_URL']
    # Mask password for logging
    masked_url = db_url
    if '@' in db_url and ':' in db_url:
        parts = db_url.split('@')
        if len(parts) == 2 and ':' in parts[0]:
            user_pass = parts[0].split('://')
            if len(user_pass) == 2:
                user = user_pass[1].split(':')[0]
                masked_url = f"{user_pass[0]}://{user}:***@{parts[1]}"
    print(f"[DB] Connecting with URL: {masked_url}")
    
    conn = psycopg2.connect(db_url)
    # Set connection to use simple queries only
    conn.set_session(autocommit=False)
    
    # Log current user and search_path for debugging
    with conn.cursor() as cur:
        cur.execute("SELECT current_user")
        user = cur.fetchone()[0]
        print(f"[DB] Connected as user: {user}")
        
        cur.execute("SELECT current_database()")
        db = cur.fetchone()[0]
        print(f"[DB] Database: {db}")
        
        cur.execute("SHOW search_path")
        search_path = cur.fetchone()[0]
        print(f"[DB] Search path: {search_path}")
        
        # Try simple query to users table
        try:
            cur.execute("SELECT COUNT(*) FROM users")
            count = cur.fetchone()[0]
            print(f"[DB] Users table accessible: True (count={count})")
        except Exception as e:
            print(f"[DB] Users table accessible: False (error={str(e)})")
    return conn

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
        with conn.cursor() as cur:
            # Use string formatting for Simple Query Protocol
            safe_email = email.replace("'", "''")
            safe_password_hash = password_hash.replace("'", "''")
            safe_full_name = full_name.replace("'", "''")
            safe_telegram = telegram_username.replace("'", "''") if telegram_username else ''
            
            telegram_value = f"'{safe_telegram}'" if telegram_username else 'NULL'
            
            cur.execute(
                f"INSERT INTO users (email, password_hash, full_name, telegram_username) VALUES ('{safe_email}', '{safe_password_hash}', '{safe_full_name}', {telegram_value}) RETURNING id, email, full_name, is_admin, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            
            user = {
                'id': row[0],
                'email': row[1],
                'full_name': row[2],
                'is_admin': row[3],
                'created_at': row[4]
            }
            
            token = generate_token(user)
            
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
        with conn.cursor() as cur:
            print(f"[LOGIN] Executing SELECT query for email: {email}")
            # Use string formatting instead of parameterized query (Simple Query Protocol requirement)
            # Escape single quotes by doubling them for SQL safety
            safe_email = email.replace("'", "''")
            
            # Use full table name with schema to avoid permission issues
            query = f"SELECT id, email, password_hash, full_name, is_admin, chat_expires_at, expires_at, password_changed_by_user FROM t_p19166386_bankruptcy_course_cr.users WHERE email = '{safe_email}'"
            print(f"[LOGIN] Full SQL query: {query}")
            
            try:
                cur.execute(query)
                row = cur.fetchone()
                print(f"[LOGIN] Query executed successfully, row fetched: {row is not None}")
            except Exception as e:
                print(f"[LOGIN] EXECUTE FAILED: {str(e)}")
                print(f"[LOGIN] Error type: {type(e).__name__}")
                print(f"[LOGIN] Error module: {type(e).__module__}")
                import traceback
                print(f"[LOGIN] Full traceback: {traceback.format_exc()}")
                raise
            if not row:
                user = None
            else:
                columns = ['id', 'email', 'password_hash', 'full_name', 'is_admin', 'chat_expires_at', 'expires_at', 'password_changed_by_user']
                user = dict(zip(columns, row))
            
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
            with conn.cursor() as cur:
                # Use string formatting for Simple Query Protocol
                safe_user_id = str(int(user_id))  # Ensure it's a safe integer
                cur.execute(
                    f"SELECT COUNT(*) as has_access FROM user_purchases WHERE user_id = {safe_user_id} AND payment_status = 'completed' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)"
                )
                access_count = cur.fetchone()[0]
                has_course_access = access_count > 0 or payload.get('is_admin', False)
                
                # Получаем chat_expires_at и expires_at из users
                cur.execute(
                    f"SELECT chat_expires_at, expires_at FROM users WHERE id = {safe_user_id}"
                )
                user_row = cur.fetchone()
                user_data = {'chat_expires_at': user_row[0], 'expires_at': user_row[1]} if user_row else None
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
        with conn.cursor() as cur:
            safe_user_id = str(int(user_id))
            cur.execute(
                f"SELECT password_hash FROM users WHERE id = {safe_user_id}"
            )
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            user_password_hash = row[0]
            
            if old_password and not bcrypt.checkpw(old_password.encode('utf-8'), user_password_hash.encode('utf-8')):
                return {
                    'statusCode': 401,
                    'headers': headers,
                    'body': json.dumps({'error': 'Current password is incorrect'}),
                    'isBase64Encoded': False
                }
            
            new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            safe_new_password_hash = new_password_hash.replace("'", "''")
            
            cur.execute(
                f"UPDATE users SET password_hash = '{safe_new_password_hash}', password_changed_by_user = TRUE WHERE id = {safe_user_id}"
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
        with conn.cursor() as cur:
            safe_token = token.replace("'", "''")
            cur.execute(
                f"""SELECT ct.id, ct.user_id, ct.email, ct.product_type, ct.expires_at, ct.is_active, ct.created_at,
                          u.full_name
                   FROM chat_tokens ct
                   JOIN users u ON ct.user_id = u.id
                   WHERE ct.token = '{safe_token}'"""
            )
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token not found', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            token_data = {
                'id': row[0],
                'user_id': row[1],
                'email': row[2],
                'product_type': row[3],
                'expires_at': row[4],
                'is_active': row[5],
                'created_at': row[6],
                'full_name': row[7]
            }
            
            if not token_data['is_active']:
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token is deactivated', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            if token_data['expires_at'] < datetime.now():
                safe_id = str(int(token_data['id']))
                cur.execute(
                    f"UPDATE chat_tokens SET is_active = false WHERE id = {safe_id}"
                )
                conn.commit()
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Token expired', 'valid': False}),
                    'isBase64Encoded': False
                }
            
            safe_id = str(int(token_data['id']))
            cur.execute(
                f"UPDATE chat_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = {safe_id}"
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