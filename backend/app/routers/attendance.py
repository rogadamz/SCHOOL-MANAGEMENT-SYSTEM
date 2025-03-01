from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student, Class
from ..models.grade import Attendance
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    responses={401: {"description": "Not authenticated"}},
)

# Pydantic models for request/response
class AttendanceBase(BaseModel):
    student_id: int
    date: date
    status: str  # 'present', 'absent', 'late', 'excused'

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    student_name: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=AttendanceResponse)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a single attendance record"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to record attendance")
    
    # Check if the student exists
    student = db.query(Student).filter(Student.id == attendance.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if there's already an attendance record for this student and date
    existing = db.query(Attendance).filter(
        Attendance.student_id == attendance.student_id,
        Attendance.date == attendance.date
    ).first()
    
    if existing:
        # Update existing record
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new record
    db_attendance = Attendance(
        student_id=attendance.student_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    # Include student name in response
    setattr(db_attendance, "student_name", f"{student.first_name} {student.last_name}")
    
    return db_attendance

@router.post("/batch", response_model=List[AttendanceResponse])
def create_batch_attendance(
    attendances: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create multiple attendance records at once"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to record attendance")
    
    responses = []
    
    for attendance in attendances:
        # Check if the student exists
        student = db.query(Student).filter(Student.id == attendance.student_id).first()
        if not student:
            continue
        
        # Check if there's already an attendance record for this student and date
        existing = db.query(Attendance).filter(
            Attendance.student_id == attendance.student_id,
            Attendance.date == attendance.date
        ).first()
        
        if existing:
            # Update existing record
            existing.status = attendance.status
            db.commit()
            db.refresh(existing)
            
            # Include student name in response
            setattr(existing, "student_name", f"{student.first_name} {student.last_name}")
            responses.append(existing)
        else:
            # Create new record
            db_attendance = Attendance(
                student_id=attendance.student_id,
                date=attendance.date,
                status=attendance.status
            )
            db.add(db_attendance)
            db.commit()
            db.refresh(db_attendance)
            
            # Include student name in response
            setattr(db_attendance, "student_name", f"{student.first_name} {student.last_name}")
            responses.append(db_attendance)
    
    return responses

@router.get("/", response_model=List[AttendanceResponse])
def get_attendance(
    date: date,
    class_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance records for a specific date, optionally filtered by class"""
    # Build query for attendance records on the given date
    query = db.query(Attendance).filter(Attendance.date == date)
    
    # If class_id is provided, filter students by class
    if class_id:
        class_obj = db.query(Class).filter(Class.id == class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Get student IDs in this class
        student_ids = [student.id for student in class_obj.students]
        
        # Filter attendance records for students in this class
        query = query.filter(Attendance.student_id.in_(student_ids))
    
    # Execute query
    attendance_records = query.all()
    
    # Include student names in response
    result = []
    for record in attendance_records:
        student = db.query(Student).filter(Student.id == record.student_id).first()
        if student:
            # Clone the record to add student_name
            record_dict = {
                "id": record.id,
                "student_id": record.student_id,
                "date": record.date,
                "status": record.status,
                "student_name": f"{student.first_name} {student.last_name}"
            }
            result.append(record_dict)
    
    return result

@router.get("/history", response_model=List[AttendanceResponse])
def get_attendance_history(
    class_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance history, optionally filtered by class and date range"""
    # Build base query
    query = db.query(Attendance)
    
    # Apply filters
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    # If class_id is provided, filter students by class
    if class_id:
        class_obj = db.query(Class).filter(Class.id == class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Get student IDs in this class
        student_ids = [student.id for student in class_obj.students]
        
        # Filter attendance records for students in this class
        query = query.filter(Attendance.student_id.in_(student_ids))
    
    # Execute query
    attendance_records = query.order_by(Attendance.date.desc()).all()
    
    # Include student names in response
    result = []
    for record in attendance_records:
        student = db.query(Student).filter(Student.id == record.student_id).first()
        if student:
            # Clone the record to add student_name
            record_dict = {
                "id": record.id,
                "student_id": record.student_id,
                "date": record.date,
                "status": record.status,
                "student_name": f"{student.first_name} {student.last_name}"
            }
            result.append(record_dict)
    
    return result

@router.get("/classes/{class_id}/students", response_model=List[dict])
def get_students_by_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all students in a specific class"""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return [
        {
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "admission_number": student.admission_number
        }
        for student in class_obj.students
    ]