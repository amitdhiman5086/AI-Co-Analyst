from __future__ import annotations
from datetime import datetime, date
from uuid import UUID
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, text, Computed, Index
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional, TYPE_CHECKING
from pgvector.sqlalchemy import Vector
from .base import Base

if TYPE_CHECKING:
    from .chat import MessageCitation

class SourceDocument(Base):
    """
    SourceDocument model representing the 'source_documents' table.
    Stores the full filing text and its high-level metadata.
    """
    __tablename__ = "source_documents"

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    ticker: Mapped[str] = mapped_column(String(10), index=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    filing_type: Mapped[str] = mapped_column(String(10), nullable=False)
    filing_date: Mapped[date] = mapped_column(Date, nullable=False)
    year: Mapped[int] = mapped_column(nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False) # Normalized Markdown
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=text("now()"), 
        onupdate=text("now()")
    )

    # Relationships
    chunks: Mapped[List[DocumentChunk]] = relationship(back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    """
    DocumentChunk model representing the 'document_chunks' table.
    Stores chunked document segments with vector and full-text search representations.
    """
    __tablename__ = "document_chunks"

    __table_args__ = (
        Index(
            "ix_document_chunks_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"}
        ),
        Index("ix_document_chunks_search_vector", "search_vector", postgresql_using="gin"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    document_id: Mapped[UUID] = mapped_column(ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536), nullable=False) # pgvector embeddings
    search_vector: Mapped[Optional[TSVECTOR]] = mapped_column(
        TSVECTOR,
        Computed("to_tsvector('english', content)"),
        nullable=True
    ) # Full-text search vector
    token_count: Mapped[int] = mapped_column(Integer, nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSONB, server_default=text("'{}'::jsonb"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    document: Mapped[SourceDocument] = relationship(back_populates="chunks")
    citations: Mapped[List[MessageCitation]] = relationship(back_populates="chunk", cascade="all, delete-orphan")
