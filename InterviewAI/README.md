# Interview AI - AI-Powered Interview Practice

A comprehensive Streamlit application that provides AI-powered interview practice based on your resume. The app uses Google's Gemini API to generate personalized questions and evaluate your answers.

## Features

- 📄 **Resume Parsing**: Extract information from PDF and DOCX resumes
- ❓ **HR Interview**: Generate and practice HR behavioral questions
- 💻 **Technical Interview**: Generate technical questions based on your skills
- 🤖 **AI Evaluation**: Get detailed feedback using Google Gemini API
- 📊 **Performance Reports**: Comprehensive analysis with visualizations
- 📈 **Progress Tracking**: Monitor your interview performance over time

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd InterviewAI
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create a .env file in the InterviewAI directory
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the application:
```bash
streamlit run app.py
```

## Getting Started

1. **Upload Resume**: Go to the Resume Upload page and upload your PDF or DOCX resume
2. **Choose Interview Type**: Select either HR or Technical interview rounds
3. **Answer Questions**: Respond to AI-generated questions based on your resume
4. **Get Evaluated**: Receive detailed feedback and scoring
5. **View Reports**: Access comprehensive performance analysis

## Configuration

The application can be configured through the `config/settings.py` file:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: Model to use (default: gemini-1.5-flash)
- `MAX_FILE_SIZE`: Maximum file size for resume uploads
- `HR_QUESTIONS_COUNT`: Number of HR questions to generate
- `TECHNICAL_QUESTIONS_COUNT`: Number of technical questions to generate

## Project Structure

```
InterviewAI/
├── app.py                 # Main Streamlit application
├── config/               # Configuration files
│   ├── settings.py       # App settings
│   └── prompts.py        # AI prompts
├── modules/              # Core functionality
│   ├── resume_parser.py  # Resume parsing
│   ├── question_generator.py  # Question generation
│   ├── evaluator.py      # Answer evaluation
│   └── report_generator.py  # Report generation
├── utils/                # Utility functions
│   ├── logger.py         # Logging
│   ├── custom_exception.py  # Custom exceptions
│   ├── file_utils.py     # File operations
│   └── text_cleaner.py   # Text processing
├── assets/               # Static assets
│   ├── reports/          # Generated reports
│   └── samples/          # Sample files
└── tests/                # Test files
```

## API Requirements

- **Google Gemini API**: Required for question generation and answer evaluation
- Get your API key from: https://makersuite.google.com/app/apikey

## Usage Examples

### Resume Upload
The app supports PDF and DOCX files up to 10MB. It automatically extracts:
- Contact information
- Skills and competencies
- Work experience
- Education details
- Projects and certifications

### Question Generation
Questions are generated based on:
- Your technical skills
- Work experience
- Education background
- Projects and achievements

### Answer Evaluation
Each answer is evaluated on:
- Relevance to the question
- Technical accuracy (for technical questions)
- Communication skills
- Problem-solving approach

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your GEMINI_API_KEY is set correctly
2. **File Upload Issues**: Ensure your file is PDF or DOCX format and under 10MB
3. **Question Generation Fails**: Check your internet connection and API key validity

### Logs

Check the `logs/` directory for detailed error logs and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.