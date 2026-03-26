import sqlite3
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from auth import get_current_user, require_owner, require_customer

router = APIRouter()


class BookingCreate(BaseModel):
    truck_id: int
    start_date: str
    end_date: str
    notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


@router.post("", status_code=201)
def create_booking(body: BookingCreate, user: dict = Depends(require_customer), db: sqlite3.Connection = Depends(get_db)):
    truck = db.execute("SELECT * FROM trucks WHERE id = ?", (body.truck_id,)).fetchone()
    if not truck:
        raise HTTPException(404, "Truck not found")
    if not truck["is_available"]:
        raise HTTPException(400, "Truck is not available")

    try:
        start = datetime.strptime(body.start_date, "%Y-%m-%d").date()
        end = datetime.strptime(body.end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(400, "Invalid date format, use YYYY-MM-DD")

    if end <= start:
        raise HTTPException(400, "Invalid date range")

    conflict = db.execute(
        """
        SELECT id FROM bookings
        WHERE truck_id = ? AND status IN ('pending','confirmed')
        AND NOT (end_date <= ? OR start_date >= ?)
        """,
        (body.truck_id, body.start_date, body.end_date),
    ).fetchone()
    if conflict:
        raise HTTPException(409, "Truck already booked for that period")

    days = (end - start).days
    total_price = days * truck["price_per_day"]

    cur = db.execute(
        "INSERT INTO bookings (truck_id, customer_id, start_date, end_date, notes, total_price) VALUES (?, ?, ?, ?, ?, ?)",
        (body.truck_id, user["id"], body.start_date, body.end_date, body.notes, total_price),
    )
    db.commit()

    row = db.execute(
        """
        SELECT b.*, t.make, t.model, t.license_plate, u.name as owner_name
        FROM bookings b
        JOIN trucks t ON b.truck_id = t.id
        JOIN users u ON t.owner_id = u.id
        WHERE b.id = ?
        """,
        (cur.lastrowid,),
    ).fetchone()
    return dict(row)


@router.get("/my-bookings")
def my_bookings(user: dict = Depends(require_customer), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        """
        SELECT b.*, t.make, t.model, t.license_plate, t.truck_type, t.price_per_day,
            u.name as owner_name, u.phone as owner_phone,
            r.id as review_id, r.rating, r.comment
        FROM bookings b
        JOIN trucks t ON b.truck_id = t.id
        JOIN users u ON t.owner_id = u.id
        LEFT JOIN reviews r ON r.booking_id = b.id
        WHERE b.customer_id = ?
        ORDER BY b.created_at DESC
        """,
        (user["id"],),
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/owner-bookings")
def owner_bookings(user: dict = Depends(require_owner), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        """
        SELECT b.*, t.make, t.model, t.license_plate, t.truck_type,
            u.name as customer_name, u.phone as customer_phone, u.email as customer_email
        FROM bookings b
        JOIN trucks t ON b.truck_id = t.id
        JOIN users u ON b.customer_id = u.id
        WHERE t.owner_id = ?
        ORDER BY b.created_at DESC
        """,
        (user["id"],),
    ).fetchall()
    return [dict(r) for r in rows]


@router.patch("/{booking_id}/status")
def update_status(
    booking_id: int,
    body: StatusUpdate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    booking = db.execute(
        "SELECT b.*, t.owner_id FROM bookings b JOIN trucks t ON b.truck_id = t.id WHERE b.id = ?",
        (booking_id,),
    ).fetchone()
    if not booking:
        raise HTTPException(404, "Booking not found")

    is_owner = user["user_type"] == "owner" and booking["owner_id"] == user["id"]
    is_customer = user["user_type"] == "customer" and booking["customer_id"] == user["id"]

    if not is_owner and not is_customer:
        raise HTTPException(403, "Access denied")

    allowed_owner = ["confirmed", "cancelled", "completed"]
    allowed_customer = ["cancelled"]

    if is_owner and body.status not in allowed_owner:
        raise HTTPException(400, f"Owner can set status to: {', '.join(allowed_owner)}")
    if is_customer and body.status not in allowed_customer:
        raise HTTPException(400, "Customers can only cancel bookings")

    db.execute("UPDATE bookings SET status = ? WHERE id = ?", (body.status, booking_id))
    db.commit()
    return {"message": "Booking status updated", "status": body.status}


@router.get("/{booking_id}")
def get_booking(booking_id: int, user: dict = Depends(get_current_user), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute(
        """
        SELECT b.*, t.make, t.model, t.license_plate, t.truck_type, t.price_per_day,
            t.owner_id, u_owner.name as owner_name, u_owner.phone as owner_phone,
            u_cust.name as customer_name, u_cust.phone as customer_phone
        FROM bookings b
        JOIN trucks t ON b.truck_id = t.id
        JOIN users u_owner ON t.owner_id = u_owner.id
        JOIN users u_cust ON b.customer_id = u_cust.id
        WHERE b.id = ?
        """,
        (booking_id,),
    ).fetchone()

    if not row:
        raise HTTPException(404, "Booking not found")

    is_owner = user["user_type"] == "owner" and row["owner_id"] == user["id"]
    is_customer = user["user_type"] == "customer" and row["customer_id"] == user["id"]
    if not is_owner and not is_customer:
        raise HTTPException(403, "Access denied")

    return dict(row)
