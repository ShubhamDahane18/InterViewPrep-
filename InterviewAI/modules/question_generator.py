# Generates HR & Technical questions
import google.generativeai as genai
from typing import List, Dict
from config.settings import GEMINI_API_KEY, GEMINI_MODEL, HR_QUESTIONS_COUNT, TECHNICAL_QUESTIONS_COUNT
from config.prompts import HR_QUESTION_PROMPT, TECHNICAL_QUESTION_PROMPT
from utils.logger import get_logger
from utils.custom_exception import CustomException

logger = get_logger(__name__)

class QuestionGenerator:
    def __init__(self):
        self.logger = logger
        self._setup_gemini()
        
    def _setup_gemini(self):
        """Initialize Gemini API"""
        try:
            if not GEMINI_API_KEY:
                raise CustomException("GEMINI_API_KEY not found. Please set it in your environment variables.")
            
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL)
            self.logger.info("Gemini API initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing Gemini API: {str(e)}")
            raise CustomException(f"Failed to initialize Gemini API: {str(e)}")
    
    def generate_hr_questions(self, resume_data: Dict, num_questions: int = None) -> List[Dict]:
        """Generate HR interview questions based on resume"""
        try:
            if num_questions is None:
                num_questions = HR_QUESTIONS_COUNT
            
            self.logger.info(f"Generating {num_questions} HR questions")
            
            # Prepare resume text for prompt
            resume_text = self._prepare_resume_text(resume_data)
            
            # Create prompt
            prompt = HR_QUESTION_PROMPT.format(
                num_questions=num_questions,
                resume_text=resume_text
            )
            
            # Generate questions using Gemini
            response = self.model.generate_content(prompt)
            questions_text = response.text.strip()
            
            # Parse questions
            questions = self._parse_questions(questions_text, "HR")
            
            self.logger.info(f"Successfully generated {len(questions)} HR questions")
            return questions
            
        except Exception as e:
            self.logger.error(f"Error generating HR questions: {str(e)}")
            raise CustomException(f"Failed to generate HR questions: {str(e)}")
    
    def generate_technical_questions(self, resume_data: Dict, num_questions: int = None) -> List[Dict]:
        """Generate technical interview questions based on resume"""
        try:
            if num_questions is None:
                num_questions = TECHNICAL_QUESTIONS_COUNT
            
            self.logger.info(f"Generating {num_questions} technical questions")
            
            # Prepare resume text for prompt
            resume_text = self._prepare_resume_text(resume_data)
            
            # Create prompt
            prompt = TECHNICAL_QUESTION_PROMPT.format(
                num_questions=num_questions,
                resume_text=resume_text
            )
            
            # Generate questions using Gemini
            response = self.model.generate_content(prompt)
            questions_text = response.text.strip()
            
            # Parse questions
            questions = self._parse_questions(questions_text, "Technical")
            
            self.logger.info(f"Successfully generated {len(questions)} technical questions")
            return questions
            
        except Exception as e:
            self.logger.error(f"Error generating technical questions: {str(e)}")
            raise CustomException(f"Failed to generate technical questions: {str(e)}")
    
    def _prepare_resume_text(self, resume_data: Dict) -> str:
        """Prepare resume text for question generation"""
        text_parts = []
        
        # Add contact info
        if resume_data.get('contact_info'):
            contact = resume_data['contact_info']
            if contact.get('email'):
                text_parts.append(f"Email: {contact['email']}")
            if contact.get('phone'):
                text_parts.append(f"Phone: {contact['phone']}")
        
        # Add sections
        if resume_data.get('sections'):
            for section_name, content in resume_data['sections'].items():
                text_parts.append(f"{section_name.title()}: {content}")
        
        # Add skills
        if resume_data.get('skills'):
            skills_text = ", ".join(resume_data['skills'])
            text_parts.append(f"Skills: {skills_text}")
        
        # Add raw text if sections are not available
        if not text_parts and resume_data.get('raw_text'):
            text_parts.append(resume_data['raw_text'])
        
        return "\n\n".join(text_parts)
    
    def _parse_questions(self, questions_text: str, question_type: str) -> List[Dict]:
        """Parse generated questions text into structured format"""
        questions = []
        lines = questions_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Remove numbering (1., 2., etc.)
            import re
            line = re.sub(r'^\d+\.\s*', '', line)
            
            if line and len(line) > 10:  # Basic validation
                questions.append({
                    'question': line,
                    'type': question_type,
                    'difficulty': self._assess_difficulty(line),
                    'category': self._categorize_question(line, question_type)
                })
        
        return questions
    
    def _assess_difficulty(self, question: str) -> str:
        """Assess question difficulty based on content"""
        question_lower = question.lower()
        
        # Simple heuristic for difficulty assessment
        if any(word in question_lower for word in ['explain', 'describe', 'analyze', 'compare', 'evaluate']):
            return 'Hard'
        elif any(word in question_lower for word in ['what', 'how', 'why', 'when', 'where']):
            return 'Medium'
        else:
            return 'Easy'
    
    def _categorize_question(self, question: str, question_type: str) -> str:
        """Categorize question based on content"""
        question_lower = question.lower()
        
        if question_type == "HR":
            if any(word in question_lower for word in ['team', 'teamwork', 'collaboration']):
                return 'Teamwork'
            elif any(word in question_lower for word in ['lead', 'leadership', 'manage']):
                return 'Leadership'
            elif any(word in question_lower for word in ['problem', 'challenge', 'difficult']):
                return 'Problem Solving'
            elif any(word in question_lower for word in ['goal', 'career', 'future']):
                return 'Career Goals'
            else:
                return 'General HR'
        
        else:  # Technical
            if any(word in question_lower for word in ['code', 'programming', 'algorithm']):
                return 'Programming'
            elif any(word in question_lower for word in ['database', 'sql', 'data']):
                return 'Database'
            elif any(word in question_lower for word in ['system', 'architecture', 'design']):
                return 'System Design'
            elif any(word in question_lower for word in ['framework', 'library', 'tool']):
                return 'Frameworks & Tools'
            else:
                return 'General Technical'