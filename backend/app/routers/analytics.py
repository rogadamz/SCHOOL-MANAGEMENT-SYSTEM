from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract, and_, or_
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User, UserRole
from ..models.student import Student, Class, Teacher, student_class
from ..models.grade import Grade, Attendance
from ..models.fee import Fee
from ..utils.auth_utils import get_current_active_user

# Initialize the router
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

# Define new response model for dashboard charts
class DashboardChartsResponse(BaseModel):
    attendance_data: List[Dict[str, Any]]
    grade_distribution: List[Dict[str, Any]]
    performance_trends: List[Dict[str, Any]]
    fee_collection: List[Dict[str, Any]]
    fee_distribution: List[Dict[str, Any]]

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

@router.get("/dashboard-charts", response_model=DashboardChartsResponse)
def get_dashboard_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    time_period: str = "6m"  # Default to 6 months
):
    """Get all chart data for the dashboard"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    # Get attendance data for the specified time period
    today = date.today()
    
    # Determine time period in days
    if time_period == "1y":
        days_ago = 365
    elif time_period == "3m":
        days_ago = 90
    else:  # Default to 6m
        days_ago = 180
    
    start_date = today - timedelta(days=days_ago)
    
    # Generate attendance data points (weekly)
    attendance_data = []
    
    # Get weekly attendance using status field
    weekly_attendance = db.query(
        func.date_trunc('week', Attendance.date).label('week'),
        func.sum(case((Attendance.status == 'present', 1), else_=0)).label('present'),
        func.sum(case((Attendance.status == 'absent', 1), else_=0)).label('absent')
    ).filter(
        Attendance.date >= start_date
    ).group_by(
        func.date_trunc('week', Attendance.date)
    ).order_by(
        func.date_trunc('week', Attendance.date)
    ).all()
    
    for week, present, absent in weekly_attendance:
        if week:
            attendance_data.append({
                "date": week.strftime("%b %d"),
                "present": int(present or 0),
                "absent": int(absent or 0)
            })
    
    # Get grade distribution
    grade_distribution = db.query(
        Grade.grade_letter.label("grade"),
        func.count(Grade.id).label("count")
    ).group_by(
        Grade.grade_letter
    ).all()
    
    grade_data = [{"grade": grade, "count": count} for grade, count in grade_distribution]
    
    # If no grade data, provide fallback sample data
    if not grade_data:
        grade_data = [
            {"grade": "A", "count": 30},
            {"grade": "B", "count": 45},
            {"grade": "C", "count": 28},
            {"grade": "D", "count": 15},
            {"grade": "F", "count": 5},
        ]
    
    # Get performance trends (monthly average scores)
    performance_data = []
    months_to_analyze = 6  # Last 6 months
    
    for month_offset in range(months_to_analyze-1, -1, -1):
        month_date = today - timedelta(days=30 * month_offset)
        month_name = month_date.strftime("%b")
        
        # Get average scores by month
        monthly_grades = db.query(
            func.avg(Grade.score).label("avg_score"),
            func.max(Grade.score).label("max_score"),
            func.min(Grade.score).label("min_score")
        ).filter(
            extract('month', Grade.date_recorded) == month_date.month,
            extract('year', Grade.date_recorded) == month_date.year
        ).first()
        
        if monthly_grades and monthly_grades.avg_score:
            performance_data.append({
                "month": month_name,
                "averageScore": round(float(monthly_grades.avg_score), 1),
                "highestScore": round(float(monthly_grades.max_score), 1),
                "lowestScore": round(float(monthly_grades.min_score), 1),
                "subject": "Overall"
            })
    
    # If no performance data, provide fallback sample data
    if not performance_data:
        performance_data = [
            {"month": "Jan", "averageScore": 75, "highestScore": 95, "lowestScore": 55, "subject": "Overall"},
            {"month": "Feb", "averageScore": 78, "highestScore": 98, "lowestScore": 58, "subject": "Overall"},
            {"month": "Mar", "averageScore": 80, "highestScore": 96, "lowestScore": 62, "subject": "Overall"},
            {"month": "Apr", "averageScore": 82, "highestScore": 97, "lowestScore": 65, "subject": "Overall"},
            {"month": "May", "averageScore": 79, "highestScore": 94, "lowestScore": 60, "subject": "Overall"},
            {"month": "Jun", "averageScore": 81, "highestScore": 96, "lowestScore": 63, "subject": "Overall"},
        ]
    
    # Get fee collection data (monthly)
    monthly_collection = []
    
    for month_offset in range(months_to_analyze-1, -1, -1):
        month_date = today - timedelta(days=30 * month_offset)
        month_name = month_date.strftime("%b")
        
        # Calculate fees collected for this month
        fees_collected = db.query(
            func.sum(Fee.paid).label("amount")
        ).filter(
            extract('month', Fee.due_date) == month_date.month,
            extract('year', Fee.due_date) == month_date.year
        ).scalar() or 0
        
        monthly_collection.append({
            "month": month_name,
            "amount": float(fees_collected)
        })
    
    # Get fee status distribution
    fee_statuses = db.query(
        Fee.status,
        func.count(Fee.id).label("count")
    ).group_by(
        Fee.status
    ).all()
    
    fee_distribution = [{"status": status, "count": count} for status, count in fee_statuses]
    
    # If there's no fee status data, provide fallback data
    if not fee_distribution:
        fee_distribution = [
            {"status": "paid", "count": 35},
            {"status": "pending", "count": 15},
            {"status": "overdue", "count": 8}
        ]
    
    return {
        "attendance_data": attendance_data,
        "grade_distribution": grade_data,
        "performance_trends": performance_data,
        "fee_collection": monthly_collection,
        "fee_distribution": fee_distribution
    }