'''
Автозаполнение адресов через DaData API
Args: event с httpMethod, queryStringParameters (query); context с request_id
Returns: Список подсказок адресов
'''

import json
import os
from typing import Dict, Any
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Автозаполнение адресов через DaData
    Args: event - dict с httpMethod, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict со списком адресов
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    headers_out = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': headers_out,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    query = params.get('query', '')
    
    if not query or len(query) < 3:
        return {
            'statusCode': 200,
            'headers': headers_out,
            'body': json.dumps({'suggestions': []}),
            'isBase64Encoded': False
        }
    
    dadata_token = os.environ.get('DADATA_API_KEY')
    if not dadata_token:
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps({'error': 'DADATA_API_KEY not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'
        request_data = json.dumps({
            'query': query,
            'count': 5
        }).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=request_data,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Token {dadata_token}'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            suggestions = result.get('suggestions', [])
            
            return {
                'statusCode': 200,
                'headers': headers_out,
                'body': json.dumps({'suggestions': suggestions}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers_out,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
