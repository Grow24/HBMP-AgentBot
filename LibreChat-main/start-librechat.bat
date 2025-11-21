@echo off
echo ====================================
echo  LibreChat Startup Script
echo ====================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your API keys.
    pause
    exit /b 1
)

echo [1/3] Checking Docker services...
docker ps >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker is not running!
    echo.
    echo Please either:
    echo   1. Start Docker Desktop, then run this script again
    echo   2. Or install MongoDB locally and start it manually
    echo.
    pause
    exit /b 1
)

echo [2/3] Starting MongoDB and Meilisearch...
docker compose up -d mongodb meilisearch
if errorlevel 1 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)

echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting LibreChat backend...
echo.
echo ====================================
echo  LibreChat is starting...
echo  URL: http://localhost:3080
echo ====================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run backend

pause

