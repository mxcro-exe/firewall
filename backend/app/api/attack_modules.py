from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.module_config import AttackModuleSetting
from app.models.user import User
from app.ml.model_runner import ml_subsystem

router = APIRouter(prefix="/attack-modules", tags=["Attack Specific Defense Modules"])

class SensitivityUpdate(BaseModel):
    sensitivity: str  # LOW, MEDIUM, HIGH

class MLTestRequest(BaseModel):
    method: str = "GET"
    path: str = "/api/search"
    query_string: str = ""
    body: str = ""

@router.get("/")
async def list_attack_modules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(AttackModuleSetting))
    return res.scalars().all()

@router.patch("/{module_key}/toggle")
async def toggle_module(
    module_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    res = await db.execute(select(AttackModuleSetting).where(AttackModuleSetting.module_key == module_key))
    setting = res.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Module not found")

    setting.is_enabled = not setting.is_enabled
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "MODULE_TOGGLED", "AttackModuleSetting", {
        "module_key": module_key, "is_enabled": setting.is_enabled
    })
    return {"module_key": module_key, "is_enabled": setting.is_enabled}

@router.put("/{module_key}/sensitivity")
async def update_module_sensitivity(
    module_key: str,
    req: SensitivityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    res = await db.execute(select(AttackModuleSetting).where(AttackModuleSetting.module_key == module_key))
    setting = res.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Module not found")

    setting.sensitivity = req.sensitivity.upper()
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "MODULE_SENSITIVITY_UPDATED", "AttackModuleSetting", {
        "module_key": module_key, "sensitivity": setting.sensitivity
    })
    return {"module_key": module_key, "sensitivity": setting.sensitivity}

@router.get("/ml/status")
async def get_ml_status(current_user: User = Depends(get_current_user)):
    return {
        "is_loaded": ml_subsystem.is_loaded,
        "model_version": ml_subsystem.version,
        "algorithm": "RandomForestClassifier (23 Features) + IsolationForest",
        "supported_classes": [
            "Benign", "SQL_Injection", "XSS", 
            "Path_Traversal", "Command_Injection", "Brute_Force"
        ]
    }

@router.post("/ml/test-inference")
async def run_ml_inference(
    req: MLTestRequest,
    current_user: User = Depends(get_current_user)
):
    result = ml_subsystem.predict(
        method=req.method,
        path=req.path,
        query_string=req.query_string,
        body=req.body
    )
    return result
