import json
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from datetime import datetime, timedelta

# Хранилище кодов в памяти (для production лучше использовать Redis)
verification_codes: Dict[str, tuple[str, datetime]] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Двухфакторная аутентификация для админ-панели через email
    Args: event с httpMethod, body (action: 'send' или 'verify', password, code)
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action: str = body_data.get('action', '')
    
    if action == 'send':
        return send_verification_code(body_data)
    elif action == 'verify':
        return verify_code(body_data)
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid action'})
        }

def send_verification_code(body_data: Dict[str, Any]) -> Dict[str, Any]:
    '''Отправка кода верификации на email администратора'''
    password: str = body_data.get('password', '')
    admin_password = os.environ.get('ADMIN_PANEL_PASSWORD', '')
    
    # Проверяем пароль
    if password != admin_password:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Invalid password'})
        }
    
    # Генерируем 6-значный код
    code = str(random.randint(100000, 999999))
    
    # Сохраняем код с временем истечения (5 минут)
    expiry_time = datetime.now() + timedelta(minutes=5)
    verification_codes['admin'] = (code, expiry_time)
    
    # Отправляем email
    admin_email = 'melni-v@yandex.ru'
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = admin_email
        msg['Subject'] = 'Код доступа в админ-панель'
        
        body = f'''
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Вход в админ-панель</h2>
            <p>Ваш код для входа:</p>
            <h1 style="color: #4CAF50; letter-spacing: 5px;">{code}</h1>
            <p>Код действителен 5 минут.</p>
            <p style="color: #888; font-size: 12px;">Если это были не вы, проигнорируйте это письмо.</p>
        </body>
        </html>
        '''
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': 'Code sent'})
        }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': f'Email error: {str(e)}'})
        }

def verify_code(body_data: Dict[str, Any]) -> Dict[str, Any]:
    '''Проверка кода верификации'''
    code: str = body_data.get('code', '')
    
    if 'admin' not in verification_codes:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'No code found'})
        }
    
    stored_code, expiry_time = verification_codes['admin']
    
    # Проверяем срок действия кода
    if datetime.now() > expiry_time:
        del verification_codes['admin']
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Code expired'})
        }
    
    # Проверяем код
    if code == stored_code:
        del verification_codes['admin']
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True})
        }
    else:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Invalid code'})
        }
