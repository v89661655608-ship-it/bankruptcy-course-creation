# SMTP Email Delivery Test - Complete Summary

## Quick Start

To test the SMTP email delivery function right now:

```bash
node test-smtp.js
```

This will show you EXACTLY what the backend function returns.

---

## Test Configuration

| Property | Value |
|----------|-------|
| **Function URL** | https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 |
| **Method** | POST |
| **Content-Type** | application/json |
| **Backend Location** | /backend/resend-email/index.py |

**Test Payload:**
```json
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}
```

---

## What the Test Does

1. Makes POST request to the function URL
2. Sends test data with email, name, and amount
3. Function validates the request
4. Function connects to SMTP server
5. Function sends HTML email
6. Returns response with status and message

---

## Response Scenarios

### ✅ Success (Status 200)

**Response:**
```json
{
  "success": true,
  "message": "Email sent to golosova1989@internet.ru"
}
```

**What happens:**
- Email is sent via SMTP
- Recipient receives consultation confirmation
- Email includes payment details and WhatsApp link

---

### ❌ Bad Request (Status 400)

**Response:**
```json
{
  "error": "Email is required"
}
```

**Cause:** Missing `email` field in request body

---

### ❌ Server Error (Status 500)

**Response:**
```json
{
  "error": "Error message",
  "type": "ExceptionType",
  "traceback": "Full Python traceback..."
}
```

**Common Causes:**
- SMTP credentials not configured
- SMTP authentication failed
- SMTP connection timeout
- Invalid email address
- Network issues

---

## Files Created

### Test Scripts
1. **test-smtp.js** - Node.js test (recommended)
2. **test_smtp.py** - Python test alternative
3. **test-smtp.sh** - Bash script with curl

### Documentation
1. **RUN_SMTP_TEST.md** - Quick start guide (⭐ START HERE)
2. **SMTP_TEST_INSTRUCTIONS.md** - Detailed instructions
3. **TEST_SMTP_RESULTS.md** - All response scenarios
4. **SMTP_TEST_SUMMARY.md** - This file

### Backend Function
- **backend/resend-email/index.py** - Function source code
- **backend/resend-email/tests.json** - Test configuration

---

## How to Read Test Results

The test script outputs everything in a clear format:

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

Status Code: [STATUS_HERE]

Response Headers:
  content-type: application/json
  access-control-allow-origin: *
  ...

Response Body:
[FULL_JSON_RESPONSE_HERE]

======================================================================
```

---

## What to Check

### 1. Status Code
- **200** = Success ✅
- **400** = Bad request ❌
- **500** = Server error ❌

### 2. Response Body
- If status 200: Check `success` and `message` fields
- If status 400/500: Check `error` and `traceback` fields

### 3. Email Delivery
- If status 200: Check inbox at `golosova1989@internet.ru`
- Subject: "Оплата консультации подтверждена — bankrot-kurs.ru"
- Check spam folder if not in inbox

---

## Email Content Details

When successful, the email contains:

**Header:**
- Green gradient with "✅ Оплата получена!"

**Body:**
- Greeting: "Здравствуйте, Валентина!"
- Confirmation: "Ваш платёж на сумму 1.00 ₽ успешно получен"
- WhatsApp button: Links to https://wa.me/79661655608
- Instructions to book consultation

**Footer:**
- Signature: Валентина Голосова
- Title: Арбитражный управляющий

---

## Troubleshooting

### Error: "SMTP credentials not configured"
**Fix:** Set environment variables in function configuration:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD

### Error: "authentication failed"
**Fix:** Update SMTP credentials (password may be expired)

### Error: "Cannot connect to SMTP server"
**Fix:** Check SMTP server is accessible and port is open

### No email received after Status 200
**Check:**
1. Spam/junk folder
2. Email address is correct
3. Wait a few minutes for delivery
4. Check email server logs

---

## Alternative Test Methods

### Using curl directly:
```bash
curl -v -X POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
  -H "Content-Type: application/json" \
  -d '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}'
```

### Using Python requests:
```python
import requests
response = requests.post(
    'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37',
    json={'email': 'golosova1989@internet.ru', 'name': 'Валентина', 'amount': 1}
)
print(response.status_code, response.json())
```

### Using Postman/Insomnia:
- Method: POST
- URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
- Header: Content-Type: application/json
- Body: Raw JSON with email, name, amount

---

## Function Logic Flow

```
1. Receive HTTP POST request
   ↓
2. Parse JSON body
   ↓
3. Validate email field exists
   ↓
4. Extract email, name, amount
   ↓
5. Check SMTP environment variables
   ↓
6. Create HTML email with template
   ↓
7. Connect to SMTP server (SSL port 465)
   ↓
8. Authenticate with credentials
   ↓
9. Send email message
   ↓
10. Return success response (200)
   
   OR
   
   Return error response (400/500) with traceback
```

---

## Environment Variables

The function requires these variables to work:

| Variable | Description | Example |
|----------|-------------|---------|
| SMTP_HOST | SMTP server hostname | smtp.yandex.ru |
| SMTP_PORT | SMTP server port (SSL) | 465 |
| SMTP_USER | SMTP username/email | melni-v@yandex.ru |
| SMTP_PASSWORD | SMTP password | ********** |

---

## Response Fields

### Success Response (200)
```json
{
  "success": true,        // Always true on success
  "message": "Email sent to [email]"  // Confirmation message
}
```

### Error Response (400)
```json
{
  "error": "Email is required"  // Error description
}
```

### Error Response (500)
```json
{
  "error": "Error message",     // Error description
  "type": "ExceptionType",       // Python exception class
  "traceback": "Stack trace..."  // Full Python traceback
}
```

---

## Next Steps

1. **Run the test:**
   ```bash
   node test-smtp.js
   ```

2. **Check the output:**
   - Look at status code
   - Read response body
   - Note any errors

3. **If Status 200:**
   - Check email inbox
   - Verify email content
   - Confirm WhatsApp link works

4. **If Status 500:**
   - Read the traceback
   - Identify the error type
   - Fix configuration issue
   - Run test again

5. **Document results:**
   - Save the output
   - Note status code
   - Record any errors

---

## Support

For questions or issues:
- Check **TEST_SMTP_RESULTS.md** for detailed error scenarios
- Review **backend/resend-email/index.py** for function code
- Examine traceback in 500 responses for exact error location

---

## Success Criteria

The test is successful when:
- ✅ Status code is 200
- ✅ Response body contains `"success": true`
- ✅ Email is received at golosova1989@internet.ru
- ✅ Email contains correct content (name, amount, WhatsApp link)
- ✅ No errors in function execution

---

**Ready to test? Run:** `node test-smtp.js`
