import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

JWT_SECRET = os.getenv("JWT_SECRET", "truck_app_secret_key_2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

security = HTTPBearer()


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired token")


def require_owner(user: dict = Depends(get_current_user)) -> dict:
    if user.get("user_type") != "owner":
        raise HTTPException(status_code=403, detail="Owner account required")
    return user


def require_customer(user: dict = Depends(get_current_user)) -> dict:
    if user.get("user_type") != "customer":
        raise HTTPException(status_code=403, detail="Customer account required")
    return user
