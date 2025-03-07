import os 
import sys 
from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker 
from app.models.user import Base 
from app.models.student import Teacher 
from app.models.timetable import TimeSlot 
from sqlalchemy.orm import relationship 
 
# Add the time_slots relationship to Teacher 
Teacher.time_slots = relationship("TimeSlot", backref="teacher") 
 
print("Relationship fixed!") 
