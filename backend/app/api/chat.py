import asyncio
from uuid import UUID

import anyio
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from supabase_auth.types import User as SupabaseUser

from app.auth.dependencies import get_current_user
from app.database.models.chat import ChatMessage, ChatThread
from app.database.session import get_db
from app.api.schemas import (
    ChatStreamRequest,
    CreateThreadRequest,
    MessageResponse,
    ThreadResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])

STUB_REPLY = (
    "This is a stubbed assistant response. "
    "In a future phase, this will be replaced with a real retrieval-augmented answer "
    "grounded in SEC filing passages."
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_owned_thread(thread_id: str, user_id: str, db: Session) -> ChatThread:
    """Load a thread and verify the caller owns it."""
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if str(thread.user_id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return thread


def _db_list_threads(user_id: str, db: Session) -> list[ChatThread]:
    return (
        db.query(ChatThread)
        .filter(ChatThread.user_id == user_id)
        .order_by(ChatThread.updated_at.desc())
        .all()
    )


def _db_create_thread(user_id: str, title: str, db: Session) -> ChatThread:
    thread = ChatThread(user_id=user_id, title=title)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def _db_load_messages(thread_id: str, db: Session) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == thread_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


def _db_add_message(thread_id: str, role: str, content: str, db: Session) -> ChatMessage:
    msg = ChatMessage(thread_id=thread_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def _thread_to_response(thread: ChatThread) -> dict:
    return ThreadResponse(
        id=str(thread.id),
        title=thread.title,
        created_at=thread.created_at.isoformat(),
        updated_at=thread.updated_at.isoformat(),
    ).model_dump()


def _message_to_response(msg: ChatMessage) -> dict:
    return MessageResponse(
        id=str(msg.id),
        role=msg.role,
        content=msg.content,
        created_at=msg.created_at.isoformat(),
    ).model_dump()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/threads")
async def list_threads(
    current_user: SupabaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's chat threads, newest first."""
    threads = await anyio.to_thread.run_sync(
        _db_list_threads, str(current_user.id), db
    )
    return [_thread_to_response(t) for t in threads]


@router.post("/threads", status_code=201)
async def create_thread(
    body: CreateThreadRequest,
    current_user: SupabaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat thread for the authenticated user."""
    thread = await anyio.to_thread.run_sync(
        _db_create_thread, str(current_user.id), body.title, db
    )
    return _thread_to_response(thread)


@router.get("/threads/{thread_id}")
async def get_thread_messages(
    thread_id: str,
    current_user: SupabaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load message history for a thread the user owns."""
    await anyio.to_thread.run_sync(
        _get_owned_thread, thread_id, str(current_user.id), db
    )
    messages = await anyio.to_thread.run_sync(_db_load_messages, thread_id, db)
    return [_message_to_response(m) for m in messages]


@router.post("/stream")
async def chat_stream(
    body: ChatStreamRequest,
    current_user: SupabaseUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept AI SDK message format, stream a stubbed assistant reply,
    and persist both user and assistant messages after the stream completes.
    """
    user_id = str(current_user.id)

    # Validate thread ownership
    await anyio.to_thread.run_sync(
        _get_owned_thread, body.threadId, user_id, db
    )

    # Persist the last user message
    last_user_msg = None
    for msg in reversed(body.messages):
        if msg.role == "user":
            last_user_msg = msg
            break

    if last_user_msg:
        await anyio.to_thread.run_sync(
            _db_add_message, body.threadId, "user", last_user_msg.content, db
        )

    async def generate():
        """Emit plain text chunks for TextStreamChatTransport."""
        words = STUB_REPLY.split(" ")
        for i, word in enumerate(words):
            chunk = word if i == 0 else f" {word}"
            yield chunk
            await asyncio.sleep(0.03)

        # Persist the full assistant message after streaming
        await anyio.to_thread.run_sync(
            _db_add_message, body.threadId, "assistant", STUB_REPLY, db
        )

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")

