@echo off
cd backend
call venv\Scripts\activate
python create_test_users.py
pause