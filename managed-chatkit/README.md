# Managed ChatKit starter

Vite + React UI that talks to a FastAPI session backend for creating ChatKit
workflow sessions.

## Quick start

```bash
npm install           # installs root deps (concurrently)
npm run dev           # runs FastAPI on :8000 and Vite on :3000
```

What happens:

- `npm run dev` runs the backend via `backend/scripts/run.sh` (FastAPI +
  uvicorn) and the frontend via `npm --prefix frontend run dev`.
- The backend exposes `/api/create-session`, exchanging your workflow id and
  `OPENAI_API_KEY` for a ChatKit client secret. The Vite dev server proxies
  `/api/*` to `127.0.0.1:8000`.

## Required environment

- `OPENAI_API_KEY`
- `VITE_CHATKIT_WORKFLOW_ID`
- (optional) `CHATKIT_API_BASE` or `VITE_CHATKIT_API_BASE` (defaults to `https://api.openai.com`)
- (optional) `VITE_API_URL` (override the dev proxy target for `/api`)

Set the env vars in your shell (or process manager) before running. Use a
workflow id from Agent Builder (starts with `wf_...`) and an API key from the
same project and organization.

## Customize

- UI: `frontend/src/components/ChatKitPanel.tsx`
- Session logic: `backend/app/main.py`

## Deploy with Docker

### Build

```bash
docker build \
  --build-arg VITE_CHATKIT_WORKFLOW_ID=wf_xxxxx \
  -t managed-chatkit .
```

### Run

```bash
docker run -d \
  -e OPENAI_API_KEY=sk-proj-xxxxx \
  -p 8000:8000 \
  --name managed-chatkit \
  managed-chatkit
```

The app will be available at `http://localhost:8000`.

### Environment variables

| Variable | Build-time | Runtime | Description |
|----------|------------|---------|-------------|
| `VITE_CHATKIT_WORKFLOW_ID` | Required | Required | Your ChatKit workflow ID |
| `OPENAI_API_KEY` | - | Required | OpenAI API key |
| `CHATKIT_API_BASE` | - | Optional | ChatKit API base URL |

### Production deployment

For production, pass `OPENAI_API_KEY` via your orchestrator's secret management:

- **Kubernetes**: Use Secrets
- **Cloud Run**: Use `--set-secrets`
- **ECS**: Use Task Definition secrets
- **Azure Container Apps**: Use secret references
