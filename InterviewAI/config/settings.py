import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-1.5-flash"

# File Upload Settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc']

# Interview Settings
HR_QUESTIONS_COUNT = 5
TECHNICAL_QUESTIONS_COUNT = 5
QUESTION_TIME_LIMIT = 300  # 5 minutes per question

# Report Settings
REPORTS_DIR = "assets/reports"
SAMPLES_DIR = "assets/samples"

# Logging
LOG_LEVEL = "INFO"