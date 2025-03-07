# backend/scripts/populate_report_cards.py

import os
import sys
from datetime import datetime, date, timedelta
import random

# Add the parent directory to the path so we can import modules properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Import models correctly
from app.models.timetable import ReportCard, GradeSummary
from app.models.user import User
from app.models.student import Student, Teacher

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def populate_report_cards():
    """Populate report cards and grade summaries for students"""
    print("Populating report cards and grade summaries...")
    
    # Get all students and teachers
    students = db.query(Student).all()
    teachers = db.query(Teacher).all()
    
    if not students:
        print("Error: Need students in the database first")
        return
    
    if not teachers:
        print("Error: Need teachers in the database first")
        return
    
    # Define academic terms and current academic year
    terms = ["Term 1", "Term 2", "Term 3"]
    current_academic_year = "2024-2025"
    previous_academic_year = "2023-2024"
    
    # Subjects for elementary/nursery school
    subjects = ["Reading", "Writing", "Mathematics", "Science", "Art", "Music", 
                "Physical Education", "Social Skills"]
    
    # Comment templates for reports
    excellent_comments = [
        "{name} has shown exceptional progress in all areas this term.",
        "{name} consistently demonstrates a positive attitude towards learning.",
        "{name} has exceeded expectations in most subject areas.",
        "{name} is a pleasure to teach and shows great enthusiasm in class.",
        "{name} has excellent focus and concentration during lessons."
    ]
    
    good_comments = [
        "{name} has made good progress in most areas this term.",
        "{name} demonstrates a good understanding of the material covered.",
        "{name} participates well in class discussions and activities.",
        "{name} works well independently and in groups.",
        "{name} has shown improvement in their organizational skills."
    ]
    
    average_comments = [
        "{name} has made satisfactory progress this term.",
        "{name} is working at the expected level for their age.",
        "{name} participates in class activities when encouraged.",
        "{name} generally completes assigned work on time.",
        "{name} is developing their skills across all subjects."
    ]
    
    needs_improvement_comments = [
        "{name} needs to focus more during class time.",
        "{name} would benefit from additional practice at home.",
        "{name} requires more support in some subject areas.",
        "{name} should work on completing assignments on time.",
        "{name} needs to participate more actively in class."
    ]
    
    # Principal comment templates
    principal_comments = [
        "Well done on your achievements this term.",
        "Keep up the good work and continue to challenge yourself.",
        "We're pleased with your progress and look forward to your continued growth.",
        "Your hard work and dedication are evident in your results.",
        "Continue to focus on your areas for improvement in the next term."
    ]
    
    # For each student, create report cards
    for student in students:
        # Get student's first name for personalized comments
        student_name = student.first_name
        
        # Create report cards for current academic year - Term 1 and possibly Term 2
        for term_index, term in enumerate(terms[:2]):  # Only Term 1 and 2 for current year
            # Only create Term 2 for half the students (simulating in-progress year)
            if term == "Term 2" and random.random() > 0.5:
                continue
                
            # Calculate issue date (in the past)
            if term == "Term 1":
                issue_date = date(2024, 12, 15)  # Mid-December for Term 1
            else:
                issue_date = date(2025, 3, 15)  # Mid-March for Term 2
            
            # Determine overall performance level (will affect comments and grades)
            performance_level = random.choices(
                ["excellent", "good", "average", "needs_improvement"],
                weights=[0.2, 0.4, 0.3, 0.1]  # Most students doing well
            )[0]
            
            # Select teacher comments based on performance
            if performance_level == "excellent":
                teacher_comment = random.choice(excellent_comments).format(name=student_name)
            elif performance_level == "good":
                teacher_comment = random.choice(good_comments).format(name=student_name)
            elif performance_level == "average":
                teacher_comment = random.choice(average_comments).format(name=student_name)
            else:
                teacher_comment = random.choice(needs_improvement_comments).format(name=student_name)
            
            # Add some specific subject comments to the general comment
            subject_comment = f"\n\n{student_name} has shown particular strength in "
            strength_subjects = random.sample(subjects, 2)
            subject_comment += f"{strength_subjects[0]} and {strength_subjects[1]}."
            
            if performance_level != "excellent":
                improvement_subjects = random.sample([s for s in subjects if s not in strength_subjects], 1)
                subject_comment += f" {student_name} would benefit from additional practice in {improvement_subjects[0]}."
            
            teacher_comment += subject_comment
            
            # Create attendance summary (good attendance for most students)
            present_days = random.randint(45, 60)
            absent_days = random.randint(0, 5)
            late_days = random.randint(0, 3)
            attendance_summary = f"Present: {present_days} days, Absent: {absent_days} days, Late: {late_days} days"
            
            # Create the report card
            report_card = ReportCard(
                student_id=student.id,
                term=term,
                academic_year=current_academic_year,
                issue_date=issue_date,
                teacher_comments=teacher_comment,
                principal_comments=random.choice(principal_comments) if random.random() > 0.3 else None,  # Only some have principal comments
                attendance_summary=attendance_summary
            )
            
            db.add(report_card)
            db.flush()  # To get the report_card.id
            
            # Create grade summaries for each subject
            for subject in subjects:
                # Base score on performance level with some variation
                if performance_level == "excellent":
                    base_score = random.uniform(90, 99)
                elif performance_level == "good":
                    base_score = random.uniform(80, 89)
                elif performance_level == "average":
                    base_score = random.uniform(70, 79)
                else:
                    base_score = random.uniform(60, 69)
                
                # Add some subject-specific variation
                if subject in strength_subjects:
                    base_score += random.uniform(2, 5)
                elif subject in improvement_subjects if 'improvement_subjects' in locals() else []:
                    base_score -= random.uniform(2, 5)
                
                # Ensure score is within 0-100 range
                score = max(min(base_score, 100), 0)
                
                # Determine grade letter from score
                if score >= 90:
                    grade_letter = "A"
                elif score >= 80:
                    grade_letter = "B"
                elif score >= 70:
                    grade_letter = "C"
                elif score >= 60:
                    grade_letter = "D"
                else:
                    grade_letter = "F"
                
                # Get a teacher appropriate for the subject
                teacher_id = random.choice(teachers).id
                
                # Generate subject-specific comment
                if grade_letter in ["A", "B"]:
                    comment = f"{student_name} shows strong understanding of {subject} concepts."
                elif grade_letter == "C":
                    comment = f"{student_name} is developing their skills in {subject}."
                else:
                    comment = f"{student_name} needs additional support in {subject}."
                
                # Create the grade summary
                grade_summary = GradeSummary(
                    report_card_id=report_card.id,
                    subject=subject,
                    score=score,
                    grade_letter=grade_letter,
                    teacher_id=teacher_id,
                    comments=comment
                )
                
                db.add(grade_summary)
        
        # Also create report cards for previous academic year (all terms)
        for term in terms:
            # Calculate issue date for previous year
            if term == "Term 1":
                issue_date = date(2023, 12, 15)
            elif term == "Term 2":
                issue_date = date(2024, 3, 15)
            else:  # Term 3
                issue_date = date(2024, 6, 15)
            
            # Similar logic as above but simplified for previous year
            performance_level = random.choices(
                ["excellent", "good", "average", "needs_improvement"],
                weights=[0.2, 0.4, 0.3, 0.1]
            )[0]
            
            if performance_level == "excellent":
                teacher_comment = random.choice(excellent_comments).format(name=student_name)
            elif performance_level == "good":
                teacher_comment = random.choice(good_comments).format(name=student_name)
            elif performance_level == "average":
                teacher_comment = random.choice(average_comments).format(name=student_name)
            else:
                teacher_comment = random.choice(needs_improvement_comments).format(name=student_name)
            
            # Create attendance summary for previous year
            present_days = random.randint(45, 60)
            absent_days = random.randint(0, 5)
            late_days = random.randint(0, 3)
            attendance_summary = f"Present: {present_days} days, Absent: {absent_days} days, Late: {late_days} days"
            
            # Create the report card for previous year
            prev_report_card = ReportCard(
                student_id=student.id,
                term=term,
                academic_year=previous_academic_year,
                issue_date=issue_date,
                teacher_comments=teacher_comment,
                principal_comments=random.choice(principal_comments) if random.random() > 0.3 else None,
                attendance_summary=attendance_summary
            )
            
            db.add(prev_report_card)
            db.flush()
            
            # Create grade summaries for previous year (simplified)
            for subject in subjects:
                if performance_level == "excellent":
                    score = random.uniform(90, 99)
                elif performance_level == "good":
                    score = random.uniform(80, 89)
                elif performance_level == "average":
                    score = random.uniform(70, 79)
                else:
                    score = random.uniform(60, 69)
                
                # Determine grade letter
                if score >= 90:
                    grade_letter = "A"
                elif score >= 80:
                    grade_letter = "B"
                elif score >= 70:
                    grade_letter = "C"
                elif score >= 60:
                    grade_letter = "D"
                else:
                    grade_letter = "F"
                
                teacher_id = random.choice(teachers).id
                
                prev_grade_summary = GradeSummary(
                    report_card_id=prev_report_card.id,
                    subject=subject,
                    score=score,
                    grade_letter=grade_letter,
                    teacher_id=teacher_id,
                    comments=None  # No detailed comments for previous year
                )
                
                db.add(prev_grade_summary)
    
    db.commit()
    print("Report cards and grade summaries populated successfully!")

if __name__ == "__main__":
    try:
        populate_report_cards()
        print("Report card data populated successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()