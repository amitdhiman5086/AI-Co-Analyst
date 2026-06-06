# AI Co-Analyst Backend

FastAPI service for the AI Co-Analyst project. This service handles retrieval (hybrid vector + full-text search), grounding validation, and LLM chat orchestration.

---

## 🛠️ Prerequisites

Ensure you have the following installed:
* **Python** >= 3.12
* **uv** (Astral's fast Python package installer and resolver)

---

## 🚀 Getting Started

### 1. Installation

Install project dependencies using `uv`:

```bash
uv sync
```

This creates a virtual environment under `.venv/` and installs all packages defined in `pyproject.toml`.

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the required variables:
* **Supabase Credentials:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
* **Database URL:** `DATABASE_URL` (Direct connection, not transaction pooler)
* **Vercel AI Gateway:** `AI_GATEWAY_URL`

### 3. Database Migrations

Run Alembic migrations to align your Supabase database schema:

```bash
uv run alembic upgrade head
```

---

## 🖥️ Running the Application

Start the local development server:

```bash
uv run uvicorn app.main:app --reload
```

* **API Base URL:** `http://127.0.0.1:8000`
* **Interactive API Docs (Swagger):** `http://127.0.0.1:8000/docs`
* **Alternative Docs (ReDoc):** `http://127.0.0.1:8000/redoc`

### Verify the Service (Health Check)

To verify the server is running properly:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status":"ok"}
```

---

## 🧪 Running Tests

Run the test suite using `pytest`:

```bash
# Run all unit tests (excluding integration tests)
uv run pytest -m "not integration"

# Run all tests, including integration tests
uv run pytest
```

---

## ⚙️ Development Guidelines

* **Settings management:** All configuration should be accessed via `from app.config import settings`. Do **not** use `os.getenv` or `load_dotenv` directly in application code.
* **Code Formatting & Linting:** Use `ruff` to keep the codebase clean:
  ```bash
  uv run ruff format .
  uv run ruff check .
  ```
