from __future__ import annotations
from datetime import datetime
from uuid import UUID
from sqlalchemy import DateTime, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .user import Profile
    from .document import DocumentChunk

class ChatThread(Base):
    """
    ChatThread model representing the 'chat_threads' table.
    Groups messages belonging to a user.
    """
    __tablename__ = "chat_threads"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=text("now()"), 
        onupdate=text("now()")
    )

    # Relationships
    user: Mapped[Profile] = relationship(back_populates="threads")
    messages: Mapped[List[ChatMessage]] = relationship(back_populates="thread", cascade="all, delete-orphan")


class ChatMessage(Base):
    """
    ChatMessage model representing the 'chat_messages' table.
    Stores messages in a thread from user, assistant, or system roles.
    """
    __tablename__ = "chat_messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    thread_id: Mapped[UUID] = mapped_column(ForeignKey("chat_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    additional_metadata: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    thread: Mapped[ChatThread] = relationship(back_populates="messages")
    citations: Mapped[List[MessageCitation]] = relationship(back_populates="message", cascade="all, delete-orphan")


class MessageCitation(Base):
    """
    MessageCitation model representing the 'message_citations' table.
    Links assistant messages to specific cited document chunks.
    """
    __tablename__ = "message_citations"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    message_id: Mapped[UUID] = mapped_column(ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id: Mapped[UUID] = mapped_column(ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    message: Mapped[ChatMessage] = relationship(back_populates="citations")
    chunk: Mapped[DocumentChunk] = relationship(back_populates="citations")
