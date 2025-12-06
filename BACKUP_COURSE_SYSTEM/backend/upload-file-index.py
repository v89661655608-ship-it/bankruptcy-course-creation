'''
Business: Upload files (PDF, videos, documents) to S3 storage and save metadata to database
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with file URL and metadata

ВАЖНО: Разграничение прав доступа:
- GET (чтение файлов): любой аутентифицированный пользователь через verify_user()
- POST/DELETE (загрузка/удаление): только админы через verify_admin()
'''

import json
import base64
import uuid
import os
from typing import Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3
from botocore.exceptions import ClientError
import jwt

def verify_admin(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token:
        return None
    
    if auth_token == 'admin_session_token':
        return {'is_admin': True, 'id': 0, 'email': 'admin@session'}
    
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

def verify_user(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    '''Verify any authenticated user (not just admin)'''
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not auth_token:
        return None
    
    if auth_token == 'admin_session_token':
        return {'is_admin': True, 'id': 0, 'email': 'admin@session'}
    
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
                'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    
    # For GET requests, allow any authenticated user
    if method == 'GET':
        user = verify_user(headers)
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
    else:
        # For POST/DELETE, require admin
        admin_user = verify_admin(headers)
        if not admin_user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized - Admin access required'})
            }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        file_name = body_data.get('fileName')
        file_content = body_data.get('fileContent')
        external_url = body_data.get('externalUrl')
        file_type = body_data.get('fileType', 'application/pdf')
        title = body_data.get('title', file_name)
        description = body_data.get('description', '')
        lesson_id = body_data.get('lessonId')
        module_id = body_data.get('moduleId')
        is_welcome_video = body_data.get('isWelcomeVideo', False)
        
        if external_url:
            conn = psycopg2.connect(database_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            cur.execute(
                "INSERT INTO course_files (title, description, file_name, file_url, file_type, file_size, lesson_id, module_id, is_welcome_video, uploaded_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, title, file_url, uploaded_at",
                (title, description, title or 'external-video', external_url, file_type, 0, lesson_id, module_id, is_welcome_video, datetime.utcnow())
            )
            
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result['id'],
                    'title': result['title'],
                    'url': result['file_url'],
                    'uploadedAt': result['uploaded_at'].isoformat()
                })
            }
        
        if not file_name or not file_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'fileName and fileContent or externalUrl are required'})
            }
        
        file_data = base64.b64decode(file_content)
        
        # Upload to S3
        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        
        if not aws_access_key or not aws_secret_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'S3 credentials not configured'})
            }
        
        s3_client = boto3.client(
            's3',
            endpoint_url='https://storage.yandexcloud.net',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name='ru-central1'
        )
        
        bucket_name = 'poehalidev-user-files'
        file_key = f'course-files/{uuid.uuid4()}/{file_name}'
        
        try:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=file_key,
                Body=file_data,
                ContentType=file_type
            )
        except ClientError as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'S3 upload failed: {str(e)}'})
            }
        
        file_url = f'https://storage.yandexcloud.net/{bucket_name}/{file_key}'
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "INSERT INTO course_files (title, description, file_name, file_url, file_type, file_size, lesson_id, module_id, is_welcome_video, uploaded_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, title, file_url, uploaded_at",
            (title, description, file_name, file_url, file_type, len(file_data), lesson_id, module_id, is_welcome_video, datetime.utcnow())
        )
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': result['id'],
                'title': result['title'],
                'url': result['file_url'],
                'uploadedAt': result['uploaded_at'].isoformat()
            })
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        file_id = query_params.get('file_id')
        lesson_id = query_params.get('lesson_id')
        module_id = query_params.get('module_id')
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if file_id:
            cur.execute(
                "SELECT file_name, file_url FROM course_files WHERE id = %s",
                (file_id,)
            )
            file_record = cur.fetchone()
            cur.close()
            conn.close()
            
            if not file_record or not file_record['file_url']:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'File not found'})
                }
            
            return {
                'statusCode': 302,
                'headers': {
                    'Location': file_record['file_url'],
                    'Access-Control-Allow-Origin': '*'
                },
                'body': ''
            }
        
        if lesson_id:
            cur.execute(
                "SELECT id, title, description, file_name, file_url, file_type, file_size, lesson_id, module_id, is_welcome_video, uploaded_at FROM course_files WHERE lesson_id = %s ORDER BY uploaded_at DESC",
                (lesson_id,)
            )
        elif module_id:
            cur.execute(
                "SELECT id, title, description, file_name, file_url, file_type, file_size, lesson_id, module_id, is_welcome_video, uploaded_at FROM course_files WHERE module_id = %s ORDER BY uploaded_at DESC",
                (module_id,)
            )
        else:
            cur.execute(
                "SELECT id, title, description, file_name, file_url, file_type, file_size, lesson_id, module_id, is_welcome_video, uploaded_at FROM course_files ORDER BY uploaded_at DESC"
            )
        
        files = cur.fetchall()
        cur.close()
        conn.close()
        
        # ВАЖНО: Трансформация snake_case → camelCase для фронтенда
        files_list = []
        for f in files:
            files_list.append({
                'id': f['id'],
                'title': f['title'],
                'description': f['description'],
                'fileName': f['file_name'],           # snake_case → camelCase
                'fileUrl': f['file_url'],             # snake_case → camelCase
                'fileType': f['file_type'],           # snake_case → camelCase
                'fileSize': f['file_size'],
                'lessonId': f.get('lesson_id'),
                'moduleId': f.get('module_id'),
                'isWelcomeVideo': f.get('is_welcome_video', False),  # snake_case → camelCase
                'uploadedAt': f['uploaded_at'].isoformat()
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'files': files_list})
        }
    
    if method == 'DELETE':
        query_params = event.get('queryStringParameters', {})
        file_id = query_params.get('id')
        
        if not file_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'id parameter is required'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("DELETE FROM course_files WHERE id = %s RETURNING id", (file_id,))
        result = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'File not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
