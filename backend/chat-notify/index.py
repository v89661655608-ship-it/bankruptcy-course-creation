'''
Business: Chat management - send Telegram notifications and register combo purchases
Args: event - dict с httpMethod, queryStringParameters (action=notify|register)
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с количеством отправленных уведомлений или token data
'''

import json
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import urllib.parse
import string
import secrets

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_telegram_chat_id(username: str, bot_token: str) -> Optional[str]:
    username_clean = username.lstrip('@')
    try:
        url = f'https://api.telegram.org/bot{bot_token}/getUpdates'
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            if data.get('ok'):
                for update in data.get('result', []):
                    message = update.get('message', {})
                    from_user = message.get('from', {})
                    if from_user.get('username', '').lower() == username_clean.lower():
                        return str(from_user.get('id'))
    except Exception:
        pass
    return None

def send_telegram_message(chat_id: str, message: str, bot_token: str) -> bool:
    try:
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            return result.get('ok', False)
    except Exception:
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'notify')
    
    if action == 'register':
        return handle_register(event, headers)
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'TELEGRAM_BOT_TOKEN not configured'})
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        tomorrow = datetime.now() + timedelta(days=1)
        day_after = tomorrow + timedelta(days=1)
        
        cur.execute("""
            SELECT id, client_name, telegram_username, access_end
            FROM chat_access
            WHERE is_active = true 
            AND access_end >= %s 
            AND access_end < %s
            AND telegram_username IS NOT NULL
            AND telegram_username != ''
        """, (tomorrow, day_after))
        
        expiring_clients = cur.fetchall()
        
        notifications_sent = []
        notifications_failed = []
        
        for client in expiring_clients:
            username = client['telegram_username']
            client_name = client['client_name']
            access_end = client['access_end']
            
            message = f"""
🔔 <b>Напоминание о доступе к чату</b>

Здравствуйте, {client_name}!

Ваш доступ к чату с юристами истекает завтра ({access_end.strftime('%d.%m.%Y')}).

Если хотите продлить доступ, свяжитесь с нами.

С уважением,
Валентина Голосова
            """.strip()
            
            chat_id = get_telegram_chat_id(username, bot_token)
            
            if chat_id:
                success = send_telegram_message(chat_id, message, bot_token)
                if success:
                    notifications_sent.append({
                        'id': client['id'],
                        'client_name': client_name,
                        'telegram_username': username
                    })
                else:
                    notifications_failed.append({
                        'id': client['id'],
                        'client_name': client_name,
                        'reason': 'Failed to send message'
                    })
            else:
                notifications_failed.append({
                    'id': client['id'],
                    'client_name': client_name,
                    'reason': 'Chat ID not found. User needs to start bot first'
                })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'total_expiring': len(expiring_clients),
                'notifications_sent': len(notifications_sent),
                'notifications_failed': len(notifications_failed),
                'sent_details': notifications_sent,
                'failed_details': notifications_failed,
                'checked_at': datetime.now().isoformat()
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }

def generate_custom_token(email: str, amount: float) -> str:
    '''Generate custom token format: {random}_manual_combo_{date}_{email_part}'''
    random_part = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    date_part = datetime.utcnow().strftime('%b%d')
    email_part = email.split('@')[0].replace('.', '').replace('-', '')[:8] if '@' in email else 'user'
    token = f"{random_part}_manual_combo_{date_part}_{email_part}"
    return token

def handle_register(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Handle combo purchase registration and token generation'''
    api_key = event.get('headers', {}).get('X-Api-Key') or event.get('headers', {}).get('x-api-key')
    expected_key = 'bankrot_combo_secret_2025'
    
    if api_key != expected_key:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Invalid API key'})
        }
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        email = body_data.get('email')
        amount = body_data.get('amount', 0)
        
        if not email:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Email is required'})
            }
        
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            user_row = cur.fetchone()
            
            if not user_row:
                print(f"[CHAT-REGISTER] User not found for email: {email}")
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': 'User not found'})
                }
            
            user_id = user_row['id']
            
            token = generate_custom_token(email, amount)
            expires_at = datetime.utcnow() + timedelta(days=30)
            expires_at_iso = expires_at.strftime('%Y-%m-%dT%H:%M:%SZ')
            chat_url = f'https://chat-bankrot.ru/?token={token}'
            
            print(f"[CHAT-REGISTER] Generated token for {email}: {token}")
            print(f"[CHAT-REGISTER] Amount: {amount}, Expires: {expires_at_iso}")
            
            cur.execute(
                """INSERT INTO chat_tokens 
                (user_id, email, token, product_type, expires_at) 
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (token) DO UPDATE SET
                    user_id = EXCLUDED.user_id,
                    email = EXCLUDED.email,
                    expires_at = EXCLUDED.expires_at""",
                (user_id, email, token, 'combo', expires_at)
            )
            conn.commit()
            
            print(f"[CHAT-REGISTER] Token saved to DB for user_id={user_id}")
            
            cur.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'token': token,
                    'chat_url': chat_url,
                    'expires_at': expires_at_iso
                })
            }
        finally:
            conn.close()
    
    except Exception as e:
        import traceback
        print(f"[CHAT-REGISTER] Error: {e}")
        print(f"[CHAT-REGISTER] Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'type': type(e).__name__
            })
        }