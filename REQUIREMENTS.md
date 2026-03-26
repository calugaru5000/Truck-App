# TruckHub — Project Requirements

## 1. Project Overview

TruckHub is a full-stack web application that allows users to browse, book, and review trucks and truck rides. The platform supports two types of accounts: **Truck Owners** who list and manage their fleet, and **Customers** who search for and book trucks.

---

## 2. Functional Requirements

### 2.1 Authentication & Accounts

| ID | Requirement |
|----|-------------|
| AUTH-01 | Users can register as either a **Truck Owner** or a **Customer** |
| AUTH-02 | Registration requires: full name, email, password (min 6 chars), optional phone number |
| AUTH-03 | Users log in with email and password |
| AUTH-04 | Sessions are maintained via JWT tokens stored in localStorage |
| AUTH-05 | Authenticated routes redirect unauthenticated users to the login page |
| AUTH-06 | Owner accounts cannot perform customer actions and vice versa |

### 2.2 Truck Management (Owner)

| ID | Requirement |
|----|-------------|
| TRUCK-01 | Owners can add new trucks with: make, model, year, license plate, truck type, capacity (tons), price per day, location, description |
| TRUCK-02 | License plate must be unique across the system |
| TRUCK-03 | Owners can edit any of their truck's details |
| TRUCK-04 | Owners can toggle truck availability on/off |
| TRUCK-05 | Owners can delete a truck (cascades to bookings and reviews) |
| TRUCK-06 | Supported truck types: Flatbed, Tanker, Refrigerated, Box, Dump, Tow, Other |

### 2.3 Truck Browsing (Public)

| ID | Requirement |
|----|-------------|
| BROWSE-01 | All visitors can browse the full truck listing without an account |
| BROWSE-02 | Trucks can be filtered by: type, location (partial match), min/max price, availability |
| BROWSE-03 | Each truck card shows: make/model/year, license plate, type, capacity, location, price/day, owner name, average rating |
| BROWSE-04 | Truck detail page shows full info including owner contact details and all reviews |

### 2.4 Booking System (Customer)

| ID | Requirement |
|----|-------------|
| BOOK-01 | Customers can request a booking by selecting a start and end date |
| BOOK-02 | The system prevents double-booking (conflict check on overlapping date ranges) |
| BOOK-03 | Total price is calculated automatically: `days × price_per_day` |
| BOOK-04 | Customers can add optional notes to a booking request |
| BOOK-05 | New bookings start with status **Pending** |
| BOOK-06 | Customers can cancel their own **Pending** or **Confirmed** bookings |

### 2.5 Booking Management (Owner)

| ID | Requirement |
|----|-------------|
| MGMT-01 | Owners can view all incoming bookings across their fleet |
| MGMT-02 | Owners can **Confirm** or **Decline** pending booking requests |
| MGMT-03 | Owners can mark confirmed bookings as **Completed** |
| MGMT-04 | Booking statuses: `pending` → `confirmed` / `cancelled`, `confirmed` → `completed` / `cancelled` |

### 2.6 Review System (Customer)

| ID | Requirement |
|----|-------------|
| REV-01 | Customers can leave a review only on **Completed** bookings |
| REV-02 | Reviews include a rating from **1 to 5 stars** and an optional text comment |
| REV-03 | Only one review is allowed per booking |
| REV-04 | Reviews are publicly visible on the truck's detail page |
| REV-05 | Average rating and review count are displayed on truck cards and detail pages |

### 2.7 Dashboards

| ID | Requirement |
|----|-------------|
| DASH-01 | **Owner Dashboard** shows: fleet summary, pending booking count, total revenue, average rating, truck list with edit/delete, all bookings with action buttons |
| DASH-02 | **Customer Dashboard** shows: booking stats (total/completed/upcoming), full booking history with status badges, option to cancel or leave a review |

### 2.8 Internationalisation

| ID | Requirement |
|----|-------------|
| I18N-01 | The entire UI supports **English** and **Romanian** languages |
| I18N-02 | Language is toggled via a button in the navigation bar (🇷🇴 / 🇬🇧) |
| I18N-03 | The selected language is persisted in `localStorage` across sessions |

---

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | The application must run locally without internet access (SQLite, no external DB) |
| NFR-02 | Backend API must respond to requests within 500ms under normal load |
| NFR-03 | Passwords must be stored as bcrypt hashes — never in plaintext |
| NFR-04 | JWT tokens expire after 7 days |
| NFR-05 | The frontend must be responsive and usable on mobile devices |
| NFR-06 | No external CSS framework CDN — all styles bundled at build time via TailwindCSS |

---

## 4. Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| email | TEXT UNIQUE | Required |
| password_hash | TEXT | bcrypt hash |
| name | TEXT | Required |
| phone | TEXT | Optional |
| user_type | TEXT | `owner` or `customer` |
| created_at | DATETIME | Auto |

### `trucks`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| owner_id | INTEGER FK | References `users.id` |
| make | TEXT | e.g. Volvo |
| model | TEXT | e.g. FH16 |
| year | INTEGER | e.g. 2022 |
| license_plate | TEXT UNIQUE | e.g. B-123-ABC |
| capacity_tons | REAL | e.g. 20.5 |
| truck_type | TEXT | flatbed / tanker / etc. |
| price_per_day | REAL | In local currency |
| description | TEXT | Optional |
| location | TEXT | Optional, e.g. București |
| is_available | INTEGER | 1 = yes, 0 = no |
| created_at | DATETIME | Auto |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| truck_id | INTEGER FK | References `trucks.id` |
| customer_id | INTEGER FK | References `users.id` |
| start_date | TEXT | ISO date string |
| end_date | TEXT | ISO date string |
| status | TEXT | pending / confirmed / completed / cancelled |
| notes | TEXT | Optional customer notes |
| total_price | REAL | Calculated at booking time |
| created_at | DATETIME | Auto |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| truck_id | INTEGER FK | References `trucks.id` |
| customer_id | INTEGER FK | References `users.id` |
| booking_id | INTEGER FK UNIQUE | References `bookings.id` — one review per booking |
| rating | INTEGER | 1–5 |
| comment | TEXT | Optional |
| created_at | DATETIME | Auto |

---

## 5. API Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | ✅ | Get current user profile |

### Trucks — `/api/trucks`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List trucks (supports filters) |
| GET | `/:id` | — | Get single truck with stats |
| POST | `/` | Owner | Add new truck |
| PUT | `/:id` | Owner | Edit own truck |
| DELETE | `/:id` | Owner | Delete own truck |
| GET | `/owner/my-trucks` | Owner | Get own trucks with stats |

### Bookings — `/api/bookings`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Customer | Create booking request |
| GET | `/my-bookings` | Customer | Get own bookings |
| GET | `/owner-bookings` | Owner | Get bookings for own trucks |
| PATCH | `/:id/status` | Owner/Customer | Update booking status |
| GET | `/:id` | Owner/Customer | Get single booking |

### Reviews — `/api/reviews`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/truck/:truckId` | — | Get reviews for a truck |
| POST | `/` | Customer | Submit review (completed bookings only) |
| DELETE | `/:id` | Customer | Delete own review |

---

## 6. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Axios, Lucide Icons |
| Backend | Node.js, Express 4 |
| Database | SQLite via built-in `node:sqlite` (Node.js ≥ 22.5 required) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| i18n | Custom React context — English & Romanian |

---

## 7. Setup & Running

### Requirements
- Node.js v22.5.0 or higher

### Start Backend
```bash
cd backend
npm install
node server.js
# → http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### One-command Start (Windows)
Double-click `start-app.bat` in the project root to launch both servers simultaneously in separate terminal windows.
