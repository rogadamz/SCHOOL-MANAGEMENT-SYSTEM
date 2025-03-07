# backend/scripts/populate_timetable_events_messages.py

import os
import sys
from datetime import datetime, date, timedelta
import random

# Add the parent directory to the path so we can import modules properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Import models correctly from timetable.py instead of separate files
from app.models.timetable import TimeSlot, Event, Message
from app.models.user import User, Base
from app.models.student import Teacher, Class

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def populate_timetable():
    """Populate the timetable with sample time slots"""
    print("Populating timetable...")
    
    # Get all classes and teachers
    classes = db.query(
        Base.metadata.tables['classes'].c.id,
        Base.metadata.tables['classes'].c.name
    ).all()
    
    teachers = db.query(
        Base.metadata.tables['teachers'].c.id,
        Base.metadata.tables['teachers'].c.specialization
    ).all()
    
    if not classes or not teachers:
        print("Error: Need classes and teachers in the database first")
        return
    
    # Subjects for elementary/nursery school
    subjects = ["Reading", "Writing", "Math", "Science", "Art", "Music", 
                "Physical Education", "Social Skills", "Naptime", "Snack Time"]
    
    # Time periods
    time_periods = [
        ("08:30", "09:15"),  # 1st period
        ("09:20", "10:05"),  # 2nd period
        ("10:10", "10:55"),  # 3rd period
        ("11:00", "11:45"),  # 4th period
        ("11:50", "12:35"),  # 5th period - lunch
        ("12:40", "13:25"),  # 6th period
        ("13:30", "14:15"),  # 7th period
        ("14:20", "15:05"),  # 8th period
    ]
    
    # For each class, create a weekly schedule
    for class_id, class_name in classes:
        # Determine how many periods this class has per day (younger classes have fewer)
        if "Pre-K" in class_name:
            max_periods = 5  # Younger kids have shorter days
        else:
            max_periods = 7
        
        for day in range(0, 5):  # Monday to Friday
            # Assign subjects to time slots for this day
            available_subjects = random.sample(subjects, max_periods)
            
            for i, period in enumerate(time_periods[:max_periods]):
                subject = available_subjects[i]
                
                # Assign an appropriate teacher
                if subject in ["Math", "Science"]:
                    teacher_options = [t[0] for t in teachers if "Math" in t[1] or "Science" in t[1]]
                elif subject in ["Reading", "Writing"]:
                    teacher_options = [t[0] for t in teachers if "Language" in t[1] or "English" in t[1]]
                else:
                    teacher_options = [t[0] for t in teachers]
                
                teacher_id = random.choice(teacher_options) if teacher_options else teachers[0][0]
                
                # Create the time slot
                time_slot = TimeSlot(
                    day_of_week=day,
                    start_time=period[0],
                    end_time=period[1],
                    class_id=class_id,
                    subject=subject,
                    teacher_id=teacher_id
                )
                db.add(time_slot)
    
    db.commit()
    print("Timetable populated successfully!")

def populate_events():
    """Populate the events calendar with sample events"""
    print("Populating events calendar...")
    
    # Get admin and teacher user IDs
    admin_users = db.query(User).filter(User.role == "admin").all()
    teacher_users = db.query(User).filter(User.role == "teacher").all()
    
    if not admin_users and not teacher_users:
        print("Error: Need admin and teacher users in the database first")
        return
    
    # Event types and templates
    event_types = {
        "holiday": [
            "Spring Break",
            "Winter Break",
            "Teacher Professional Day",
            "Parent-Teacher Conference Day",
            "Presidents' Day",
            "Memorial Day",
            "Labor Day",
        ],
        "meeting": [
            "Parent-Teacher Meeting",
            "Staff Meeting",
            "Board Meeting",
            "Parent Association Meeting",
            "Department Meeting",
        ],
        "activity": [
            "Field Trip to Zoo",
            "Science Fair",
            "Art Exhibition",
            "Sports Day",
            "Annual Concert",
            "Book Fair",
            "Career Day",
        ],
        "academic": [
            "End of Term Assessment",
            "Reading Assessment",
            "Math Assessment",
            "Project Presentations",
            "Report Card Day",
        ],
    }
    
    # Generate events for the next 6 months
    today = date.today()
    end_date = today + timedelta(days=180)
    
    # Add holidays (typically all-day events)
    for i in range(3):
        event_type = "holiday"
        event_title = random.choice(event_types[event_type])
        event_start = today + timedelta(days=random.randint(7, 150))
        
        # Holidays are typically 1-5 days
        duration = random.randint(1, 5)
        event_end = event_start + timedelta(days=duration-1)
        
        event = Event(
            title=event_title,
            description=f"School closed for {event_title}.",
            start_date=event_start,
            end_date=event_end,
            all_day=True,
            location="School",
            event_type=event_type,
            created_by=random.choice(admin_users).id
        )
        db.add(event)
    
    # Add meetings (typically not all-day events)
    for i in range(5):
        event_type = "meeting"
        event_title = random.choice(event_types[event_type])
        event_start = today + timedelta(days=random.randint(7, 150))
        
        # Meetings typically last 1-3 hours
        start_hour = random.randint(9, 16)  # 9 AM to 4 PM
        end_hour = min(start_hour + random.randint(1, 3), 18)  # No later than 6 PM
        
        event = Event(
            title=event_title,
            description=f"Please attend the {event_title} to discuss important matters.",
            start_date=event_start,
            end_date=event_start,  # Same day
            all_day=False,
            start_time=f"{start_hour:02d}:00",
            end_time=f"{end_hour:02d}:00",
            location=random.choice(["School Hall", "Main Office", "Classroom 101", "Library"]),
            event_type=event_type,
            created_by=random.choice(admin_users + teacher_users).id
        )
        db.add(event)
    
    # Add activities
    for i in range(4):
        event_type = "activity"
        event_title = random.choice(event_types[event_type])
        event_start = today + timedelta(days=random.randint(14, 120))
        
        # Activities can be all-day or timed
        all_day = random.choice([True, False])
        
        if all_day:
            event = Event(
                title=event_title,
                description=f"Students will participate in {event_title}.",
                start_date=event_start,
                end_date=event_start,  # Usually single day
                all_day=all_day,
                location=random.choice(["School Grounds", "School Hall", "Local Park", "Community Center"]),
                event_type=event_type,
                created_by=random.choice(teacher_users).id
            )
        else:
            start_hour = random.randint(9, 14)  # 9 AM to 2 PM
            end_hour = min(start_hour + random.randint(2, 4), 16)  # No later than 4 PM
            
            event = Event(
                title=event_title,
                description=f"Students will participate in {event_title}.",
                start_date=event_start,
                end_date=event_start,  # Usually single day
                all_day=all_day,
                start_time=f"{start_hour:02d}:00",
                end_time=f"{end_hour:02d}:00",
                location=random.choice(["School Grounds", "School Hall", "Local Park", "Community Center"]),
                event_type=event_type,
                created_by=random.choice(teacher_users).id
            )
        
        db.add(event)
    
    # Add academic events
    for i in range(6):
        event_type = "academic"
        event_title = random.choice(event_types[event_type])
        event_start = today + timedelta(days=random.randint(14, 120))
        
        # Academic events are often during school hours
        start_hour = random.randint(9, 14)  # 9 AM to 2 PM
        end_hour = min(start_hour + random.randint(1, 3), 15)  # No later than 3 PM
        
        event = Event(
            title=event_title,
            description=f"Students will complete {event_title}.",
            start_date=event_start,
            end_date=event_start,
            all_day=False,
            start_time=f"{start_hour:02d}:00",
            end_time=f"{end_hour:02d}:00",
            location="Classroom",
            event_type=event_type,
            created_by=random.choice(teacher_users).id
        )
        db.add(event)
    
    db.commit()
    print("Events populated successfully!")

def populate_messages():
    """Populate the message system with sample messages"""
    print("Populating messages...")
    
    # Get all users
    users = db.query(User).all()
    
    if len(users) < 2:
        print("Error: Need at least 2 users in the database")
        return
    
    admin_users = [user for user in users if user.role == "admin"]
    teacher_users = [user for user in users if user.role == "teacher"]
    parent_users = [user for user in users if user.role == "parent"]
    
    # Message templates
    message_templates = [
        # Admin to teacher messages
        {
            "subject": "Staff Meeting This Friday",
            "content": "Dear Teachers,\n\nThis is a reminder that we have a staff meeting this Friday at 3:30 PM. Please prepare your monthly reports.\n\nRegards,\nThe Administration",
            "sender_type": "admin",
            "recipient_type": "teacher"
        },
        {
            "subject": "Professional Development Opportunity",
            "content": "Dear Faculty,\n\nWe're pleased to announce a professional development workshop on new teaching methods next month. Please let us know if you're interested in attending.\n\nBest regards,\nThe Administration",
            "sender_type": "admin",
            "recipient_type": "teacher"
        },
        # Admin to parent messages
        {
            "subject": "Upcoming School Events",
            "content": "Dear Parents,\n\nPlease note the following upcoming events:\n- Parent-Teacher Meeting: March 15\n- School Play: March 22\n- Spring Break: March 27-31\n\nBest regards,\nThe Administration",
            "sender_type": "admin",
            "recipient_type": "parent"
        },
        # Teacher to parent messages
        {
            "subject": "Your Child's Progress Report",
            "content": "Dear Parent,\n\nI'm pleased to share that your child has been making excellent progress in reading and mathematics. They have shown great enthusiasm during class activities.\n\nBest regards,\nThe Teacher",
            "sender_type": "teacher",
            "recipient_type": "parent"
        },
        {
            "subject": "Class Field Trip Permission",
            "content": "Dear Parent,\n\nOur class is planning a field trip to the Science Museum on April 12. Please sign and return the permission slip by April 5.\n\nThank you,\nThe Teacher",
            "sender_type": "teacher",
            "recipient_type": "parent"
        },
        # Parent to teacher messages
        {
            "subject": "Question About Homework Assignment",
            "content": "Dear Teacher,\n\nMy child is having difficulty with the latest math homework. Could you provide some additional guidance or resources?\n\nThank you,\nConcerned Parent",
            "sender_type": "parent",
            "recipient_type": "teacher"
        },
        {
            "subject": "Absence Notification",
            "content": "Dear Teacher,\n\nMy child will be absent on Thursday and Friday due to a family event. Could you please let me know what homework they will miss?\n\nThank you,\nThe Parent",
            "sender_type": "parent",
            "recipient_type": "teacher"
        }
    ]
    
    # Create messages (both sent and received)
    for _ in range(20):
        template = random.choice(message_templates)
        
        # Determine sender and recipient based on roles
        if template["sender_type"] == "admin":
            sender = random.choice(admin_users) if admin_users else random.choice(users)
            
            if template["recipient_type"] == "teacher":
                recipient = random.choice(teacher_users) if teacher_users else random.choice(users)
            else:  # parent
                recipient = random.choice(parent_users) if parent_users else random.choice(users)
        
        elif template["sender_type"] == "teacher":
            sender = random.choice(teacher_users) if teacher_users else random.choice(users)
            recipient = random.choice(parent_users) if parent_users else random.choice(users)
        
        else:  # parent
            sender = random.choice(parent_users) if parent_users else random.choice(users)
            recipient = random.choice(teacher_users) if teacher_users else random.choice(users)
        
        # Ensure sender and recipient are different users
        if sender.id == recipient.id:
            continue
        
        # Create sent date (within last 30 days)
        sent_at = datetime.now() - timedelta(days=random.randint(0, 30), 
                                             hours=random.randint(0, 23), 
                                             minutes=random.randint(0, 59))
        
        # Randomize read status (more recent messages more likely to be unread)
        days_ago = (datetime.now() - sent_at).days
        read_probability = min(0.9, days_ago * 0.1)  # 10% chance per day, max 90%
        is_read = random.random() < read_probability
        
        message = Message(
            sender_id=sender.id,
            recipient_id=recipient.id,
            subject=template["subject"],
            content=template["content"],
            sent_at=sent_at,
            read=is_read
        )
        db.add(message)
    
    db.commit()
    print("Messages populated successfully!")

if __name__ == "__main__":
    try:
        populate_timetable()
        populate_events()
        populate_messages()
        print("All data populated successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()