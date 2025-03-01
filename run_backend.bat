@echo off
cd backend
call venv\Scripts\activate
set PYTHONPATH=%PYTHONPATH%;%CD%
python -m uvicorn app.main:app --reload