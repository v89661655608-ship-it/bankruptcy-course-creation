import json
import os
from typing import Dict, Any
import urllib.request


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Универсальный поиск через DaData API: организации и адреса
    Args: event - dict с httpMethod, queryStringParameters (query, type: party|address)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с найденными результатами
    """
    method: str = event.get('httpMethod', 'GET')
    
    # CORS для OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Получаем параметры
    params = event.get('queryStringParameters') or {}
    query = params.get('query', '').strip()
    search_type = params.get('type', 'party')  # party или address
    
    if not query or len(query) < 3:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Query parameter required (min 3 chars)'}),
            'isBase64Encoded': False
        }
    
    # DaData API ключ из секретов
    api_key = os.environ.get('DADATA_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'DADATA_API_KEY not configured'}),
            'isBase64Encoded': False
        }
    
    # Определяем URL и тело запроса в зависимости от типа
    if search_type == 'address':
        url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'
        request_body = json.dumps({
            'query': query,
            'count': 10
        }).encode('utf-8')
    else:  # party
        url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party'
        request_body = json.dumps({
            'query': query,
            'count': 10,
            'status': ['ACTIVE']
        }).encode('utf-8')
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Token {api_key}'
    }
    
    req = urllib.request.Request(url, data=request_body, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            # Форматируем результаты в зависимости от типа
            suggestions = []
            
            if search_type == 'address':
                for item in result.get('suggestions', []):
                    suggestions.append({
                        'value': item.get('value', ''),
                        'unrestricted_value': item.get('unrestricted_value', ''),
                    })
            else:  # party
                for item in result.get('suggestions', []):
                    data_obj = item.get('data', {})
                    name_obj = data_obj.get('name', {})
                    address_obj = data_obj.get('address', {})
                    
                    suggestions.append({
                        'inn': data_obj.get('inn', ''),
                        'name': name_obj.get('short_with_opf') or name_obj.get('full') or item.get('value', ''),
                        'fullName': name_obj.get('full', ''),
                        'address': address_obj.get('unrestricted_value') or address_obj.get('value', ''),
                        'ogrn': data_obj.get('ogrn', ''),
                        'kpp': data_obj.get('kpp', ''),
                    })
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'suggestions': suggestions}),
                'isBase64Encoded': False
            }
    
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': e.code,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'DaData API error: {error_body}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }