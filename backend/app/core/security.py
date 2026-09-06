import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from app.core.config import settings

def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    code = secrets.randbelow(900000) + 100000
    return str(code)

def hash_otp(otp: str, email: str) -> str:
    """Hash the OTP with salt/email to prevent storage of plain text OTPs."""
    salted = f"{email}:{otp}:{settings.JWT_SECRET}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()

def verify_otp_hash(plain_otp: str, email: str, hashed_otp: str) -> bool:
    """Verify submitted plain OTP against stored hash."""
    expected_hash = hash_otp(plain_otp, email)
    return secrets.compare_digest(expected_hash, hashed_otp)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
