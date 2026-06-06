from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create engine using direct DATABASE_URL (sync)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    # Use NullPool or sensible defaults for serverless/container env
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    """
    Generator dependency to yield database sessions.
    FastAPI runs synchronous dependencies in a threadpool automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
