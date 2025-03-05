# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
import sys
import os

# Add the parent directory to the path so we can import the config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATABASE_URL

# Import models
from .models.user import Base
from .models.student import Student, Class, Teacher
from .models.grade import Grade, Attendance
from .models.fee import Fee
# Import all models from timetable.py (they're all defined in this file)
from .models.timetable import TimeSlot, Event, Message, ReportCard, GradeSummary, LearningMaterial, ClassMaterial

# Import routers
from .routers import auth, students, analytics, fees, attendance
# Import new routers
from .routers import teachers, classes, dashboard, financial
# Conditionally import other routers if they exist
try:
    from .routers import events, messages, report_cards, materials
    has_additional_routers = True
except ImportError:
    has_additional_routers = False

# Create database tables
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Downtown Nursery School Management System",
    description="API for the Downtown Nursery School Management System with the motto: 'We shall reach the shore'",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(analytics.router)
app.include_router(fees.router)
app.include_router(attendance.router)

# Include new routers
app.include_router(teachers.router)
app.include_router(classes.router)
app.include_router(dashboard.router)
app.include_router(financial.router)

# Include additional routers if they exist
if has_additional_routers:
    app.include_router(events.router)
    app.include_router(messages.router)
    app.include_router(report_cards.router)
    app.include_router(materials.router)

@app.get("/")
def read_root():
    return {
        "name": "Downtown Nursery School Management System",
        "motto": "We shall reach the shore",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)