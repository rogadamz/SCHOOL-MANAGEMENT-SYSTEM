from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
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