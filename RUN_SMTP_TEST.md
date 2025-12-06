# Quick SMTP Test - Run This Now

## Fastest Way to Test

Copy and paste this command in your terminal:

```bash
node test-smtp.js
```

That's it! The script will make a POST request to the function and show you EXACTLY what it returns.

## What You'll See

The script will output the complete response including:
- ✅ Status code (200 = success, 400 = bad request, 500 = error)
- ✅ All response headers
- ✅ Full response body (JSON)
- ✅ Any error messages and tracebacks

## Test Details

**Testing this function:**
```
https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37
```

**With this data:**
```json
{
  "email": "golosova1989@internet.ru",
  "name": "Валентина",
  "amount": 1
}
```

## Expected Success Response

If everything works, you should see:

```json
{
  "success": true,
  "message": "Email sent to golosova1989@internet.ru"
}
```

Status code: **200**

## If There's an Error

The response will include:
```json
{
  "error": "error message here",
  "type": "ExceptionType",
  "traceback": "full Python traceback..."
}
```

Status code: **500**

## Alternative Commands

If `node` doesn't work, try:

**Python:**
```bash
python3 test_smtp.py
```

**Curl:**
```bash
curl -X POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
  -H "Content-Type: application/json" \
  -d '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}'
```

**Bash:**
```bash
bash test-smtp.sh
```

## What Happens

The function will:
1. Receive your request
2. Validate the email field is present
3. Connect to SMTP server (smtp.yandex.ru)
4. Send an HTML email to `golosova1989@internet.ru`
5. Return success or error response

## Need More Info?

See detailed documentation:
- **SMTP_TEST_INSTRUCTIONS.md** - Complete testing guide
- **TEST_SMTP_RESULTS.md** - All possible response scenarios
- **backend/resend-email/index.py** - Function source code
