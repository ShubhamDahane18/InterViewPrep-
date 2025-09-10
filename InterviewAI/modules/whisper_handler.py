# Whisper integration (speech-to-text)
import tempfile
import os
import io
import streamlit as st
from typing import Optional, Tuple
import numpy as np
from utils.logger import get_logger
from utils.custom_exception import CustomException

# Optional imports for Whisper
try:
    import whisper
    import soundfile as sf
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    whisper = None
    sf = None

logger = get_logger(__name__)

class WhisperHandler:
    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper handler
        
        Args:
            model_size: Size of Whisper model ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.logger = logger
        self.model_size = model_size
        self.model = None
        
        if not WHISPER_AVAILABLE:
            raise CustomException("Whisper is not available. Please install openai-whisper and soundfile packages.")
        
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            self.logger.info(f"Loading Whisper model: {self.model_size}")
            self.model = whisper.load_model(self.model_size)
            self.logger.info("Whisper model loaded successfully")
        except Exception as e:
            self.logger.error(f"Error loading Whisper model: {str(e)}")
            raise CustomException(f"Failed to load Whisper model: {str(e)}")
    
    def transcribe_audio_file(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to audio file
            
        Returns:
            Transcribed text
        """
        try:
            self.logger.info(f"Transcribing audio file: {audio_file_path}")
            
            # Check if file exists
            if not os.path.exists(audio_file_path):
                raise CustomException(f"Audio file not found: {audio_file_path}")
            
            # Transcribe using Whisper
            result = self.model.transcribe(audio_file_path)
            transcribed_text = result["text"].strip()
            
            self.logger.info(f"Transcription completed. Length: {len(transcribed_text)} characters")
            return transcribed_text
            
        except Exception as e:
            self.logger.error(f"Error transcribing audio file: {str(e)}")
            raise CustomException(f"Failed to transcribe audio: {str(e)}")
    
    def transcribe_audio_bytes(self, audio_bytes: bytes, sample_rate: int = 16000) -> str:
        """
        Transcribe audio bytes to text
        
        Args:
            audio_bytes: Audio data as bytes
            sample_rate: Sample rate of audio
            
        Returns:
            Transcribed text
        """
        try:
            self.logger.info("Transcribing audio bytes")
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe the temporary file
                result = self.transcribe_audio_file(temp_file_path)
                return result
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            self.logger.error(f"Error transcribing audio bytes: {str(e)}")
            raise CustomException(f"Failed to transcribe audio bytes: {str(e)}")
    
    def transcribe_streamlit_audio(self, audio_data) -> str:
        """
        Transcribe audio from Streamlit audio recorder
        
        Args:
            audio_data: Audio data from Streamlit audio recorder
            
        Returns:
            Transcribed text
        """
        try:
            self.logger.info("Transcribing Streamlit audio data")
            
            if audio_data is None:
                raise CustomException("No audio data provided")
            
            # Convert audio data to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # Normalize audio
            audio_float = audio_array.astype(np.float32) / 32768.0
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                # Write audio data using soundfile
                sf.write(temp_file.name, audio_float, 16000)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe the temporary file
                result = self.transcribe_audio_file(temp_file_path)
                return result
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            self.logger.error(f"Error transcribing Streamlit audio: {str(e)}")
            raise CustomException(f"Failed to transcribe Streamlit audio: {str(e)}")
    
    def get_available_models(self) -> list:
        """Get list of available Whisper models"""
        return ["tiny", "base", "small", "medium", "large"]
    
    def get_model_info(self) -> dict:
        """Get information about the current model"""
        return {
            "model_size": self.model_size,
            "available_models": self.get_available_models(),
            "model_loaded": self.model is not None
        }

class AudioRecorder:
    """Helper class for audio recording in Streamlit"""
    
    @staticmethod
    def create_audio_recorder_widget():
        """Create Streamlit audio recorder widget"""
        try:
            # Note: This requires streamlit-audio-recorder package
            # For now, we'll use the built-in audio recorder
            audio_data = st.audio("", format="audio/wav")
            return audio_data
        except Exception as e:
            logger.error(f"Error creating audio recorder: {str(e)}")
            return None
    
    @staticmethod
    def create_file_uploader():
        """Create audio file uploader"""
        uploaded_file = st.file_uploader(
            "Upload Audio File",
            type=['wav', 'mp3', 'm4a', 'ogg', 'flac'],
            help="Upload an audio file to transcribe"
        )
        return uploaded_file
    
    @staticmethod
    def process_uploaded_audio(uploaded_file) -> bytes:
        """Process uploaded audio file"""
        if uploaded_file is not None:
            return uploaded_file.read()
        return None

# Global whisper handler instance
_whisper_handler = None

def get_whisper_handler(model_size: str = "base") -> Optional[WhisperHandler]:
    """Get or create global whisper handler instance"""
    global _whisper_handler
    
    if not WHISPER_AVAILABLE:
        return None
    
    if _whisper_handler is None or _whisper_handler.model_size != model_size:
        try:
            _whisper_handler = WhisperHandler(model_size)
        except Exception as e:
            logger.error(f"Failed to create Whisper handler: {str(e)}")
            return None
    
    return _whisper_handler