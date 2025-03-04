# backend/app/routers/analytics.py - Enhanced dashboard stats endpoint

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User, UserRole
from ..models.student import Student, Class, Teacher, student_class
from ..models.grade import Grade, Attendance
from ..models.fee import Fee
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={401: {"description": "Not authenticated"}},
)

class DashboardStatsResponse(BaseModel):
    student_count: int
    teacher_count: int
    parent_count: int
    class_count: int
    financial_summary: Dict[str, float]
    attendance_today: Dict[str, Any]

@router.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive dashboard statistics"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    # Count users by role
    student_count = db.query(Student).count()
    teacher_count = db.query(Teacher).count()
    parent_count = db.query(User).filter(User.role == UserRole.PARENT).count()
    class_count = db.query(Class).count()
    
    # Get financial summary
    fee_summary = db.query(
        func.sum(Fee.amount).label("total_amount"),
        func.sum(Fee.paid).label("total_paid")
    ).first()
    
    total_amount = fee_summary.total_amount or 0
    total_paid = fee_summary.total_paid or 0
    total_balance = float(total_amount) - float(total_paid)
    payment_rate = (float(total_paid) / float(total_amount) * 100) if total_amount > 0 else 0
    
    # Get today's attendance
    today = date.today()
    
    # Get counts by status
    attendance_counts = db.query(
        Attendance.status,
        func.count(Attendance.id).label("count")
    ).filter(
        Attendance.date == today
    ).group_by(
        Attendance.status
    ).all()
    
    attendance_stats = {
        "present": 0,
        "absent": 0,
        "late": 0,
        "excused": 0,
        "total": student_count,
        "rate": 0
    }
    
    for status, count in attendance_counts:
        if status in attendance_stats:
            attendance_stats[status] = count
    
    # Calculate total checked in and attendance rate
    total_checked = sum(attendance_stats[status] for status in ["present", "absent", "late", "excused"])
    attendance_stats["total"] = max(total_checked, student_count)
    
    if total_checked > 0:
        attendance_stats["rate"] = (attendance_stats["present"] / total_checked) * 100
    
    return {
        "student_count": student_count,
        "teacher_count": teacher_count,
        "parent_count": parent_count,
        "class_count": class_count,
        "financial_summary": {
            "total_amount": float(total_amount),
            "total_paid": float(total_paid),
            "total_balance": float(total_balance),
            "payment_rate": float(payment_rate)
        },
        "attendance_today": attendance_stats
    }