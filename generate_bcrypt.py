import bcrypt

# Password
password = b"Lizik110808!"

# Generate hash
generated_hash = bcrypt.hashpw(password, bcrypt.gensalt())

# Verify immediately
if bcrypt.checkpw(password, generated_hash):
    print(generated_hash.decode('utf-8'))
else:
    print("ERROR: Hash generation failed")
