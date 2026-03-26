# TruckHub 🚛

A full-stack truck booking platform where customers can browse and book trucks, and owners can list and manage their fleet.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express
- **Database**: SQLite via Node.js built-in `node:sqlite` (requires Node.js 22.5+)
- **Auth**: JWT (jsonwebtoken) + bcryptjs

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
├── backend/          # Express API server
│   ├── server.js
│   ├── db.js         # SQLite setup & schema
│   ├── middleware/
│   │   └── auth.js   # JWT middleware
│   └── routes/
│       ├── auth.js
│       ├── trucks.js
│       ├── bookings.js
│       └── reviews.js
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
- Node.js v22.5.0 or higher (v24+ recommended)

### Backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
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
