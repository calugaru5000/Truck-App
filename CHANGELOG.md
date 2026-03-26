# Changelog

All notable changes to TruckHub are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] — 2026-03-26

### Changed — Backend rewritten from Node.js/Express to Python/FastAPI

**Why this migration was made:**

- **Ecosystem & readability** — Python's syntax is more readable for data-heavy server logic. SQLite queries, data validation, and business rules all become cleaner with Python's native types and Pydantic models.
- **Built-in type validation** — FastAPI uses Pydantic models, so every request body is automatically validated and documented with no extra code. In the Express version, all validation was done manually with `if (!field)` checks.
- **Auto-generated API docs** — FastAPI automatically generates interactive Swagger UI at `/docs` and a ReDoc page at `/redoc`. This makes testing and exploring the API significantly easier.
- **Dependency injection** — FastAPI's `Depends()` system cleanly handles authentication, database connections, and role checks per-route, replacing Express middleware chains.
- **Same database, zero data migration** — Python's built-in `sqlite3` module reads the exact same `truck_app.db` file. No schema changes, no data loss.
- **No native build issues** — The original backend was switched from `better-sqlite3` to `node:sqlite` to avoid native compilation. Python's `sqlite3` is a pure built-in with no build step at all.
- **Python is the dominant language in backend and data work** — Aligning the backend with Python improves long-term maintainability and opens the door for future data features (analytics, ML recommendations, etc.).

### Added
- `backend/main.py` — FastAPI application entry point (replaces `server.js`)
- `backend/database.py` — SQLite connection factory using built-in `sqlite3` with `row_factory` for dict-like rows (replaces `db.js`)
- `backend/auth.py` — JWT creation and `Depends()`-based auth guards using `python-jose` and `fastapi.security.HTTPBearer` (replaces `middleware/auth.js`)
- `backend/routers/auth.py` — Register, login, and `/me` routes with `passlib` bcrypt hashing (replaces `routes/auth.js`)
- `backend/routers/trucks.py` — Full truck CRUD with dynamic query building and owner stats route (replaces `routes/trucks.js`)
- `backend/routers/bookings.py` — Booking creation with conflict detection, customer/owner views, status update (replaces `routes/bookings.js`)
- `backend/routers/reviews.py` — Truck reviews, create and delete with ownership validation (replaces `routes/reviews.js`)
- `backend/requirements.txt` — Python dependencies: `fastapi`, `uvicorn[standard]`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`

### Changed
- `start-app.bat` — Backend launch command changed from `node server.js` to `python -m uvicorn main:app --reload --port 5000`; also now shows the auto-docs URL (`http://localhost:5000/docs`)

### Kept (unchanged)
- All frontend React code — zero changes required; the API contract is identical
- `backend/truck_app.db` — same SQLite database file, fully compatible
- All route paths and HTTP methods remain the same

### Node.js backend files retained
The original `server.js`, `db.js`, `middleware/`, and `routes/` JS files are kept in the repository for reference but are no longer used. The new entry point is `main.py`.

---

## [1.2.0] — 2026-03-26

### Added
- **Romanian / English language toggle** — full UI translation for both languages across all pages and components
- `src/i18n/translations.js` — centralised EN/RO string table covering navigation, all pages, status labels, and truck types
- `src/context/LangContext.jsx` — `LangProvider` and `useLang()` hook; selected language persisted in `localStorage`
- Language toggle button (🇷🇴 / 🇬🇧) in the Navbar, visible on desktop and mobile
- `REQUIREMENTS.md` — comprehensive project specification (functional requirements, DB schema, API reference, tech stack)
- `CHANGELOG.md` — this file
- `start-app.bat` — double-click launcher that opens the backend and frontend in separate terminal windows simultaneously

### Changed
- `Home.jsx` — truck type links now use translated labels
- `TruckCard.jsx` — type badge, availability label, and capacity unit are now translated
- `TruckList.jsx` — all filter labels, placeholders, and result counts are translated
- `TruckDetail.jsx` — all labels, booking CTA section, and info badges are translated
- `BookingPage.jsx` — all form labels, price estimate, and success screen are translated
- `OwnerDashboard.jsx` — dashboard stats, tab labels, booking action buttons, and status badges are translated
- `CustomerDashboard.jsx` — booking stats, action buttons, and review modal are translated
- `AddEditTruck.jsx` — all form fields, placeholders, and submit buttons are translated
- `Navbar.jsx` — nav links and user role badge are translated; language toggle added
- `App.jsx` — wrapped with `LangProvider`

---

## [1.1.0] — 2026-03-26

### Added
- **Full frontend** built with React 18 + Vite + TailwindCSS + React Router v6
- `AuthContext.jsx` — JWT-based auth state management with `localStorage` persistence
- `Navbar.jsx` — sticky navigation bar with auth-aware links and mobile hamburger menu
- `StarRating.jsx` — interactive and read-only star rating component (1–5 stars)
- `TruckCard.jsx` — truck summary card with type badge, rating, capacity, and price
- `ReviewCard.jsx` — individual review card showing rating, comment, and reviewer name
- `Home.jsx` — landing page with hero section, feature grid, truck type browser, and owner CTA
- `Login.jsx` — email/password login form with show/hide password toggle
- `Register.jsx` — registration form with role selector (Customer / Owner)
- `TruckList.jsx` — truck browsing page with location search, type filter, price range, availability toggle, and active filter tags
- `TruckDetail.jsx` — full truck detail page with owner info, sticky booking sidebar, and reviews list
- `BookingPage.jsx` — booking form with date picker, live price estimate, and success confirmation screen
- `OwnerDashboard.jsx` — owner control panel with fleet stats, trucks tab (add/edit/delete), and bookings tab (confirm/decline/complete)
- `CustomerDashboard.jsx` — customer booking history with status badges, cancel action, and review modal
- `AddEditTruck.jsx` — truck create/edit form with all fields and availability toggle
- `App.jsx` — client-side routing with protected routes for owner and customer roles
- `vite.config.js` — Vite dev server with `/api` proxy to backend on port 5000
- `tailwind.config.js` — custom `brand` colour palette (orange/amber tones)

### Changed
- `README.md` created with setup instructions, project structure, and API reference

---

## [1.0.0] — 2026-03-26

### Added
- **Initial backend** built with Node.js + Express
- `db.js` — SQLite database initialisation using Node.js built-in `node:sqlite` (`DatabaseSync`); creates all tables on first run
- Database schema: `users`, `trucks`, `bookings`, `reviews` with foreign key constraints
- `middleware/auth.js` — JWT authentication middleware and role-based access (`requireOwner`, `requireCustomer`)
- `routes/auth.js` — `POST /register`, `POST /login`, `GET /me`
- `routes/trucks.js` — full CRUD for trucks; public listing with filters (type, location, price, availability); owner-specific route
- `routes/bookings.js` — booking creation with overlap conflict check, customer booking history, owner incoming bookings, status update
- `routes/reviews.js` — public truck reviews, post review (completed bookings only, one per booking), delete own review
- `server.js` — Express app with CORS, JSON body parsing, route mounting, and `/api/health` endpoint
- `package.json` — dependencies: express, cors, jsonwebtoken, bcryptjs
- `backend/.env` support via `JWT_SECRET` environment variable (defaults to development key)
