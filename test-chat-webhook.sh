#!/bin/bash

echo "Testing chat webhook: 66d27e23-0698-4d41-8708-9c7e34148508"
echo "=========================================="
echo ""

curl -v -X POST 'https://functions.poehali.dev/66d27e23-0698-4d41-8708-9c7e34148508' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: bankrot_combo_secret_2025' \
  -d '{
    "email": "melni-v@yandex.ru",
    "amount": 4999
  }'

echo ""
echo ""
echo "=========================================="
