import sqlite3
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from auth import require_customer

router = APIRouter()


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: Optional[str] = None


@router.get("/truck/{truck_id}")
def truck_reviews(truck_id: int, db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        """
        SELECT r.*, u.name as customer_name
        FROM reviews r
        JOIN users u ON r.customer_id = u.id
        WHERE r.truck_id = ?
        ORDER BY r.created_at DESC
        """,
        (truck_id,),
    ).fetchall()
    return [dict(r) for r in rows]


@router.post("", status_code=201)
def create_review(body: ReviewCreate, user: dict = Depends(require_customer), db: sqlite3.Connection = Depends(get_db)):
    if not (1 <= body.rating <= 5):
        raise HTTPException(400, "Rating must be between 1 and 5")

    booking = db.execute("SELECT * FROM bookings WHERE id = ?", (body.booking_id,)).fetchone()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking["customer_id"] != user["id"]:
        raise HTTPException(403, "You can only review your own bookings")
    if booking["status"] != "completed":
        raise HTTPException(400, "You can only review completed bookings")

    existing = db.execute("SELECT id FROM reviews WHERE booking_id = ?", (body.booking_id,)).fetchone()
    if existing:
        raise HTTPException(409, "You already reviewed this booking")

    cur = db.execute(
        "INSERT INTO reviews (truck_id, customer_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
        (booking["truck_id"], user["id"], body.booking_id, body.rating, body.comment),
    )
    db.commit()

    row = db.execute(
        "SELECT r.*, u.name as customer_name FROM reviews r JOIN users u ON r.customer_id = u.id WHERE r.id = ?",
        (cur.lastrowid,),
    ).fetchone()
    return dict(row)


@router.delete("/{review_id}")
def delete_review(review_id: int, user: dict = Depends(require_customer), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM reviews WHERE id = ?", (review_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Review not found")
    if row["customer_id"] != user["id"]:
        raise HTTPException(403, "Not your review")

    db.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    db.commit()
    return {"message": "Review deleted"}
