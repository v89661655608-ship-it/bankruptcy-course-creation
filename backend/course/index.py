'''
Business: Course content API for students - view modules, lessons, track progress
Args: event with httpMethod, headers, queryStringParameters; context with request_id
Returns: Course content and user progress data
'''

import json
import os
import jwt
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_user(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token:
        return None
    
    # Allow admin_session_token for admin viewing course
    if auth_token == 'admin_session_token':
        return {'id': 0, 'email': 'admin@session', 'is_admin': True}
    
    try:
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            return None
        
        payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
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
            'body': ''
        }
    
    headers_out = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    user = verify_user(event.get('headers', {}))
    if not user:
        return {
            'statusCode': 401,
            'headers': headers_out,
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    try:
        if method == 'GET':
            return get_course_content(user, event, headers_out)
        elif method == 'POST':
            return update_progress(user, event, headers_out)
        
        return {'statusCode': 405, 'headers': headers_out, 'body': json.dumps({'error': 'Method not allowed'})}
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps({'error': str(e)})
        }

def get_course_content(user: Dict[str, Any], event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    user_id = user['id']
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT COUNT(*) as has_access FROM user_purchases WHERE user_id = %s AND payment_status = 'completed' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
                (user_id,)
            )
            access_check = cur.fetchone()
            
            if not access_check['has_access'] and not user.get('is_admin'):
                return {
                    'statusCode': 403,
                    'headers': headers,
                    'body': json.dumps({'error': 'Course access required. Please purchase the course.'})
                }
            
            cur.execute("SELECT * FROM course_modules WHERE is_published = TRUE ORDER BY sort_order")
            modules = cur.fetchall()
            
            result = []
            for module in modules:
                module_dict = dict(module)
                
                cur.execute("SELECT * FROM lessons WHERE module_id = %s AND is_published = TRUE ORDER BY sort_order", (module['id'],))
                lessons = cur.fetchall()
                
                lessons_with_progress = []
                for lesson in lessons:
                    lesson_dict = dict(lesson)
                    
                    cur.execute(
                        "SELECT completed, watch_time_seconds, last_watched_at FROM user_progress WHERE user_id = %s AND lesson_id = %s",
                        (user_id, lesson['id'])
                    )
                    progress = cur.fetchone()
                    lesson_dict['progress'] = dict(progress) if progress else {'completed': False, 'watch_time_seconds': 0}
                    
                    cur.execute("SELECT * FROM materials WHERE lesson_id = %s", (lesson['id'],))
                    materials = cur.fetchall()
                    lesson_dict['materials'] = [dict(m) for m in materials]
                    
                    cur.execute("SELECT id, title, description, file_name, file_url, file_type, file_size FROM course_files WHERE lesson_id = %s ORDER BY uploaded_at DESC", (lesson['id'],))
                    lesson_files = cur.fetchall()
                    lesson_dict['files'] = [dict(f) for f in lesson_files]
                    
                    lessons_with_progress.append(lesson_dict)
                
                cur.execute("SELECT * FROM materials WHERE module_id = %s AND lesson_id IS NULL", (module['id'],))
                module_materials = cur.fetchall()
                
                cur.execute("SELECT id, title, description, file_name, file_url, file_type, file_size FROM course_files WHERE module_id = %s AND lesson_id IS NULL ORDER BY uploaded_at DESC", (module['id'],))
                module_files = cur.fetchall()
                
                module_dict['lessons'] = lessons_with_progress
                module_dict['materials'] = [dict(m) for m in module_materials]
                module_dict['files'] = [dict(f) for f in module_files]
                result.append(module_dict)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
    
    finally:
        conn.close()

def update_progress(user: Dict[str, Any], event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    conn = get_db_connection()
    user_id = user['id']
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        lesson_id = body_data.get('lesson_id')
        completed = body_data.get('completed', False)
        watch_time_seconds = body_data.get('watch_time_seconds', 0)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO user_progress (user_id, lesson_id, completed, watch_time_seconds, last_watched_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, lesson_id)
                DO UPDATE SET completed = EXCLUDED.completed, watch_time_seconds = EXCLUDED.watch_time_seconds, last_watched_at = CURRENT_TIMESTAMP
                RETURNING *
                """,
                (user_id, lesson_id, completed, watch_time_seconds)
            )
            progress = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(progress), default=str)
            }
    
    finally:
        conn.close()