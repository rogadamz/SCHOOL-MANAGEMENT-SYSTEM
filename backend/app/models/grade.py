from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .user import Base

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject = Column(String)
    score = Column(Float)
    grade_letter = Column(String)
    term = Column(String)
    date_recorded = Column(Date)
    
    # Relationships
    student = relationship("Student", back_populates="grades")

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date)
    status = Column(String, default="present")  # 'present', 'absent', 'late', 'excused'
    
    # Relationships
    student = relationship("Student", back_populates="attendances")