# backend/app/routers/classes.py - Class management endpoints

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User, UserRole
from ..models.student import Teacher, Class, Student, student_class
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/classes",
    tags=["classes"],
    responses={401: {"description": "Not authenticated"}},
)

# Pydantic models
class ClassBase(BaseModel):
    name: str
    grade_level: str
    teacher_id: int

class ClassCreate(ClassBase):
    pass

class StudentBrief(BaseModel):
    id: int
    first_name: str
    last_name: str
    admission_number: str

    class Config:
        from_attributes = True

class TeacherBrief(BaseModel):
    id: int
    specialization: str
    user_id: int
    user_full_name: Optional[str] = None

    class Config:
        from_attributes = True

class ClassResponse(ClassBase):
    id: int
    teacher: Optional[TeacherBrief]
    students: Optional[List[StudentBrief]]
    student_count: Optional[int]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ClassResponse])
def get_all_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all classes with their associated teachers and student counts"""
    # Everyone can view classes, but the data shown might differ based on role
    
    classes = db.query(Class).offset(skip).limit(limit).all()
    
    # Get related data for each class
    for cls in classes:
        # Get teacher info
        if not hasattr(cls, 'teacher') or cls.teacher is None:
            cls.teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
            
            # Add teacher's user full name
            if cls.teacher:
                teacher_user = db.query(User).filter(User.id == cls.teacher.user_id).first()
                if teacher_user:
                    cls.teacher.user_full_name = teacher_user.full_name
        
        # Get student count
        if not hasattr(cls, 'student_count'):
            cls.student_count = db.query(student_class).filter(student_class.c.class_id == cls.id).count()
        
        # Get students if admin or teacher
        if current_user.role in ["admin", "teacher"]:
            if not hasattr(cls, 'students') or cls.students is None:
                cls.students = db.query(Student).join(
                    student_class, 
                    student_class.c.student_id == Student.id
                ).filter(
                    student_class.c.class_id == cls.id
                ).all()
        else:
            # For parents, only show if their child is in this class
            parent_students = db.query(Student).filter(Student.parent_id == current_user.id).all()
            parent_student_ids = [student.id for student in parent_students]
            
            cls.students = db.query(Student).join(
                student_class, 
                student_class.c.student_id == Student.id
            ).filter(
                student_class.c.class_id == cls.id,
                Student.id.in_(parent_student_ids)
            ).all()
    
    return classes

@router.get("/{class_id}", response_model=ClassResponse)
def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific class by ID with all its students"""
    cls = db.query(Class).filter(Class.id == class_id).first()
    if cls is None:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get teacher info
    cls.teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
    if cls.teacher:
        teacher_user = db.query(User).filter(User.id == cls.teacher.user_id).first()
        if teacher_user:
            cls.teacher.user_full_name = teacher_user.full_name
    
    # Get students based on user role
    if current_user.role in ["admin", "teacher"]:
        # Admins and teachers can see all students
        cls.students = db.query(Student).join(
            student_class, 
            student_class.c.student_id == Student.id
        ).filter(
            student_class.c.class_id == cls.id
        ).all()
    else:
        # Parents can only see their children
        parent_students = db.query(Student).filter(Student.parent_id == current_user.id).all()
        parent_student_ids = [student.id for student in parent_students]
        
        cls.students = db.query(Student).join(
            student_class, 
            student_class.c.student_id == Student.id
        ).filter(
            student_class.c.class_id == cls.id,
            Student.id.in_(parent_student_ids)
        ).all()
    
    # Set student count
    cls.student_count = len(cls.students) if hasattr(cls, 'students') and cls.students else 0
    
    return cls

@router.post("/", response_model=ClassResponse)
def create_class(
    cls: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new class"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create classes")
    
    # Check if teacher exists
    teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Create new class
    db_class = Class(**cls.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    
    # Get related data
    db_class.teacher = teacher
    db_class.students = []
    db_class.student_count = 0
    
    # Get teacher's user full name
    teacher_user = db.query(User).filter(User.id == teacher.user_id).first()
    if teacher_user:
        db_class.teacher.user_full_name = teacher_user.full_name
    
    return db_class

@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    class_update: ClassBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a class's information"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update classes")
    
    # Check if class exists
    db_class = db.query(Class).filter(Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check if teacher exists
    teacher = db.query(Teacher).filter(Teacher.id == class_update.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Update class
    for key, value in class_update.dict().items():
        setattr(db_class, key, value)
    
    db.commit()
    db.refresh(db_class)
    
    # Get related data
    db_class.teacher = teacher
    db_class.students = db.query(Student).join(
        student_class, 
        student_class.c.student_id == Student.id
    ).filter(
        student_class.c.class_id == db_class.id
    ).all()
    db_class.student_count = len(db_class.students)
    
    # Get teacher's user full name
    teacher_user = db.query(User).filter(User.id == teacher.user_id).first()
    if teacher_user:
        db_class.teacher.user_full_name = teacher_user.full_name
    
    return db_class

@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a class"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete classes")
    
    # Check if class exists
    db_class = db.query(Class).filter(Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Before deleting, remove all student associations from the student_class table
    db.execute(student_class.delete().where(student_class.c.class_id == class_id))
    
    # Delete the class
    db.delete(db_class)
    db.commit()
    
    return None

@router.post("/{class_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_student_to_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a student to a class"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify class registrations")
    
    # Check if class exists
    db_class = db.query(Class).filter(Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check if student exists
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if student is already in the class
    existing = db.query(student_class).filter(
        student_class.c.class_id == class_id,
        student_class.c.student_id == student_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student is already in this class")
    
    # Add student to class
    db.execute(
        student_class.insert().values(
            class_id=class_id,
            student_id=student_id
        )
    )
    db.commit()
    
    return None

@router.delete("/{class_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_student_from_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a student from a class"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to modify class registrations")
    
    # Check if class exists
    db_class = db.query(Class).filter(Class.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check if student exists
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if student is in the class
    existing = db.query(student_class).filter(
        student_class.c.class_id == class_id,
        student_class.c.student_id == student_id
    ).first()
    
    if not existing:
        raise HTTPException(status_code=400, detail="Student is not in this class")
    
    # Remove student from class
    db.execute(
        student_class.delete().where(
            student_class.c.class_id == class_id,
            student_class.c.student_id == student_id
        )
    )
    db.commit()
    
    return None