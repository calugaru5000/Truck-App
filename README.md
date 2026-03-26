# TruckHub 🚛

A full-stack truck booking platform where customers can browse and book trucks, and owners can list and manage their fleet.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + React Router
- **Backend**: Python + FastAPI + uvicorn
- **Database**: SQLite via Python built-in `sqlite3`
- **Auth**: JWT (python-jose) + passlib/bcrypt

## Features

- **Two account types**: Truck Owners & Customers
- **Truck listings**: Browse with filters (type, price, location, availability)
- **Truck management**: Owners can add, edit, delete trucks
- **Booking system**: Customers request bookings; owners confirm/decline/complete
- **Review system**: Customers leave 1–5 star ratings after completed bookings
- **Dashboards**: Separate dashboards for owners and customers

## Project Structure

```
Truck-App/
├── backend/          # FastAPI server (Python)
│   ├── main.py       # App entry point
│   ├── database.py   # SQLite setup & schema
│   ├── auth.py       # JWT helpers & Depends() guards
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py
│       ├── trucks.py
│       ├── bookings.py
│       └── reviews.py
└── frontend/         # React + Vite app
    └── src/
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── TruckCard.jsx
        │   ├── ReviewCard.jsx
        │   └── StarRating.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── TruckList.jsx
            ├── TruckDetail.jsx
            ├── BookingPage.jsx
            ├── OwnerDashboard.jsx
            ├── CustomerDashboard.jsx
            └── AddEditTruck.jsx
```

## Getting Started

### Requirements
- Python 3.11 or higher
- Node.js (for the frontend only)

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 5000
# Runs on http://localhost:5000
# Interactive API docs: http://localhost:5000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (owner or customer) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/trucks` | List trucks (with filters) |
| GET | `/api/trucks/:id` | Get truck detail |
| POST | `/api/trucks` | Add truck (owner only) |
| PUT | `/api/trucks/:id` | Edit truck (owner only) |
| DELETE | `/api/trucks/:id` | Delete truck (owner only) |
| GET | `/api/trucks/owner/my-trucks` | Owner's trucks |
| POST | `/api/bookings` | Create booking (customer only) |
| GET | `/api/bookings/my-bookings` | Customer's bookings |
| GET | `/api/bookings/owner-bookings` | Owner's incoming bookings |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/api/reviews/truck/:truckId` | Get reviews for a truck |
| POST | `/api/reviews` | Submit review (customer, completed bookings only) |
