import hashlib
import time
from datetime import datetime, timedelta

expires_date = (datetime.now() + timedelta(days=365)).isoformat()
tokens = []

for i in range(1000):
    unique_string = f"{time.time()}{i}{hash(time.time())}"
    token = f"CHAT_{hashlib.sha256(unique_string.encode()).hexdigest()[:32].upper()}"
    tokens.append(f"('{token}', '{expires_date}')")
    time.sleep(0.001)  # Чтобы time.time() менялось

# Разбиваем на части по 100 токенов (чтобы не превысить лимит SQL)
chunks = [tokens[i:i+100] for i in range(0, len(tokens), 100)]

for idx, chunk in enumerate(chunks):
    values = ',\n'.join(chunk)
    sql = f"""-- Part {idx+1}/10
INSERT INTO chat_tokens_pool (token, expires_at) VALUES
{values}
ON CONFLICT (token) DO NOTHING;
"""
    with open(f'tokens_part_{idx+1}.sql', 'w') as f:
        f.write(sql)

print(f"Generated {len(tokens)} tokens in 10 SQL files")
