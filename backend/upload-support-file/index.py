import json
import base64
import uuid
import os
from typing import Dict, Any
import boto3
from botocore.exceptions import ClientError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload images and files from support chat to S3 storage
    Args: event with httpMethod, body (multipart/form-data), context
    Returns: HTTP response with file URL
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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = event.get('body', '')
    is_base64 = event.get('isBase64Encoded', False)
    
    if is_base64:
        body = base64.b64decode(body)
    else:
        body = body.encode('utf-8') if isinstance(body, str) else body
    
    boundary = None
    content_type = event.get('headers', {}).get('content-type') or event.get('headers', {}).get('Content-Type', '')
    
    if 'boundary=' in content_type:
        boundary = content_type.split('boundary=')[1].strip()
        if boundary.startswith('"') and boundary.endswith('"'):
            boundary = boundary[1:-1]
        boundary = boundary.encode('utf-8') if isinstance(boundary, str) else boundary
    
    if not boundary:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing boundary in Content-Type'}),
            'isBase64Encoded': False
        }
    
    parts = body.split(b'--' + boundary)
    
    file_data = None
    file_name = 'file'
    content_type_file = 'application/octet-stream'
    
    for part in parts:
        if b'Content-Disposition' in part and b'filename=' in part:
            headers_body = part.split(b'\r\n\r\n', 1)
            if len(headers_body) == 2:
                headers_section = headers_body[0]
                file_content = headers_body[1].rstrip(b'\r\n')
                
                for line in headers_section.split(b'\r\n'):
                    if b'filename=' in line:
                        filename_part = line.split(b'filename=')[1]
                        file_name = filename_part.strip(b'"').decode('utf-8', errors='ignore')
                    if line.startswith(b'Content-Type:'):
                        content_type_file = line.split(b'Content-Type:')[1].strip().decode('utf-8', errors='ignore')
                
                file_data = file_content
                break
    
    if not file_data:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No file found in request'}),
            'isBase64Encoded': False
        }
    
    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    
    if not aws_access_key or not aws_secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'S3 credentials not configured'}),
            'isBase64Encoded': False
        }
    
    s3_client = boto3.client(
        's3',
        endpoint_url='https://storage.yandexcloud.net',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name='ru-central1'
    )
    
    bucket_name = 'poehalidev-user-files'
    file_key = f'support-files/{uuid.uuid4()}/{file_name}'
    
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=file_data,
            ContentType=content_type_file
        )
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'S3 upload failed: {str(e)}'}),
            'isBase64Encoded': False
        }
    
    file_url = f'https://storage.yandexcloud.net/{bucket_name}/{file_key}'
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'url': file_url}),
        'isBase64Encoded': False
    }
