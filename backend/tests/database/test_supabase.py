from unittest.mock import patch, MagicMock
from app.database.supabase import get_supabase_client, get_supabase_admin_client
from app.config import settings

def test_get_supabase_client():
    token = "test_user_jwt_token"
    
    with patch("app.database.supabase.create_client") as mock_create_client:
        mock_create_client.return_value = MagicMock()
        
        client = get_supabase_client(token)
        
        # Verify that create_client is called with correct parameters
        mock_create_client.assert_called_once()
        args, kwargs = mock_create_client.call_args
        
        assert kwargs["supabase_url"] == settings.SUPABASE_URL
        assert kwargs["supabase_key"] == settings.SUPABASE_ANON_KEY
        
        # Verify header override
        options = kwargs["options"]
        assert options.headers["Authorization"] == f"Bearer {token}"
        assert client is not None

def test_get_supabase_admin_client():
    with patch("app.database.supabase.create_client") as mock_create_client:
        mock_create_client.return_value = MagicMock()
        
        client = get_supabase_admin_client()
        
        # Verify that create_client is called with correct parameters
        mock_create_client.assert_called_once_with(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
        )
        assert client is not None
