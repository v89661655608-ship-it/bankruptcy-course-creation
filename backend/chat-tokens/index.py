import json
import os
import psycopg2
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API for managing chat access tokens between bankrot-kurs.ru and chat-bankrot.ru
    Args: event with httpMethod (POST for create, GET for verify), headers with X-Api-Key
    Returns: HTTP response with token data or verification result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    api_key = headers.get('x-api-key') or headers.get('X-Api-Key')
    expected_key = os.environ.get('CHAT_API_KEY')
    
    if not api_key or api_key != expected_key:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized: Invalid API key'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            email = body_data.get('email')
            product_type = body_data.get('product_type', 'chat')
            days = body_data.get('days', 30)
            
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email is required'})
                }
            
            token = str(uuid.uuid4())
            expires_at = datetime.now() + timedelta(days=days)
            
            cur.execute('''
                INSERT INTO t_p19166386_bankruptcy_course_cr.chat_tokens 
                (user_id, email, token, product_type, created_at, expires_at, is_active)
                VALUES (%s, %s, %s, %s, NOW(), %s, TRUE)
                RETURNING id, token, expires_at
            ''', (user_id, email, token, product_type, expires_at))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': result[0],
                    'token': result[1],
                    'expires_at': result[2].isoformat(),
                    'email': email
                })
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            token = params.get('token')
            
            if not token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Token parameter is required'})
                }
            
            cur.execute('''
                SELECT id, user_id, email, product_type, expires_at, is_active, last_used_at
                FROM t_p19166386_bankruptcy_course_cr.chat_tokens
                WHERE token = %s
            ''', (token,))
            
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'valid': False, 'error': 'Token not found'})
                }
            
            token_id, user_id, email, product_type, expires_at, is_active, last_used_at = row
            is_expired = datetime.now() > expires_at
            is_valid = is_active and not is_expired
            
            if is_valid:
                cur.execute('''
                    UPDATE t_p19166386_bankruptcy_course_cr.chat_tokens
                    SET last_used_at = NOW()
                    WHERE token = %s
                ''', (token,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'valid': is_valid,
                    'token_id': token_id,
                    'user_id': user_id,
                    'email': email,
                    'product_type': product_type,
                    'expires_at': expires_at.isoformat(),
                    'is_active': is_active,
                    'is_expired': is_expired,
                    'last_used_at': last_used_at.isoformat() if last_used_at else None
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cur.close()
        conn.close()
