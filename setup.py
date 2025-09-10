import os

# Define project structure
project_structure = {
    "InterviewAI": {
        "app.py": "",
        "requirements.txt": "",
        "README.md": "# InterviewAI Project\n\nAn AI-powered interview app with resume parsing, HR & Technical rounds, and real-time voice interviews using Whisper.\n",
        "config": {
            "__init__.py": "",
            "settings.py": "# Configuration file for API keys, model settings, etc.\n",
            "prompts.py": "# Prompt templates for HR & Technical rounds\n",
        },
        "modules": {
            "__init__.py": "",
            "resume_parser.py": "# Extract text & skills from PDF/DOCX\n",
            "question_generator.py": "# Generates HR & Technical questions\n",
            "interview_manager.py": "# Handles Q&A logic\n",
            "evaluator.py": "# Evaluates answers (LLM-based scoring)\n",
            "report_generator.py": "# Builds performance report (PDF/JSON)\n",
            "whisper_handler.py": "# Whisper integration (speech-to-text)\n",
        },
        "utils": {
            "__init__.py": "",
            "file_utils.py": "# File handling helpers\n",
            "text_cleaner.py": "# Text preprocessing functions\n",
            "logger.py": "# Logging utility\n",
        },
        "assets": {
            "css": {},
            "reports": {},
            "samples": {},
        },
        "tests": {
            "test_resume_parser.py": "# Unit tests for resume_parser\n",
            "test_question_generator.py": "# Unit tests for question_generator\n",
            "test_evaluator.py": "# Unit tests for evaluator\n",
            "test_whisper_handler.py": "# Unit tests for whisper_handler\n",
        },
    }
}

def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

if __name__ == "__main__":
    base_path = "."
    create_structure(base_path, project_structure)
    print("✅ Project structure created successfully!")
