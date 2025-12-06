# SMTP Email Delivery Test Instructions

## Function Details
- **Function Name**: resend-email
- **Function URL**: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
- **Purpose**: Resend consultation confirmation email manually
- **Backend Location**: `/backend/resend-email/index.py`

## Test Request

### Method
POST

### URL
```
https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}
```

## How to Run the Test

### Option 1: Using Node.js (Recommended)
```bash
node test-smtp.js
```

### Option 2: Using Python
```bash
python3 test_smtp.py
```

### Option 3: Using curl
```bash
curl -v -X POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
  -H "Content-Type: application/json" \
  -d '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}'
```

### Option 4: Using bash script
```bash
bash test-smtp.sh
```

## Expected Responses

### Success Response (Status 200)
```json
{
  "success": true,
  "message": "Email sent to golosova1989@internet.ru"
}
```

**Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`

### Error Response - Missing Email (Status 400)
```json
{
  "error": "Email is required"
}
```

### Error Response - SMTP Configuration Issue (Status 500)
```json
{
  "error": "SMTP credentials not configured",
  "type": "Exception",
  "traceback": "..."
}
```

### Error Response - SMTP Connection Issue (Status 500)
```json
{
  "error": "...",
  "type": "SMTPException",
  "traceback": "..."
}
```

## Function Logic

The function performs the following steps:

1. **Validates Request**: Checks if email is provided
2. **Extracts Parameters**:
   - `email`: Recipient email address (required)
   - `name`: Recipient name (defaults to "Клиент")
   - `amount`: Payment amount (defaults to 0)
3. **Sends Email**: Uses SMTP to send HTML email with consultation confirmation
4. **Returns Response**: Returns success or error with full traceback

## Environment Variables Required

The function requires these environment variables to be set:
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (default: 465)
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password

## Email Content

The email sent includes:
- Subject: "Оплата консультации подтверждена — bankrot-kurs.ru"
- Beautiful HTML template with:
  - Payment confirmation
  - Payment amount
  - WhatsApp contact button
  - Instructions for booking consultation

## Test Files Created

1. **test-smtp.js** - Node.js test script (async/await)
2. **test_smtp.py** - Python test script with detailed output
3. **test-smtp.sh** - Bash script using curl
4. **SMTP_TEST_INSTRUCTIONS.md** - This file

## Troubleshooting

### Connection Timeout
If you get a connection timeout, check:
- Network connectivity
- Firewall settings
- Function URL is correct

### Status 500 with SMTP Error
If you get status 500 with SMTP-related error:
- Check SMTP credentials are configured
- Verify SMTP server is accessible
- Check SMTP credentials are valid

### Status 400
- Make sure email field is provided in request body
- Verify JSON is valid

## Next Steps After Test

1. Check the response status code
2. If status is 200, check the email inbox at `golosova1989@internet.ru`
3. Verify email was received with correct content
4. If there's an error, examine the traceback for details
