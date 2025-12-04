import json
import base64
import os
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Распознавание текста на документах через Яндекс Vision API
    Args: event - dict с httpMethod, body (содержит base64 изображения)
          context - object с атрибутами request_id, function_name
    Returns: HTTP response dict с распознанным текстом
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = event.get('body', '{}')
    if not body:
        body = '{}'
    
    body_data = json.loads(body)
    image_base64 = body_data.get('image')
    
    if not image_base64:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Image is required'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('YANDEX_VISION_API_KEY')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'API key not configured'}),
            'isBase64Encoded': False
        }
    
    vision_url = 'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze'
    
    headers = {
        'Authorization': f'Api-Key {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'folderId': body_data.get('folderId', ''),
        'analyze_specs': [{
            'content': image_base64,
            'features': [{
                'type': 'TEXT_DETECTION',
                'text_detection_config': {
                    'language_codes': ['ru', 'en']
                }
            }]
        }]
    }
    
    response = requests.post(vision_url, headers=headers, json=payload)
    
    if response.status_code != 200:
        return {
            'statusCode': response.status_code,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Vision API error',
                'details': response.text
            }),
            'isBase64Encoded': False
        }
    
    result = response.json()
    
    extracted_text = ''
    if 'results' in result and len(result['results']) > 0:
        text_annotation = result['results'][0].get('results', [{}])[0].get('textDetection', {})
        pages = text_annotation.get('pages', [])
        
        for page in pages:
            blocks = page.get('blocks', [])
            for block in blocks:
                lines = block.get('lines', [])
                for line in lines:
                    words = line.get('words', [])
                    line_text = ' '.join([word.get('text', '') for word in words])
                    extracted_text += line_text + '\n'
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'text': extracted_text.strip(),
            'fullResponse': result
        }),
        'isBase64Encoded': False
    }
