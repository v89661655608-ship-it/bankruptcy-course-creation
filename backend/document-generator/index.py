import json
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация заявления о признании гражданина банкротом на основе собранных данных
    
    Получает: персональные данные, кредитную историю, доходы, имущество
    Возвращает: сформированное заявление в формате DOCX/PDF
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        
        personal_data = body_data.get('personalData')
        credit_data = body_data.get('creditData')
        income_data = body_data.get('incomeData')
        property_data = body_data.get('propertyData')
        
        if not personal_data or not credit_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно данных для генерации заявления'}),
                'isBase64Encoded': False
            }
        
        document_text = generate_bankruptcy_application(
            personal_data, 
            credit_data, 
            income_data, 
            property_data
        )
        
        result = {
            'success': True,
            'document': {
                'text': document_text,
                'createdAt': datetime.now().isoformat(),
                'format': 'text',
                'fileName': f"заявление_банкротство_{personal_data.get('inn', 'unknown')}.txt"
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }


def generate_bankruptcy_application(
    personal: Dict[str, Any],
    credit: Dict[str, Any],
    income: Dict[str, Any],
    property: Dict[str, Any]
) -> str:
    '''Генерирует текст заявления о банкротстве'''
    
    doc = []
    
    doc.append("В Арбитражный суд города Москвы")
    doc.append("")
    doc.append("ЗАЯВЛЕНИЕ")
    doc.append("о признании гражданина несостоятельным (банкротом)")
    doc.append("")
    doc.append(f"Заявитель: {personal.get('fullName', 'Не указано')}")
    doc.append(f"ИНН: {personal.get('inn', 'Не указано')}")
    doc.append(f"СНИЛС: {personal.get('snils', 'Не указано')}")
    doc.append(f"Дата рождения: {personal.get('birthDate', 'Не указано')}")
    
    passport = personal.get('passport', {})
    doc.append(f"Паспорт: {passport.get('series', '')} {passport.get('number', '')}, выдан {passport.get('issueDate', '')}")
    
    registration = personal.get('registration', {})
    doc.append(f"Адрес регистрации: {registration.get('address', 'Не указано')}")
    doc.append("")
    
    doc.append("1. СВЕДЕНИЯ О ЗАДОЛЖЕННОСТИ")
    doc.append("")
    doc.append(f"Общая сумма задолженности: {credit.get('totalDebt', 0):,.2f} руб.")
    doc.append("")
    
    creditors = credit.get('creditors', [])
    if creditors:
        doc.append("Кредиторы:")
        for idx, creditor in enumerate(creditors, 1):
            doc.append(f"\n{idx}. {creditor.get('name', 'Не указано')}")
            doc.append(f"   ИНН: {creditor.get('inn', 'Не указано')}")
            
            for credit_item in creditor.get('credits', []):
                doc.append(f"   Договор: {credit_item.get('contractNumber', 'Не указано')}")
                doc.append(f"   Сумма кредита: {credit_item.get('amount', 0):,.2f} руб.")
                doc.append(f"   Задолженность: {credit_item.get('debt', 0):,.2f} руб.")
                doc.append(f"   Дата договора: {credit_item.get('date', 'Не указано')}")
    
    exec_docs = credit.get('executiveDocuments', [])
    if exec_docs:
        doc.append("\nИсполнительные производства:")
        for idx, exec_doc in enumerate(exec_docs, 1):
            doc.append(f"\n{idx}. ИП № {exec_doc.get('number', 'Не указано')}")
            doc.append(f"   Дата возбуждения: {exec_doc.get('date', 'Не указано')}")
            doc.append(f"   Сумма: {exec_doc.get('amount', 0):,.2f} руб.")
            doc.append(f"   Взыскатель: {exec_doc.get('creditor', 'Не указано')}")
    
    doc.append("")
    doc.append("2. СВЕДЕНИЯ О ДОХОДАХ")
    doc.append("")
    if income:
        doc.append(f"Ежемесячный доход: {income.get('monthlyIncome', 0):,.2f} руб.")
        doc.append(f"Источник дохода: {income.get('source', 'Не указано')}")
        doc.append(f"Доход за последний год: {income.get('lastYear', 0):,.2f} руб.")
    else:
        doc.append("Постоянный источник дохода отсутствует")
    
    doc.append("")
    doc.append("3. СВЕДЕНИЯ ОБ ИМУЩЕСТВЕ")
    doc.append("")
    
    if property:
        real_estate = property.get('realEstate', [])
        if real_estate:
            doc.append("Недвижимое имущество:")
            for idx, item in enumerate(real_estate, 1):
                doc.append(f"\n{idx}. {item.get('type', 'Не указано').capitalize()}")
                doc.append(f"   Адрес: {item.get('address', 'Не указано')}")
                doc.append(f"   Кадастровый номер: {item.get('cadastralNumber', 'Не указано')}")
                doc.append(f"   Оценочная стоимость: {item.get('value', 0):,.2f} руб.")
        else:
            doc.append("Недвижимое имущество отсутствует")
        
        vehicles = property.get('vehicles', [])
        if vehicles:
            doc.append("\nТранспортные средства:")
            for idx, vehicle in enumerate(vehicles, 1):
                doc.append(f"\n{idx}. {vehicle.get('type', '')} {vehicle.get('model', '')}")
                doc.append(f"   Год выпуска: {vehicle.get('year', '')}")
                doc.append(f"   Регистрационный номер: {vehicle.get('registrationNumber', '')}")
    else:
        doc.append("Имущество отсутствует")
    
    doc.append("")
    doc.append("4. ОБОСНОВАНИЕ")
    doc.append("")
    doc.append(f"Я, {personal.get('fullName', '')}, не в состоянии погасить задолженность перед кредиторами в размере {credit.get('totalDebt', 0):,.2f} руб.")
    doc.append("Признаки банкротства налицо: общий размер обязательств превышает 500 000 руб., просрочка более 3 месяцев.")
    doc.append("")
    
    doc.append("На основании вышеизложенного и руководствуясь статьями 213.3-213.5 Федерального закона")
    doc.append("от 26.10.2002 № 127-ФЗ \"О несостоятельности (банкротстве)\",")
    doc.append("")
    doc.append("ПРОШУ:")
    doc.append("")
    doc.append(f"1. Признать меня, {personal.get('fullName', '')}, несостоятельным (банкротом).")
    doc.append("2. Ввести в отношении меня процедуру реструктуризации долгов гражданина.")
    doc.append("3. Утвердить финансового управляющего.")
    doc.append("")
    doc.append("Приложение:")
    doc.append("1. Копия паспорта")
    doc.append("2. Выписка из БКИ")
    doc.append("3. Справка о доходах")
    doc.append("4. Документы, подтверждающие задолженность")
    doc.append("5. Квитанция об уплате госпошлины")
    doc.append("")
    doc.append(f"Дата: {datetime.now().strftime('%d.%m.%Y')}")
    doc.append(f"Подпись: _____________ / {personal.get('fullName', '')} /")
    
    return "\n".join(doc)