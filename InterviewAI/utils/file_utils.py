import os
import shutil
from typing import List
from utils.logger import get_logger
from utils.custom_exception import CustomException

logger = get_logger(__name__)

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate if file has allowed extension"""
    try:
        file_ext = os.path.splitext(filename)[1].lower()
        return file_ext in allowed_extensions
    except Exception as e:
        logger.error(f"Error validating file extension: {str(e)}")
        return False

def validate_file_size(file_path: str, max_size: int) -> bool:
    """Validate if file size is within limits"""
    try:
        file_size = os.path.getsize(file_path)
        return file_size <= max_size
    except Exception as e:
        logger.error(f"Error validating file size: {str(e)}")
        return False

def clean_temp_files(temp_files: List[str]):
    """Clean up temporary files"""
    for file_path in temp_files:
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Cleaned up temp file: {file_path}")
        except Exception as e:
            logger.error(f"Error cleaning temp file {file_path}: {str(e)}")

def ensure_directory_exists(directory_path: str):
    """Ensure directory exists, create if it doesn't"""
    try:
        os.makedirs(directory_path, exist_ok=True)
    except Exception as e:
        logger.error(f"Error creating directory {directory_path}: {str(e)}")
        raise CustomException(f"Failed to create directory: {str(e)}")

def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB"""
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except Exception as e:
        logger.error(f"Error getting file size: {str(e)}")
        return 0.0