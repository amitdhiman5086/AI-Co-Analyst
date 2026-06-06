from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.auth import router as auth_router

app = FastAPI(
    title="AI Co-Analyst Backend",
    description="FastAPI service for AI Co-Analyst retrieval, grounding, and chat operations.",
    version="0.1.0"
)

# Configure CORS Middleware using settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)

@app.get("/health", status_code=200)
async def health_check():
    """
    Health check endpoint to verify that the service is running.
    """
    return {"status": "ok"}

# Trigger reload with new env vars
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
