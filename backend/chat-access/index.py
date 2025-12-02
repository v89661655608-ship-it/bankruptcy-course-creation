'''
Business: Управление доступом клиентов к чату с юристами
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

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
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method == 'GET':
            return get_clients(event, headers)
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            if 'token' in body_data:
                return verify_token(event, headers)
            else:
                return add_client(event, headers)
        elif method == 'PUT':
            return update_client(event, headers)
        elif method == 'DELETE':
            return delete_client(event, headers)
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }

def get_clients(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    active_only = params.get('active', 'true').lower() == 'true'
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if active_only:
        cur.execute("""
            SELECT id, client_name, client_email, client_phone, telegram_username,
                   access_start, access_end, is_active, payment_amount, notes,
                   created_at, updated_at
            FROM chat_access
            WHERE is_active = true AND access_end > NOW()
            ORDER BY access_end ASC
        """)
    else:
        cur.execute("""
            SELECT id, client_name, client_email, client_phone, telegram_username,
                   access_start, access_end, is_active, payment_amount, notes,
                   created_at, updated_at
            FROM chat_access
            ORDER BY created_at DESC
        """)
    
    clients = cur.fetchall()
    cur.close()
    conn.close()
    
    for client in clients:
        for key in ['access_start', 'access_end', 'created_at', 'updated_at']:
            if client.get(key):
                client[key] = client[key].isoformat()
        if client.get('payment_amount'):
            client['payment_amount'] = float(client['payment_amount'])
    
    return {
        'statusCode': 200,
        'headers': headers,
        'isBase64Encoded': False,
        'body': json.dumps({'clients': clients})
    }

def add_client(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    client_name = body_data.get('client_name')
    client_email = body_data.get('client_email')
    client_phone = body_data.get('client_phone')
    telegram_username = body_data.get('telegram_username')
    days = body_data.get('days', 7)
    payment_amount = body_data.get('payment_amount')
    notes = body_data.get('notes')
    
    if not client_name:
        return {
            'statusCode': 400,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'client_name is required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    access_start = datetime.now()
    access_end = access_start + timedelta(days=days)
    
    cur.execute("""
        INSERT INTO chat_access (
            client_name, client_email, client_phone, telegram_username,
            access_start, access_end, is_active, payment_amount, notes
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, client_name, access_start, access_end
    """, (
        client_name, client_email, client_phone, telegram_username,
        access_start, access_end, True, payment_amount, notes
    ))
    
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if result:
        result['access_start'] = result['access_start'].isoformat()
        result['access_end'] = result['access_end'].isoformat()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'client': result})
    }

def update_client(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    client_id = params.get('id')
    
    if not client_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'id parameter is required'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    update_fields = []
    update_values = []
    
    if 'client_name' in body_data:
        update_fields.append('client_name = %s')
        update_values.append(body_data['client_name'])
    if 'client_email' in body_data:
        update_fields.append('client_email = %s')
        update_values.append(body_data['client_email'])
    if 'client_phone' in body_data:
        update_fields.append('client_phone = %s')
        update_values.append(body_data['client_phone'])
    if 'telegram_username' in body_data:
        update_fields.append('telegram_username = %s')
        update_values.append(body_data['telegram_username'])
    if 'extend_days' in body_data:
        update_fields.append('access_end = access_end + INTERVAL \'%s days\'')
        update_values.append(body_data['extend_days'])
    if 'is_active' in body_data:
        update_fields.append('is_active = %s')
        update_values.append(body_data['is_active'])
    if 'notes' in body_data:
        update_fields.append('notes = %s')
        update_values.append(body_data['notes'])
    
    update_fields.append('updated_at = NOW()')
    update_values.append(client_id)
    
    query = f"UPDATE chat_access SET {', '.join(update_fields)} WHERE id = %s RETURNING id"
    
    cur.execute(query, update_values)
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if result:
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'updated_id': result['id']})
        }
    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Client not found'})
        }

def delete_client(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    client_id = params.get('id')
    
    if not client_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'id parameter is required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM chat_access WHERE id = %s RETURNING id", (client_id,))
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if result:
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'deleted_id': result['id']})
        }
    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Client not found'})
        }

def verify_token(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    token = body_data.get('token', '').strip().upper()
    
    if not token or not token.startswith('CHAT_'):
        return {
            'statusCode': 400,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'valid': False,
                'access_granted': False,
                'error': 'Неверный формат токена'
            })
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, is_used, used_by_email, expires_at 
        FROM chat_tokens_pool 
        WHERE token = %s
    """, (token,))
    
    token_data = cur.fetchone()
    
    if not token_data:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'valid': False,
                'access_granted': False,
                'error': 'Токен не найден'
            })
        }
    
    if token_data['is_used']:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'valid': True,
                'access_granted': True,
                'user_email': token_data['used_by_email'],
                'access_end': token_data['expires_at'].isoformat() if token_data['expires_at'] else None
            })
        }
    
    expires_at = token_data['expires_at']
    if expires_at and datetime.now() > expires_at:
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'valid': False,
                'access_granted': False,
                'error': 'Срок действия токена истёк'
            })
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'isBase64Encoded': False,
        'body': json.dumps({
            'valid': True,
            'access_granted': True,
            'access_end': expires_at.isoformat() if expires_at else None
        })
    }