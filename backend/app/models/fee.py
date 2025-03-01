from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .user import Base

class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    amount = Column(Float)
    description = Column(String)
    due_date = Column(Date)
    paid = Column(Float, default=0.0)
    status = Column(String)  # "paid", "pending", "overdue"
    term = Column(String)
    academic_year = Column(String)
    
    # Relationships
    student = relationship("Student", back_populates="fees")