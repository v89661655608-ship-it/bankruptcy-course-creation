#!/usr/bin/env python3
"""Test script for SMTP email delivery function"""

import json
import urllib.request
import urllib.error
from urllib.parse import urljoin

def test_smtp_email():
    url = 'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37'
    
    payload = {
        "email": "golosova1989@internet.ru",
        "name": "Валентина",
        "amount": 1
    }
    
    print("=" * 60)
    print("SMTP Email Delivery Test")
    print("=" * 60)
    print(f"\nURL: {url}")
    print(f"Method: POST")
    print(f"\nRequest Payload:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print("\n" + "=" * 60)
    
    # Prepare request
    data = json.dumps(payload).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Content-Length': str(len(data))
    }
    
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        # Make request
        print("\nMaking request...")
        with urllib.request.urlopen(req) as response:
            # Get response details
            status_code = response.status
            response_headers = dict(response.headers)
            body = response.read().decode('utf-8')
            
            print("\n" + "=" * 60)
            print("RESPONSE")
            print("=" * 60)
            print(f"\nStatus Code: {status_code}")
            print(f"\nResponse Headers:")
            for key, value in response_headers.items():
                print(f"  {key}: {value}")
            
            print(f"\nResponse Body:")
            try:
                body_json = json.loads(body)
                print(json.dumps(body_json, indent=2, ensure_ascii=False))
            except json.JSONDecodeError:
                print(body)
            
            print("\n" + "=" * 60)
            
    except urllib.error.HTTPError as e:
        # Handle HTTP errors
        print("\n" + "=" * 60)
        print("HTTP ERROR RESPONSE")
        print("=" * 60)
        print(f"\nStatus Code: {e.code}")
        print(f"Reason: {e.reason}")
        print(f"\nError Headers:")
        for key, value in dict(e.headers).items():
            print(f"  {key}: {value}")
        
        error_body = e.read().decode('utf-8')
        print(f"\nError Response Body:")
        try:
            error_json = json.loads(error_body)
            print(json.dumps(error_json, indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            print(error_body)
        
        print("\n" + "=" * 60)
        
    except urllib.error.URLError as e:
        print("\n" + "=" * 60)
        print("URL ERROR")
        print("=" * 60)
        print(f"\nError: {e.reason}")
        print("\n" + "=" * 60)
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("EXCEPTION")
        print("=" * 60)
        print(f"\nException Type: {type(e).__name__}")
        print(f"Exception Message: {str(e)}")
        
        import traceback
        print("\nFull Traceback:")
        traceback.print_exc()
        print("\n" + "=" * 60)

if __name__ == '__main__':
    test_smtp_email()
