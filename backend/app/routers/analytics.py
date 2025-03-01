from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import date, timedelta
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student
from ..models.grade import Grade, Attendance
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={401: {"description": "Not authenticated"}},
)

class GradeDistribution(BaseModel):
    grade_letter: str
    count: int

class AttendanceRate(BaseModel):
    date: date
    present_count: int
    absent_count: int
    rate: float

class SubjectPerformance(BaseModel):
    subject: str
    average_score: float

@router.get("/grade-distribution", response_model=List[GradeDistribution])
def get_grade_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    # Get the distribution of grades
    result = db.query(
        Grade.grade_letter, 
        func.count(Grade.id).label("count")
    ).group_by(Grade.grade_letter).all()
    
    return [{"grade_letter": grade, "count": count} for grade, count in result]

@router.get("/attendance-rate", response_model=List[AttendanceRate])
def get_attendance_rate(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    # Calculate the date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Get daily attendance rates
    attendance_data = []
    current_date = start_date
    
    while current_date <= end_date:
        present_count = db.query(Attendance).filter(
            Attendance.date == current_date,
            Attendance.present == True
        ).count()
        
        absent_count = db.query(Attendance).filter(
            Attendance.date == current_date,
            Attendance.present == False
        ).count()
        
        total = present_count + absent_count
        rate = present_count / total if total > 0 else 0
        
        attendance_data.append({
            "date": current_date,
            "present_count": present_count,
            "absent_count": absent_count,
            "rate": rate
        })
        
        current_date += timedelta(days=1)
    
    return attendance_data

@router.get("/subject-performance", response_model=List[SubjectPerformance])
def get_subject_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")
    
    # Get average scores by subject
    result = db.query(
        Grade.subject,
        func.avg(Grade.score).label("average_score")
    ).group_by(Grade.subject).all()
    
    return [{"subject": subject, "average_score": float(avg_score)} for subject, avg_score in result]

@router.get("/student-performance/{student_id}", response_model=Dict[str, Any])
def get_student_performance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's performance")
    
    # Get the student's grades
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()
    
    # Calculate average score by subject
    subject_scores = {}
    for grade in grades:
        if grade.subject not in subject_scores:
            subject_scores[grade.subject] = []
        subject_scores[grade.subject].append(grade.score)
    
    subject_averages = {
        subject: sum(scores) / len(scores) 
        for subject, scores in subject_scores.items()
    }
    
    # Get attendance rate
    present_count = db.query(Attendance).filter(
        Attendance.student_id == student_id,
        Attendance.present == True
    ).count()
    
    total_attendance = db.query(Attendance).filter(
        Attendance.student_id == student_id
    ).count()
    
    attendance_rate = present_count / total_attendance if total_attendance > 0 else 0
    
    return {
        "student_id": student_id,
        "student_name": f"{student.first_name} {student.last_name}",
        "subject_averages": subject_averages,
        "overall_average": sum(subject_averages.values()) / len(subject_averages) if subject_averages else 0,
        "attendance_rate": attendance_rate
    }