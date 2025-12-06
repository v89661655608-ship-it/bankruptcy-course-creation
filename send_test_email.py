import requests
import json

url = 'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37'

data = {
    'email': 'golosova1989@internet.ru',
    'name': 'Валентина',
    'amount': 1
}

print("Отправка письма...")
print(f"URL: {url}")
print(f"Данные: {json.dumps(data, ensure_ascii=False)}")

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"\nСтатус: {response.status_code}")
    print(f"Ответ: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ Письмо успешно отправлено!")
    else:
        print("\n❌ Ошибка при отправке")
        
except Exception as e:
    print(f"\n❌ Исключение: {e}")
