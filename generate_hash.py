import bcrypt

password = b'123456'
hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
print(hashed)
