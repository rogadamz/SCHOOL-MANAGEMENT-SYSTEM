# backend/app/routers/materials.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.student import Class
from ..models.timetable import LearningMaterial, ClassMaterial
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/materials",
    tags=["materials"],
    responses={401: {"description": "Not authenticated"}},
)

class MaterialBase(BaseModel):
    title: str
    description: str
    material_type: str
    external_url: Optional[str] = None

@router.get("/")
async def get_materials(
    class_id: Optional[int] = None,
    material_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all learning materials, optionally filtered by class or type"""
    if class_id:
        # Get materials for a specific class
        materials = db.query(LearningMaterial).join(
            ClassMaterial, ClassMaterial.material_id == LearningMaterial.id
        ).filter(
            ClassMaterial.class_id == class_id
        )
    else:
        # Get all materials
        materials = db.query(LearningMaterial)
    
    # Filter by material type
    if material_type:
        materials = materials.filter(LearningMaterial.material_type == material_type)
    
    return materials.all()

@router.post("/")
async def create_material(
    material: MaterialBase,
    class_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new learning material"""
    # Only teachers and admins can create materials
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized to create materials")
    
    # Create the material
    new_material = LearningMaterial(
        title=material.title,
        description=material.description,
        material_type=material.material_type,
        external_url=material.external_url,
        upload_date=date.today(),
        teacher_id=current_user.id  # Assuming teachers use the User model
    )
    
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    
    # Associate material with classes
    for class_id in class_ids:
        # Verify class exists
        class_obj = db.query(Class).filter(Class.id == class_id).first()
        if not class_obj:
            continue  # Skip invalid class IDs
            
        class_material = ClassMaterial(
            class_id=class_id,
            material_id=new_material.id
        )
        db.add(class_material)
    
    db.commit()
    
    return new_material