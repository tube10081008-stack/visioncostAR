@echo off
echo Starting VisionCost AI Server...
echo Please ensure you have set your GEMINI_API_KEY environment variable.
echo Server running at http://localhost:8000

REM Try to use the local venv python if it exists
if exist "..\.venv\Scripts\python.exe" (
    ..\.venv\Scripts\python.exe backend/main.py
) else (
    REM Fallback to global python
    python backend/main.py
)

pause
