# backend/scripts/populate_learning_materials.py

import os
import sys
from datetime import datetime, date, timedelta
import random

# Add the parent directory to the path so we can import modules properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

from app.models.learning_material import LearningMaterial, ClassMaterial
from app.models.student import Teacher, Class

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def populate_learning_materials():
    """Populate learning materials and class materials"""
    print("Populating learning materials...")
    
    # Get all teachers and classes
    teachers = db.query(Teacher).all()
    classes = db.query(Class).all()
    
    if not teachers:
        print("Error: Need teachers in the database first")
        return
    
    if not classes:
        print("Error: Need classes in the database first")
        return
    
    # Material types and templates
    material_templates