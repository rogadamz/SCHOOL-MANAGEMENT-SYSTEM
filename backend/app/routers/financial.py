# backend/app/routers/financial.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date, extract
from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student, Class
from ..models.fee import Fee
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/financial",
    tags=["financial"],
    responses={401: {"description": "Not authenticated"}},
)

class FeeSummary(BaseModel):
    total_amount: float
    total_paid: float
    total_balance: float
    payment_rate: float
    student_count: int
    paid_count: int
    partial_count: int
    unpaid_count: int

class MonthlyCollection(BaseModel):
    month: str
    amount: float

class FeeStatusCount(BaseModel):
    status: str
    count: int

class FeeChartData(BaseModel):
    monthly_collection: List[MonthlyCollection]
    status_distribution: List[FeeStatusCount]

@router.get("/summary", response_model=FeeSummary)
async def get_fee_summary(
    term: str = None,
    academic_year: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a summary of fee collection status"""
    query = db.query(Fee)
    
    if term:
        query = query.filter(Fee.term == term)
    
    if academic_year:
        query = query.filter(Fee.academic_year == academic_year)
    
    # Get total amounts
    fee_summary = query.with_entities(
        func.sum(Fee.amount).label("total_amount"),
        func.sum(Fee.paid).label("total_paid")
    ).first()
    
    total_amount = float(fee_summary.total_amount or 0)
    total_paid = float(fee_summary.total_paid or 0)
    total_balance = total_amount - total_paid
    payment_rate = (total_paid / total_amount * 100) if total_amount > 0 else 0
    
    # Get student payment status counts
    all_fees = query.all()
    student_count = len(set(fee.student_id for fee in all_fees))
    
    # Group fees by student to determine payment status
    student_payment_status = {}
    for fee in all_fees:
        if fee.student_id not in student_payment_status:
            student_payment_status[fee.student_id] = {
                "total": 0,
                "paid": 0
            }
        
        student_payment_status[fee.student_id]["total"] += fee.amount
        student_payment_status[fee.student_id]["paid"] += fee.paid
    
    # Count students by payment status
    paid_count = 0
    partial_count = 0
    unpaid_count = 0
    
    for student_id, status in student_payment_status.items():
        payment_ratio = status["paid"] / status["total"] if status["total"] > 0 else 0
        
        if payment_ratio >= 0.99:  # Consider as fully paid (allowing for small rounding errors)
            paid_count += 1
        elif payment_ratio > 0:
            partial_count += 1
        else:
            unpaid_count += 1
    
    return {
        "total_amount": total_amount,
        "total_paid": total_paid,
        "total_balance": total_balance,
        "payment_rate": payment_rate,
        "student_count": student_count,
        "paid_count": paid_count,
        "partial_count": partial_count,
        "unpaid_count": unpaid_count
    }

@router.get("/chart-data", response_model=FeeChartData)
async def get_fee_chart_data(
    academic_year: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get data for fee charts on the dashboard"""
    # Get monthly collection data
    # In a real system with payment dates, you would use those dates
    # Here we'll use the due_date as a proxy
    
    current_year = datetime.now().year
    months = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for month in range(1, 13):
        query = db.query(func.sum(Fee.paid).label("amount"))
        
        if academic_year:
            query = query.filter(Fee.academic_year == academic_year)
        
        # Filter by month of due_date
        query = query.filter(extract('month', Fee.due_date) == month)
        
        if academic_year:
            # If academic year is provided, filter by year from that
            year = int(academic_year.split("-")[0])
            query = query.filter(extract('year', Fee.due_date) == year)
        else:
            # Otherwise use current year
            query = query.filter(extract('year', Fee.due_date) == current_year)
        
        result = query.scalar() or 0
        
        months.append({
            "month": month_names[month - 1],
            "amount": float(result)
        })
    
    # Get status distribution
    status_query = db.query(
        Fee.status,
        func.count(Fee.id).label("count")
    ).group_by(Fee.status)
    
    if academic_year:
        status_query = status_query.filter(Fee.academic_year == academic_year)
    
    status_results = status_query.all()
    status_data = []
    
    for status, count in status_results:
        status_data.append({
            "status": status.capitalize(),
            "count": count
        })
    
    return {
        "monthly_collection": months,
        "status_distribution": status_data
    }

@router.get("/student/{student_id}/fees")
async def get_student_fees(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all fees for a specific student"""
    # First check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if current user is authorized to view this student's fees
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this student's fees")
    
    # Get the fees
    fees = db.query(Fee).filter(Fee.student_id == student_id).all()
    
    result = []
    for fee in fees:
        result.append({
            "id": fee.id,
            "amount": fee.amount,
            "description": fee.description,
            "due_date": fee.due_date.isoformat(),
            "paid": fee.paid,
            "balance": fee.amount - fee.paid,
            "status": fee.status,
            "term": fee.term,
            "academic_year": fee.academic_year
        })
    
    return result

@router.get("/payments-due")
async def get_payments_due(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get upcoming payments due within specified days"""
    
    today = date.today()
    end_date = today + timedelta(days=days)
    
    # Find fees with upcoming due dates that aren't fully paid
    query = db.query(Fee).filter(
        Fee.due_date.between(today, end_date),
        Fee.amount > Fee.paid
    ).order_by(Fee.due_date)
    
    # For parents, only show their children's fees
    if current_user.role == "parent":
        parent_students = db.query(Student).filter(Student.parent_id == current_user.id).all()
        parent_student_ids = [student.id for student in parent_students]
        
        query = query.filter(Fee.student_id.in_(parent_student_ids))
    
    fees = query.all()
    
    result = []
    for fee in fees:
        # Get student information
        student = db.query(Student).filter(Student.id == fee.student_id).first()
        
        if student:
            result.append({
                "id": fee.id,
                "student_name": f"{student.first_name} {student.last_name}",
                "student_id": student.id,
                "amount": fee.amount,
                "balance": fee.amount - fee.paid,
                "description": fee.description,
                "due_date": fee.due_date.isoformat(),
                "days_left": (fee.due_date - today).days,
                "term": fee.term,
                "academic_year": fee.academic_year
            })
    
    return result