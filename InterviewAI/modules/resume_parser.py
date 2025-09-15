# Extract text & skills from PDF/DOCX
import PyPDF2
import docx
import re
from typing import Dict, List, Optional
from utils.logger import get_logger
from utils.custom_exception import CustomException

logger = get_logger(__name__)

class ResumeParser:
    def __init__(self):
        self.logger = logger
        
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            self.logger.error(f"Error extracting text from PDF: {str(e)}")
            raise CustomException(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            self.logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise CustomException(f"Failed to extract text from DOCX: {str(e)}")
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using pattern matching"""
        # Common technical skills patterns
        skill_patterns = [
            r'\b(?:Python|Java|JavaScript|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin)\b',
            r'\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel)\b',
            r'\b(?:HTML|CSS|Bootstrap|jQuery|SASS|LESS)\b',
            r'\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|GitHub|GitLab)\b',
            r'\b(?:Machine Learning|AI|Data Science|Analytics|Statistics)\b',
            r'\b(?:Project Management|Leadership|Communication|Teamwork)\b',
            r'\b(?:Agile|Scrum|DevOps|CI/CD|Microservices)\b'
        ]
        
        skills = set()
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.update(matches)
        
        return list(skills)
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume text"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone pattern
        phone_pattern = r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group()
        
        return contact_info
    
    def parse_resume(self, file_path: str) -> Dict[str, any]:
        """Main method to parse resume and extract all information"""
        try:
            self.logger.info(f"Starting to parse resume: {file_path}")
            
            # Determine file type and extract text
            if file_path.lower().endswith('.pdf'):
                text = self.extract_text_from_pdf(file_path)
            elif file_path.lower().endswith(('.docx', '.doc')):
                text = self.extract_text_from_docx(file_path)
            else:
                raise CustomException("Unsupported file format. Please upload PDF or DOCX files.")
            
            if not text.strip():
                raise CustomException("No text found in the uploaded file.")
            
            # Extract information
            skills = self.extract_skills(text)
            contact_info = self.extract_contact_info(text)
            
            # Basic parsing of sections
            sections = self._parse_sections(text)
            
            result = {
                'raw_text': text,
                'skills': skills,
                'contact_info': contact_info,
                'sections': sections,
                'file_path': file_path
            }
            
            self.logger.info(f"Successfully parsed resume. Found {len(skills)} skills.")
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing resume: {str(e)}")
            raise CustomException(f"Failed to parse resume: {str(e)}")
    
    def _parse_sections(self, text: str) -> Dict[str, str]:
        """Parse resume into different sections"""
        sections = {}
        
        # Common section headers
        section_headers = [
            'experience', 'work experience', 'employment',
            'education', 'academic background',
            'skills', 'technical skills', 'core competencies',
            'projects', 'personal projects',
            'certifications', 'certificates',
            'summary', 'objective', 'profile'
        ]
        
        lines = text.split('\n')
        current_section = 'other'
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line is a section header
            is_header = False
            for header in section_headers:
                if header.lower() in line.lower() and len(line.split()) <= 3:
                    # Save previous section
                    if current_content:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = header.lower()
                    current_content = []
                    is_header = True
                    break
            
            if not is_header:
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections