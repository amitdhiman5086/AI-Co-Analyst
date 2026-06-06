from __future__ import annotations
from datetime import datetime
from uuid import UUID
from sqlalchemy import DateTime, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .chat import ChatThread

class Profile(Base):
    """
    Profile model representing the 'profiles' table.
    Links directly to Supabase auth.users.id.
    """
    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=text("now()"), 
        onupdate=text("now()")
    )

    # Relationships
    threads: Mapped[List[ChatThread]] = relationship(back_populates="user", cascade="all, delete-orphan")
