from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from app.config import settings

def get_supabase_client(token: str) -> Client:
    """
    Creates a user-scoped Supabase client authenticated with the user's JWT token.
    This client is suitable for operations that should respect Row Level Security (RLS)
    policies based on the authenticated user.
    """
    options = SyncClientOptions(
        headers={"Authorization": f"Bearer {token}"}
    )
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_ANON_KEY,
        options=options
    )

def get_supabase_admin_client() -> Client:
    """
    Creates an administrative Supabase client using the service-role key.
    This client bypasses Row Level Security (RLS) policies and should only be used
    on the backend for privileged operations.
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )
