from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.core.config import settings
from app.core.security import generate_otp, hash_otp, verify_otp_hash, create_access_token
from app.db.mongodb import db_manager
from app.services.email_service import send_otp_email
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    email = req.email.lower().strip()
    
    # Generate 6-digit OTP
    otp_code = generate_otp()
    hashed = hash_otp(otp_code, email)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    # Store in MongoDB (with TTL index)
    await db_manager.save_otp(email, hashed, expires_at)
    
    # Send email (or dev console fallback)
    result = await send_otp_email(email, otp_code)
    
    return {
        "success": True,
        "message": f"Verification code sent to {email}",
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES,
        "dev_otp": result.get("dev_otp") # Populated if in dev mode
    }

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    email = req.email.lower().strip()
    code = req.otp.strip()
    
    record = await db_manager.get_otp(email)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found for this email, or code has expired. Please request a new code."
        )
    
    # Check attempts
    if record.get("attempts", 0) >= 5:
        await db_manager.delete_otp(email)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many invalid attempts. Please request a new verification code."
        )
    
    # Verify hash
    is_valid = verify_otp_hash(code, email, record["hashed_otp"])
    if not is_valid:
        await db_manager.increment_otp_attempts(email)
        attempts_left = 5 - (record.get("attempts", 0) + 1)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {attempts_left} attempt(s) remaining."
        )
    
    # Verification success: Delete OTP & Upsert User
    await db_manager.delete_otp(email)
    user = await db_manager.upsert_user(email)
    
    # Issue JWT
    token = create_access_token(data={"sub": email})
    
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.get("id"),
            "email": email
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
            "last_login": current_user.get("last_login")
        }
    }
