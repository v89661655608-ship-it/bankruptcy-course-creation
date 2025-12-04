import json
import re
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Умный парсинг OCR-текста для автоматического извлечения данных
    Args: event - dict с httpMethod, body (содержит text и documentType)
    Returns: HTTP response с распарсенными данными из документов
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
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = event.get('body', '{}')
    if not body:
        body = '{}'
    
    body_data = json.loads(body)
    text: str = body_data.get('text', '')
    document_type: str = body_data.get('documentType', 'passport')
    
    if not text:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Text is required'}),
            'isBase64Encoded': False
        }
    
    parsed_data = {}
    
    if document_type == 'passport':
        parsed_data = parse_passport(text)
    elif document_type == 'bki':
        parsed_data = parse_bki(text)
    elif document_type == 'income':
        parsed_data = parse_income(text)
    elif document_type == 'property':
        parsed_data = parse_property(text)
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'documentType': document_type,
            'data': parsed_data
        }),
        'isBase64Encoded': False
    }


def parse_passport(text: str) -> Dict[str, Any]:
    '''Парсинг паспорта РФ'''
    data = {}
    
    fio_match = re.search(r'([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)', text)
    if fio_match:
        data['fullName'] = f"{fio_match.group(1)} {fio_match.group(2)} {fio_match.group(3)}"
    
    series_number = re.search(r'(\d{2})\s*(\d{2})\s*(\d{6})', text)
    if series_number:
        data['passportSeries'] = f"{series_number.group(1)} {series_number.group(2)}"
        data['passportNumber'] = series_number.group(3)
    
    birth_date = re.search(r'(\d{2})\.(\d{2})\.(\d{4})', text)
    if birth_date:
        data['birthDate'] = f"{birth_date.group(3)}-{birth_date.group(2)}-{birth_date.group(1)}"
    
    birth_place = re.search(r'(?:место\s+рождения|родился|родилась)[:\s]+([А-ЯЁа-яё\s,.-]+?)(?:\n|$)', text, re.IGNORECASE)
    if birth_place:
        data['birthPlace'] = birth_place.group(1).strip()
    
    issue_date = re.search(r'(?:дата\s+выдачи|выдан)[:\s]+(\d{2})\.(\d{2})\.(\d{4})', text, re.IGNORECASE)
    if issue_date:
        data['passportIssueDate'] = f"{issue_date.group(3)}-{issue_date.group(2)}-{issue_date.group(1)}"
    
    issued_by = re.search(r'(?:кем\s+выдан)[:\s]+([А-ЯЁа-яё\s\d№.-]+?)(?:\n|код)', text, re.IGNORECASE)
    if issued_by:
        data['passportIssuedBy'] = issued_by.group(1).strip()
    
    code = re.search(r'(?:код\s+подразделения)[:\s]*(\d{3})-?(\d{3})', text, re.IGNORECASE)
    if code:
        data['passportCode'] = f"{code.group(1)}-{code.group(2)}"
    
    address = re.search(r'(?:зарегистрирован|прописан|адрес)[:\s]+([А-ЯЁа-яё\s\d,.№-]+?)(?:\n|$)', text, re.IGNORECASE)
    if address:
        data['registrationAddress'] = address.group(1).strip()
    
    reg_date = re.search(r'(?:с|от)\s+(\d{2})\.(\d{2})\.(\d{4})', text)
    if reg_date:
        data['registrationDate'] = f"{reg_date.group(3)}-{reg_date.group(2)}-{reg_date.group(1)}"
    
    return data


def parse_bki(text: str) -> Dict[str, Any]:
    '''Парсинг кредитной истории БКИ'''
    data = {'creditors': []}
    
    banks = re.findall(r'([А-ЯЁ][А-ЯЁа-яё\s]+(?:Банк|банк|БАНК))', text)
    debts = re.findall(r'(?:долг|задолженность|остаток)[:\s]*(\d+[\s\d]*)\s*(?:руб|₽)', text, re.IGNORECASE)
    amounts = re.findall(r'(?:сумма\s+кредита)[:\s]*(\d+[\s\d]*)\s*(?:руб|₽)', text, re.IGNORECASE)
    contracts = re.findall(r'(?:договор|№)[:\s]*([А-ЯЁа-яё\d/-]+)', text, re.IGNORECASE)
    
    for i, bank in enumerate(banks):
        creditor = {
            'name': bank.strip(),
            'inn': '',
            'credits': []
        }
        
        if i < len(debts):
            debt_str = debts[i].replace(' ', '')
            creditor['credits'].append({
                'contractNumber': contracts[i].strip() if i < len(contracts) else '',
                'amount': float(amounts[i].replace(' ', '')) if i < len(amounts) else 0,
                'debt': float(debt_str),
                'date': ''
            })
        
        if creditor['credits']:
            data['creditors'].append(creditor)
    
    total = sum(c['credits'][0]['debt'] for c in data['creditors'] if c['credits'])
    data['totalDebt'] = total
    
    return data


def parse_income(text: str) -> Dict[str, Any]:
    '''Парсинг справки о доходах (2-НДФЛ)'''
    data = {}
    
    income_match = re.search(r'(?:доход|сумма)[:\s]*(\d+[\s\d]*)\s*(?:руб|₽)', text, re.IGNORECASE)
    if income_match:
        total_income = float(income_match.group(1).replace(' ', ''))
        data['lastYear'] = total_income
        data['monthlyIncome'] = round(total_income / 12, 2)
    
    source_match = re.search(r'(?:источник|работодатель|организация)[:\s]+([А-ЯЁа-яё\s"«»\d.-]+?)(?:\n|ИНН)', text, re.IGNORECASE)
    if source_match:
        data['source'] = source_match.group(1).strip()
    else:
        data['source'] = 'заработная плата'
    
    return data


def parse_property(text: str) -> Dict[str, Any]:
    '''Парсинг выписки из ЕГРН'''
    data = {'realEstate': []}
    
    property_types = re.findall(r'(квартира|дом|здание|участок|гараж)', text, re.IGNORECASE)
    cadastral = re.findall(r'(\d{2}:\d{2}:\d{6,7}:\d{1,5})', text)
    addresses = re.findall(r'(?:адрес|расположен)[:\s]+([А-ЯЁа-яё\s\d,.№-]+?)(?:\n|кадастр)', text, re.IGNORECASE)
    values = re.findall(r'(?:стоимость|кадастровая\s+стоимость)[:\s]*(\d+[\s\d]*)\s*(?:руб|₽)', text, re.IGNORECASE)
    
    for i in range(max(len(property_types), len(cadastral), len(addresses))):
        property_item = {
            'type': property_types[i].lower() if i < len(property_types) else 'недвижимость',
            'cadastralNumber': cadastral[i] if i < len(cadastral) else '',
            'address': addresses[i].strip() if i < len(addresses) else '',
            'value': float(values[i].replace(' ', '')) if i < len(values) else 0
        }
        data['realEstate'].append(property_item)
    
    return data