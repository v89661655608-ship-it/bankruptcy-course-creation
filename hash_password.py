#!/usr/bin/env python3
"""
Script to hash a password using bcrypt
Usage: python hash_password.py
"""
import bcrypt

# Password to hash
password = '7f57e9e3'

# Hash the password using bcrypt
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Print the hash
print(password_hash)
