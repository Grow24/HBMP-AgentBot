@echo off
echo ========================================
echo  LibreChat - Complete Setup and Run
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js v20+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit the .env file and add your Gemini API key!
    echo.
    echo Find this line:
    echo   GOOGLE_KEY=user_provided
    echo.
    echo Replace it with:
    echo   GOOGLE_KEY=your_actual_gemini_api_key
    echo.
    notepad .env
    echo.
    echo Press any key after saving your API key...
    pause >nul
)

REM Check if node_modules exists
if not exist node_modules (
    echo.
    echo ========================================
    echo  Step 1: Installing Dependencies
    echo ========================================
    echo This will take 5-10 minutes...
    echo.
    call npm ci
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo.
    echo ========================================
    echo  Step 2: Building Frontend
    echo ========================================
    echo This will take 5-10 minutes...
    echo.
    call npm run frontend
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to build frontend
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo  Step 3: Starting Services
echo ========================================
echo.

REM Check Docker
docker ps >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker is not running!
    echo.
    echo Please start Docker Desktop, then press any key...
    pause >nul
)

echo Starting MongoDB and Meilisearch...
docker compose up -d mongodb meilisearch
if errorlevel 1 (
    echo ERROR: Failed to start Docker services
    echo.
    echo Alternative: Install MongoDB locally from:
    echo https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo.
echo Waiting for services to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  Starting LibreChat Backend
echo ========================================
echo.
echo  URL: http://localhost:3080
echo  
echo  First time users:
echo  1. Go to http://localhost:3080
echo  2. Click "Sign up"
echo  3. Create your account
echo  4. Start chatting with Gemini!
echo.
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run backend

pause

