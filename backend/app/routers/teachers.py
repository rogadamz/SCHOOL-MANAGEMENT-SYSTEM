# backend/app/routers/teachers.py - Teacher management endpoints

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User, UserRole
from ..models.student import Teacher, Class
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/teachers",
    tags=["teachers"],
    responses={401: {"description": "Not authenticated"}},
)

# Pydantic models
class TeacherBase(BaseModel):
    specialization: str
    user_id: int

class TeacherCreate(TeacherBase):
    pass

class ClassResponse(BaseModel):
    id: int
    name: str
    grade_level: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class TeacherResponse(TeacherBase):
    id: int
    user: Optional[UserResponse]
    classes: Optional[List[ClassResponse]]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[TeacherResponse])
def get_all_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all teachers with their associated users and classes"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view teachers")
    
    teachers = db.query(Teacher).options(
        # Use SQLAlchemy eager loading to get related data
        # You'd need to import joinedload from sqlalchemy.orm
        # from sqlalchemy.orm import joinedload
        # joinedload(Teacher.user),
        # joinedload(Teacher.classes)
    ).offset(skip).limit(limit).all()
    
    # Handle related data manually if not using joinedload
    for teacher in teachers:
        if not hasattr(teacher, 'user') or teacher.user is None:
            teacher.user = db.query(User).filter(User.id == teacher.user_id).first()
        
        if not hasattr(teacher, 'classes') or teacher.classes is None:
            teacher.classes = db.query(Class).filter(Class.teacher_id == teacher.id).all()
    
    return teachers

@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific teacher by ID"""
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to view teacher details")
    
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Get related data
    teacher.user = db.query(User).filter(User.id == teacher.user_id).first()
    teacher.classes = db.query(Class).filter(Class.teacher_id == teacher.id).all()
    
    return teacher

@router.post("/", response_model=TeacherResponse)
def create_teacher(
    teacher: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new teacher profile"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create teachers")
    
    # Check if user exists and is a teacher
    user = db.query(User).filter(User.id == teacher.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != UserRole.TEACHER:
        raise HTTPException(status_code=400, detail="User is not a teacher")
    
    # Check if teacher profile already exists
    existing_teacher = db.query(Teacher).filter(Teacher.user_id == teacher.user_id).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Teacher profile already exists for this user")
    
    # Create new teacher profile
    db_teacher = Teacher(**teacher.dict())
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    
    # Get related data
    db_teacher.user = user
    db_teacher.classes = []
    
    return db_teacher

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int,
    teacher_update: TeacherBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a teacher's profile"""
    if current_user.role != "admin" and current_user.id != teacher_update.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this teacher")
    
    # Check if teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Update teacher profile
    for key, value in teacher_update.dict().items():
        setattr(db_teacher, key, value)
    
    db.commit()
    db.refresh(db_teacher)
    
    # Get related data
    db_teacher.user = db.query(User).filter(User.id == db_teacher.user_id).first()
    db_teacher.classes = db.query(Class).filter(Class.teacher_id == db_teacher.id).all()
    
    return db_teacher

@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a teacher profile"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete teachers")
    
    # Check if teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Remove teacher profile (but not the user account)
    db.delete(db_teacher)
    db.commit()
    
    return None