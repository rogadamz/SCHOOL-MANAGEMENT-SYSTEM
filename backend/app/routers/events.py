# backend/app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..services.database import get_db
from ..models.user import User
from ..models.timetable import Event
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={401: {"description": "Not authenticated"}},
)

@router.get("/")
async def get_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all events, optionally filtered by date range"""
    query = db.query(Event)
    
    if start_date:
        query = query.filter(Event.start_date >= start_date)
    
    if end_date:
        query = query.filter(Event.end_date <= end_date)
    
    events = query.all()
    return events

@router.get("/{event_id}")
async def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific event by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event