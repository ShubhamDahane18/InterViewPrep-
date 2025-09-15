import re
from typing import str
from utils.logger import get_logger

logger = get_logger(__name__)

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    try:
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:()-]', '', text)
        
        # Remove multiple newlines
        text = re.sub(r'\n+', '\n', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    except Exception as e:
        logger.error(f"Error cleaning text: {str(e)}")
        return text

def extract_emails(text: str) -> list:
    """Extract email addresses from text"""
    try:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails
    except Exception as e:
        logger.error(f"Error extracting emails: {str(e)}")
        return []

def extract_phone_numbers(text: str) -> list:
    """Extract phone numbers from text"""
    try:
        phone_pattern = r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phones = re.findall(phone_pattern, text)
        return [''.join(phone) for phone in phones]
    except Exception as e:
        logger.error(f"Error extracting phone numbers: {str(e)}")
        return []

def normalize_whitespace(text: str) -> str:
    """Normalize whitespace in text"""
    try:
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text)
        
        # Replace multiple newlines with single newline
        text = re.sub(r'\n+', '\n', text)
        
        # Remove leading/trailing whitespace from each line
        lines = text.split('\n')
        lines = [line.strip() for line in lines]
        
        return '\n'.join(lines)
    except Exception as e:
        logger.error(f"Error normalizing whitespace: {str(e)}")
        return text