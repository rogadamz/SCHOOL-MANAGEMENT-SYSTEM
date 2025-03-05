# backend/app/models/timetable.py
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean, Table, Text, DateTime
from sqlalchemy.orm import relationship
from .user import Base

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
    
    # Relationships
    class_ref = relationship("Class", backref="time_slots")
    teacher = relationship("Teacher", backref="time_slots")

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
    
    # Relationships
    creator = relationship("User", backref="created_events")

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
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")
    replies = relationship("Message", backref=relationship("Message", remote_side=[id]))

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
    
    # Relationships
    student = relationship("Student", backref="report_cards")

class GradeSummary(Base):
    __tablename__ = "grade_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    report_card_id = Column(Integer, ForeignKey("report_cards.id"))
    subject = Column(String)
    score = Column(Float)
    grade_letter = Column(String)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    comments = Column(Text, nullable=True)
    
    # Relationships
    report_card = relationship("ReportCard", backref="grade_summaries")
    teacher = relationship("Teacher", backref="grade_summaries")

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
    
    # Relationships
    teacher = relationship("Teacher", backref="materials")

class ClassMaterial(Base):
    __tablename__ = "class_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    material_id = Column(Integer, ForeignKey("learning_materials.id"))
    
    # Relationships
    class_ref = relationship("Class", backref="class_materials")
    material = relationship("LearningMaterial", backref="class_materials")