'''
Пересоздание и отправка токена чата пользователю через внешнее API chat-bankrot.ru
Args: event с email пользователя; context с request_id
Returns: Результат создания токена и отправки письма
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
        body = event.get('body', '{}')
        if not body or body == '':
            body = '{}'
        body_data = json.loads(body)
        user_email = body_data.get('email')
        
        if not user_email:
            return {
                'statusCode': 400,
                'headers': headers_out,
                'body': json.dumps({'error': 'email is required'}),
                'isBase64Encoded': False
            }
        
        print(f"[RESEND] Processing request for {user_email}")
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT u.id, u.email, u.full_name, p.product_type, p.payment_id
                    FROM users u 
                    LEFT JOIN user_purchases p ON p.user_id = u.id AND p.payment_status = 'completed'
                    WHERE u.email = %s AND p.product_type IN ('chat', 'combo')
                    ORDER BY p.purchase_date DESC
                    LIMIT 1""",
                    (user_email,)
                )
                user_data = cur.fetchone()
        finally:
            conn.close()
        
        if not user_data:
            return {
                'statusCode': 404,
                'headers': headers_out,
                'body': json.dumps({'error': 'User or combo/chat purchase not found'}),
                'isBase64Encoded': False
            }
        
        user_id = user_data['id']
        product_type = user_data['product_type']
        
        print(f"[RESEND] Found user {user_id}, product: {product_type}")
        
        # Создаем токен через внешнее API
        chat_token_data = create_chat_token_via_api(
            user_id=user_id,
            user_email=user_email,
            product_type=product_type
        )
        
        if not chat_token_data or not chat_token_data.get('token'):
            return {
                'statusCode': 500,
                'headers': headers_out,
                'body': json.dumps({
                    'error': 'Failed to create chat token via external API',
                    'details': str(chat_token_data)
                }),
                'isBase64Encoded': False
            }
        
        token = chat_token_data['token']
        expires_at = chat_token_data['expires_at']
        expires_date = expires_at.strftime('%d.%m.%Y')
        
        print(f"[RESEND] Token created: {token[:20]}...")
        
        # Сохраняем токен в нашу БД
        save_result = save_external_chat_token(user_id, user_email, token, expires_at, product_type)
        print(f"[RESEND] Token saved to DB: {save_result}")
        
        # Отправляем email
        email_result = send_chat_token_email(
            user_email=user_email,
            user_name=user_data['full_name'],
            token=token,
            expires_date=expires_date,
            product_type=product_type
        )
        print(f"[RESEND] Email sent: {email_result}")
        
        return {
            'statusCode': 200,
            'headers': headers_out,
            'body': json.dumps({
                'success': True,
                'message': f'Chat token created and email sent to {user_email}',
                'token': token,
                'expires_at': expires_date
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        print(f"[RESEND] ERROR: {e}")
        print(f"[RESEND] Traceback: {traceback.format_exc()}")
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


def create_chat_token_via_api(user_id: int, user_email: str, product_type: str):
    '''Create chat token via external chat-tokens API (chat-bankrot.ru shared DB)'''
    try:
        api_key = os.environ.get('CHAT_API_KEY')
        if not api_key:
            print(f"[CHAT_TOKEN_API] ❌ CHAT_API_KEY not configured")
            return {'error': 'CHAT_API_KEY not configured'}
        
        days = 30 if product_type in ['chat', 'combo'] else 180
        
        # Внешнее API для создания токена в общей БД с chat-bankrot.ru
        chat_tokens_url = 'https://functions.poehali.dev/4be60127-67a0-45a6-8940-0e875ec618ac'
        
        print(f"[CHAT_TOKEN_API] Creating token for user {user_id} ({user_email})")
        print(f"[CHAT_TOKEN_API] Product: {product_type}, Days: {days}")
        print(f"[CHAT_TOKEN_API] API URL: {chat_tokens_url}")
        
        response = requests.post(
            chat_tokens_url,
            json={
                'user_id': user_id,
                'email': user_email,
                'product_type': product_type,
                'days': days
            },
            headers={
                'X-Api-Key': api_key,
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        print(f"[CHAT_TOKEN_API] Response status: {response.status_code}")
        print(f"[CHAT_TOKEN_API] Response body: {response.text[:500]}")
        
        if response.status_code == 201:
            result = response.json()
            token = result.get('token')
            expires_at_str = result.get('expires_at')
            
            if expires_at_str:
                # Парсим ISO формат даты
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
            else:
                expires_at = datetime.now() + timedelta(days=days)
            
            print(f"[CHAT_TOKEN_API] ✅ Token created successfully: {token}")
            
            return {
                'token': token,
                'expires_at': expires_at,
                'chat_url': 'https://chat-bankrot.ru'
            }
        else:
            print(f"[CHAT_TOKEN_API] ❌ Failed with status {response.status_code}")
            return {'error': f'API returned {response.status_code}', 'response': response.text}
        
    except Exception as e:
        print(f"[CHAT_TOKEN_API] ❌ Exception: {e}")
        import traceback
        print(f"[CHAT_TOKEN_API] Traceback: {traceback.format_exc()}")
        return {'error': str(e)}


def save_external_chat_token(user_id: int, user_email: str, token: str, expires_at: datetime, product_type: str):
    '''Save external chat token (from chat-bankrot.ru) to local database'''
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO chat_tokens 
                (user_id, email, token, product_type, expires_at, created_at) 
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (token) DO UPDATE SET
                    user_id = EXCLUDED.user_id,
                    email = EXCLUDED.email,
                    product_type = EXCLUDED.product_type,
                    expires_at = EXCLUDED.expires_at
                RETURNING token""",
                (user_id, user_email, token, product_type, expires_at)
            )
            result = cur.fetchone()
            conn.commit()
            print(f"[DB] ✅ Saved chat token for user {user_id}: {token}")
            return True
    except Exception as e:
        print(f"[DB] ❌ Error saving token: {e}")
        import traceback
        print(f"[DB] Traceback: {traceback.format_exc()}")
        return False
    finally:
        conn.close()


def send_chat_token_email(user_email: str, user_name: str, token: str, expires_date: str, product_type: str):
    '''Send email with chat token'''
    try:
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
        smtp_port = int(os.environ.get('SMTP_PORT', 465))
        smtp_user = os.environ.get('SMTP_USER', 'bankrotkurs@yandex.ru')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_password:
            print(f"[EMAIL] ❌ SMTP_PASSWORD not configured")
            return False
        
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_user
        msg['To'] = user_email
        msg['Subject'] = 'Доступ к закрытому чату "Банкротство физических лиц"'
        
        html_body = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #00897b 0%, #00695c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💬 Доступ к чату активирован!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Здравствуйте, <strong>{user_name}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Спасибо за покупку! Ваш доступ к закрытому чату с юристами активирован до <strong>{expires_date}</strong>.</p>
        
        <div style="background: linear-gradient(135deg, #e8f4fd 0%, #e0f2f1 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00897b;">
            <h2 style="margin-top: 0; color: #00897b; font-size: 20px;">🔑 Ваш персональный токен доступа:</h2>
            
            <p style="margin: 15px 0;">
                <span style="background: #fff3cd; padding: 12px 16px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 16px; display: inline-block; word-break: break-all;">{token}</span>
            </p>
            
            <p style="margin: 15px 0;">
                <strong>Действителен до:</strong> {expires_date}
            </p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #00897b;">
            <h3 style="margin-top: 0; font-size: 18px; color: #00897b;">📱 Как войти в чат:</h3>
            <ol style="margin: 10px 0; padding-left: 20px; font-size: 15px;">
                <li style="margin: 10px 0;">Перейдите на <a href="https://chat-bankrot.ru" style="color: #00897b; font-weight: bold;">chat-bankrot.ru</a></li>
                <li style="margin: 10px 0;">Нажмите кнопку <strong>"Войти с токеном"</strong></li>
                <li style="margin: 10px 0;">Вставьте ваш токен в поле для входа</li>
                <li style="margin: 10px 0;">Готово! Задавайте вопросы юристам 💬</li>
            </ol>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Важно:</strong><br>
                • Сохраните этот токен — он понадобится для входа в чат<br>
                • Не передавайте токен другим людям<br>
                • При возникновении проблем пишите на bankrotkurs@yandex.ru
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://chat-bankrot.ru" style="display: inline-block; background: linear-gradient(135deg, #00897b 0%, #00695c 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Войти в чат</a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #999;">
            С уважением,<br>
            <strong>Валентина Голосова</strong><br>
            Арбитражный управляющий
        </p>
    </div>
</body>
</html>'''
        
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        print(f"[EMAIL] Connecting to {smtp_host}:{smtp_port}")
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"[EMAIL] ✅ Email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        print(f"[EMAIL] ❌ Error sending email: {e}")
        import traceback
        print(f"[EMAIL] Traceback: {traceback.format_exc()}")
        return False