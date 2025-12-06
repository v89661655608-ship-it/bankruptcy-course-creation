#!/bin/bash

echo "Testing SMTP Email Delivery Function"
echo "======================================"
echo ""
echo "URL: https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37"
echo "Method: POST"
echo ""
echo "Request Payload:"
echo '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}'
echo ""
echo "======================================"
echo ""

curl -v -X POST https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37 \
  -H "Content-Type: application/json" \
  -d '{"email":"golosova1989@internet.ru","name":"Валентина","amount":1}' \
  2>&1
