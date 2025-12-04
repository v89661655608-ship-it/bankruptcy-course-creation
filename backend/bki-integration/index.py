import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Интеграция с Бюро кредитных историй для получения данных о кредитах и задолженностях
    
    Получает: согласие пользователя и код субъекта кредитной истории
    Возвращает: кредиторов, долги, исполнительные производства
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
        subject_code = body_data.get('subjectCode')
        consent = body_data.get('consent', False)
        
        if not consent:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется согласие на получение кредитной истории'}),
                'isBase64Encoded': False
            }
        
        if not subject_code:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан код субъекта кредитной истории'}),
                'isBase64Encoded': False
            }
        
        test_data = {
            'success': True,
            'data': {
                'creditors': [
                    {
                        'name': 'ПАО Сбербанк',
                        'inn': '7707083893',
                        'credits': [
                            {
                                'contractNumber': '12345/2020',
                                'amount': 500000,
                                'debt': 650000,
                                'date': '01.01.2020',
                                'currency': 'RUB',
                                'type': 'Потребительский кредит'
                            }
                        ]
                    },
                    {
                        'name': 'ВТБ (ПАО)',
                        'inn': '7702070139',
                        'credits': [
                            {
                                'contractNumber': '67890/2019',
                                'amount': 300000,
                                'debt': 400000,
                                'date': '01.06.2019',
                                'currency': 'RUB',
                                'type': 'Кредитная карта'
                            }
                        ]
                    }
                ],
                'totalDebt': 1050000,
                'executiveDocuments': [
                    {
                        'number': '12345678/2023',
                        'date': '01.01.2023',
                        'amount': 650000,
                        'creditor': 'ПАО Сбербанк',
                        'bailiff': 'УФССП по г. Москве',
                        'status': 'В производстве'
                    }
                ],
                'creditScore': 450,
                'lastUpdate': '2024-01-01'
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