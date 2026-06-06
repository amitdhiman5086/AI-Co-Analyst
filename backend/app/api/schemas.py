from pydantic import BaseModel


class CreateThreadRequest(BaseModel):
    title: str


class ThreadResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class AISdkMessage(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    threadId: str
    messages: list[AISdkMessage]
