@echo off
echo 🚀 Setting up Interview AI - Voice-Driven Interview Practice
echo ==========================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit .env file and add your OpenAI API key
    echo    Get your API key from: https://platform.openai.com/api-keys
) else (
    echo ✅ .env file already exists
)

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist server\uploads mkdir server\uploads

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🔑 Get your OpenAI API key from: https://platform.openai.com/api-keys
echo.
echo Happy Interviewing! 🎯
pause
