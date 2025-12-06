import bcrypt

# Password and hash
password = "Lizik110808!"
hash_str = "$2b$12$VXJxGmqJ7K8LZvWRKZzxWeQNBTYvB7EKxWLxK4VJ6F0nC5M9.0.rS"

# Convert to bytes
password_bytes = password.encode('utf-8')
hash_bytes = hash_str.encode('utf-8')

# Verify
result = bcrypt.checkpw(password_bytes, hash_bytes)
print(result)
