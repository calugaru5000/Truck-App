import sqlite3
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from database import get_db
from auth import create_token, get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    user_type: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: sqlite3.Connection = Depends(get_db)):
    if body.user_type not in ("owner", "customer"):
        raise HTTPException(400, "user_type must be owner or customer")

    existing = db.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
    if existing:
        raise HTTPException(409, "Email already registered")

    password_hash = pwd_context.hash(body.password)
    cur = db.execute(
        "INSERT INTO users (email, password_hash, name, phone, user_type) VALUES (?, ?, ?, ?, ?)",
        (body.email, password_hash, body.name, body.phone, body.user_type),
    )
    db.commit()
    user_id = cur.lastrowid

    token = create_token({"id": user_id, "email": body.email, "name": body.name, "user_type": body.user_type})
    return {
        "token": token,
        "user": {"id": user_id, "email": body.email, "name": body.name, "phone": body.phone, "user_type": body.user_type},
    }


@router.post("/login")
def login(body: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM users WHERE email = ?", (body.email,)).fetchone()
    if not row or not pwd_context.verify(body.password, row["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    token = create_token({"id": row["id"], "email": row["email"], "name": row["name"], "user_type": row["user_type"]})
    return {
        "token": token,
        "user": {"id": row["id"], "email": row["email"], "name": row["name"], "phone": row["phone"], "user_type": row["user_type"]},
    }


@router.get("/me")
def me(user: dict = Depends(get_current_user), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute(
        "SELECT id, email, name, phone, user_type, created_at FROM users WHERE id = ?",
        (user["id"],),
    ).fetchone()
    if not row:
        raise HTTPException(404, "User not found")
    return dict(row)
