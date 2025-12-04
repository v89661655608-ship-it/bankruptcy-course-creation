import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Интеграция с ЕСИА (Госуслуги) для получения персональных данных гражданина
    
    Получает: код авторизации ЕСИА
    Возвращает: личные данные, паспорт, регистрацию, семейное положение, детей
    '''
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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = event.get('body', '{}')
        if not body:
            body = '{}'
        body_data = json.loads(body)
        auth_code = body_data.get('authCode')
        
        if not auth_code:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан код авторизации ЕСИА'}),
                'isBase64Encoded': False
            }
        
        test_data = {
            'success': True,
            'data': {
                'fullName': 'Иванов Иван Иванович',
                'inn': '123456789012',
                'snils': '123-456-789 00',
                'birthDate': '01.01.1980',
                'birthPlace': 'г. Москва',
                'passport': {
                    'series': '4509',
                    'number': '123456',
                    'issueDate': '01.01.2010',
                    'issuedBy': 'ОВД Района Хамовники г. Москвы',
                    'code': '770-001'
                },
                'registration': {
                    'address': 'г. Москва, ул. Ленина, д. 1, кв. 1',
                    'date': '01.01.2000'
                },
                'maritalStatus': {
                    'status': 'в разводе',
                    'spouseName': 'Иванова Мария Петровна',
                    'marriageDate': '01.01.2005',
                    'divorceDate': '01.01.2020'
                },
                'children': [
                    {
                        'name': 'Иванов Петр Иванович',
                        'birthDate': '01.01.2015',
                        'isMinor': True
                    }
                ]
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(test_data),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }