# syntax=docker/dockerfile:1

FROM node:20-slim AS builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

ARG VITE_CHATKIT_WORKFLOW_ID
ENV VITE_CHATKIT_WORKFLOW_ID=${VITE_CHATKIT_WORKFLOW_ID}

RUN npm run build

FROM python:3.12-slim AS runtime

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY --from=builder /app/dist ./dist

COPY backend/pyproject.toml ./

RUN uv pip install --system -e .

COPY backend/app ./app

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--log-level", "info"]
