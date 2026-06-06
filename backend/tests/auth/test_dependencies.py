import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from supabase_auth.errors import AuthApiError
from app.auth.dependencies import get_current_user

@pytest.mark.anyio
async def test_get_current_user_success():
    token = "valid_token"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    # Mock user details
    mock_user = MagicMock()
    mock_user.id = "user-123"
    mock_user.email = "test@example.com"
    
    mock_response = MagicMock()
    mock_response.user = mock_user
    
    with patch("app.auth.dependencies.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        user = await get_current_user(credentials)
        
        assert user.id == "user-123"
        assert user.email == "test@example.com"
        mock_get_client.assert_called_once_with(token)
        mock_client.auth.get_user.assert_called_once_with(token)

@pytest.mark.anyio
async def test_get_current_user_invalid_response():
    token = "invalid_token"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    mock_response = MagicMock()
    mock_response.user = None
    
    with patch("app.auth.dependencies.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.return_value = mock_response
        mock_get_client.return_value = mock_client
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials)
            
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid or expired authentication token"

@pytest.mark.anyio
async def test_get_current_user_auth_api_error():
    token = "expired_token"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    # We can create a mock AuthApiError
    # AuthApiError needs a message, status, and code
    err = AuthApiError("Token expired", 401, "invalid_jwt")
    
    with patch("app.auth.dependencies.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.side_effect = err
        mock_get_client.return_value = mock_client
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials)
            
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Authentication failed:" in exc_info.value.detail

@pytest.mark.anyio
async def test_get_current_user_unexpected_error():
    token = "valid_token"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    with patch("app.auth.dependencies.get_supabase_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.auth.get_user.side_effect = RuntimeError("Connection timeout")
        mock_get_client.return_value = mock_client
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials)
            
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"
