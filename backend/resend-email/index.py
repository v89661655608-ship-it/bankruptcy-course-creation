'''
Business: Resend consultation confirmation email manually
Args: event with email, name, amount in body; context with request_id
Returns: Success or error message
'''

import json
import os
from typing import Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        # Support both GET (query params) and POST (body)
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            user_email = params.get('email', '').strip()
            user_name = params.get('name', 'Клиент')
            amount = float(params.get('amount', 2999))
        else:
            body_data = json.loads(event.get('body', '{}'))
            user_email = body_data.get('email', '').strip()
            user_name = body_data.get('name', 'Клиент')
            amount = float(body_data.get('amount', 0))
        
        if not user_email:
            return {
                'statusCode': 400,
                'headers': headers_out,
                'body': json.dumps({'error': 'Email is required'})
            }
        
        send_consultation_confirmation_email(user_email, user_name, amount)
        
        return {
            'statusCode': 200,
            'headers': headers_out,
            'body': json.dumps({
                'success': True,
                'message': f'Email sent to {user_email}'
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print(f"[RESEND] ❌ ERROR: {json.dumps(error_details)}")
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps(error_details),
            'isBase64Encoded': False
        }

def send_consultation_confirmation_email(user_email: str, user_name: str, amount: float):
    print(f"[RESEND] Starting email send to {user_email}")
    
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 465))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    print(f"[RESEND] SMTP config: host={smtp_host}, port={smtp_port}, user={smtp_user}, pass={'***' if smtp_password else 'MISSING'}")
    
    if not all([smtp_host, smtp_user, smtp_password]):
        error_msg = f"SMTP credentials missing: host={smtp_host}, user={smtp_user}, password={'set' if smtp_password else 'MISSING'}"
        print(f"[RESEND] ERROR: {error_msg}")
        raise Exception(error_msg)
    
    whatsapp_url = 'https://wa.me/79661655608'
    subject = 'Оплата консультации подтверждена — bankrot-kurs.ru'
    
    html_body = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Оплата получена!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Здравствуйте, <strong>{user_name}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Спасибо за оплату консультации! Ваш платёж на сумму <strong>{amount:.2f} ₽</strong> успешно получен.</p>
        
        <div style="background: linear-gradient(135deg, #e8f4fd 0%, #dcf8c6 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #25D366;">
            <h2 style="margin-top: 0; color: #128C7E; font-size: 20px;">💬 Следующий шаг</h2>
            
            <p style="margin: 15px 0; font-size: 16px;">
                Для записи на консультацию свяжитесь со мной в WhatsApp:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="{whatsapp_url}" style="display: inline-block; background: #25D366; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px;">
                    📱 Написать в WhatsApp
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Или перейдите по ссылке: <a href="{whatsapp_url}" style="color: #25D366; text-decoration: none; font-weight: bold;">{whatsapp_url}</a>
            </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>ℹ️ Важно:</strong> Напишите мне в WhatsApp, чтобы мы договорились об удобном времени для консультации.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Если у вас возникнут вопросы, просто ответьте на это письмо или напишите мне в WhatsApp.
        </p>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #999;">
            С уважением,<br>
            <strong>Валентина Голосова</strong><br>
            Арбитражный управляющий<br>
            <a href="{whatsapp_url}" style="color: #25D366; text-decoration: none;">📱 WhatsApp</a>
        </p>
    </div>
</body>
</html>
    '''
    
    # Текстовая версия письма для совместимости с почтовыми провайдерами
    text_body = f'''
Здравствуйте, {user_name}!

Спасибо за оплату консультации! Ваш платёж на сумму {amount:.2f} ₽ успешно получен.

СЛЕДУЮЩИЙ ШАГ:
Для записи на консультацию свяжитесь со мной в WhatsApp: {whatsapp_url}

Важно: Напишите мне в WhatsApp, чтобы мы договорились об удобном времени для консультации.

Если у вас возникнут вопросы, просто ответьте на это письмо или напишите мне в WhatsApp.

С уважением,
Валентина Голосова
Арбитражный управляющий
WhatsApp: {whatsapp_url}
    '''
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = user_email
    
    # Сначала текстовая версия, потом HTML (стандарт MIME)
    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))
    
    print(f"[RESEND] Connecting to SMTP {smtp_host}:{smtp_port}")
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        print(f"[RESEND] Logging in as {smtp_user}")
        server.login(smtp_user, smtp_password)
        print(f"[RESEND] Sending message to {user_email}")
        server.send_message(msg)
    print(f"[RESEND] ✅ Successfully sent consultation confirmation to {user_email}")