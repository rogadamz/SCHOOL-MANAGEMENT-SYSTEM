# backend/create_table_only.py

import os
import sys
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean, Table, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the database URL
from config import DATABASE_URL

# Create database engine
engine = create_engine(DATABASE_URL)

# Import Base from existing models
from app.models.user import Base

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

if __name__ == "__main__":
    try:
        print("Creating additional tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating additional tables: {e}")