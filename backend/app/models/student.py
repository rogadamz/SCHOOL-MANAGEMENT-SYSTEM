from .fee import Fee  # Add this import at the top
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from .user import Base

# Association table for many-to-many relationship between students and classes
student_class = Table(
    "student_class",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id")),
    Column("class_id", Integer, ForeignKey("classes.id"))
)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    date_of_birth = Column(Date)
    admission_number = Column(String, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("users.id"))
    fees = relationship("Fee", back_populates="student", cascade="all, delete-orphan")
    
    # Relationships
    parent = relationship("User", back_populates="students")
    grades = relationship("Grade", back_populates="student", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    classes = relationship("Class", secondary=student_class, back_populates="students")
    # Add this line:
    report_cards = relationship("ReportCard", back_populates="student")

class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    grade_level = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    
    # Relationships
    teacher = relationship("Teacher", back_populates="classes")
    students = relationship("Student", secondary=student_class, back_populates="classes")

    time_slots = relationship("TimeSlot", back_populates="class_ref")

class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    specialization = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Relationships
    user = relationship("User", back_populates="teacher_profile")
    classes = relationship("Class", back_populates="teacher", cascade="all, delete-orphan")
    time_slots = relationship("TimeSlot", back_populates="teacher")  # Add this line