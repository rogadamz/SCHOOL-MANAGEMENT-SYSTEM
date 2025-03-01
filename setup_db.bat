@echo off
echo Creating PostgreSQL database...

REM Connect to PostgreSQL and create the database if it doesn't exist
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "SELECT 'CREATE DATABASE downtown_nursery_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'downtown_nursery_db')\gexec"

echo Database setup complete!
pause