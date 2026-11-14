import pyotp
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, 
    get_current_user, require_role
)
from app.core.audit import log_audit
from app.models.user import User
from app.models.site import Site
from app.schemas.auth import (
    LoginRequest, Token, UserResponse, SetupWizardRequest, PasswordChangeRequest
)
from app.schemas.settings import TotpSetupResponse, TotpVerifyRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalars().first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    # Check 2FA if enabled
    if user.totp_enabled:
        if not req.totp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="2FA_REQUIRED"
            )
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(req.totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA code"
            )
    
    token = create_access_token({"sub": user.username, "role": user.role})
    await log_audit(db, user.username, user.role, "USER_LOGIN", "User", {"username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "is_first_run_completed": user.is_first_run_completed
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/setup-wizard")
async def complete_setup_wizard(
    req: SetupWizardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Create or update primary site
    new_site = Site(
        name=req.site_name,
        domain_or_host=req.domain_or_host,
        upstream_url=req.upstream_url,
        security_mode=req.security_mode,
        health_score=85
    )
    db.add(new_site)
    current_user.is_first_run_completed = True
    await db.commit()
    await log_audit(
        db, current_user.username, current_user.role, 
        "SETUP_WIZARD_COMPLETED", "Site", {"site_name": req.site_name}
    )
    return {"status": "success", "message": "First-run setup completed", "site_id": new_site.id}

@router.post("/change-password")
async def change_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid old password")
    current_user.password_hash = get_password_hash(req.new_password)
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "PASSWORD_CHANGED", "User")
    return {"status": "success", "message": "Password updated successfully"}

@router.post("/totp/setup", response_model=TotpSetupResponse)
async def setup_totp(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    await db.commit()
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.username,
        issuer_name="PatchShield"
    )
    return {"secret": secret, "provisioning_uri": uri}

@router.post("/totp/verify")
async def verify_totp(
    req: TotpVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup has not been initiated")
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(req.code):
        raise HTTPException(status_code=400, detail="Invalid TOTP verification code")
    current_user.totp_enabled = True
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "2FA_ENABLED", "User")
    return {"status": "success", "message": "2FA successfully enabled"}
