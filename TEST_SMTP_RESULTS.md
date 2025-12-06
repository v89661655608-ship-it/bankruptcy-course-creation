# SMTP Email Delivery Test Results

## Test Execution Command

To test the SMTP email delivery function, run:

```bash
node test-smtp.js
```

## Test Configuration

**Function URL:**
```
https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
```

**Request Method:** POST

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}
```

## Expected Output Format

### Successful Test Execution

```
======================================================================
SMTP EMAIL DELIVERY TEST - resend-email function
======================================================================

URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
Method: POST

Request Payload:
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}

======================================================================
Sending request...

======================================================================
RESPONSE
======================================================================

Status Code: 200 OK

Response Headers:
  content-type: application/json
  access-control-allow-origin: *
  content-length: 78
  date: Fri, 06 Dec 2024 XX:XX:XX GMT
  server: Yandex Cloud Functions

Response Body:
{
  "success": true,
  "message": "Email sent to golosova1989@internet.ru"
}

======================================================================
```

### Error Response - Missing Email (Status 400)

```
======================================================================
SMTP EMAIL DELIVERY TEST - resend-email function
======================================================================

URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
Method: POST

Request Payload:
{
  "name": "Валентина",
  "amount": 1
}

======================================================================
Sending request...

======================================================================
RESPONSE
======================================================================

Status Code: 400 Bad Request

Response Headers:
  content-type: application/json
  access-control-allow-origin: *
  content-length: 32
  date: Fri, 06 Dec 2024 XX:XX:XX GMT

Response Body:
{
  "error": "Email is required"
}

======================================================================
ERROR: Response was not OK (status: 400)
======================================================================
```

### Error Response - SMTP Configuration Issue (Status 500)

```
======================================================================
SMTP EMAIL DELIVERY TEST - resend-email function
======================================================================

URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
Method: POST

Request Payload:
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}

======================================================================
Sending request...

======================================================================
RESPONSE
======================================================================

Status Code: 500 Internal Server Error

Response Headers:
  content-type: application/json
  access-control-allow-origin: *
  content-length: 523
  date: Fri, 06 Dec 2024 XX:XX:XX GMT

Response Body:
{
  "error": "SMTP credentials not configured",
  "type": "Exception",
  "traceback": "Traceback (most recent call last):\n  File \"/function/code/index.py\", line 47, in handler\n    send_consultation_confirmation_email(user_email, user_name, amount)\n  File \"/function/code/index.py\", line 77, in send_consultation_confirmation_email\n    raise Exception('SMTP credentials not configured')\nException: SMTP credentials not configured\n"
}

======================================================================
ERROR: Response was not OK (status: 500)
======================================================================
```

### Error Response - SMTP Connection/Authentication Failure (Status 500)

```
======================================================================
SMTP EMAIL DELIVERY TEST - resend-email function
======================================================================

URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
Method: POST

Request Payload:
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}

======================================================================
Sending request...

======================================================================
RESPONSE
======================================================================

Status Code: 500 Internal Server Error

Response Headers:
  content-type: application/json
  access-control-allow-origin: *
  content-length: 1234
  date: Fri, 06 Dec 2024 XX:XX:XX GMT

Response Body:
{
  "error": "(535, b'5.7.8 Error: authentication failed: authentication failure')",
  "type": "SMTPAuthenticationError",
  "traceback": "Traceback (most recent call last):\n  File \"/function/code/index.py\", line 47, in handler\n    send_consultation_confirmation_email(user_email, user_name, amount)\n  File \"/function/code/index.py\", line 146, in send_consultation_confirmation_email\n    server.login(smtp_user, smtp_password)\n  File \"/usr/lib/python3.9/smtplib.py\", line 746, in login\n    raise last_exception\n  File \"/usr/lib/python3.9/smtplib.py\", line 735, in login\n    (code, resp) = self.auth(\n  File \"/usr/lib/python3.9/smtplib.py\", line 658, in auth\n    raise SMTPAuthenticationError(code, resp)\nsmtplib.SMTPAuthenticationError: (535, b'5.7.8 Error: authentication failed: authentication failure')\n"
}

======================================================================
ERROR: Response was not OK (status: 500)
======================================================================
```

### Network Error - Connection Timeout

```
======================================================================
SMTP EMAIL DELIVERY TEST - resend-email function
======================================================================

URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
Method: POST

Request Payload:
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}

======================================================================
Sending request...

======================================================================
EXCEPTION OCCURRED
======================================================================

Error Type: TypeError
Error Message: fetch failed

Stack Trace:
TypeError: fetch failed
    at node:internal/deps/undici/undici:12618:11
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async testSMTP (file:///path/to/test-smtp.js:XX:XX)

======================================================================
```

## Response Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | Success | Email was successfully sent to recipient |
| 400 | Bad Request | Missing required `email` field in request body |
| 500 | Internal Server Error | Function execution error (SMTP config, connection, auth, etc.) |

## Test Files Available

1. **test-smtp.js** - Node.js test script (recommended)
2. **test_smtp.py** - Python test script
3. **test-smtp.sh** - Bash script using curl
4. **SMTP_TEST_INSTRUCTIONS.md** - Detailed instructions
5. **TEST_SMTP_RESULTS.md** - This file (expected results)

## How to Interpret Results

### ✅ Success (Status 200)
- **What it means:** Email was successfully sent through SMTP
- **Next step:** Check inbox at `golosova1989@internet.ru` for the email
- **Email subject:** "Оплата консультации подтверждена — bankrot-kurs.ru"
- **Email contains:** 
  - Payment confirmation
  - Amount paid (1.00 ₽)
  - WhatsApp contact button
  - Instructions for booking consultation

### ❌ Error (Status 400)
- **What it means:** Invalid request - missing email field
- **Fix:** Ensure request body includes `email` field
- **Example fix:**
  ```json
  {
    "email": "golosova1989@internet.ru",
    "name": "Валентина",
    "amount": 1
  }
  ```

### ❌ Error (Status 500)
- **What it means:** Server-side error during execution
- **Common causes:**
  1. **SMTP credentials not configured**
     - Missing environment variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
  2. **SMTP authentication failed**
     - Invalid credentials
     - Expired password
     - Account locked
  3. **SMTP connection failed**
     - SMTP server unreachable
     - Network issues
     - Firewall blocking port 465
  4. **Email sending failed**
     - Invalid recipient email format
     - Recipient email blocked
     - Rate limit exceeded

- **How to debug:** Check the `traceback` field in response body for exact error location and cause

### ❌ Network Error
- **What it means:** Cannot connect to function URL
- **Common causes:**
  1. Function is down or unreachable
  2. Network connectivity issues
  3. DNS resolution failure
  4. Firewall blocking request
- **Fix:** 
  - Check internet connection
  - Verify function URL is correct
  - Try again after a few minutes

## Backend Function Details

**Location:** `/backend/resend-email/index.py`

**Purpose:** Manually resend consultation confirmation email to a customer

**Environment Variables Required:**
- `SMTP_HOST` - SMTP server hostname (e.g., smtp.yandex.ru)
- `SMTP_PORT` - SMTP server port (default: 465 for SSL)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASSWORD` - SMTP password

**Email Template Features:**
- Beautiful HTML design with gradients
- Personalized greeting with customer name
- Payment amount confirmation
- WhatsApp contact button (WhatsApp: +7 966 165 56 08)
- Professional signature
- Mobile-responsive layout

## Troubleshooting Steps

### If test fails with Status 500:

1. **Check the traceback field in response**
   ```json
   {
     "error": "...",
     "type": "ExceptionType",
     "traceback": "Full Python traceback here..."
   }
   ```

2. **Common errors and solutions:**

   | Error Type | Error Message | Solution |
   |-----------|---------------|----------|
   | Exception | SMTP credentials not configured | Set environment variables in function config |
   | SMTPAuthenticationError | authentication failed | Update SMTP credentials |
   | SMTPConnectError | Cannot connect to SMTP server | Check SMTP_HOST and SMTP_PORT |
   | socket.gaierror | Name or service not known | Verify SMTP_HOST is correct |
   | SMTPRecipientsRefused | Recipient address rejected | Verify email format is valid |

3. **Verify SMTP configuration:**
   - Check function environment variables
   - Test SMTP credentials manually
   - Verify SMTP server is accessible

4. **Test with curl for raw output:**
   ```bash
   curl -v -X POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
     -H "Content-Type: application/json" \
     -d '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}'
   ```

### If email is not received:

1. Check spam/junk folder
2. Verify recipient email is correct
3. Check function response was Status 200
4. Wait a few minutes (email delivery delay)
5. Check email server logs if available

## Expected Email Content

When test is successful (Status 200), the recipient should receive an email with:

**Subject:**
```
Оплата консультации подтверждена — bankrot-kurs.ru
```

**From:**
```
melni-v@yandex.ru (or configured SMTP_USER)
```

**To:**
```
golosova1989@internet.ru
```

**Content:**
- Green gradient header with "✅ Оплата получена!"
- Personalized greeting: "Здравствуйте, Валентина!"
- Payment confirmation: "Ваш платёж на сумму 1.00 ₽ успешно получен"
- Green WhatsApp button linking to: https://wa.me/79661655608
- Instructions to contact via WhatsApp
- Professional footer with signature from Валентина Голосова

## Alternative Testing Methods

### Using Postman
1. Create new POST request
2. URL: `https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "email": "golosova1989@internet.ru",
     "name": "Валентина",
     "amount": 1
   }
   ```
5. Send request
6. Review response

### Using Python Requests
```python
import requests
import json

url = 'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37'
payload = {
    'email': 'golosova1989@internet.ru',
    'name': 'Валентина',
    'amount': 1
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
```

### Using HTTPie
```bash
http POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
  email=golosova1989@internet.ru \
  name=Валентина \
  amount:=1
```

## Summary

This document describes all possible outcomes when testing the SMTP email delivery function. To run the actual test and see real results, execute:

```bash
node test-smtp.js
```

The test will output EXACTLY what the function returns, including:
- HTTP status code
- All response headers
- Complete response body
- Any errors or exceptions with full tracebacks
