'''
Чат службы поддержки между клиентами и администраторами
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: Сообщения чата, отправка сообщений, добавление реакций
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'list')
        
        if action == 'list':
            return get_messages(event, headers_out)
        elif action == 'send':
            return send_message(event, headers_out)
        elif action == 'react':
            return add_reaction(event, headers_out)
        elif action == 'mark_read':
            return mark_as_read(event, headers_out)
        elif action == 'all_chats':
            return get_all_chats(event, headers_out)
        
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

def get_messages(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить сообщения для конкретного пользователя'''
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT 
                    sm.id,
                    sm.user_id,
                    sm.message,
                    sm.image_url,
                    sm.is_from_admin,
                    sm.created_at,
                    sm.read_by_admin,
                    sm.read_by_user,
                    u.full_name,
                    u.email,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'reaction', smr.reaction,
                                'user_id', smr.user_id
                            )
                        ) FILTER (WHERE smr.id IS NOT NULL),
                        '[]'
                    ) as reactions
                FROM support_messages sm
                JOIN users u ON sm.user_id = u.id
                LEFT JOIN support_message_reactions smr ON sm.id = smr.message_id
                WHERE sm.user_id = %s
                GROUP BY sm.id, u.full_name, u.email
                ORDER BY sm.created_at ASC""",
                (int(user_id),)
            )
            messages = cur.fetchall()
            
            messages_list = []
            for msg in messages:
                messages_list.append({
                    'id': msg['id'],
                    'user_id': msg['user_id'],
                    'message': msg['message'],
                    'image_url': msg['image_url'],
                    'is_from_admin': msg['is_from_admin'],
                    'created_at': msg['created_at'].isoformat() if msg['created_at'] else None,
                    'read_by_admin': msg['read_by_admin'],
                    'read_by_user': msg['read_by_user'],
                    'full_name': msg['full_name'],
                    'email': msg['email'],
                    'reactions': msg['reactions']
                })
    finally:
        conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'messages': messages_list}),
        'isBase64Encoded': False
    }

def send_message(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Отправить сообщение в чат поддержки'''
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    body_data = json.loads(body)
    
    user_id = body_data.get('user_id')
    message = body_data.get('message')
    image_url = body_data.get('image_url')
    is_from_admin = body_data.get('is_from_admin', False)
    
    if not user_id or not message:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id and message are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO support_messages 
                (user_id, message, image_url, is_from_admin, read_by_admin, read_by_user) 
                VALUES (%s, %s, %s, %s, %s, %s) 
                RETURNING id, created_at""",
                (int(user_id), message, image_url, is_from_admin, is_from_admin, not is_from_admin)
            )
            result = cur.fetchone()
            message_id = result['id']
            created_at = result['created_at']
            conn.commit()
            
            if not is_from_admin:
                cur.execute(
                    "SELECT email, full_name FROM users WHERE id = %s",
                    (int(user_id),)
                )
                user = cur.fetchone()
                
                if user:
                    send_admin_notification(
                        user_email=user['email'],
                        user_name=user['full_name'],
                        message=message
                    )
    finally:
        conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'message_id': message_id,
            'created_at': created_at.isoformat()
        }),
        'isBase64Encoded': False
    }

def add_reaction(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Добавить реакцию на сообщение'''
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    body_data = json.loads(body)
    
    message_id = body_data.get('message_id')
    user_id = body_data.get('user_id')
    reaction = body_data.get('reaction')
    
    if not message_id or not user_id or not reaction:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'message_id, user_id, and reaction are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO support_message_reactions (message_id, user_id, reaction)
                VALUES (%s, %s, %s)
                ON CONFLICT (message_id, user_id) 
                DO UPDATE SET reaction = EXCLUDED.reaction
                RETURNING id""",
                (int(message_id), int(user_id), reaction)
            )
            conn.commit()
    finally:
        conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def mark_as_read(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Отметить сообщения как прочитанные'''
    body = event.get('body', '{}')
    if not body or body == '':
        body = '{}'
    body_data = json.loads(body)
    
    user_id = body_data.get('user_id')
    is_admin = body_data.get('is_admin', False)
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'user_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if is_admin:
                cur.execute(
                    "UPDATE support_messages SET read_by_admin = true WHERE user_id = %s",
                    (int(user_id),)
                )
            else:
                cur.execute(
                    "UPDATE support_messages SET read_by_user = true WHERE user_id = %s",
                    (int(user_id),)
                )
            conn.commit()
    finally:
        conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def get_all_chats(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Получить список всех чатов с последними сообщениями (для админа)'''
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """SELECT 
                    u.id as user_id,
                    u.full_name,
                    u.email,
                    MAX(sm.created_at) as last_message_time,
                    COUNT(CASE WHEN sm.read_by_admin = false AND sm.is_from_admin = false THEN 1 END) as unread_count,
                    (
                        SELECT message 
                        FROM support_messages 
                        WHERE user_id = u.id 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) as last_message
                FROM users u
                INNER JOIN support_messages sm ON u.id = sm.user_id
                GROUP BY u.id, u.full_name, u.email
                ORDER BY MAX(sm.created_at) DESC"""
            )
            chats = cur.fetchall()
            
            chats_list = []
            for chat in chats:
                chats_list.append({
                    'user_id': chat['user_id'],
                    'full_name': chat['full_name'],
                    'email': chat['email'],
                    'last_message_time': chat['last_message_time'].isoformat() if chat['last_message_time'] else None,
                    'unread_count': chat['unread_count'],
                    'last_message': chat['last_message']
                })
    finally:
        conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'chats': chats_list}),
        'isBase64Encoded': False
    }

def send_admin_notification(user_email: str, user_name: str, message: str):
    '''Отправить уведомление админу о новом сообщении'''
    try:
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
        smtp_port = int(os.environ.get('SMTP_PORT', 465))
        smtp_user = os.environ.get('SMTP_USER', 'bankrotkurs@yandex.ru')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        admin_email = 'melni-v@yandex.ru'
        
        if not smtp_password:
            print(f"[EMAIL] ⚠️ SMTP_PASSWORD not configured")
            return
        
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_user
        msg['To'] = admin_email
        msg['Subject'] = f'Новое сообщение в поддержке от {user_name}'
        
        html_body = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💬 Новое сообщение в поддержке</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;"><strong>От:</strong> {user_name} ({user_email})</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; white-space: pre-wrap;">{message}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://bankrot-kurs.ru/admin-support" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Открыть чат поддержки</a>
        </div>
    </div>
</body>
</html>'''
        
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"[EMAIL] ✅ Admin notification sent to {admin_email}")
    except Exception as e:
        print(f"[EMAIL] ❌ Error sending admin notification: {e}")
