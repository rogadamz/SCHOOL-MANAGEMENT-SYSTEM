# backend/app/routers/messages.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ..services.database import get_db
from ..models.user import User
from ..models.timetable import Message
from ..utils.auth_utils import get_current_active_user

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={401: {"description": "Not authenticated"}},
)

class MessageCreate(BaseModel):
    recipient_id: int
    subject: str
    content: str
    parent_message_id: Optional[int] = None

@router.get("/")
async def get_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all messages for the current user"""
    # Get messages where the current user is either sender or recipient
    messages = db.query(Message).filter(
        (Message.sender_id == current_user.id) | 
        (Message.recipient_id == current_user.id)
    ).order_by(Message.sent_at.desc()).all()
    
    return messages

@router.post("/")
async def create_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new message"""
    # Validate recipient exists
    recipient = db.query(User).filter(User.id == message.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create new message
    new_message = Message(
        sender_id=current_user.id,
        recipient_id=message.recipient_id,
        subject=message.subject,
        content=message.content,
        sent_at=datetime.now(),
        read=False,
        parent_message_id=message.parent_message_id
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message