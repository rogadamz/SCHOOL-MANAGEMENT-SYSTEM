# backend/app/routers/report_cards.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Student
from ..models.timetable import ReportCard, GradeSummary
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/report-cards",
    tags=["report_cards"],
    responses={401: {"description": "Not authenticated"}},
)

@router.get("/{student_id}")
async def get_student_report_cards(
    student_id: int,
    term: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get report cards for a specific student"""
    # Check if student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if user has access to this student
    if current_user.role == "parent" and student.parent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this student's report cards")
    
    # Build query
    query = db.query(ReportCard).filter(ReportCard.student_id == student_id)
    
    if term:
        query = query.filter(ReportCard.term == term)
    
    if academic_year:
        query = query.filter(ReportCard.academic_year == academic_year)
    
    report_cards = query.all()
    
    # Get grade summaries for each report card
    result = []
    for report_card in report_cards:
        grade_summaries = db.query(GradeSummary).filter(
            GradeSummary.report_card_id == report_card.id
        ).all()
        
        # Convert to dict and add grade summaries
        report_card_dict = {
            "id": report_card.id,
            "student_id": report_card.student_id,
            "term": report_card.term,
            "academic_year": report_card.academic_year,
            "issue_date": report_card.issue_date,
            "teacher_comments": report_card.teacher_comments,
            "principal_comments": report_card.principal_comments,
            "attendance_summary": report_card.attendance_summary,
            "grade_summaries": grade_summaries
        }
        
        result.append(report_card_dict)
    
    return result