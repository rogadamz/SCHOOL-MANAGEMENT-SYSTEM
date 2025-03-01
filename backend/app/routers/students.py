from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student
from ..models.grade import Grade, Attendance
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/students",
    tags=["students"],
    responses={401: {"description": "Not authenticated"}},
)

# Pydantic models for request/response
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    admission_number: str

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    parent_id: int

    class Config:
        from_attributes = True

class GradeBase(BaseModel):
    subject: str
    score: float
    grade_letter: str
    term: str
    date_recorded: date

class GradeCreate(GradeBase):
    pass

class GradeResponse(GradeBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    present: bool

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

@router.post("/", response_model=StudentResponse)
def create_student(
    student: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_student = Student(
        first_name=student.first_name,
        last_name=student.last_name,
        date_of_birth=student.date_of_birth,
        admission_number=student.admission_number,
        parent_id=current_user.id
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.get("/", response_model=List[StudentResponse])
def read_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "admin" or current_user.role == "teacher":
        students = db.query(Student).offset(skip).limit(limit).all()
    else:
        students = db.query(Student).filter(Student.parent_id == current_user.id).all()
    return students

@router.get("/{student_id}", response_model=StudentResponse)
def read_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student")
    
    return student

@router.post("/{student_id}/grades", response_model=GradeResponse)
def create_grade(
    student_id: int,
    grade: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to add grades")
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_grade = Grade(
        student_id=student_id,
        subject=grade.subject,
        score=grade.score,
        grade_letter=grade.grade_letter,
        term=grade.term,
        date_recorded=grade.date_recorded
    )
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade

@router.get("/{student_id}/grades", response_model=List[GradeResponse])
def read_student_grades(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's grades")
    
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()
    return grades

@router.post("/{student_id}/attendance", response_model=AttendanceResponse)
def record_attendance(
    student_id: int,
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to record attendance")
    
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_attendance = Attendance(
        student_id=student_id,
        date=attendance.date,
        present=attendance.present
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/{student_id}/attendance", response_model=List[AttendanceResponse])
def read_student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's attendance")
    
    attendance = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return attendance