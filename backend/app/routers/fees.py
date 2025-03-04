# backend/app/routers/fees.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student
from ..models.fee import Fee
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/fees",
    tags=["fees"],
    responses={401: {"description": "Not authenticated"}},
)

# Pydantic models for request/response
class FeeBase(BaseModel):
    amount: float
    description: str
    due_date: date
    paid: float = 0.0
    status: str
    term: str
    academic_year: str

class FeeCreate(FeeBase):
    pass

class FeeResponse(FeeBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class FeeSummary(BaseModel):
    total_amount: float
    total_paid: float
    total_balance: float
    payment_rate: float

class DailySummary(BaseModel):
    collected: float
    pending: float

class ChartData(BaseModel):
    monthlyCollection: List[Dict[str, Any]]
    statusDistribution: List[Dict[str, Any]]

@router.post("/{student_id}", response_model=FeeResponse)
def create_fee(
    student_id: int,
    fee: FeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to manage fees")
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_fee = Fee(
        student_id=student_id,
        amount=fee.amount,
        description=fee.description,
        due_date=fee.due_date,
        paid=fee.paid,
        status=fee.status,
        term=fee.term,
        academic_year=fee.academic_year
    )
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.get("/all", response_model=List[FeeResponse])
def read_all_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all fees in the system"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view all fees")
    
    fees = db.query(Fee).all()
    return fees

@router.get("/summary", response_model=FeeSummary)
def get_fee_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a summary of all fees"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view fee summary")
    
    # Calculate total amount, total paid, and balance
    result = db.query(
        func.sum(Fee.amount).label("total_amount"),
        func.sum(Fee.paid).label("total_paid")
    ).first()
    
    total_amount = result.total_amount or 0
    total_paid = result.total_paid or 0
    total_balance = total_amount - total_paid
    payment_rate = (total_paid / total_amount * 100) if total_amount > 0 else 0
    
    return {
        "total_amount": total_amount,
        "total_paid": total_paid,
        "total_balance": total_balance,
        "payment_rate": payment_rate
    }

@router.get("/summary", response_model=DailySummary)
def get_daily_summary(
    date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get fee summary for a specific date"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view fee summary")
    
    # This is a placeholder - in a real system, you would track payments by date
    # For demonstration, returning random data based on the date
    # In a real implementation, you would query the payment transactions table
    
    # Just as a demo, generate some random values based on the day of month
    day_of_month = date.day
    collected = day_of_month * 150.0  # More collection later in the month
    pending = max(0, 3000 - collected)  # Less pending later in the month
    
    return {
        "collected": collected,
        "pending": pending
    }

@router.get("/chart-data", response_model=ChartData)
def get_chart_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get data for fee charts"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view fee data")
    
    # Monthly collection - in a real system, you would aggregate by payment date
    # For demonstration, generating sample data
    # In a real implementation, you would query the payment transactions table
    
    # Get current month and year
    current_date = datetime.now()
    current_month = current_date.month
    current_year = current_date.year
    
    # Create data for the last 6 months
    monthly_collection = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(5, -1, -1):
        month_index = (current_month - i - 1) % 12
        month = month_names[month_index]
        
        # Query the database for payments in this month
        # This is just placeholder logic - replace with actual query in a real system
        monthly_collection.append({
            "month": month,
            "amount": 1500 + (i * 200)  # Increasing trend for demo
        })
    
    # Status distribution
    status_counts = db.query(
        Fee.status,
        func.count(Fee.id).label("count")
    ).group_by(Fee.status).all()
    
    status_distribution = [
        {"status": status, "count": count}
        for status, count in status_counts
    ]
    
    # If no data, provide sample data
    if not status_distribution:
        status_distribution = [
            {"status": "paid", "count": 35},
            {"status": "pending", "count": 12},
            {"status": "overdue", "count": 8}
        ]
    
    return {
        "monthlyCollection": monthly_collection,
        "statusDistribution": status_distribution
    }

@router.get("/{student_id}", response_model=List[FeeResponse])
def read_student_fees(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's fees")
    
    fees = db.query(Fee).filter(Fee.student_id == student_id).all()
    return fees

@router.put("/{fee_id}", response_model=FeeResponse)
def update_fee(
    fee_id: int,
    fee_update: FeeBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to update fees")
    
    db_fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if db_fee is None:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    # Update fee attributes
    for key, value in fee_update.dict().items():
        setattr(db_fee, key, value)
    
    db.commit()
    db.refresh(db_fee)
    return db_fee