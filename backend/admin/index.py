'''
Business: Admin API for managing course modules, lessons, and materials
Args: event with httpMethod, body, headers; context with request_id
Returns: Course management data or error messages
'''

import json
import os
import jwt
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_admin(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token:
        return None
    
    try:
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return None
        
        payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
        
        if not payload.get('is_admin'):
            return None
        
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers_out = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    admin = verify_admin(event.get('headers', {}))
    if not admin:
        return {
            'statusCode': 403,
            'headers': headers_out,
            'body': json.dumps({'error': 'Admin access required'})
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        resource = params.get('resource', 'modules')
        
        if resource == 'modules':
            return handle_modules(method, event, headers_out)
        elif resource == 'lessons':
            return handle_lessons(method, event, headers_out)
        elif resource == 'materials':
            return handle_materials(method, event, headers_out)
        elif resource == 'generate-tokens':
            return handle_generate_tokens(method, event, headers_out)
        elif resource == 'export-tokens':
            return handle_export_tokens(method, event, headers_out)
        else:
            return {
                'statusCode': 404,
                'headers': headers_out,
                'body': json.dumps({'error': 'Not found'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps({'error': str(e)})
        }

def handle_modules(method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM course_modules ORDER BY sort_order")
                modules = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(m) for m in modules], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title')
            description = body_data.get('description', '')
            sort_order = body_data.get('sort_order', 0)
            is_published = body_data.get('is_published', False)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO course_modules (title, description, sort_order, is_published) VALUES (%s, %s, %s, %s) RETURNING *",
                    (title, description, sort_order, is_published)
                )
                module = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(module), default=str)
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            module_id = body_data.get('id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "UPDATE course_modules SET title=%s, description=%s, sort_order=%s, is_published=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *",
                    (body_data.get('title'), body_data.get('description'), body_data.get('sort_order'), body_data.get('is_published'), module_id)
                )
                module = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(module), default=str)
                }
        
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    
    finally:
        conn.close()

def handle_lessons(method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            module_id = params.get('module_id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if module_id:
                    cur.execute("SELECT * FROM lessons WHERE module_id = %s ORDER BY sort_order", (module_id,))
                else:
                    cur.execute("SELECT * FROM lessons ORDER BY module_id, sort_order")
                
                lessons = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(l) for l in lessons], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO lessons (module_id, title, description, video_url, duration_minutes, sort_order, is_published) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *",
                    (body_data.get('module_id'), body_data.get('title'), body_data.get('description', ''), 
                     body_data.get('video_url', ''), body_data.get('duration_minutes', 0), 
                     body_data.get('sort_order', 0), body_data.get('is_published', False))
                )
                lesson = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(lesson), default=str)
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            lesson_id = body_data.get('id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "UPDATE lessons SET title=%s, description=%s, video_url=%s, duration_minutes=%s, sort_order=%s, is_published=%s, updated_at=CURRENT_TIMESTAMP WHERE id=%s RETURNING *",
                    (body_data.get('title'), body_data.get('description'), body_data.get('video_url'),
                     body_data.get('duration_minutes'), body_data.get('sort_order'), 
                     body_data.get('is_published'), lesson_id)
                )
                lesson = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(dict(lesson), default=str)
                }
        
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    
    finally:
        conn.close()

def handle_materials(method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            lesson_id = params.get('lesson_id')
            module_id = params.get('module_id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if lesson_id:
                    cur.execute("SELECT * FROM materials WHERE lesson_id = %s", (lesson_id,))
                elif module_id:
                    cur.execute("SELECT * FROM materials WHERE module_id = %s", (module_id,))
                else:
                    cur.execute("SELECT * FROM materials ORDER BY created_at DESC")
                
                materials = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps([dict(m) for m in materials], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO materials (lesson_id, module_id, title, file_url, file_type, file_size_kb) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *",
                    (body_data.get('lesson_id'), body_data.get('module_id'), body_data.get('title'),
                     body_data.get('file_url'), body_data.get('file_type'), body_data.get('file_size_kb'))
                )
                material = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(dict(material), default=str)
                }
        
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
    
    finally:
        conn.close()

def handle_generate_tokens(method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Generate 1000 tokens for chat access pool'''
    import hashlib
    import time
    from datetime import datetime, timedelta
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    conn = get_db_connection()
    try:
        body = json.loads(event.get('body', '{}'))
        count = body.get('count', 1000)
        
        expires_date = datetime.now() + timedelta(days=365)
        
        tokens_batch = []
        base_time = time.time()
        for i in range(count):
            unique_string = f"{base_time}{i}{os.urandom(8).hex()}"
            token = f"CHAT_{hashlib.sha256(unique_string.encode()).hexdigest()[:32].upper()}"
            tokens_batch.append((token, expires_date))
        
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                "INSERT INTO chat_tokens_pool (token, expires_at) VALUES %s ON CONFLICT (token) DO NOTHING",
                tokens_batch,
                page_size=500
            )
            generated_count = cur.rowcount
            conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'generated': generated_count,
                'expires_at': expires_date.isoformat()
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()

def handle_export_tokens(method: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Export all unused tokens from chat_tokens_pool'''
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Получаем ВСЕ неиспользованные токены без ограничений
            cur.execute("""
                SELECT token 
                FROM chat_tokens_pool 
                WHERE is_used = false 
                ORDER BY created_at DESC
            """)
            
            # Получаем все строки
            rows = cur.fetchall()
            
            # Извлекаем только токены из кортежей
            tokens = [row[0] for row in rows]
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'count': len(tokens),
                    'tokens': tokens
                })
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()