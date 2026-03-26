# Changelog

All notable changes to TruckHub are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
