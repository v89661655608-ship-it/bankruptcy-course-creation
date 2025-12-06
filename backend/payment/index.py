'''
Business: Payment API - create payments via YooKassa, handle webhooks
Args: event with httpMethod, body, headers; context with request_id
Returns: Payment creation response or webhook processing status

CRITICAL SETUP REQUIRED:
1. Go to yookassa.ru personal cabinet
2. Settings -> HTTP notifications (Настройки -> HTTP-уведомления)
3. Set webhook URL: https://functions.poehali.dev/b3f3dab4-093d-45bf-98cb-86512e00886b?action=webhook
4. Enable notifications for: payment.succeeded

Without this setup, webhooks will NOT work and users will NOT receive access after payment!
'''

import json
import os
import base64
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from datetime import datetime, timedelta
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import bcrypt

def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

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
    
    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'create')
        
        if action == 'create':
            return create_payment(event, headers_out)
        elif action == 'webhook':
            return handle_webhook(event, headers_out)
        elif action == 'status':
            return check_payment_status(event, headers_out)
        elif action == 'check_course_access':
            return check_course_access(event, headers_out)
        
        return {
            'statusCode': 400,
            'headers': headers_out,
            'body': json.dumps({'error': 'Invalid action'})
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

def create_payment(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # Support both GET (query params) and POST (body)
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        user_id = params.get('user_id')
        amount = float(params.get('amount', 4999))
        email = params.get('email', '')
        full_name = params.get('name', 'Клиент')
        return_url = params.get('return_url', '')
        product_type = params.get('product_type', 'course')
    else:
        body_str = event.get('body', '{}')
        body_data = json.loads(body_str) if body_str else {}
        user_id = body_data.get('user_id')
        amount = body_data.get('amount', 4999)
        email = body_data.get('email', '')
        full_name = body_data.get('name', 'Клиент')
        return_url = body_data.get('return_url', '')
        product_type = body_data.get('product_type', 'course')
    
    if not email:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'email is required'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not user_id:
                cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                existing_user = cur.fetchone()
                
                if existing_user:
                    user_id = existing_user['id']
                else:
                    password = str(uuid.uuid4())[:8]
                    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute(
                        "INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (%s, %s, %s, false) RETURNING id",
                        (email, password_hash, full_name)
                    )
                    user_id = cur.fetchone()['id']
                    conn.commit()
    finally:
        conn.close()
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to create/find user'})
        }
    
    shop_id = os.environ.get('YUKASSA_SHOP_ID')
    secret_key = os.environ.get('YUKASSA_SECRET_KEY')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Payment credentials not configured'})
        }
    
    idempotence_key = str(uuid.uuid4())
    
    auth_string = f"{shop_id}:{secret_key}"
    auth_encoded = base64.b64encode(auth_string.encode()).decode()
    
    payment_data = {
        "amount": {
            "value": f"{amount:.2f}",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url or "https://your-domain.com/payment/success"
        },
        "capture": True,
        "description": "Оплата курса 'Банкротство физических лиц'",
        "metadata": {
            "user_id": str(user_id),
            "email": email,
            "product_type": product_type
        }
    }
    
    if email:
        payment_data["receipt"] = {
            "customer": {
                "email": email
            },
            "items": [{
                "description": "Онлайн-курс 'Банкротство физических лиц'",
                "quantity": "1.00",
                "amount": {
                    "value": f"{amount:.2f}",
                    "currency": "RUB"
                },
                "vat_code": 1,
                "payment_subject": "service",
                "payment_mode": "full_payment"
            }]
        }
    
    print(f"Creating payment with YooKassa: shop_id={shop_id}, amount={amount}, email={email}")
    print(f"Payment data: {json.dumps(payment_data, ensure_ascii=False)}")
    
    response = requests.post(
        'https://api.yookassa.ru/v3/payments',
        json=payment_data,
        headers={
            'Authorization': f'Basic {auth_encoded}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json'
        }
    )
    
    print(f"YooKassa response status: {response.status_code}")
    print(f"YooKassa response body: {response.text}")
    
    if response.status_code != 200:
        error_details = response.text
        try:
            error_json = response.json()
            error_details = json.dumps(error_json, ensure_ascii=False)
        except:
            pass
        
        return {
            'statusCode': response.status_code,
            'headers': headers,
            'body': json.dumps({
                'error': 'Payment creation failed', 
                'details': error_details,
                'yukassa_status': response.status_code
            }, ensure_ascii=False)
        }
    
    payment_response = response.json()
    
    if product_type == 'course':
        expires_interval = "3 months"
    elif product_type == 'chat':
        expires_interval = "1 month"
    elif product_type == 'combo':
        expires_interval = "3 months"
    else:
        expires_interval = "3 months"
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"INSERT INTO user_purchases (user_id, amount, payment_status, payment_id, product_type, expires_at) VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP + INTERVAL '{expires_interval}') RETURNING id",
                (user_id, amount, 'pending', payment_response['id'], product_type)
            )
            purchase_id = cur.fetchone()['id']
            conn.commit()
    finally:
        conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'payment_id': payment_response['id'],
            'purchase_id': purchase_id,
            'confirmation_url': payment_response['confirmation']['confirmation_url'],
            'status': payment_response['status']
        })
    }

def handle_webhook(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    print(f"[WEBHOOK] Received webhook event: {body_data.get('event')}")
    print(f"[WEBHOOK] Full body: {json.dumps(body_data, ensure_ascii=False)}")
    
    if body_data.get('event') != 'payment.succeeded':
        print(f"[WEBHOOK] Ignoring event: {body_data.get('event')}")
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'status': 'ignored'})
        }
    
    payment = body_data.get('object', {})
    payment_id = payment.get('id')
    user_id = payment.get('metadata', {}).get('user_id')
    
    print(f"[WEBHOOK] Processing payment: payment_id={payment_id}, user_id={user_id}")
    
    if not payment_id or not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid webhook data'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT product_type FROM user_purchases WHERE payment_id = %s AND user_id = %s",
                (payment_id, int(user_id))
            )
            current_purchase = cur.fetchone()
            current_product_type = current_purchase['product_type'] if current_purchase else 'course'
            
            cur.execute(
                "SELECT id, expires_at FROM user_purchases WHERE user_id = %s AND payment_status = 'completed' AND product_type = %s ORDER BY expires_at DESC LIMIT 1",
                (int(user_id), current_product_type)
            )
            existing_purchase = cur.fetchone()
            
            if existing_purchase and existing_purchase['expires_at']:
                if current_product_type == 'course':
                    extension_days = 90
                elif current_product_type == 'chat':
                    extension_days = 30
                elif current_product_type == 'combo':
                    extension_days = 90
                else:
                    extension_days = 90
                
                if existing_purchase['expires_at'] > datetime.now():
                    new_expires_at = existing_purchase['expires_at'] + timedelta(days=extension_days)
                else:
                    new_expires_at = datetime.now() + timedelta(days=extension_days)
                
                cur.execute(
                    "UPDATE user_purchases SET payment_status = %s, expires_at = %s WHERE payment_id = %s AND user_id = %s",
                    ('completed', new_expires_at, payment_id, int(user_id))
                )
            else:
                cur.execute(
                    "UPDATE user_purchases SET payment_status = %s WHERE payment_id = %s AND user_id = %s",
                    ('completed', payment_id, int(user_id))
                )
            
            # Обновляем purchased_product для всех типов продуктов
            if current_product_type == 'course':
                # Для курса обновляем только purchased_product
                cur.execute(
                    "UPDATE users SET purchased_product = %s WHERE id = %s",
                    (current_product_type, int(user_id))
                )
                print(f"[WEBHOOK] Set purchased_product = {current_product_type} for user {user_id}")
            elif current_product_type in ['chat', 'combo']:
                # Для чата и комбо обновляем chat_expires_at и purchased_product
                cur.execute(
                    "SELECT chat_expires_at FROM users WHERE id = %s",
                    (int(user_id),)
                )
                user_data = cur.fetchone()
                current_chat_expires = user_data['chat_expires_at'] if user_data else None
                
                if current_chat_expires and current_chat_expires > datetime.now():
                    # Продлеваем существующую подписку на чат
                    new_chat_expires = current_chat_expires + timedelta(days=30)
                else:
                    # Новая подписка на чат
                    new_chat_expires = datetime.now() + timedelta(days=30)
                
                cur.execute(
                    "UPDATE users SET chat_expires_at = %s, purchased_product = %s WHERE id = %s",
                    (new_chat_expires, current_product_type, int(user_id))
                )
                print(f"[WEBHOOK] Set chat_expires_at = {new_chat_expires}, purchased_product = {current_product_type} for user {user_id}")
            
            conn.commit()
            
            cur.execute(
                "SELECT u.email, u.full_name FROM users u WHERE u.id = %s",
                (int(user_id),)
            )
            user = cur.fetchone()
    finally:
        conn.close()
    
    if user:
        amount_value = float(payment.get('amount', {}).get('value', 0))
        
        send_admin_notification(
            user_email=user['email'],
            user_name=user['full_name'],
            amount=amount_value,
            payment_id=payment_id
        )
        
        # Отправляем письмо с доступом для всех типов продуктов
        print(f"[WEBHOOK] Sending credentials to {user['email']} for product_type={current_product_type}")
        conn_main = get_db_connection()
        try:
            with conn_main.cursor(cursor_factory=RealDictCursor) as cur:
                temp_password = str(uuid.uuid4())[:8]
                temp_password_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                cur.execute(
                    "UPDATE users SET password_hash = %s WHERE id = %s",
                    (temp_password_hash, int(user_id))
                )
                conn_main.commit()
                
                print(f"[WEBHOOK] Password updated, sending email with password: {temp_password}")
                send_course_credentials_email(
                    user_email=user['email'],
                    user_name=user['full_name'],
                    password=temp_password,
                    product_type=current_product_type
                )
                print(f"[WEBHOOK] Email sent successfully!")
        finally:
            conn_main.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'status': 'processed'})
    }

def check_payment_status(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    payment_id = params.get('payment_id')
    
    if not payment_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'payment_id is required'})
        }
    
    shop_id = os.environ.get('YUKASSA_SHOP_ID')
    secret_key = os.environ.get('YUKASSA_SECRET_KEY')
    
    auth_string = f"{shop_id}:{secret_key}"
    auth_encoded = base64.b64encode(auth_string.encode()).decode()
    
    response = requests.get(
        f'https://api.yookassa.ru/v3/payments/{payment_id}',
        headers={
            'Authorization': f'Basic {auth_encoded}',
            'Content-Type': 'application/json'
        }
    )
    
    if response.status_code != 200:
        return {
            'statusCode': response.status_code,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to check payment status'})
        }
    
    payment_data = response.json()
    
    if payment_data.get('status') == 'succeeded':
        user_id = payment_data.get('metadata', {}).get('user_id')
        if user_id:
            conn = get_db_connection()
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT product_type FROM user_purchases WHERE payment_id = %s AND user_id = %s",
                        (payment_id, int(user_id))
                    )
                    current_purchase = cur.fetchone()
                    current_product_type = current_purchase['product_type'] if current_purchase else 'course'
                    
                    cur.execute(
                        "SELECT id, expires_at FROM user_purchases WHERE user_id = %s AND payment_status = 'completed' AND product_type = %s ORDER BY expires_at DESC LIMIT 1",
                        (int(user_id), current_product_type)
                    )
                    existing_purchase = cur.fetchone()
                    
                    if existing_purchase and existing_purchase['expires_at']:
                        if current_product_type == 'course':
                            extension_days = 180
                        elif current_product_type == 'chat':
                            extension_days = 30
                        elif current_product_type == 'combo':
                            extension_days = 180
                        else:
                            extension_days = 180
                        
                        if existing_purchase['expires_at'] > datetime.now():
                            new_expires_at = existing_purchase['expires_at'] + timedelta(days=extension_days)
                        else:
                            new_expires_at = datetime.now() + timedelta(days=extension_days)
                        
                        cur.execute(
                            "UPDATE user_purchases SET payment_status = %s, expires_at = %s WHERE payment_id = %s AND user_id = %s",
                            ('completed', new_expires_at, payment_id, int(user_id))
                        )
                    else:
                        cur.execute(
                            "UPDATE user_purchases SET payment_status = %s WHERE payment_id = %s AND user_id = %s",
                            ('completed', payment_id, int(user_id))
                        )
                    
                    conn.commit()
                    
                    cur.execute(
                        "SELECT u.email, u.full_name, up.product_type FROM users u JOIN user_purchases up ON u.id = up.user_id WHERE up.payment_id = %s",
                        (payment_id,)
                    )
                    user = cur.fetchone()
            finally:
                conn.close()
            
            if user:
                amount_value = float(payment_data.get('amount', {}).get('value', 0))
                user_product_type = user.get('product_type', 'course')
                
                send_admin_notification(
                    user_email=user['email'],
                    user_name=user['full_name'],
                    amount=amount_value,
                    payment_id=payment_id
                )
                
                grant_chat_access_in_bankrot_app(
                    user_email=user['email'],
                    user_name=user['full_name'],
                    amount=amount_value,
                    payment_id=payment_id,
                    product_type=user_product_type,
                    user_id=int(user_id)
                )
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'payment_id': payment_id,
            'status': payment_data.get('status'),
            'paid': payment_data.get('paid', False)
        })
    }



def create_chat_token_via_api(user_id: int, user_email: str, product_type: str):
    '''Create chat token via chat-tokens API endpoint'''
    try:
        api_key = os.environ.get('CHAT_API_KEY')
        if not api_key:
            print(f"[CHAT_TOKEN_API] ❌ CHAT_API_KEY not configured")
            return None
        
        days = 30 if product_type in ['chat', 'combo'] else 180
        
        func2url_path = '/var/task/func2url.json'
        chat_tokens_url = None
        
        try:
            with open(func2url_path, 'r') as f:
                func2url = json.load(f)
                chat_tokens_url = func2url.get('chat-tokens')
        except Exception as e:
            print(f"[CHAT_TOKEN_API] ⚠️ Could not read func2url.json: {e}")
        
        if not chat_tokens_url:
            chat_tokens_url = 'https://functions.poehali.dev/4be60127-67a0-45a6-8940-0e875ec618ac'
            print(f"[CHAT_TOKEN_API] Using fallback URL")
        
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
        
        if response.status_code != 201:
            print(f"[CHAT_TOKEN_API] ❌ Failed to create token: {response.text}")
            return None
        
        result = response.json()
        token = result.get('token')
        expires_at_str = result.get('expires_at')
        
        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        else:
            expires_at = datetime.now() + timedelta(days=days)
        
        print(f"[CHAT_TOKEN_API] ✅ Token created: {token[:20]}...")
        
        return {
            'token': token,
            'expires_at': expires_at,
            'chat_url': 'https://chat-bankrot.ru'
        }
        
    except Exception as e:
        print(f"[CHAT_TOKEN_API] ❌ Error creating token via API: {e}")
        import traceback
        print(f"[CHAT_TOKEN_API] Traceback: {traceback.format_exc()}")
        return None

def save_external_chat_token(user_id: int, user_email: str, token: str, expires_at: datetime, product_type: str):
    '''Save external chat token (from bankrot-kurs.ru) to our database'''
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO chat_tokens 
                (user_id, email, token, product_type, expires_at) 
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (token) DO UPDATE SET
                    user_id = EXCLUDED.user_id,
                    email = EXCLUDED.email,
                    product_type = EXCLUDED.product_type,
                    expires_at = EXCLUDED.expires_at
                RETURNING token""",
                (user_id, user_email, token, product_type, expires_at)
            )
            conn.commit()
            print(f"[DB] Saved external chat token for user {user_id}: {token}")
            return True
    except Exception as e:
        print(f"[DB] Error saving external chat token: {e}")
        import traceback
        print(f"[DB] Traceback: {traceback.format_exc()}")
        return False
    finally:
        conn.close()

def send_chat_token_email(user_email: str, user_name: str, chat_token: str, product_type: str):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 465))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return
    
    chat_url = f'https://chat-bankrot.ru/?token={chat_token}'
    subject = 'Доступ к чату с юристами — bankrot-kurs.ru'
    
    html_body = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Добро пожаловать в чат!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Здравствуйте, <strong>{user_name}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">Спасибо за оплату! Ваш доступ к закрытому чату с юристами активирован на <strong>30 дней</strong>.</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">🔑 Ваш токен доступа:</h2>
            
            <p style="margin: 15px 0;"><strong>Токен:</strong><br><span style="background: #fff3cd; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 12px; display: inline-block; word-break: break-all;">{chat_token}</span></p>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">💬 Как войти в чат:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Нажмите кнопку "Войти в чат" ниже</li>
                <li style="margin: 8px 0;">Вставьте ваш токен в поле для входа</li>
                <li style="margin: 8px 0;">Задавайте вопросы юристам в чате!</li>
            </ol>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <strong>⚠️ Важно:</strong> Сохраните это письмо — в нём содержится токен для входа в чат. Доступ действует 30 дней.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Если у вас возникнут вопросы, просто ответьте на это письмо.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="{chat_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">💬 Войти в чат</a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #999;">
            С уважением,<br>
            <strong>Валентина Голосова</strong><br>
            Арбитражный управляющий
        </p>
    </div>
</body>
</html>
    '''
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = user_email
        
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        print(f"[EMAIL] Sending chat token to {user_email}")
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        print(f"[EMAIL] Successfully sent chat token to {user_email}")
    except Exception as e:
        print(f"[EMAIL] Error sending chat token to {user_email}: {e}")
        import traceback
        print(f"[EMAIL] Traceback: {traceback.format_exc()}")

def send_course_credentials_email(user_email: str, user_name: str, password: str, product_type: str = 'course'):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 465))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return
    
    # Настройка заголовка и основного контента в зависимости от типа продукта
    if product_type == 'chat':
        subject = 'Доступ к чату с поддержкой — bankrot-kurs.ru'
        title = '💬 Добро пожаловать в чат!'
        main_text = 'Спасибо за оплату! Ваш доступ к <strong>чату с поддержкой</strong> активирован на <strong>30 дней</strong>.'
        course_block = ''
        chat_bonus_block = '''
        <div style="background: linear-gradient(135deg, #e8f4fd 0%, #e0f2f1 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00897b;">
            <h2 style="margin-top: 0; color: #00897b; font-size: 20px;">💬 ВАШ ДОСТУП К ЧАТУ</h2>
            
            <p style="margin: 15px 0;">
                Доступ к чату активен на <strong>30 дней</strong>!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-top: 20px;">
                <h3 style="margin-top: 0; font-size: 16px; color: #333;">Как войти в чат:</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin: 8px 0;">Войдите в личный кабинет на сайте</li>
                    <li style="margin: 8px 0;">Перейдите в раздел "Поддержка"</li>
                    <li style="margin: 8px 0;">Задавайте вопросы нашим специалистам!</li>
                </ol>
            </div>
            
            <p style="font-size: 13px; color: #666; margin-top: 15px;">
                ✅ Доступ активен в течение месяца с момента оплаты
            </p>
        </div>
        '''
    elif product_type == 'combo':
        subject = 'Доступ к курсу и чату — bankrot-kurs.ru'
        title = '🎉 Добро пожаловать на курс!'
        main_text = 'Спасибо за покупку! Ваш доступ к курсу <strong>"Банкротство физических лиц - самостоятельно"</strong> активирован на <strong>3 месяца</strong>.'
        course_block = '''
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">📚 Что вас ждёт в курсе:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">7 подробных видеомодулей</li>
                <li style="margin: 8px 0;">Все шаблоны документов для подачи</li>
                <li style="margin: 8px 0;">Пошаговые инструкции</li>
                <li style="margin: 8px 0;">Доступ на 3 месяца</li>
            </ul>
        </div>
        '''
        chat_bonus_block = '''
        <div style="background: linear-gradient(135deg, #e8f4fd 0%, #e0f2f1 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00897b;">
            <h2 style="margin-top: 0; color: #00897b; font-size: 20px;">💬 БОНУС: ДОСТУП К ЧАТУ С ПОДДЕРЖКОЙ</h2>
            
            <p style="margin: 15px 0;">
                Вам активирован доступ к чату с поддержкой на <strong>30 дней</strong>!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-top: 20px;">
                <h3 style="margin-top: 0; font-size: 16px; color: #333;">Как получить доступ к чату:</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin: 8px 0;">Войдите в личный кабинет на сайте</li>
                    <li style="margin: 8px 0;">Перейдите в раздел "Поддержка"</li>
                    <li style="margin: 8px 0;">Задавайте вопросы нашим специалистам!</li>
                </ol>
            </div>
            
            <p style="font-size: 13px; color: #666; margin-top: 15px;">
                ✅ Доступ активен в течение месяца с момента оплаты
            </p>
        </div>
        '''
    else:  # course
        subject = 'Доступ к курсу "Банкротство физических лиц"'
        title = '🎉 Добро пожаловать на курс!'
        main_text = 'Спасибо за покупку! Ваш доступ к курсу <strong>"Банкротство физических лиц - самостоятельно"</strong> активирован на <strong>3 месяца</strong>.'
        course_block = '''
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">📚 Что вас ждёт в курсе:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">7 подробных видеомодулей</li>
                <li style="margin: 8px 0;">Все шаблоны документов для подачи</li>
                <li style="margin: 8px 0;">Пошаговые инструкции</li>
                <li style="margin: 8px 0;">Доступ на 3 месяца</li>
            </ul>
        </div>
        '''
        chat_bonus_block = ''
    
    html_body = f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">{title}</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Здравствуйте, <strong>{user_name}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">{main_text}</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">📝 Ваши данные для входа:</h2>
            
            <p style="margin: 15px 0;"><strong>Сайт:</strong> <a href="https://bankrot-kurs.ru/login" style="color: #667eea; text-decoration: none;">bankrot-kurs.ru/login</a></p>
            
            <p style="margin: 15px 0;"><strong>Email:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">{user_email}</span></p>
            
            <p style="margin: 15px 0;"><strong>Пароль:</strong> <span style="background: #fff3cd; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-weight: bold;">{password}</span></p>
        </div>
        
        {course_block}
        
        {chat_bonus_block}
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <strong>Важно:</strong> Сохраните это письмо — в нём содержится пароль для входа в личный кабинет.
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Если у вас возникнут вопросы, просто ответьте на это письмо.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://bankrot-kurs.ru/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Войти в личный кабинет</a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #999;">
            С уважением,<br>
            <strong>Валентина Голосова</strong><br>
            Арбитражный управляющий
        </p>
    </div>
</body>
</html>
    '''
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = user_email
        
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        print(f"[EMAIL] Sending course credentials to {user_email}")
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        print(f"[EMAIL] Successfully sent course credentials to {user_email}")
    except Exception as e:
        print(f"[EMAIL] Error sending course credentials to {user_email}: {e}")
        import traceback
        print(f"[EMAIL] Traceback: {traceback.format_exc()}")

def check_course_access(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    '''Проверяет, есть ли у email активная подписка на курс'''
    body_data = json.loads(event.get('body', '{}'))
    email = body_data.get('email', '').strip().lower()
    
    if not email:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email is required'})
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Проверяем наличие активной подписки на курс (course или combo) в user_purchases
            cur.execute(
                """SELECT u.id, u.email, up.expires_at, up.product_type 
                FROM t_p19166386_bankruptcy_course_cr.users u 
                JOIN t_p19166386_bankruptcy_course_cr.user_purchases up ON u.id = up.user_id
                WHERE LOWER(u.email) = %s 
                AND up.payment_status = 'completed'
                AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
                AND up.product_type IN ('course', 'combo')
                ORDER BY up.created_at DESC
                LIMIT 1""",
                (email,)
            )
            user = cur.fetchone()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'has_active_course': True,
                        'email': user['email'],
                        'expires_at': user['expires_at'].isoformat() if user['expires_at'] else None,
                        'product_type': user['product_type']
                    })
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'has_active_course': False,
                        'message': 'No active course subscription found for this email'
                    })
                }
    finally:
        conn.close()

def send_admin_notification(user_email: str, user_name: str, amount: float, payment_id: str):
    admin_notify_url = 'https://functions.poehali.dev/d7308d73-82be-4249-9c4d-bd4ea5a81921'
    
    try:
        requests.post(
            admin_notify_url,
            json={
                'type': 'payment',
                'subject': 'Новая оплата курса',
                'message': f'Клиент {user_name} успешно оплатил курс',
                'data': {
                    'email': user_email,
                    'name': user_name,
                    'amount': amount,
                    'payment_id': payment_id,
                    'timestamp': datetime.now().isoformat()
                }
            },
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
    except Exception as e:
        pass

def register_in_chat_system(email: str, amount: float):
    '''Call external chat-bankrot.ru webhook to register combo purchase and get token'''
    webhook_url = 'https://functions.poehali.dev/66d27e23-0698-4d41-8708-9c7e34148508'
    api_key = 'bankrot_combo_secret_2025'
    
    try:
        print(f"[CHAT_WEBHOOK] Registering user {email} in chat-bankrot.ru system")
        response = requests.post(
            webhook_url,
            json={'email': email, 'amount': amount},
            headers={
                'Content-Type': 'application/json',
                'X-Api-Key': api_key
            },
            timeout=10
        )
        print(f"[CHAT_WEBHOOK] Response status: {response.status_code}")
        print(f"[CHAT_WEBHOOK] Response body: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            token = response_data.get('token')
            expires_at_str = response_data.get('expires_at')
            
            if token and expires_at_str:
                from datetime import datetime
                expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
                chat_url = response_data.get('chat_url', f'https://chat-bankrot.ru/?token={token}')
                print(f"[CHAT_WEBHOOK] Successfully registered {email} in chat, token: {token}")
                
                return {'token': token, 'expires_at': expires_at, 'chat_url': chat_url}
            else:
                print(f"[CHAT_WEBHOOK] Response missing token or expires_at")
                return None
        else:
            print(f"[CHAT_WEBHOOK] Failed to register {email}: {response.text}")
            return None
    except Exception as e:
        print(f"[CHAT_WEBHOOK] Error calling chat webhook: {e}")
        import traceback
        print(f"[CHAT_WEBHOOK] Traceback: {traceback.format_exc()}")
        return None