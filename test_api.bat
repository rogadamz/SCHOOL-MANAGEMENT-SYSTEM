@echo off
echo Testing login API with admin user...
curl -X POST ^
  http://127.0.0.1:8000/auth/token ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin&password=admin123"

echo.
echo.
echo Testing "me" endpoint with the token from above...
echo Replace YOUR_TOKEN_HERE with the access_token received from the login response
curl -X GET ^
  http://127.0.0.1:8000/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

pause