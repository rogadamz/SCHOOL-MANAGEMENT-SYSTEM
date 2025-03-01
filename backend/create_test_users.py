import os
import sys
from datetime import date, timedelta
import random

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole, Base
from app.models.student import Student, Class, Teacher
from app.models.grade import Grade, Attendance
from app.models.fee import Fee
from app.utils.auth_utils import get_password_hash
from config import DATABASE_URL

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Create test users
def create_test_users():
    print("Creating test users...")
    
    # Create admin user
    admin_user = User(
        username="admin",
        email="admin@downtown.edu",
        full_name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True
    )
    
    # Create teacher users
    teacher_user1 = User(
        username="teacher1",
        email="teacher1@downtown.edu",
        full_name="John Smith",
        hashed_password=get_password_hash("teacher123"),
        role=UserRole.TEACHER,
        is_active=True
    )
    
    teacher_user2 = User(
        username="teacher2",
        email="teacher2@downtown.edu",
        full_name="Mary Johnson",
        hashed_password=get_password_hash("teacher123"),
        role=UserRole.TEACHER,
        is_active=True
    )
    
    # Create parent users
    parent_user1 = User(
        username="parent1",
        email="parent1@example.com",
        full_name="Robert Brown",
        hashed_password=get_password_hash("parent123"),
        role=UserRole.PARENT,
        is_active=True
    )
    
    parent_user2 = User(
        username="parent2",
        email="parent2@example.com",
        full_name="Sarah Davis",
        hashed_password=get_password_hash("parent123"),
        role=UserRole.PARENT,
        is_active=True
    )
    
    # Add users to database
    db.add_all([admin_user, teacher_user1, teacher_user2, parent_user1, parent_user2])
    db.commit()
    
    # Refresh to get IDs
    db.refresh(admin_user)
    db.refresh(teacher_user1)
    db.refresh(teacher_user2)
    db.refresh(parent_user1)
    db.refresh(parent_user2)
    
    print(f"Created users with IDs: {admin_user.id}, {teacher_user1.id}, {teacher_user2.id}, {parent_user1.id}, {parent_user2.id}")
    
    return {
        "admin": admin_user,
        "teacher1": teacher_user1,
        "teacher2": teacher_user2,
        "parent1": parent_user1,
        "parent2": parent_user2
    }

# Create teacher profiles
def create_teacher_profiles(users):
    print("Creating teacher profiles...")
    
    teacher1 = Teacher(
        specialization="Early Childhood Education",
        user_id=users["teacher1"].id
    )
    
    teacher2 = Teacher(
        specialization="Special Education",
        user_id=users["teacher2"].id
    )
    
    db.add_all([teacher1, teacher2])
    db.commit()
    
    db.refresh(teacher1)
    db.refresh(teacher2)
    
    print(f"Created teacher profiles with IDs: {teacher1.id}, {teacher2.id}")
    
    return {
        "teacher1": teacher1,
        "teacher2": teacher2
    }

# Create classes
def create_classes(teachers):
    print("Creating classes...")
    
    class1 = Class(
        name="Butterfly Class",
        grade_level="Pre-K",
        teacher_id=teachers["teacher1"].id
    )
    
    class2 = Class(
        name="Sunshine Class",
        grade_level="Kindergarten",
        teacher_id=teachers["teacher2"].id
    )
    
    db.add_all([class1, class2])
    db.commit()
    
    db.refresh(class1)
    db.refresh(class2)
    
    print(f"Created classes with IDs: {class1.id}, {class2.id}")
    
    return {
        "class1": class1,
        "class2": class2
    }

# Create students
def create_students(users, classes):
    print("Creating students...")
    
    student1 = Student(
        first_name="James",
        last_name="Brown",
        date_of_birth=date(2019, 5, 15),
        admission_number="ST-2023-001",
        parent_id=users["parent1"].id
    )
    
    student2 = Student(
        first_name="Emily",
        last_name="Brown",
        date_of_birth=date(2020, 3, 10),
        admission_number="ST-2023-002",
        parent_id=users["parent1"].id
    )
    
    student3 = Student(
        first_name="Michael",
        last_name="Davis",
        date_of_birth=date(2019, 8, 22),
        admission_number="ST-2023-003",
        parent_id=users["parent2"].id
    )
    
    db.add_all([student1, student2, student3])
    db.commit()
    
    db.refresh(student1)
    db.refresh(student2)
    db.refresh(student3)
    
    # Associate students with classes
    student1.classes.append(classes["class1"])
    student2.classes.append(classes["class1"])
    student3.classes.append(classes["class2"])
    
    db.commit()
    
    print(f"Created students with IDs: {student1.id}, {student2.id}, {student3.id}")
    
    return {
        "student1": student1,
        "student2": student2,
        "student3": student3
    }

# Create grades
def create_grades(students):
    print("Creating grades...")
    
    subjects = ["Reading", "Writing", "Math", "Science", "Art"]
    grades = []
    
    for student_key, student in students.items():
        for subject in subjects:
            # Generate random score between 65 and 100
            score = random.uniform(65, 100)
            
            # Determine grade letter
            if score >= 90:
                grade_letter = "A"
            elif score >= 80:
                grade_letter = "B"
            elif score >= 70:
                grade_letter = "C"
            else:
                grade_letter = "D"
            
            grade = Grade(
                student_id=student.id,
                subject=subject,
                score=score,
                grade_letter=grade_letter,
                term="Term 1",
                date_recorded=date.today() - timedelta(days=random.randint(1, 30))
            )
            
            grades.append(grade)
    
    db.add_all(grades)
    db.commit()
    
    print(f"Created {len(grades)} grade records")

# Create attendance records
def create_attendance(students):
    print("Creating attendance records...")
    
    attendance_records = []
    
    # Generate 30 days of attendance records
    for i in range(30):
        record_date = date.today() - timedelta(days=i)
        
        # Skip weekends
        if record_date.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
            continue
        
        for student_key, student in students.items():
            # 90% chance of being present
            present = random.random() < 0.9
            
            attendance = Attendance(
                student_id=student.id,
                date=record_date,
                present=present
            )
            
            attendance_records.append(attendance)
    
    db.add_all(attendance_records)
    db.commit()
    
    print(f"Created {len(attendance_records)} attendance records")

# Create fee records
def create_fees(students):
    print("Creating fee records...")
    
    fee_types = [
        {"description": "Tuition Fee", "amount": 5000.0},
        {"description": "Development Fee", "amount": 1000.0},
        {"description": "Activity Fee", "amount": 500.0},
        {"description": "Books and Materials", "amount": 750.0}
    ]
    
    fees = []
    
    for student_key, student in students.items():
        for fee_type in fee_types:
            # 70% chance of being fully paid
            paid_status = random.random() < 0.7
            
            paid_amount = fee_type["amount"] if paid_status else fee_type["amount"] * random.uniform(0, 0.8)
            status = "paid" if paid_status else ("pending" if paid_amount > 0 else "overdue")
            
            fee = Fee(
                student_id=student.id,
                amount=fee_type["amount"],
                description=fee_type["description"],
                due_date=date.today() + timedelta(days=30),
                paid=paid_amount,
                status=status,
                term="Term 1",
                academic_year="2024-2025"
            )
            
            fees.append(fee)
    
    db.add_all(fees)
    db.commit()
    
    print(f"Created {len(fees)} fee records")

def main():
    try:
        # Create all data
        users = create_test_users()
        teachers = create_teacher_profiles(users)
        classes = create_classes(teachers)
        students = create_students(users, classes)
        create_grades(students)
        create_attendance(students)
        create_fees(students)
        
        print("\nTest data creation completed successfully!")
        print("\nYou can now login with the following accounts:")
        print("Admin: username='admin', password='admin123'")
        print("Teacher: username='teacher1', password='teacher123'")
        print("Parent: username='parent1', password='parent123'")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating test data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()