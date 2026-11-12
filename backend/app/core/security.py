from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Asymmetric Ed25519 key loading
try:
    private_key_bytes = bytes.fromhex(settings.ED25519_PRIVATE_KEY_HEX)
    SIGNING_PRIVATE_KEY = Ed25519PrivateKey.from_private_bytes(private_key_bytes)
    SIGNING_PUBLIC_KEY = SIGNING_PRIVATE_KEY.public_key()
except Exception:
    SIGNING_PRIVATE_KEY = Ed25519PrivateKey.generate()
    SIGNING_PUBLIC_KEY = SIGNING_PRIVATE_KEY.public_key()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def sign_certificate_payload(payload_str: str) -> str:
    """Signs certificate payload using Ed25519 and returns hex signature."""
    sig = SIGNING_PRIVATE_KEY.sign(payload_str.encode('utf-8'))
    return sig.hex()

def verify_certificate_signature(payload_str: str, signature_hex: str) -> bool:
    """Verifies Ed25519 hex signature against payload string."""
    try:
        sig_bytes = bytes.fromhex(signature_hex)
        SIGNING_PUBLIC_KEY.verify(sig_bytes, payload_str.encode('utf-8'))
        return True
    except Exception:
        return False

