#!/bin/bash

curl -v -X POST 'https://functions.poehali.dev/66d27e23-0698-4d41-8708-9c7e34148508?action=register' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: bankrot_combo_secret_2025' \
  -d '{
  "email": "test@example.com",
  "amount": 4999
}'
