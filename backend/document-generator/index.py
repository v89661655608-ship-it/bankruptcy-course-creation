import json
import base64
import io
from typing import Dict, Any
from datetime import datetime
from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.units import cm
except ImportError:
    pass

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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
        additional_fields = body_data.get('additionalFields', {})
        benefits_data = body_data.get('benefitsData', {})
        children_data = body_data.get('childrenData', {})
        transactions_data = body_data.get('transactionsData', {})
        doc_format = body_data.get('format', 'docx')
        
        if not personal_data or not credit_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Недостаточно данных для генерации заявления'}),
                'isBase64Encoded': False
            }
        
        if doc_format == 'creditors-list':
            docx_base64 = generate_creditors_list_document(
                personal_data, credit_data
            )
            result = {
                'success': True,
                'document': {
                    'data': docx_base64,
                    'createdAt': datetime.now().isoformat(),
                    'format': 'docx',
                    'fileName': f"приложение1_список_кредиторов_{personal_data.get('inn', 'doc')}.docx"
                }
            }
        elif doc_format == 'property-list':
            docx_base64 = generate_property_list_document(
                personal_data, property_data
            )
            result = {
                'success': True,
                'document': {
                    'data': docx_base64,
                    'createdAt': datetime.now().isoformat(),
                    'format': 'docx',
                    'fileName': f"приложение2_опись_имущества_{personal_data.get('inn', 'doc')}.docx"
                }
            }
        elif doc_format == 'pdf':
            pdf_base64 = generate_pdf_document(
                personal_data, credit_data, income_data, property_data, additional_fields, benefits_data, children_data, transactions_data
            )
            result = {
                'success': True,
                'document': {
                    'data': pdf_base64,
                    'createdAt': datetime.now().isoformat(),
                    'format': 'pdf',
                    'fileName': f"заявление_банкротство_{personal_data.get('inn', 'doc')}.pdf"
                }
            }
        elif doc_format == 'docx':
            docx_base64 = generate_docx_document(
                personal_data, credit_data, income_data, property_data, additional_fields, benefits_data, children_data, transactions_data
            )
            result = {
                'success': True,
                'document': {
                    'data': docx_base64,
                    'createdAt': datetime.now().isoformat(),
                    'format': 'docx',
                    'fileName': f"заявление_банкротство_{personal_data.get('inn', 'doc')}.docx"
                }
            }
        else:
            document_text = generate_bankruptcy_application(
                personal_data, credit_data, income_data, property_data
            )
            result = {
                'success': True,
                'document': {
                    'text': document_text,
                    'createdAt': datetime.now().isoformat(),
                    'format': 'text',
                    'fileName': f"заявление_банкротство_{personal_data.get('inn', 'doc')}.txt"
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


def format_number(num):
    """Форматирует число с разделителями тысяч"""
    if not num:
        return "0"
    return f"{float(num):,.0f}".replace(',', ' ')


def determine_court_by_address(address: str) -> Dict[str, str]:
    '''Определяет арбитражный суд по адресу регистрации'''
    
    address_lower = address.lower()
    
    courts_mapping = {
        'москва': {
            'name': 'Арбитражный суд города Москвы',
            'address': '115191, г. Москва, ул. Большая Тульская, д. 17'
        },
        'московская область': {
            'name': 'Арбитражный суд Московской области',
            'address': '107053, г. Москва, пр-т Академика Сахарова, д. 18'
        },
        'санкт-петербург': {
            'name': 'Арбитражный суд города Санкт-Петербурга и Ленинградской области',
            'address': '191015, г. Санкт-Петербург, Суворовский пр., д. 50-52'
        },
        'ленинградская область': {
            'name': 'Арбитражный суд города Санкт-Петербурга и Ленинградской области',
            'address': '191015, г. Санкт-Петербург, Суворовский пр., д. 50-52'
        },
        'новосибирск': {
            'name': 'Арбитражный суд Новосибирской области',
            'address': '630102, г. Новосибирск, ул. Нижегородская, д. 6'
        },
        'екатеринбург': {
            'name': 'Арбитражный суд Свердловской области',
            'address': '620075, г. Екатеринбург, ул. Шарташская, д. 4'
        },
        'казань': {
            'name': 'Арбитражный суд Республики Татарстан',
            'address': '420107, г. Казань, ул. Право-Булачная, д. 34/2'
        },
        'нижний новгород': {
            'name': 'Арбитражный суд Нижегородской области',
            'address': '603006, г. Нижний Новгород, Кремль, корп. 4'
        },
        'челябинск': {
            'name': 'Арбитражный суд Челябинской области',
            'address': '454000, г. Челябинск, ул. Воровского, д. 2'
        },
        'омск': {
            'name': 'Арбитражный суд Омской области',
            'address': '644024, г. Омск, ул. Учебная, д. 51'
        },
        'самара': {
            'name': 'Арбитражный суд Самарской области',
            'address': '443045, г. Самара, ул. Авроры, д. 148'
        },
        'ростов': {
            'name': 'Арбитражный суд Ростовской области',
            'address': '344002, г. Ростов-на-Дону, ул. Станиславского, д. 8'
        },
        'уфа': {
            'name': 'Арбитражный суд Республики Башкортостан',
            'address': '450057, г. Уфа, ул. Октябрьской революции, д. 63а'
        },
        'красноярск': {
            'name': 'Арбитражный суд Красноярского края',
            'address': '660049, г. Красноярск, пр. Мира, д. 63'
        },
        'пермь': {
            'name': 'Арбитражный суд Пермского края',
            'address': '614990, г. Пермь, ул. Екатерининская, д. 177'
        },
        'воронеж': {
            'name': 'Арбитражный суд Воронежской области',
            'address': '394030, г. Воронеж, ул. Свободы, д. 45'
        },
        'волгоград': {
            'name': 'Арбитражный суд Волгоградской области',
            'address': '400005, г. Волгоград, ул. Богунская, д. 12'
        },
        'краснодар': {
            'name': 'Арбитражный суд Краснодарского края',
            'address': '350063, г. Краснодар, ул. Постовая, д. 32'
        },
        'саратов': {
            'name': 'Арбитражный суд Саратовской области',
            'address': '410002, г. Саратов, ул. Бабушкин взвоз, д. 1'
        },
        'тюмень': {
            'name': 'Арбитражный суд Тюменской области',
            'address': '625000, г. Тюмень, ул. Первомайская, д. 20'
        },
        'тула': {
            'name': 'Арбитражный суд Тульской области',
            'address': '300041, г. Тула, ул. Староникитская, д. 1'
        },
        'иркутск': {
            'name': 'Арбитражный суд Иркутской области',
            'address': '664025, г. Иркутск, бул. Гагарина, д. 70'
        },
        'владивосток': {
            'name': 'Арбитражный суд Приморского края',
            'address': '690091, г. Владивосток, ул. Светланская, д. 54'
        },
        'хабаровск': {
            'name': 'Арбитражный суд Хабаровского края',
            'address': '680000, г. Хабаровск, ул. Ленина, д. 37'
        },
    }
    
    for region, court in courts_mapping.items():
        if region in address_lower:
            return court
    
    return {
        'name': 'Арбитражный суд (не удалось определить автоматически)',
        'address': 'Укажите адрес суда вручную'
    }


def generate_docx_document(
    personal: Dict[str, Any],
    credit: Dict[str, Any],
    income: Dict[str, Any],
    property: Dict[str, Any],
    additional: Dict[str, Any] = None,
    benefits: Dict[str, Any] = None,
    children: Dict[str, Any] = None,
    transactions: Dict[str, Any] = None
) -> str:
    '''Генерирует DOCX документ по шаблону и возвращает base64'''
    
    doc = Document()
    
    if additional is None:
        additional = {}
    
    passport = personal.get('passport', {})
    registration = personal.get('registration', {})
    creditors = credit.get('creditors', [])
    
    # Пересчитываем total_debt из реальных данных кредитов
    total_debt = 0
    for creditor in creditors:
        credits_list = creditor.get('credits', [])
        for credit_item in credits_list:
            total_debt += credit_item.get('debt', 0)
    
    registration_address = registration.get('address', '')
    auto_court = determine_court_by_address(registration_address)
    
    court_name = additional.get('courtName', auto_court['name'])
    court_address = additional.get('courtAddress', auto_court['address'])
    phone = additional.get('phone', 'Место для ввода текста.')
    email = additional.get('email', 'Место для ввода текста.')
    
    # Шапка документа с форматированием
    def add_header_paragraph(text):
        p = doc.add_paragraph(text)
        p_format = p.paragraph_format
        p_format.space_before = Pt(0)
        p_format.space_after = Pt(0)
        p_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
        p_format.left_indent = Cm(7)
        return p
    
    add_header_paragraph(f"В {court_name}")
    add_header_paragraph(f"Адрес: {court_address}")
    add_header_paragraph("")
    
    add_header_paragraph(f"Заявитель (Должник):")
    add_header_paragraph(f"{personal.get('fullName', 'Место для ввода текста.')}")
    add_header_paragraph(f"Адрес: {registration.get('address', 'Место для ввода текста.')}")
    add_header_paragraph("")
    
    add_header_paragraph(f"Паспорт: серия {passport.get('series', 'Место для ввода текста.')} номер {passport.get('number', 'Место для ввода текста.')}")
    add_header_paragraph(f"выдан: {passport.get('issuedBy', 'Место для ввода текста.')}")
    add_header_paragraph(f"дата выдачи: {passport.get('issueDate', 'Место для ввода текста.')}")
    add_header_paragraph(f"код подразделения: {passport.get('code', 'Место для ввода текста.')}")
    add_header_paragraph(f"тел. 8 {phone}")
    add_header_paragraph(f"e-mail: {email}")
    add_header_paragraph("")
    add_header_paragraph("")
    
    add_header_paragraph("Кредиторы:")
    for idx, creditor in enumerate(creditors, 1):
        add_header_paragraph(f"{idx}. {creditor.get('name', 'Место для ввода текста.')}")
        add_header_paragraph(f"ИНН {creditor.get('inn', 'Место для ввода текста.')}")
        legal_address = creditor.get('legalAddress', 'Место для ввода текста.')
        add_header_paragraph(f"Юридический адрес: {legal_address}")
        add_header_paragraph("")
    
    doc.add_paragraph()
    
    title = doc.add_heading("ЗАЯВЛЕНИЕ ГРАЖДАНИНА О ПРИЗНАНИИ БАНКРОТОМ", level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Основной текст заявления с форматированием
    p_main = doc.add_paragraph(f"{personal.get('fullName', 'ФИО')} (далее – «Должник») обращается в суд с заявлением о признании его банкротом, поскольку имеются обязательства на сумму, превышающую 500 000 рублей и эти обязательства не исполнены Должником в течение трех месяцев с даты, когда они должны были быть исполнены. Кроме того, удовлетворение требований одного кредитора или нескольких кредиторов Должника приведет к невозможности исполнения Должником денежных обязательств в полном объеме перед другими кредиторами.")
    p_main_format = p_main.paragraph_format
    p_main_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_main_format.first_line_indent = Cm(1)
    p_main_format.space_before = Pt(0)
    p_main_format.space_after = Pt(0)
    p_main_format.line_spacing = 1.0
    
    p_debt = doc.add_paragraph(f"По состоянию на дату подачи заявления размер непогашенной задолженности Должника перед Кредиторами, составляет {format_number(total_debt)} рублей ({format_number(total_debt)} рублей 00 копеек) из которых:")
    p_debt_format = p_debt.paragraph_format
    p_debt_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_debt_format.first_line_indent = Cm(1)
    p_debt_format.space_before = Pt(0)
    p_debt_format.space_after = Pt(0)
    p_debt_format.line_spacing = 1.0
    
    for idx, creditor in enumerate(creditors, 1):
        doc.add_paragraph(f"{idx}. Перед {creditor.get('name', 'Место для ввода текста.')}:")
        credits_list = creditor.get('credits', [])
        if credits_list:
            for credit_item in credits_list:
                contract_num = credit_item.get('contractNumber', 'Место для ввода текста.')
                contract_date = credit_item.get('date', 'Место для ввода текста.')
                debt = credit_item.get('debt', 0)
                amount = credit_item.get('amount', 0)
                p_credit = doc.add_paragraph(f"- по Кредитному договору № {contract_num} от {contract_date} г. общая сумма задолженности составляет {format_number(debt)} рублей, в том числе сумма основного долга {format_number(amount)} рублей, сумма задолженности по начисленным процентам {format_number(debt - amount)} рублей.")
                p_credit_format = p_credit.paragraph_format
                p_credit_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p_credit_format.first_line_indent = Cm(1)
                p_credit_format.space_before = Pt(0)
                p_credit_format.space_after = Pt(0)
                p_credit_format.line_spacing = 1.0
        else:
            p_credit_placeholder = doc.add_paragraph(f"- по Кредитному договору № Место для ввода текста. от Место для ввода текста. г. общая сумма задолженности составляет Место для ввода текста. рублей, в том числе сумма основного долга Место для ввода текста. рублей, сумма задолженности по начисленным процентам Место для ввода текста. рублей.")
            p_credit_placeholder_format = p_credit_placeholder.paragraph_format
            p_credit_placeholder_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_credit_placeholder_format.first_line_indent = Cm(1)
            p_credit_placeholder_format.space_before = Pt(0)
            p_credit_placeholder_format.space_after = Pt(0)
            p_credit_placeholder_format.line_spacing = 1.0
    
    monthly_income = income.get('monthlyIncome', 0) if income else 0
    yearly_income = income.get('lastYear', 0) if income else 0
    no_income = income.get('noIncome', False) if income else False
    
    if no_income or monthly_income == 0:
        p_no_income = doc.add_paragraph(f"Должник не имеет возможности удовлетворить требования Кредиторов в полном объеме, ввиду того, что объем всех ежемесячных обязательных платежей Должника в пользу Кредиторов (более {format_number(total_debt / 12)} рублей) превышает доход Должника. Должник не имеет постоянного источника дохода и является безработным.")
        p_no_income_format = p_no_income.paragraph_format
        p_no_income_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_no_income_format.first_line_indent = Cm(1)
        p_no_income_format.space_before = Pt(0)
        p_no_income_format.space_after = Pt(0)
        p_no_income_format.line_spacing = 1.0
        
        p = doc.add_paragraph("Должник не имеет дохода и является безработным, о чем свидетельствует справка из Центра занятости населения.")
        p_format = p.paragraph_format
        p_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_format.first_line_indent = Cm(1)
        p_format.space_before = Pt(0)
        p_format.space_after = Pt(0)
        p_format.line_spacing = 1.0
    else:
        p1 = doc.add_paragraph(f"Должник не имеет возможности удовлетворить требования Кредиторов в полном объеме, ввиду того, что объем всех ежемесячных обязательных платежей Должника в пользу Кредиторов (более {format_number(total_debt / 12)} рублей) значительно превышает средний размер заработной платы Должника за последний год, что согласно справки 2 НДФЛ составляет {format_number(monthly_income)} рублей. ")
        p1_format = p1.paragraph_format
        p1_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p1_format.first_line_indent = Cm(1)
        p1_format.space_before = Pt(0)
        p1_format.space_after = Pt(0)
        p1_format.line_spacing = 1.0
        
        p2 = doc.add_paragraph("Такая ситуация возникла в связи с тем, что Должник не рассчитал свои силы и возможности, кредиты приобретались при рождении детей и тратились на семейные нужды, впоследствии Должником была потеряна работа.")
        p2_format = p2.paragraph_format
        p2_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p2_format.first_line_indent = Cm(1)
        p2_format.space_before = Pt(0)
        p2_format.space_after = Pt(0)
        p2_format.line_spacing = 1.0
    if benefits and benefits.get('isLowIncome'):
        cert_num = benefits.get('certificateNumber', 'Место для ввода текста.')
        cert_date = benefits.get('certificateDate', 'Место для ввода текста.')
        special_status = benefits.get('specialStatus', 'матерью одиночкой (инвалидом, пр.)')
        benefits_text = f"На основании справки № {cert_num} от {cert_date} г. Должник отнесен к категории малоимущих граждан. Кроме того, Должник является {special_status}."
        p3 = doc.add_paragraph(benefits_text)
        p3_format = p3.paragraph_format
        p3_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p3_format.first_line_indent = Cm(1)
        p3_format.space_before = Pt(0)
        p3_format.space_after = Pt(0)
        p3_format.line_spacing = 1.0
    
    if children and not children.get('noChildren', True):
        children_list = children.get('children', [])
        if children_list:
            for child in children_list:
                child_name = child.get('fullName', 'ФИО')
                birth_date = child.get('birthDate', 'года рождения')
                lives_with = 'проживающая вместе с Должником' if child.get('livesWithDebtor', False) else 'проживающая отдельно от Должника'
                p4 = doc.add_paragraph(f"На иждивении у Должника находится несовершеннолетний(яя) {child_name} {birth_date} года рождения, {lives_with}.")
                p4_format = p4.paragraph_format
                p4_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p4_format.first_line_indent = Cm(1)
                p4_format.space_before = Pt(0)
                p4_format.space_after = Pt(0)
                p4_format.line_spacing = 1.0
    
    if children and children.get('alimonyInfo', {}).get('isPayingAlimony', False):
        alimony = children.get('alimonyInfo', {})
        doc_type = alimony.get('documentType', 'notarial')
        
        if doc_type == 'notarial':
            notary_date = alimony.get('notaryDate', '01.01.2021')
            child_name = alimony.get('childFullName', 'ФИО')
            amount = format_number(alimony.get('monthlyAmount', 0))
            alimony_text = f"В соответствии с Соглашением об оплате алиментов на содержание несовершеннолетнего ребенка, удостоверенного нотариусом {notary_date} г., заключенного между Должником и матерью несовершеннолетнего ребенка Должника {child_name}, Должник обязался выплачивать в пользу своего несовершеннолетнего ребенка алименты в размере {amount} рублей ежемесячно до достижения ребенком восемнадцатилетнего возраста."
        elif doc_type == 'court':
            doc_details = alimony.get('documentDetails', 'решению суда')
            alimony_text = f"В соответствии с {doc_details} Должник обязан выплачивать алименты на содержание несовершеннолетнего ребенка."
        else:
            other_details = alimony.get('otherDetails', 'документу об алиментах')
            alimony_text = f"В соответствии с {other_details} Должник обязан выплачивать алименты на содержание несовершеннолетнего ребенка."
        
        p5 = doc.add_paragraph(alimony_text)
        p5_format = p5.paragraph_format
        p5_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p5_format.first_line_indent = Cm(1)
        p5_format.space_before = Pt(0)
        p5_format.space_after = Pt(0)
        p5_format.line_spacing = 1.0
    
    if property and property.get('realEstate'):
        real_estate = property.get('realEstate', [])
        if real_estate:
            item = real_estate[0]
            area_text = str(item.get('area', 'Место для ввода текста.'))
            land_area_text = str(item.get('landArea', 'Место для ввода текста.'))
            
            if item.get('isSoleResidence', False):
                p6 = doc.add_paragraph(f"В собственности Должника находится {item.get('type', 'недвижимость')}, общей площадью {area_text} кв. м. с земельным участком площадью {land_area_text} кв. м. по адресу: {item.get('address', 'Место для ввода текста.')}, являющийся единственным пригодным для постоянного проживания помещением для него и членов его семьи и не подлежит реализации.")
            else:
                p6 = doc.add_paragraph(f"В собственности Должника находится {item.get('type', 'недвижимость')}, общей площадью {area_text} кв. м. с земельным участком площадью {land_area_text} кв. м. по адресу: {item.get('address', 'Место для ввода текста.')}.")
            
            p6_format = p6.paragraph_format
            p6_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p6_format.first_line_indent = Cm(1)
            p6_format.space_before = Pt(0)
            p6_format.space_after = Pt(0)
            p6_format.line_spacing = 1.0
    else:
        p6 = doc.add_paragraph("В собственности Должника находится Место для ввода текста., общей площадью Место для ввода текста. с земельным участком площадью Место для ввода текста. кв. м. по адресу: Место для ввода текста. являющийся единственным пригодным для постоянного проживания помещением для него и членов его семьи.")
        p6_format = p6.paragraph_format
        p6_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p6_format.first_line_indent = Cm(1)
        p6_format.space_before = Pt(0)
        p6_format.space_after = Pt(0)
        p6_format.line_spacing = 1.0
    
    if property and property.get('vehicles'):
        vehicles = property.get('vehicles', [])
        if vehicles:
            vehicle = vehicles[0]
            vehicle_brand = vehicle.get('brand', 'Место для ввода текста.')
            vehicle_model = vehicle.get('model', 'Место для ввода текста.')
            vehicle_year = vehicle.get('year', 'Место для ввода текста.')
            vehicle_reg = vehicle.get('registrationNumber', 'Место для ввода текста.')
            vehicle_vin = vehicle.get('vin', 'Место для ввода текста.')
            p7 = doc.add_paragraph(f"Кроме того, в собственности Должника находится автомобиль марки {vehicle_brand} {vehicle_model} {vehicle_year} г., государственный регистрационный номер: {vehicle_reg}, идентификационный номер VIN: {vehicle_vin}.")
            p7_format = p7.paragraph_format
            p7_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p7_format.first_line_indent = Cm(1)
            p7_format.space_before = Pt(0)
            p7_format.space_after = Pt(0)
            p7_format.line_spacing = 1.0
    
    p8 = doc.add_paragraph("Какое-либо имущество, на которое может быть обращено взыскание в соответствии с действующим законодательством, у Должника отсутствует.")
    p8_format = p8.paragraph_format
    p8_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p8_format.first_line_indent = Cm(1)
    p8_format.space_before = Pt(0)
    p8_format.space_after = Pt(0)
    p8_format.line_spacing = 1.0
    
    def add_body_paragraph(text):
        p = doc.add_paragraph(text)
        p_format = p.paragraph_format
        p_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_format.first_line_indent = Cm(1)
        p_format.space_before = Pt(0)
        p_format.space_after = Pt(0)
        p_format.line_spacing = 1.0
        return p
    
    add_body_paragraph('В соответствии с п. 1 ст. 213.3 Федерального закона «О несостоятельности (банкротстве)» №127-ФЗ от 16.10.2002 (далее также – «Закон о банкротстве»), правом на обращение в суд с заявлением о признании гражданина банкротом обладают гражданин, конкурсный кредитор, уполномоченный орган.')
    add_body_paragraph('Согласно п. 1 с. 213.3 Закона о банкротстве, заявление о признании гражданина банкротом принимается судом при условии, что требования к гражданину составляют не менее чем пятьсот тысяч рублей и указанные требования не исполнены в течение трех месяцев с даты, когда они должны быть исполнены, если иное не предусмотрено Законом о банкротстве.')
    add_body_paragraph('В соответствии с п. 1 ст. 213.4 Закона о банкротстве, гражданин обязан обратиться в суд с заявлением о признании его банкротом в случае, если удовлетворение требований одного кредитора или нескольких кредиторов приводит к невозможности исполнения гражданином денежных обязательств и (или) обязанности по уплате обязательных платежей в полном объеме перед другими кредиторами и размер таких обязательств и обязанности в совокупности составляет не менее чем пятьсот тысяч рублей.')
    add_body_paragraph('Согласно п. 2 ст. 213.4 Закона о банкротстве гражданин вправе подать в арбитражный суд заявление о признании его банкротом в случае предвидения банкротства при наличии обстоятельств, очевидно свидетельствующих о том, что он не в состоянии исполнить денежные обязательства и (или) обязанность по уплате обязательных платежей в установленный срок, при этом гражданин отвечает признакам неплатежеспособности и (или) признакам недостаточности имущества.')
    add_body_paragraph('Согласно п.3 ст.213.6 Закона о банкротстве, под неплатежеспособностью гражданина понимается его неспособность удовлетворить в полном объеме требования кредиторов по денежным обязательствам и (или) исполнить обязанность по уплате обязательных платежей.')
    add_body_paragraph('Если не доказано иное, гражданин предполагается неплатежеспособным при условии, что имеет место хотя бы одно из следующих обстоятельств:')
    add_body_paragraph('- гражданин прекратил расчеты с кредиторами, то есть перестал исполнять денежные обязательства и (или) обязанность по уплате обязательных платежей, срок исполнения которых наступил;')
    add_body_paragraph('- более чем десять процентов совокупного размера денежных обязательств и (или) обязанности по уплате обязательных платежей, которые имеются у гражданина и срок исполнения которых наступил, не исполнены им в течение более чем одного месяца со дня, когда такие обязательства должны быть исполнены;')
    add_body_paragraph('- размер задолженности гражданина превышает стоимость его имущества, в том числе права требования;')
    add_body_paragraph('- наличие постановления об окончании исполнительного производства в связи с тем, что у гражданина отсутствует имущество, на которое может быть обращено взыскание.')
    
    doc.add_paragraph("На момент подачи настоящего заявления:")
    doc.add_paragraph('- существуют обстоятельства, очевидно свидетельствующие о том, что Должник не в состоянии исполнить денежные обязательства и (или) обязанность по уплате обязательных платежей в установленный срок;')
    doc.add_paragraph(f"- сумма задолженности Должника перед Кредиторами составляет {format_number(total_debt)} рублей;")
    doc.add_paragraph('- срок, в течение которого Должником не были исполнены обязательства, превышает 3 (три) месяца с момента наступления даты их исполнения.')
    doc.add_paragraph('- размер задолженности Должника перед Кредитором превышает стоимость его имущества, на которое может быть обращено взыскание в соответствии с действующим законодательством (п. 3 ст. 213.25 Закона о банкротстве и ст. 446 ГПК РФ).')
    
    doc.add_paragraph('Должник не привлекался к административной ответственности за мелкое хищение, умышленное уничтожение или повреждение имущества, неправомерные действия при банкротстве, фиктивное или преднамеренное банкротство.')
    doc.add_paragraph('Кроме того, в настоящий момент отсутствуют сведения об известных Должнику уголовных и административных делах в отношении него, а также о наличии неснятой или непогашенной судимости.')
    
    if transactions and not transactions.get('noTransactions', True):
        transactions_list = transactions.get('transactions', [])
        if transactions_list:
            for idx, trans in enumerate(transactions_list, 1):
                trans_date = trans.get('date', '01.01.2021')
                trans_type = trans.get('type', 'купля-продажа')
                trans_desc = trans.get('description', 'сделка с имуществом')
                trans_amount = format_number(trans.get('amount', 0))
                trans_counterparty = trans.get('counterparty', 'Место для ввода текста.')
                p_trans = doc.add_paragraph(f'Должником в течение трех лет до даты подачи заявления была произведена сделка: {trans_type} от {trans_date} г. - {trans_desc}. Сумма сделки составила {trans_amount} рублей. Контрагент: {trans_counterparty}.')
                p_trans_format = p_trans.paragraph_format
                p_trans_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p_trans_format.first_line_indent = Cm(1)
                p_trans_format.space_before = Pt(0)
                p_trans_format.space_after = Pt(0)
                p_trans_format.line_spacing = 1.0
            
            p10 = doc.add_paragraph('Иные сделки с недвижимым имуществом, ценными бумагами, долями в уставном капитале, транспортными средствами и сделок на сумму свыше трехсот тысяч рублей в течение трех лет до даты подачи настоящего заявления Должником не совершались.')
            p10_format = p10.paragraph_format
            p10_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p10_format.first_line_indent = Cm(1)
            p10_format.space_before = Pt(0)
            p10_format.space_after = Pt(0)
            p10_format.line_spacing = 1.0
    else:
        p10 = doc.add_paragraph('Сделки с недвижимым имуществом, ценными бумагами, долями в уставном капитале, транспортными средствами и сделок на сумму свыше трехсот тысяч рублей в течение трех лет до даты подачи настоящего заявления Должником не совершались.')
        p10_format = p10.paragraph_format
        p10_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p10_format.first_line_indent = Cm(1)
        p10_format.space_before = Pt(0)
        p10_format.space_after = Pt(0)
        p10_format.line_spacing = 1.0
    doc.add_paragraph('В соответствии с общим смыслом п. 19 Постановления Пленума Верховного Суда РФ № 45 от 13.10.2015 г. «О некоторых вопросах, связанных с введением в действие процедур, применяемых в делах о несостоятельности (банкротстве) граждан» в качестве доказательства наличия у Должника денежных средств, достаточных для погашения расходов по делу о банкротстве, к настоящему заявлению приложен платежный документ об оплате в депозит Арбитражного суда денежных средств в размере 25 000 рублей.')
    doc.add_paragraph('Таким образом, имеются признаки банкротства гражданина-должника, указанные в п. 3 ст. 213.6 Закона о банкротстве и основания для возбуждения судом дела о банкротстве в соответствии со статьями 213.3 и 213.4 Закона о банкротстве.')
    doc.add_paragraph('На основании вышеизложенного, а также руководствуясь ст. ст. 6, 27, 38, 213.3, 213.4 Федерального закона «О несостоятельности (банкротстве)» от 26.10.2002 №127-ФЗ; ст. ст. 223, 224 АПК РФ,')
    
    doc.add_paragraph()
    prosh_heading = doc.add_paragraph("ПРОШУ:")
    prosh_heading.runs[0].bold = True
    prosh_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph(f"1) Признать {personal.get('fullName', 'Место для ввода текста.')} несостоятельным (банкротом) и ввести процедуру реализации имущества.")
    doc.add_paragraph("2) Назначить финансового управляющего из числа членов следующих саморегулируемых организаций:")
    doc.add_paragraph('• НПС СОПАУ "Альянс управляющих" (350015, Краснодарский край, г. Краснодар, ул.Северная, д.309);')
    doc.add_paragraph('• Ассоциация арбитражных управляющих "ГАРАНТИЯ" (125167, г Москва, ул Викторенко, д.5, строение 1, эт. 2);')
    doc.add_paragraph('• Ассоциация Арбитражных Управляющих "Содружество" (191124, г Санкт-Петербург, Санкт-Петербург, проспект Суворовский, д. 65, лит. Б, пом. 8-Н43);')
    doc.add_paragraph('• АССОЦИАЦИЯ "МЕЖРЕГИОНАЛЬНАЯ САМОРЕГУЛИРУЕМАЯ ОРГАНИЗАЦИЯ ПРОФЕССИОНАЛЬНЫХ АРБИТРАЖНЫХ УПРАВЛЯЮЩИХ" (109240, г. Москва, Котельническая наб., д.17).')
    
    doc.add_paragraph()
    doc.add_paragraph("Приложения:")
    appendices = [
        "1. Почтовые квитанции о направлении копии настоящего заявления кредиторам, Место для ввода текста. листов.",
        "2. Документ, подтверждающий уплату государственной пошлины Место для ввода текста. лист;",
        "3. Документ, подтверждающий внесение денежных средств на выплату вознаграждения финансовому управляющему в депозит арбитражного суда Место для ввода текста. лист;",
        "4. Копия паспорта (всех страниц) Место для ввода текста. листов;",
        "5. Копия ИНН (свидетельства о постановке на учет в налоговом органе) (при наличии) Место для ввода текста. лист;",
        "6. Копия СНИЛС Место для ввода текста. лист;",
        "7. Копии справок, выданных кредиторами о задолженности на Место для ввода текста. листах;",
        "8. Копии кредитных договоров Место для ввода текста. штуки;",
        "9. Документы, подтверждающие наличие или отсутствие у гражданина статуса индивидуального предпринимателя, полученные не ранее чем за пять рабочих дней до даты подачи в суд заявления на Место для ввода текста. листе;",
        "10. Список кредиторов и должников гражданина по форме Приложения № 1 к Приказу Минэкономразвития России от 05.08.2015 № 530;",
        "11. Опись имущества гражданина по форме Приложения № 2 к Приказу Минэкономразвития России от 05.08.2015 № 530;",
        "12. Справки 2 НДФЛ за трехлетний период, предшествующий дате подачи заявления о признании гражданина банкротом на Место для ввода текста. листах;",
        "13. Копии документов, подтверждающих право собственности гражданина на имущество на Место для ввода текста. листах (при наличии);",
        "14. Копии документов о совершавшихся гражданином в течение трех лет до даты подачи заявления сделках с недвижимым имуществом, транспортными средствами и сделках на сумму свыше трехсот тысяч рублей (при наличии);",
        "15. Копия свидетельства пенсионного страхования (при наличии);",
        "16. Копия решения о признании гражданина безработным, выданная государственной службой занятости населения (при наличии);",
        "17. Копия свидетельства о заключении брака (при наличии заключенного и не расторгнутого на дату подачи заявления брака);",
        "18. Копия свидетельства о расторжении брака, если оно выдано в течение трех лет до даты подачи заявления (при наличии);",
        "19. Копия брачного договора (при наличии);",
        "20. Копия соглашения или судебного акта о разделе общего имущества супругов, соответственно заключенного и принятого в течение трех лет до даты подачи заявления (при наличии);",
        "21. Копия свидетельства о рождении ребенка, если гражданин является его родителем, усыновителем или опекуном.",
    ]
    
    for creditor_idx in range(len(creditors)):
        appendices.append(f"{22 + creditor_idx}. Выписка из ЕГРЮЛ на кредитора {creditor_idx + 1};")
    
    for app in appendices:
        doc.add_paragraph(app)
    
    doc.add_paragraph()
    doc.add_paragraph(f"Должник: {personal.get('fullName', 'Место для ввода текста.')}")
    doc.add_paragraph(f"Дата: {datetime.now().strftime('%d.%m.%Y')}")
    
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


def generate_pdf_document(
    personal: Dict[str, Any],
    credit: Dict[str, Any],
    income: Dict[str, Any],
    property: Dict[str, Any],
    additional: Dict[str, Any] = None,
    benefits: Dict[str, Any] = None,
    children: Dict[str, Any] = None,
    transactions: Dict[str, Any] = None
) -> str:
    '''Генерирует PDF документ по шаблону и возвращает base64'''
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    y = height - 2*cm
    
    c.setFont("Helvetica", 10)
    
    if additional is None:
        additional = {}
    
    passport = personal.get('passport', {})
    registration = personal.get('registration', {})
    creditors = credit.get('creditors', [])
    
    # Пересчитываем total_debt из реальных данных кредитов
    total_debt = 0
    for creditor in creditors:
        credits_list = creditor.get('credits', [])
        for credit_item in credits_list:
            total_debt += credit_item.get('debt', 0)
    
    registration_address = registration.get('address', '')
    auto_court = determine_court_by_address(registration_address)
    
    court_name = additional.get('courtName', auto_court['name'])
    court_address = additional.get('courtAddress', auto_court['address'])
    phone = additional.get('phone', 'Место для ввода текста.')
    email = additional.get('email', 'Место для ввода текста.')
    
    c.drawString(2*cm, y, f"В {court_name}")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"Адрес: {court_address}")
    y -= 1*cm
    
    c.drawString(2*cm, y, f"Заявитель (Должник):")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"{personal.get('fullName', 'Место для ввода текста.')}")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"Адрес: {registration.get('address', 'Место для ввода текста.')}")
    y -= 1*cm
    
    c.drawString(2*cm, y, f"Паспорт: серия {passport.get('series', 'Место для ввода текста.')} номер {passport.get('number', 'Место для ввода текста.')}")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"выдан: {passport.get('issuedBy', 'Место для ввода текста.')}")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"дата выдачи: {passport.get('issueDate', 'Место для ввода текста.')}")
    y -= 0.5*cm
    c.drawString(2*cm, y, f"код подразделения: {passport.get('code', 'Место для ввода текста.')}")
    y -= 1*cm
    
    c.drawString(2*cm, y, "Кредиторы:")
    y -= 0.5*cm
    
    for idx, creditor in enumerate(creditors, 1):
        c.drawString(2*cm, y, f"{idx}. {creditor.get('name', 'Место для ввода текста.')}")
        y -= 0.5*cm
        c.drawString(2*cm, y, f"ИНН {creditor.get('inn', 'Место для ввода текста.')}")
        y -= 0.5*cm
        legal_address = creditor.get('legalAddress', 'Место для ввода текста.')
        c.drawString(2*cm, y, f"Юридический адрес: {legal_address}")
        y -= 0.7*cm
        
        if y < 5*cm:
            c.showPage()
            y = height - 2*cm
            c.setFont("Helvetica", 10)
    
    y -= 1*cm
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width/2, y, "ЗАЯВЛЕНИЕ ГРАЖДАНИНА О ПРИЗНАНИИ БАНКРОТОМ")
    y -= 1.5*cm
    
    c.setFont("Helvetica", 10)
    
    text_lines = [
        f"{personal.get('fullName', 'ФИО')} (далее – «Должник») обращается в суд с заявлением",
        "о признании его банкротом, поскольку имеются обязательства на сумму,",
        "превышающую 500 000 рублей...",
        "",
        f"Общая задолженность: {format_number(total_debt)} рублей",
    ]
    
    for line in text_lines:
        if y < 3*cm:
            c.showPage()
            y = height - 2*cm
            c.setFont("Helvetica", 10)
        c.drawString(2*cm, y, line)
        y -= 0.5*cm
    
    y -= 1*cm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(2*cm, y, "ПРОШУ:")
    y -= 0.7*cm
    
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, y, f"1) Признать {personal.get('fullName', 'Место для ввода текста.')} несостоятельным (банкротом)")
    y -= 0.5*cm
    c.drawString(2*cm, y, "2) Назначить финансового управляющего")
    y -= 1.5*cm
    
    c.drawString(2*cm, y, f"Должник: {personal.get('fullName', 'Место для ввода текста.')}")
    y -= 0.7*cm
    c.drawString(2*cm, y, f"Дата: {datetime.now().strftime('%d.%m.%Y')}")
    
    c.save()
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


def generate_creditors_list_document(
    personal: Dict[str, Any],
    credit: Dict[str, Any]
) -> str:
    '''
    Генерирует Приложение №1 - Список кредиторов и должников гражданина
    по форме из Приказа Минэкономразвития от 05.08.2015 N 530
    '''
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    from docx.table import _Cell
    
    doc = Document()
    
    # Заголовок документа
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p_header.add_run("Приложение № 1\nк приказу Минэкономразвития России\nот 5 августа 2015 г. № 530")
    run.font.size = Pt(10)
    
    doc.add_paragraph()
    
    # Заголовок
    title = doc.add_heading("СПИСОК\nкредиторов и должников гражданина", level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in title.runs:
        run.font.size = Pt(14)
        run.font.bold = True
    
    # Информация о гражданине
    p_citizen = doc.add_paragraph()
    full_name = personal.get('fullName', '_________________________')
    inn = personal.get('inn', '_________________________')
    snils = personal.get('snils', '_________________________')
    
    registration = personal.get('registration', {})
    address = registration.get('address', '_________________________')
    
    p_citizen.add_run(f"Гражданин: {full_name}\n")
    p_citizen.add_run(f"ИНН: {inn}\n")
    p_citizen.add_run(f"СНИЛС: {snils}\n")
    p_citizen.add_run(f"Адрес регистрации: {address}")
    
    doc.add_paragraph()
    
    # Функция для объединения ячеек
    def set_cell_border(cell, **kwargs):
        """Устанавливает границы ячейки"""
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        
        tcBorders = OxmlElement('w:tcBorders')
        for edge in ('top', 'left', 'bottom', 'right'):
            if edge in kwargs:
                edge_el = OxmlElement(f'w:{edge}')
                edge_el.set(qn('w:val'), 'single')
                edge_el.set(qn('w:sz'), '4')
                edge_el.set(qn('w:space'), '0')
                edge_el.set(qn('w:color'), '000000')
                tcBorders.append(edge_el)
        tcPr.append(tcBorders)
    
    # Раздел I: Сведения о кредиторах
    section_heading = doc.add_paragraph()
    section_heading.add_run("I. Сведения о кредиторах гражданина").bold = True
    
    p_desc = doc.add_paragraph()
    p_desc.add_run("по денежным обязательствам, НЕ связанным с осуществлением предпринимательской деятельности гражданина").italic = True
    
    doc.add_paragraph()
    p_money = doc.add_paragraph()
    p_money.add_run("1. Денежные обязательства").bold = True
    
    # Таблица кредиторов
    table = doc.add_table(rows=1, cols=8)
    table.style = 'Table Grid'
    
    # Заголовки таблицы
    headers = table.rows[0].cells
    headers[0].text = "№ п/п"
    headers[1].text = "Содержание обязательства"
    headers[2].text = "Кредитор"
    headers[3].text = "Место нахождения (место жительства) кредитора"
    headers[4].text = "Основание возникновения"
    headers[5].text = "Сумма обязательства, всего"
    headers[6].text = "в том числе задолженность"
    headers[7].text = "Штрафы, пени и иные санкции"
    
    # Форматирование заголовков
    for cell in headers:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Заполнение данными о кредиторах
    creditors = credit.get('creditors', [])
    row_num = 1
    total_debt = 0
    total_penalties = 0
    
    for creditor in creditors:
        creditor_name = creditor.get('name', '')
        creditor_inn = creditor.get('inn', '')
        creditor_address = creditor.get('legalAddress', 'не указано')
        
        credits_list = creditor.get('credits', [])
        for credit_item in credits_list:
            row = table.add_row().cells
            
            # № п/п
            row[0].text = str(row_num)
            row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Содержание обязательства
            row[1].text = "Кредитный договор"
            
            # Кредитор
            row[2].text = f"{creditor_name}\nИНН: {creditor_inn}"
            
            # Место нахождения
            row[3].text = creditor_address
            
            # Основание возникновения
            contract_num = credit_item.get('contractNumber', '')
            contract_date = credit_item.get('date', '')
            row[4].text = f"Договор № {contract_num}\nот {contract_date}"
            
            # Сумма обязательства всего
            debt = credit_item.get('debt', 0)
            row[5].text = format_number(debt)
            row[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            total_debt += debt
            
            # Задолженность
            row[6].text = format_number(debt)
            row[6].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            
            # Штрафы
            row[7].text = "0"
            row[7].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            
            # Форматирование ячеек
            for cell in row:
                cell.paragraphs[0].runs[0].font.size = Pt(9)
            
            row_num += 1
    
    # Итоговая строка
    total_row = table.add_row().cells
    total_row[0].merge(total_row[4])
    total_row[0].text = "ИТОГО:"
    total_row[0].paragraphs[0].runs[0].font.bold = True
    total_row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    total_row[5].text = format_number(total_debt)
    total_row[5].paragraphs[0].runs[0].font.bold = True
    total_row[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    total_row[6].text = format_number(total_debt)
    total_row[6].paragraphs[0].runs[0].font.bold = True
    total_row[6].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    total_row[7].text = "0"
    total_row[7].paragraphs[0].runs[0].font.bold = True
    total_row[7].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    doc.add_paragraph()
    
    # Раздел с обязательными платежами
    p_tax = doc.add_paragraph()
    p_tax.add_run("2. Обязательные платежи").bold = True
    
    table_tax = doc.add_table(rows=1, cols=4)
    table_tax.style = 'Table Grid'
    
    headers_tax = table_tax.rows[0].cells
    headers_tax[0].text = "№ п/п"
    headers_tax[1].text = "Наименование налога, сбора или иного обязательного платежа"
    headers_tax[2].text = "Недоимка"
    headers_tax[3].text = "Штрафы, пени и иные санкции"
    
    for cell in headers_tax:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Пустая строка (нет налоговых задолженностей)
    row_tax = table_tax.add_row().cells
    row_tax[0].text = "-"
    row_tax[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    row_tax[1].text = "Отсутствуют"
    row_tax[2].text = "0"
    row_tax[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    row_tax[3].text = "0"
    row_tax[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    doc.add_paragraph()
    
    # Раздел III: Сведения о должниках (пустой раздел)
    section3_heading = doc.add_paragraph()
    section3_heading.add_run("III. Сведения о должниках гражданина").bold = True
    
    p_desc3 = doc.add_paragraph()
    p_desc3.add_run("по денежным обязательствам, НЕ связанным с осуществлением предпринимательской деятельности гражданина").italic = True
    
    doc.add_paragraph("Должников перед гражданином не имеется.")
    
    doc.add_paragraph()
    doc.add_paragraph()
    
    # Подпись
    p_signature = doc.add_paragraph()
    p_signature.add_run(f"Гражданин: {full_name}")
    p_signature.add_run("\t\t_______________")
    
    p_date = doc.add_paragraph()
    p_date.add_run(f"Дата: {datetime.now().strftime('%d.%m.%Y')}")
    
    # Сохранение в base64
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


def generate_property_list_document(
    personal: Dict[str, Any],
    property: Dict[str, Any]
) -> str:
    '''
    Генерирует Приложение №2 - Опись имущества гражданина
    по форме из Приказа Минэкономразвития от 05.08.2015 N 530
    '''
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    
    doc = Document()
    
    # Заголовок документа
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p_header.add_run("Приложение № 2\nк приказу Минэкономразвития России\nот 5 августа 2015 г. № 530")
    run.font.size = Pt(10)
    
    doc.add_paragraph()
    
    # Заголовок
    title = doc.add_heading("ОПИСЬ\nимущества гражданина", level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in title.runs:
        run.font.size = Pt(14)
        run.font.bold = True
    
    # Информация о гражданине
    p_citizen = doc.add_paragraph()
    full_name = personal.get('fullName', '_________________________')
    inn = personal.get('inn', '_________________________')
    snils = personal.get('snils', '_________________________')
    
    passport = personal.get('passport', {})
    passport_series = passport.get('series', '__')
    passport_number = passport.get('number', '______')
    passport_issued_by = passport.get('issuedBy', '_________________________')
    passport_issue_date = passport.get('issueDate', '__.__.____')
    
    registration = personal.get('registration', {})
    address = registration.get('address', '_________________________')
    
    p_citizen.add_run(f"Гражданин: {full_name}\n")
    p_citizen.add_run(f"ИНН: {inn}\n")
    p_citizen.add_run(f"СНИЛС: {snils}\n")
    p_citizen.add_run(f"Паспорт: серия {passport_series} номер {passport_number}, выдан {passport_issued_by} {passport_issue_date}\n")
    p_citizen.add_run(f"Адрес регистрации: {address}")
    
    doc.add_paragraph()
    
    # I. Недвижимое имущество
    section1_heading = doc.add_paragraph()
    section1_heading.add_run("I. Недвижимое имущество").bold = True
    
    table1 = doc.add_table(rows=1, cols=7)
    table1.style = 'Table Grid'
    
    # Заголовки таблицы недвижимости
    headers1 = table1.rows[0].cells
    headers1[0].text = "№ п/п"
    headers1[1].text = "Вид и наименование имущества"
    headers1[2].text = "Вид собственности"
    headers1[3].text = "Местонахождение (адрес)"
    headers1[4].text = "Площадь (кв. м)"
    headers1[5].text = "Основание приобретения и стоимость"
    headers1[6].text = "Сведения о залоге и залогодержателе"
    
    # Форматирование заголовков
    for cell in headers1:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Заполнение данными о недвижимости
    real_estate = property.get('realEstate', []) if property else []
    
    if real_estate:
        for idx, item in enumerate(real_estate, 1):
            row = table1.add_row().cells
            row[0].text = str(idx)
            row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            item_type = item.get('type', 'недвижимость')
            row[1].text = item_type
            
            row[2].text = "Индивидуальная"
            
            item_address = item.get('address', 'не указано')
            row[3].text = item_address
            
            area = item.get('area', 0)
            land_area = item.get('landArea', 0)
            if land_area:
                row[4].text = f"Дом: {area}\nУчасток: {land_area}"
            else:
                row[4].text = str(area)
            
            cadastral = item.get('cadastralNumber', 'не указано')
            value = format_number(item.get('value', 0))
            row[5].text = f"Кадастровый номер: {cadastral}\nСтоимость: {value} руб."
            
            if item.get('isSoleResidence', False):
                row[6].text = "Единственное жилье, не подлежит реализации"
            else:
                row[6].text = "Не обременено"
            
            # Форматирование ячеек
            for cell in row:
                cell.paragraphs[0].runs[0].font.size = Pt(9)
    else:
        row = table1.add_row().cells
        row[0].text = "-"
        row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row[1].text = "Недвижимое имущество отсутствует"
        row[2].text = "-"
        row[3].text = "-"
        row[4].text = "-"
        row[5].text = "-"
        row[6].text = "-"
    
    doc.add_paragraph()
    
    # II. Транспортные средства
    section2_heading = doc.add_paragraph()
    section2_heading.add_run("II. Транспортные средства").bold = True
    
    table2 = doc.add_table(rows=1, cols=7)
    table2.style = 'Table Grid'
    
    # Заголовки таблицы транспортных средств
    headers2 = table2.rows[0].cells
    headers2[0].text = "№ п/п"
    headers2[1].text = "Вид, марка, модель"
    headers2[2].text = "Год выпуска"
    headers2[3].text = "Идентификационный номер (VIN)"
    headers2[4].text = "Регистрационный номер"
    headers2[5].text = "Место нахождения"
    headers2[6].text = "Сведения о залоге"
    
    # Форматирование заголовков
    for cell in headers2:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Заполнение данными о транспортных средствах
    vehicles = property.get('vehicles', []) if property else []
    
    if vehicles:
        for idx, vehicle in enumerate(vehicles, 1):
            row = table2.add_row().cells
            row[0].text = str(idx)
            row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            vehicle_type = vehicle.get('type', 'Автомобиль')
            brand = vehicle.get('brand', '')
            model = vehicle.get('model', '')
            row[1].text = f"{vehicle_type} {brand} {model}"
            
            year = vehicle.get('year', '')
            row[2].text = str(year)
            row[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            vin = vehicle.get('vin', 'не указан')
            row[3].text = vin
            
            reg_number = vehicle.get('registrationNumber', 'не указан')
            row[4].text = reg_number
            row[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            row[5].text = address
            
            row[6].text = "Не обременено"
            
            # Форматирование ячеек
            for cell in row:
                cell.paragraphs[0].runs[0].font.size = Pt(9)
    else:
        row = table2.add_row().cells
        row[0].text = "-"
        row[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row[1].text = "Транспортные средства отсутствуют"
        row[2].text = "-"
        row[3].text = "-"
        row[4].text = "-"
        row[5].text = "-"
        row[6].text = "-"
    
    doc.add_paragraph()
    
    # III. Иное имущество
    section3_heading = doc.add_paragraph()
    section3_heading.add_run("III. Иное ценное имущество").bold = True
    
    table3 = doc.add_table(rows=1, cols=4)
    table3.style = 'Table Grid'
    
    headers3 = table3.rows[0].cells
    headers3[0].text = "№ п/п"
    headers3[1].text = "Вид имущества"
    headers3[2].text = "Описание"
    headers3[3].text = "Стоимость"
    
    for cell in headers3:
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Пустая строка (иное имущество обычно отсутствует)
    row3 = table3.add_row().cells
    row3[0].text = "-"
    row3[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    row3[1].text = "Иное ценное имущество отсутствует"
    row3[2].text = "-"
    row3[3].text = "0"
    row3[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    doc.add_paragraph()
    doc.add_paragraph()
    
    # Примечание
    p_note = doc.add_paragraph()
    p_note.add_run("Примечание: ").bold = True
    p_note.add_run("В соответствии с п. 3 ст. 213.25 Федерального закона \"О несостоятельности (банкротстве)\" и ст. 446 ГПК РФ, единственное пригодное для постоянного проживания помещение не подлежит реализации.")
    p_note.paragraph_format.first_line_indent = Cm(1)
    
    doc.add_paragraph()
    
    # Подпись
    p_signature = doc.add_paragraph()
    p_signature.add_run(f"Гражданин: {full_name}")
    p_signature.add_run("\t\t_______________")
    
    p_date = doc.add_paragraph()
    p_date.add_run(f"Дата: {datetime.now().strftime('%d.%m.%Y')}")
    
    # Сохранение в base64
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')


def generate_bankruptcy_application(
    personal: Dict[str, Any],
    credit: Dict[str, Any],
    income: Dict[str, Any],
    property: Dict[str, Any]
) -> str:
    '''Генерирует текст заявления о банкротстве (устарело, используйте DOCX/PDF)'''
    return "Используйте формат DOCX или PDF для генерации документа"