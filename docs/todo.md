# AI Co-Analyst Implementation Plan

## Phase 1: Project Scaffolding & Configuration
- [ ] Scaffold Frontend SPA (`frontend/`): React, Vite, TS, Tailwind CSS, React Router.
- [ ] Scaffold Backend Service (`backend/`): FastAPI, Pydantic settings.
- [ ] Create `backend/app/config.py` using `pydantic-settings` to validate:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `AI_GATEWAY_URL`
  - `AI_GATEWAY_API_KEY` (optional)
  - `LLM_MODEL`
  - `EMBEDDING_MODEL`
  - `EMBEDDING_DIMENSIONS`
- [ ] Create `frontend/src/lib/env.ts` to validate:
  - `VITE_API_BASE_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Install dev tools, formatters (`ruff`), and setup `pyproject.toml` editability.

## Phase 2: Database Schema & Migrations
- [ ] Set up Alembic configuration in `backend/alembic.ini` and `backend/alembic/env.py`.
- [ ] Define database models in `backend/app/database/models.py`:
  - `profiles` (authenticated user profiles)
  - `chat_threads` (chat threads)
  - `chat_messages` (chat messages)
  - `message_citations` (citation links)
  - `source_documents` (metadata + parsed content)
  - `document_chunks` (text, embedding vector, tsvector)
- [ ] Generate initial Alembic migration.
- [ ] Edit candidate migration to include Postgres-specific features:
  - `CREATE EXTENSION IF NOT EXISTS vector;`
  - `vector(1536)` embedding column type.
  - Generated `tsvector` columns for Full-Text Search.
  - HNSW index on `document_chunks.embedding` for semantic vector search.
  - GIN indexes for FTS and metadata queries.
  - Row Level Security (RLS) policies.
- [ ] Apply migrations locally or against linked hosted Supabase DB.

## Phase 3: Auth & Secure Communication
- [ ] Wire up Supabase Auth on the frontend (`@supabase/supabase-js`).
- [ ] Implement backend JWT verification dependency in `backend/app/auth/dependencies.py`.
- [ ] Add thin fetch client in `frontend/src/lib/http.ts` and API singleton in `frontend/src/lib/api.ts` to inject Supabase JWT automatically into `Authorization: Bearer <token>` header.
- [ ] Add cors middleware to FastAPI matching configured `ALLOWED_ORIGINS`.

## Phase 4: Ingestion Pipeline
- [ ] Implement local SEC downloading script (already seeded).
- [ ] Build parser to clean SEC HTML filings into clean Markdown documents.
- [ ] Implement recursive text chunking strategy.
- [ ] Create embedding service in `backend/app/retrieval/embedding.py` calling the Vercel AI Gateway endpoint.
- [ ] Store source documents and chunks (along with generated embeddings and tsvectors) in Supabase.

## Phase 5: Hybrid Retrieval Layer
- [ ] Implement semantic search over `document_chunks.embedding` via `pgvector`.
- [ ] Implement lexical search over `document_chunks.search_vector` via Postgres Full-Text Search.
- [ ] Build Reciprocal Rank Fusion (RRF) in Python to fuse semantic and lexical query rankings.
- [ ] Build retrieval service to fetch top-K fused chunks + document context.

## Phase 6: PydanticAI Agent Orchestration
- [ ] Create PydanticAI agent definition in `backend/app/assistant/agent.py` configured with `base_url` pointing to the Vercel AI Gateway URL.
- [ ] Define runtime dependency injection model (`DocumentAgentDeps`).
- [ ] Define typed grounding models (`GroundedAnswer`, `Citation`, `SourcePassage`).
- [ ] Colocate system prompt instructions restricting the model to retrieved evidence.
- [ ] Implement grounding validator to ensure every citation strictly matches retrieved passages.

## Phase 7: Streaming & Chat API
- [ ] Implement `POST /chat/stream` FastAPI route handling authorization, orchestrating retrieval, running the PydanticAI agent, and formatting streaming event parts.
- [ ] Setup persistent chats, threads, and citation storage in the database upon successful completions.
- [ ] Handle error scenarios gracefully (unauthorized, grounding errors, rate limits) and emit clear events.

## Phase 8: Frontend Chat UI
- [ ] Install Vercel AI SDK React primitives.
- [ ] Create chat route and layout (thread sidebar, past history loading, sign out button).
- [ ] Build interactive chat interface with auto-scrolling, streaming indicator, and markdown formatting.
- [ ] Render citation tags linking to source metadata.
- [ ] Build click-to-view modal/sidebar showing the verified source excerpt.

## Phase 9: Testing, Optimization & Review
- [ ] Write unit tests for chunking, RRF fusion, citation extraction, and grounding validator.
- [ ] Build mock client tests to verify token auth and API streaming responses.
- [ ] Audit dependencies for size, performance, and compliance with the project dependency policy.