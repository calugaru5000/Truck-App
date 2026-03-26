import sqlite3
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from auth import require_owner

router = APIRouter()


class TruckCreate(BaseModel):
    make: str
    model: str
    year: int
    license_plate: str
    capacity_tons: float
    truck_type: str
    price_per_day: float
    description: Optional[str] = None
    location: Optional[str] = None


class TruckUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    capacity_tons: Optional[float] = None
    truck_type: Optional[str] = None
    price_per_day: Optional[float] = None
    description: Optional[str] = None
    location: Optional[str] = None
    is_available: Optional[bool] = None


@router.get("")
def list_trucks(
    type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    available: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
):
    query = """
        SELECT t.*, u.name as owner_name, u.phone as owner_phone,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count
        FROM trucks t
        JOIN users u ON t.owner_id = u.id
        LEFT JOIN reviews r ON r.truck_id = t.id
        WHERE 1=1
    """
    params = []
    if type:
        query += " AND t.truck_type = ?"
        params.append(type)
    if min_price is not None:
        query += " AND t.price_per_day >= ?"
        params.append(min_price)
    if max_price is not None:
        query += " AND t.price_per_day <= ?"
        params.append(max_price)
    if location:
        query += " AND t.location LIKE ?"
        params.append(f"%{location}%")
    if available is not None:
        query += " AND t.is_available = ?"
        params.append(1 if available == "true" else 0)

    query += " GROUP BY t.id ORDER BY t.created_at DESC"
    rows = db.execute(query, params).fetchall()
    return [dict(r) for r in rows]


@router.get("/owner/my-trucks")
def my_trucks(user: dict = Depends(require_owner), db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute(
        """
        SELECT t.*,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) as review_count,
            COUNT(DISTINCT b.id) as booking_count
        FROM trucks t
        LEFT JOIN reviews r ON r.truck_id = t.id
        LEFT JOIN bookings b ON b.truck_id = t.id
        WHERE t.owner_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
        """,
        (user["id"],),
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{truck_id}")
def get_truck(truck_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute(
        """
        SELECT t.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as review_count
        FROM trucks t
        JOIN users u ON t.owner_id = u.id
        LEFT JOIN reviews r ON r.truck_id = t.id
        WHERE t.id = ?
        GROUP BY t.id
        """,
        (truck_id,),
    ).fetchone()
    if not row:
        raise HTTPException(404, "Truck not found")
    return dict(row)


@router.post("", status_code=201)
def create_truck(body: TruckCreate, user: dict = Depends(require_owner), db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute("SELECT id FROM trucks WHERE license_plate = ?", (body.license_plate,)).fetchone()
    if existing:
        raise HTTPException(409, "License plate already registered")

    cur = db.execute(
        """
        INSERT INTO trucks (owner_id, make, model, year, license_plate, capacity_tons,
                            truck_type, price_per_day, description, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (user["id"], body.make, body.model, body.year, body.license_plate,
         body.capacity_tons, body.truck_type, body.price_per_day, body.description, body.location),
    )
    db.commit()
    row = db.execute("SELECT * FROM trucks WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


@router.put("/{truck_id}")
def update_truck(
    truck_id: int,
    body: TruckUpdate,
    user: dict = Depends(require_owner),
    db: sqlite3.Connection = Depends(get_db),
):
    row = db.execute("SELECT * FROM trucks WHERE id = ?", (truck_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Truck not found")
    if row["owner_id"] != user["id"]:
        raise HTTPException(403, "Not your truck")

    is_available_val = None
    if body.is_available is not None:
        is_available_val = 1 if body.is_available else 0

    db.execute(
        """
        UPDATE trucks SET
            make = COALESCE(?, make),
            model = COALESCE(?, model),
            year = COALESCE(?, year),
            license_plate = COALESCE(?, license_plate),
            capacity_tons = COALESCE(?, capacity_tons),
            truck_type = COALESCE(?, truck_type),
            price_per_day = COALESCE(?, price_per_day),
            description = COALESCE(?, description),
            location = COALESCE(?, location),
            is_available = COALESCE(?, is_available)
        WHERE id = ?
        """,
        (body.make, body.model, body.year, body.license_plate, body.capacity_tons,
         body.truck_type, body.price_per_day, body.description, body.location,
         is_available_val, truck_id),
    )
    db.commit()
    updated = db.execute("SELECT * FROM trucks WHERE id = ?", (truck_id,)).fetchone()
    return dict(updated)


@router.delete("/{truck_id}")
def delete_truck(truck_id: int, user: dict = Depends(require_owner), db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM trucks WHERE id = ?", (truck_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Truck not found")
    if row["owner_id"] != user["id"]:
        raise HTTPException(403, "Not your truck")

    db.execute("DELETE FROM trucks WHERE id = ?", (truck_id,))
    db.commit()
    return {"message": "Truck deleted"}
