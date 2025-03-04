# backend/create_additional_tables.py

import os
import sys
from datetime import date, timedelta, datetime
import random

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean, Table, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from config import DATABASE_URL

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Import all existing models at once to avoid circular imports
from app.models.user import Base, User, UserRole
from app.models.student import Student, Class, Teacher
from app.models.grade import Grade, Attendance
from app.models.fee import Fee

# Define new tables

# Timetable for classes
class TimeSlot(Base):
    __tablename__ = "time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer)  # 0 = Monday, 6 = Sunday
    start_time = Column(String)
    end_time = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))
    subject = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))

# School events/calendar
class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    all_day = Column(Boolean, default=True)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    event_type = Column(String)  # holiday, meeting, activity, etc.
    created_by = Column(Integer, ForeignKey("users.id"))

# Messages/communication
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String)
    content = Column(Text)
    sent_at = Column(DateTime)
    read = Column(Boolean, default=False)
    parent_message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)

# Report cards (comprehensive term reports)
class ReportCard(Base):
    __tablename__ = "report_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    term = Column(String)
    academic_year = Column(String)
    issue_date = Column(Date)
    teacher_comments = Column(Text)
    principal_comments = Column(Text, nullable=True)
    attendance_summary = Column(String)  # JSON or string summary

class GradeSummary(Base):
    __tablename__ = "grade_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    report_card_id = Column(Integer, ForeignKey("report_cards.id"))
    subject = Column(String)
    score = Column(Float)
    grade_letter = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    comments = Column(Text, nullable=True)

# Learning materials/resources
class LearningMaterial(Base):
    __tablename__ = "learning_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    material_type = Column(String)  # document, video, link, etc.
    file_path = Column(String, nullable=True)
    external_url = Column(String, nullable=True)
    upload_date = Column(Date)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))

class ClassMaterial(Base):
    __tablename__ = "class_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    material_id = Column(Integer, ForeignKey("learning_materials.id"))

# Set up relationship attributes after all classes are defined
# This avoids circular dependencies
Teacher.time_slots = relationship("TimeSlot", backref="teacher")
Class.time_slots = relationship("TimeSlot", backref="class_ref")
Student.report_cards = relationship("ReportCard", backref="student")
ReportCard.grade_summaries = relationship("GradeSummary", backref="report_card", cascade="all, delete-orphan")
LearningMaterial.class_materials = relationship("ClassMaterial", backref="material")
Message.replies = relationship("Message", backref="parent_message", remote_side=[Message.id])

# Create all the tables
def create_tables():
    # Create all tables
    print("Creating additional tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

# Populate with sample data
def create_sample_data():
    print("Creating sample data for new tables...")
    
    # Get existing users
    admin = db.query(User).filter_by(username="admin").first()
    teacher_user1 = db.query(User).filter_by(username="teacher1").first()
    teacher_user2 = db.query(User).filter_by(username="teacher2").first()
    
    # Get teacher profiles
    teacher1 = db.query(Teacher).filter_by(user_id=teacher_user1.id).first() if teacher_user1 else None
    teacher2 = db.query(Teacher).filter_by(user_id=teacher_user2.id).first() if teacher_user2 else None
    
    if not teacher1 or not teacher2:
        print("Teachers not found. Please run create_test_users.py first.")
        return
        
    # Get classes
    class1 = db.query(Class).filter_by(name="Butterfly Class").first()
    class2 = db.query(Class).filter_by(name="Sunshine Class").first()
    
    if not class1 or not class2:
        print("Classes not found. Please run create_test_users.py first.")
        return
    
    # Get students
    students = db.query(Student).all()
    if not students:
        print("No students found. Please run create_test_users.py first.")
        return
    
    # Create time slots
    time_slots = []
    
    # Class 1 schedule
    for day in range(5):  # Monday to Friday
        # Morning activities
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="08:30",
            end_time="09:15",
            class_id=class1.id,
            subject="Morning Circle",
            teacher_id=teacher1.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="09:30",
            end_time="10:15",
            class_id=class1.id,
            subject="Reading",
            teacher_id=teacher1.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="10:30",
            end_time="11:15",
            class_id=class1.id,
            subject="Math",
            teacher_id=teacher1.id
        ))
        
        # Lunch break
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="13:00",
            end_time="13:45",
            class_id=class1.id,
            subject="Art",
            teacher_id=teacher1.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="14:00",
            end_time="14:45",
            class_id=class1.id,
            subject="Play Time",
            teacher_id=teacher1.id
        ))
    
    # Class 2 schedule
    for day in range(5):  # Monday to Friday
        # Morning activities
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="08:30",
            end_time="09:15",
            class_id=class2.id,
            subject="Morning Circle",
            teacher_id=teacher2.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="09:30",
            end_time="10:15",
            class_id=class2.id,
            subject="Writing",
            teacher_id=teacher2.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="10:30",
            end_time="11:15",
            class_id=class2.id,
            subject="Science",
            teacher_id=teacher2.id
        ))
        
        # Lunch break
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="13:00",
            end_time="13:45",
            class_id=class2.id,
            subject="Music",
            teacher_id=teacher2.id
        ))
        
        time_slots.append(TimeSlot(
            day_of_week=day,
            start_time="14:00",
            end_time="14:45",
            class_id=class2.id,
            subject="Play Time",
            teacher_id=teacher2.id
        ))
    
    db.add_all(time_slots)
    db.commit()
    print(f"Created {len(time_slots)} time slots")
    
    # Create events
    events = [
        Event(
            title="Parent-Teacher Meeting",
            description="Discuss student progress with parents",
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=10),
            all_day=False,
            start_time="15:00",
            end_time="18:00",
            location="School Hall",
            event_type="meeting",
            created_by=admin.id
        ),
        Event(
            title="Spring Break",
            description="School closed for spring break",
            start_date=date.today() + timedelta(days=20),
            end_date=date.today() + timedelta(days=27),
            all_day=True,
            event_type="holiday",
            created_by=admin.id
        ),
        Event(
            title="Field Trip to Zoo",
            description="Educational trip to learn about animals",
            start_date=date.today() + timedelta(days=15),
            end_date=date.today() + timedelta(days=15),
            all_day=True,
            location="City Zoo",
            event_type="activity",
            created_by=teacher_user1.id
        )
    ]
    
    db.add_all(events)
    db.commit()
    print(f"Created {len(events)} events")
    
    # Create report cards
    report_cards = []
    
    for student in students:
        # Get all grades for this student
        student_grades = db.query(Grade).filter_by(student_id=student.id).all()
        
        # Calculate attendance percentage
        attendance_records = db.query(Attendance).filter_by(student_id=student.id).all()
        present_count = sum(1 for a in attendance_records if getattr(a, 'present', False))
        attendance_percentage = present_count / max(1, len(attendance_records)) * 100
        
        # Create report card
        report_card = ReportCard(
            student_id=student.id,
            term="Term 1",
            academic_year="2024-2025",
            issue_date=date.today() - timedelta(days=5),
            teacher_comments=f"{student.first_name} has been {random.choice(['performing well', 'making good progress', 'showing enthusiasm'])} in class.",
            principal_comments=f"Keep up the good work, {student.first_name}!",
            attendance_summary=f"Present: {present_count}/{len(attendance_records)} days ({attendance_percentage:.1f}%)"
        )
        
        report_cards.append(report_card)
    
    db.add_all(report_cards)
    db.commit()
    
    # Refresh report cards to get IDs
    for report_card in report_cards:
        db.refresh(report_card)
    
    print(f"Created {len(report_cards)} report cards")
    
    # Create grade summaries for each report card
    grade_summaries = []
    
    for report_card in report_cards:
        student_id = report_card.student_id
        student_grades = db.query(Grade).filter_by(student_id=student_id).all()
        
        # Group grades by subject
        subjects = {}
        for grade in student_grades:
            if grade.subject not in subjects:
                subjects[grade.subject] = []
            subjects[grade.subject].append(grade.score)
        
        # Create a grade summary for each subject
        for subject, scores in subjects.items():
            avg_score = sum(scores) / len(scores)
            
            # Determine grade letter
            grade_letter = "F"
            if avg_score >= 90:
                grade_letter = "A"
            elif avg_score >= 80:
                grade_letter = "B"
            elif avg_score >= 70:
                grade_letter = "C"
            elif avg_score >= 60:
                grade_letter = "D"
            
            # Get teacher ID based on class
            student = db.query(Student).filter_by(id=student_id).first()
            student_classes = student.classes
            teacher_id = student_classes[0].teacher_id if student_classes else None
            
            grade_summary = GradeSummary(
                report_card_id=report_card.id,
                subject=subject,
                score=avg_score,
                grade_letter=grade_letter,
                teacher_id=teacher_id,
                comments=f"Student is {random.choice(['doing well', 'making progress', 'needs improvement'])} in {subject}."
            )
            
            grade_summaries.append(grade_summary)
    
    db.add_all(grade_summaries)
    db.commit()
    print(f"Created {len(grade_summaries)} grade summaries")
    
    # Create learning materials
    materials = [
        LearningMaterial(
            title="Alphabet Worksheet",
            description="Practice sheets for learning the alphabet",
            material_type="document",
            file_path="/materials/alphabet_worksheet.pdf",
            upload_date=date.today() - timedelta(days=15),
            teacher_id=teacher1.id
        ),
        LearningMaterial(
            title="Counting Numbers",
            description="Interactive exercise for learning to count from 1 to 20",
            material_type="document",
            file_path="/materials/counting_numbers.pdf",
            upload_date=date.today() - timedelta(days=10),
            teacher_id=teacher1.id
        ),
        LearningMaterial(
            title="Colors and Shapes",
            description="Learning basic colors and shapes",
            material_type="video",
            external_url="https://example.com/colors_shapes",
            upload_date=date.today() - timedelta(days=5),
            teacher_id=teacher2.id
        )
    ]
    
    db.add_all(materials)
    db.commit()
    
    # Refresh materials to get IDs
    for material in materials:
        db.refresh(material)
    
    print(f"Created {len(materials)} learning materials")
    
    # Assign materials to classes
    class_materials = [
        ClassMaterial(
            class_id=class1.id,
            material_id=materials[0].id
        ),
        ClassMaterial(
            class_id=class1.id,
            material_id=materials[1].id
        ),
        ClassMaterial(
            class_id=class2.id,
            material_id=materials[2].id
        )
    ]
    
    db.add_all(class_materials)
    db.commit()
    print(f"Created {len(class_materials)} class material assignments")
    
    # Create messages
    parent1 = db.query(User).filter_by(username="parent1").first()
    parent2 = db.query(User).filter_by(username="parent2").first()
    
    if parent1 and parent2:
        messages = [
            Message(
                sender_id=teacher_user1.id,
                recipient_id=parent1.id,
                subject="Regarding your child's progress",
                content="I wanted to update you on James's progress in class. He's doing very well with reading.",
                sent_at=datetime.now() - timedelta(days=3)
            ),
            Message(
                sender_id=teacher_user2.id,
                recipient_id=parent2.id,
                subject="Field trip permission",
                content="Please remember to sign the permission slip for our upcoming zoo trip.",
                sent_at=datetime.now() - timedelta(days=2)
            ),
            Message(
                sender_id=admin.id,
                recipient_id=teacher_user1.id,
                subject="Staff meeting",
                content="Reminder that we have a staff meeting this Friday at 3pm.",
                sent_at=datetime.now() - timedelta(days=1)
            )
        ]
        
        db.add_all(messages)
        db.commit()
        print(f"Created {len(messages)} messages")
    else:
        print("Parent users not found, skipping message creation")

if __name__ == "__main__":
    try:
        create_tables()
        create_sample_data()
        print("\nAdditional tables and sample data created successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error creating additional tables: {e}")
    finally:
        db.close()