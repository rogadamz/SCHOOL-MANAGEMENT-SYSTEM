# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student, Class, Teacher
from ..models.grade import Grade, Attendance
from ..models.fee import Fee

# Import models from timetable.py instead of separate files
from ..models.timetable import TimeSlot, Event, Message, ReportCard, GradeSummary, LearningMaterial, ClassMaterial

from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    responses={401: {"description": "Not authenticated"}},
)

class DashboardSummary(BaseModel):
    student_count: int
    teacher_count: int
    parent_count: int
    class_count: int
    financial_summary: Dict[str, float]
    attendance_today: Dict[str, Any]
    recent_events: List[Dict[str, Any]]
    latest_messages: List[Dict[str, Any]]
    resource_count: int

@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all dashboard summary data in a single call"""
    
    # Student count
    student_count = db.query(func.count(Student.id)).scalar() or 0
    
    # Teacher count
    teacher_count = db.query(func.count(Teacher.id)).scalar() or 0
    
    # Parent count
    parent_count = db.query(func.count(User.id)).filter(User.role == "parent").scalar() or 0
    
    # Class count
    class_count = db.query(func.count(Class.id)).scalar() or 0
    
    # Financial summary
    fee_summary = db.query(
        func.sum(Fee.amount).label("total_amount"),
        func.sum(Fee.paid).label("total_paid")
    ).first()
    
    total_amount = float(fee_summary.total_amount or 0)
    total_paid = float(fee_summary.total_paid or 0)
    total_balance = total_amount - total_paid
    payment_rate = (total_paid / total_amount * 100) if total_amount > 0 else 0
    
    # Today's attendance
    today = date.today()
    
    # Get attendance by status
    attendance_stats = {
        "present": 0,
        "absent": 0,
        "late": 0,
        "excused": 0,
        "total": student_count,
        "rate": 0
    }
    
    # Count attendance by status
    attendance_counts = db.query(
        Attendance.status,
        func.count(Attendance.id).label("count")
    ).filter(
        Attendance.date == today
    ).group_by(
        Attendance.status
    ).all()
    
    for status, count in attendance_counts:
        if status in attendance_stats:
            attendance_stats[status] = count
    
    # Calculate attendance rate
    total_marked = sum(attendance_stats[status] for status in ["present", "absent", "late", "excused"])
    attendance_stats["total"] = max(total_marked, student_count)
    attendance_stats["rate"] = (attendance_stats["present"] / attendance_stats["total"] * 100) if attendance_stats["total"] > 0 else 0
    
    # Recent events (next 5 events)
    recent_events = db.query(Event).filter(
        Event.start_date >= today
    ).order_by(Event.start_date).limit(5).all()
    
    events_data = []
    for event in recent_events:
        creator = db.query(User).filter(User.id == event.created_by).first()
        events_data.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_date": event.start_date.isoformat(),
            "end_date": event.end_date.isoformat() if event.end_date else None,
            "all_day": event.all_day,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location": event.location,
            "event_type": event.event_type,
            "creator_name": creator.full_name if creator else "Unknown"
        })
    
    # Latest messages (for admin, get all; for others, get their messages)
    if current_user.role == "admin":
        latest_messages = db.query(Message).order_by(desc(Message.sent_at)).limit(5).all()
    else:
        latest_messages = db.query(Message).filter(
            or_(
                Message.recipient_id == current_user.id,
                Message.sender_id == current_user.id
            )
        ).order_by(desc(Message.sent_at)).limit(5).all()
    
    messages_data = []
    for message in latest_messages:
        sender = db.query(User).filter(User.id == message.sender_id).first()
        recipient = db.query(User).filter(User.id == message.recipient_id).first()
        
        messages_data.append({
            "id": message.id,
            "subject": message.subject,
            "content": message.content[:50] + "..." if len(message.content) > 50 else message.content,
            "sent_at": message.sent_at.isoformat(),
            "read": message.read,
            "sender_name": sender.full_name if sender else "Unknown",
            "recipient_name": recipient.full_name if recipient else "Unknown"
        })
    
    # Count learning resources
    resource_count = db.query(func.count(LearningMaterial.id)).scalar() or 0
    
    return {
        "student_count": student_count,
        "teacher_count": teacher_count,
        "parent_count": parent_count,
        "class_count": class_count,
        "financial_summary": {
            "total_amount": total_amount,
            "total_paid": total_paid,
            "total_balance": total_balance,
            "payment_rate": payment_rate
        },
        "attendance_today": attendance_stats,
        "recent_events": events_data,
        "latest_messages": messages_data,
        "resource_count": resource_count
    }

@router.get("/events")
async def get_events(
    start_date: date = None,
    end_date: date = None,
    event_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get events within a date range"""
    query = db.query(Event)
    
    if start_date:
        query = query.filter(Event.start_date >= start_date)
    
    if end_date:
        query = query.filter(Event.end_date <= end_date)
    
    if event_type:
        query = query.filter(Event.event_type == event_type)
    
    events = query.order_by(Event.start_date).all()
    
    result = []
    for event in events:
        creator = db.query(User).filter(User.id == event.created_by).first()
        
        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start_date": event.start_date.isoformat(),
            "end_date": event.end_date.isoformat() if event.end_date else None,
            "all_day": event.all_day,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location": event.location,
            "event_type": event.event_type,
            "creator_name": creator.full_name if creator else "Unknown"
        })
    
    return result

@router.get("/calendar-day")
async def get_calendar_day_summary(
    day_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance, events, and financial data for a specific calendar day"""
    
    # Get attendance data for this day
    attendance_stats = {
        "present": 0,
        "absent": 0,
        "late": 0,
        "excused": 0,
        "total": 0,
        "rate": 0
    }
    
    # Count attendance by status
    attendance_counts = db.query(
        Attendance.status,
        func.count(Attendance.id).label("count")
    ).filter(
        Attendance.date == day_date
    ).group_by(
        Attendance.status
    ).all()
    
    student_count = db.query(func.count(Student.id)).scalar() or 0
    
    for status, count in attendance_counts:
        if status in attendance_stats:
            attendance_stats[status] = count
    
    # Calculate attendance rate
    total_marked = sum(attendance_stats[status] for status in ["present", "absent", "late", "excused"])
    attendance_stats["total"] = max(total_marked, student_count)
    attendance_stats["rate"] = (attendance_stats["present"] / attendance_stats["total"] * 100) if attendance_stats["total"] > 0 else 0
    
    # Get events for this day
    events = db.query(Event).filter(
        and_(
            Event.start_date <= day_date,
            Event.end_date >= day_date
        )
    ).all()
    
    events_data = []
    for event in events:
        creator = db.query(User).filter(User.id == event.created_by).first()
        events_data.append({
            "id": event.id,
            "title": event.title,
            "event_type": event.event_type,
            "all_day": event.all_day,
            "creator_name": creator.full_name if creator else "Unknown"
        })
    
    # Get fee payments made on this day
    # Note: In a real system, you would need a payment transactions table
    # This is a placeholder calculation based on fee due dates
    fee_data = {
        "collected": 0,
        "pending": 0
    }
    
    fees_due = db.query(Fee).filter(Fee.due_date == day_date).all()
    
    for fee in fees_due:
        fee_data["collected"] += fee.paid
        fee_data["pending"] += (fee.amount - fee.paid)
    
    return {
        "date": day_date.isoformat(),
        "attendance": attendance_stats,
        "events": events_data,
        "fees": fee_data,
        "has_data": bool(total_marked > 0 or events_data or fees_due)
    }