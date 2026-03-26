from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, trucks, bookings, reviews

app = FastAPI(title="TruckHub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth.router, prefix="/api/auth")
app.include_router(trucks.router, prefix="/api/trucks")
app.include_router(bookings.router, prefix="/api/bookings")
app.include_router(reviews.router, prefix="/api/reviews")


@app.get("/api/health")
def health():
    return {"status": "ok"}
