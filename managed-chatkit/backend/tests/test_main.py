from __future__ import annotations

from fastapi.testclient import TestClient
import httpx

from app import main


def test_resolve_error_message_prefers_nested_error_message() -> None:
    payload = {"error": {"message": "Workflow id is invalid"}}

    message = main.resolve_error_message(payload, fallback="Fallback")

    assert message == "Workflow id is invalid"


def test_resolve_error_message_uses_top_level_error_string() -> None:
    payload = {"error": "Rate limit exceeded"}

    message = main.resolve_error_message(payload, fallback="Fallback")

    assert message == "Rate limit exceeded"


def test_create_session_flattens_nested_upstream_error(monkeypatch) -> None:
    class StubAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self) -> "StubAsyncClient":
            return self

        async def __aexit__(self, exc_type, exc, tb) -> bool:
            return False

        async def post(self, *args, **kwargs) -> httpx.Response:
            request = httpx.Request(
                "POST", "https://api.openai.com/v1/chatkit/sessions"
            )
            return httpx.Response(
                status_code=400,
                json={"error": {"message": "Workflow not found"}},
                request=request,
            )

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(main.httpx, "AsyncClient", StubAsyncClient)

    client = TestClient(main.app)
    response = client.post("/api/create-session", json={"workflow": {"id": "wf_123"}})

    assert response.status_code == 400
    assert response.json() == {"error": "Workflow not found"}
    assert "chatkit_session_id=" in response.headers.get("set-cookie", "")
