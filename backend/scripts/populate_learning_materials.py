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
    material_templates = {
        "document": [
            {
                "title": "Letter Recognition Worksheet",
                "description": "A worksheet to help students practice recognizing and writing uppercase and lowercase letters.",
                "external_url": None,
                "file_path": "/materials/letters_worksheet.pdf"
            },
            {
                "title": "Numbers 1-10 Practice Sheet",
                "description": "Worksheet for practicing writing numbers from 1 to 10 with counting exercises.",
                "external_url": None,
                "file_path": "/materials/numbers_worksheet.pdf"
            },
            {
                "title": "Colors and Shapes Activity",
                "description": "An activity sheet to help students learn basic colors and shapes.",
                "external_url": None,
                "file_path": "/materials/colors_shapes.pdf"
            },
            {
                "title": "Weekly Reading Log",
                "description": "Log for students to track their daily reading activities.",
                "external_url": None,
                "file_path": "/materials/reading_log.pdf"
            }
        ],
        "video": [
            {
                "title": "Phonics - Letter Sounds Song",
                "description": "Educational video teaching the sounds of each letter through song.",
                "external_url": "https://example.com/videos/phonics-song",
                "file_path": None
            },
            {
                "title": "Counting to 20 Dance",
                "description": "Fun dance video to help children learn to count to 20.",
                "external_url": "https://example.com/videos/counting-dance",
                "file_path": None
            },
            {
                "title": "Days of the Week Song",
                "description": "Catchy song to help students learn the days of the week.",
                "external_url": "https://example.com/videos/days-of-week",
                "file_path": None
            }
        ],
        "link": [
            {
                "title": "Interactive Storybook Collection",
                "description": "A collection of online interactive storybooks for early readers.",
                "external_url": "https://example.com/storybooks",
                "file_path": None
            },
            {
                "title": "Math Games for Pre-K",
                "description": "Online games to help develop early math skills.",
                "external_url": "https://example.com/math-games",
                "file_path": None
            },
            {
                "title": "Virtual Science Experiments",
                "description": "Simple science experiments that can be demonstrated virtually.",
                "external_url": "https://example.com/science-experiments",
                "file_path": None
            }
        ],
        "presentation": [
            {
                "title": "All About Animals",
                "description": "Presentation introducing different animals and their habitats.",
                "external_url": None,
                "file_path": "/materials/animals_presentation.pptx"
            },
            {
                "title": "Our Solar System",
                "description": "Simple introduction to planets and the solar system.",
                "external_url": None,
                "file_path": "/materials/solar_system.pptx"
            },
            {
                "title": "Healthy Foods Guide",
                "description": "Presentation about different food groups and healthy eating habits.",
                "external_url": None,
                "file_path": "/materials/healthy_foods.pptx"
            }
        ]
    }
    
    # Materials specifically for different grade levels
    grade_specific_materials = {
        "Pre-K": [
            {
                "title": "Pre-K Alphabet Bingo",
                "description": "Bingo game focusing on alphabet recognition for Pre-K students.",
                "material_type": "document",
                "external_url": None,
                "file_path": "/materials/prek_alphabet_bingo.pdf"
            },
            {
                "title": "Nursery Rhymes Collection",
                "description": "Collection of popular nursery rhymes with illustrations.",
                "material_type": "document",
                "external_url": None,
                "file_path": "/materials/nursery_rhymes.pdf"
            }
        ],
        "Kindergarten": [
            {
                "title": "Kindergarten Sight Words List",
                "description": "List of sight words for kindergarten students to practice.",
                "material_type": "document",
                "external_url": None,
                "file_path": "/materials/sight_words.pdf"
            },
            {
                "title": "Basic Addition Worksheets",
                "description": "Simple addition problems for kindergarten students.",
                "material_type": "document",
                "external_url": None,
                "file_path": "/materials/addition_worksheets.pdf"
            }
        ]
    }
    
    # First, create general materials shared by all teachers
    materials_created = []
    
    # Create general learning materials from templates
    for material_type, templates in material_templates.items():
        for template in templates:
            # Randomly assign to a teacher
            teacher = random.choice(teachers)
            
            # Create material
            material = LearningMaterial(
                title=template["title"],
                description=template["description"],
                material_type=material_type,
                file_path=template["file_path"],
                external_url=template["external_url"],
                upload_date=date.today() - timedelta(days=random.randint(0, 90)),
                teacher_id=teacher.id
            )
            
            db.add(material)
            db.flush()
            materials_created.append(material)
    
    # Next, create grade-specific materials
    for grade_level, templates in grade_specific_materials.items():
        # Find classes for this grade level
        grade_classes = [cls for cls in classes if grade_level in cls.grade_level]
        
        if not grade_classes:
            continue
        
        for template in templates:
            # Find teachers who teach this grade
            grade_teachers = []
            for cls in grade_classes:
                teacher = db.query(Teacher).filter(Teacher.id == cls.teacher_id).first()
                if teacher:
                    grade_teachers.append(teacher)
            
            if not grade_teachers:
                grade_teachers = teachers
            
            teacher = random.choice(grade_teachers)
            
            # Create material
            material = LearningMaterial(
                title=template["title"],
                description=template["description"],
                material_type=template["material_type"],
                file_path=template["file_path"],
                external_url=template["external_url"],
                upload_date=date.today() - timedelta(days=random.randint(0, 60)),
                teacher_id=teacher.id
            )
            
            db.add(material)
            db.flush()
            materials_created.append(material)
            
            # Immediately link to appropriate grade classes
            for cls in grade_classes:
                class_material = ClassMaterial(
                    class_id=cls.id,
                    material_id=material.id
                )
                db.add(class_material)
    
    # Finally, assign materials to classes
    for material in materials_created:
        # Determine how many classes should have this material (1-3)
        num_classes = random.randint(1, min(3, len(classes)))
        
        # Randomly select classes
        selected_classes = random.sample(classes, num_classes)
        
        # Link material to selected classes
        for cls in selected_classes:
            # Skip if already linked (for grade-specific materials)
            existing = db.query(ClassMaterial).filter(
                ClassMaterial.class_id == cls.id,
                ClassMaterial.material_id == material.id
            ).first()
            
            if not existing:
                class_material = ClassMaterial(
                    class_id=cls.id,
                    material_id=material.id
                )
                db.add(class_material)
    
    db.commit()
    print(f"Created {len(materials_created)} learning materials linked to classes.")
    print("Learning materials population complete!")

if __name__ == "__main__":
    try:
        populate_learning_materials()
        print("Learning materials data populated successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()