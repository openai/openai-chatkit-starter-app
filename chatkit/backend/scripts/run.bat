@echo off
REM Simple helper to start the ChatKit backend on Windows

setlocal enabledelayedexpansion

cd /d "%~dp0\.."

if not exist ".venv" (
    echo Creating virtual env in %CD%\.venv ...
    python -m venv .venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment. Make sure Python is installed.
        exit /b 1
    )
)

call .venv\Scripts\activate.bat

echo Installing backend deps (editable) ...
pip install -e . >nul 2>&1
if errorlevel 1 (
    echo Warning: pip install had issues, but continuing...
)

REM Load env vars from the repo's .env.local (if present)
set "ENV_FILE=%~dp0..\..\.env.local"
if "%OPENAI_API_KEY%"=="" (
    if exist "!ENV_FILE!" (
        echo Sourcing OPENAI_API_KEY from !ENV_FILE!
        for /f "usebackq tokens=1,* delims==" %%a in ("!ENV_FILE!") do (
            if "%%a"=="OPENAI_API_KEY" set "OPENAI_API_KEY=%%b"
        )
    )
)

if "%OPENAI_API_KEY%"=="" (
    echo.
    echo Error: OPENAI_API_KEY is not set.
    echo Please set OPENAI_API_KEY in your environment or in .env.local
    echo.
    exit /b 1
)

echo Starting ChatKit backend on http://127.0.0.1:8000 ...
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
