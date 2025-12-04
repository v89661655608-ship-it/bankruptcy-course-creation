'''
Отправка письма с токеном доступа к чату пользователю
'''

import json
import os
from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
from psycopg2.extras import RealDictCursor

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
                'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers_out = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_email = body_data.get('email')
        
        if not user_email:
            return {
                'statusCode': 400,
                'headers': headers_out,
                'body': json.dumps({'error': 'email is required'})
            }
        
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT u.id, u.email, u.full_name, ct.token, ct.expires_at 
                    FROM users u 
                    LEFT JOIN chat_tokens ct ON ct.user_id = u.id 
                    WHERE u.email = %s
                    ORDER BY ct.created_at DESC
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
                'body': json.dumps({'error': 'User not found'})
            }
        
        if not user_data['token']:
            return {
                'statusCode': 404,
                'headers': headers_out,
                'body': json.dumps({'error': 'No chat token found for this user'})
            }
        
        token = user_data['token']
        expires_at = user_data['expires_at']
        expires_date = expires_at.strftime('%d.%m.%Y')
        
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
        smtp_port = int(os.environ.get('SMTP_PORT', 465))
        smtp_email = os.environ.get('SMTP_USER', 'bankrotkurs@yandex.ru')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_password:
            return {
                'statusCode': 500,
                'headers': headers_out,
                'body': json.dumps({'error': 'SMTP not configured'})
            }
        
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_email
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
        <p style="font-size: 16px; margin-bottom: 20px;">Здравствуйте, <strong>{user_data['full_name']}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Спасибо за покупку комбо-пакета! Ваш доступ к закрытому чату с юристами активирован до <strong>{expires_date}</strong>.</p>
        
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
        
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': headers_out,
            'body': json.dumps({
                'success': True,
                'message': f'Email sent to {user_email}',
                'token': token,
                'expires_at': expires_date
            })
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
            })
        }
