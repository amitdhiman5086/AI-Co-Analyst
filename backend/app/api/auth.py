from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.database.models.user import Profile
from supabase_auth.types import User as SupabaseUser
import anyio

router = APIRouter(prefix="/auth", tags=["auth"])

def db_sync_profile(db: Session, user_id: str, email: str) -> Profile:
    """
    Executes profile lookup and creation in a synchronous database session.
    """
    # Check if a profile with the Supabase auth user ID already exists
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        profile = Profile(id=user_id, email=email)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.post("/sync")
async def sync_profile(
    current_user: SupabaseUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Syncs the Supabase user identity with the local database profiles table.
    Creates a new profile if it's the user's first time logging in.
    """
    if not current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticated user must have a valid email address."
        )

    # Offload the blocking SQLAlchemy operation to a worker thread
    profile = await anyio.to_thread.run_sync(
        db_sync_profile, db, current_user.id, current_user.email
    )
    
    return {
        "id": str(profile.id),
        "email": profile.email,
        "created_at": profile.created_at.isoformat() if profile.created_at else None
    }
