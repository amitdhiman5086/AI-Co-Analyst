import anyio
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase_auth.types import User
from supabase_auth.errors import AuthApiError
from app.database.supabase import get_supabase_client

# HTTPBearer security scheme to extract the Authorization header
security = HTTPBearer(auto_error=True)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Dependency that verifies the Supabase JWT in the Authorization header.
    Calls Supabase Auth to retrieve the user's details and validates the session.
    
    Raises HTTP 401 if:
    - The token is missing, expired, or invalid.
    - The user cannot be found/authenticated.
    """
    token = credentials.credentials
    client = get_supabase_client(token)
    
    try:
        # Run the blocking network call to Supabase in a separate thread
        # to prevent blocking the async FastAPI event loop.
        response = await anyio.to_thread.run_sync(client.auth.get_user, token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return response.user
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        # Re-raise already constructed HTTPExceptions
        raise
    except Exception:
        # Catch unexpected errors (e.g. network/connection issues) and return 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
