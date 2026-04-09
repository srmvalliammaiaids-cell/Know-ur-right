import os
import logging
from google.cloud import translate_v3 as translate
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class TranslationService:
    """Service for translating text between languages using Google Cloud Translation API."""
    
    LANGUAGE_CODES = {
        "hi": "hi",  # Hindi
        "ta": "ta",  # Tamil
        "te": "te",  # Telugu
        "kn": "kn",  # Kannada
        "ml": "ml",  # Malayalam
        "bn": "bn",  # Bengali
        "mr": "mr",  # Marathi
        "en": "en"   # English
    }
    
    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'nyaya-setu-project')
        self.client = translate.TranslationServiceClient()
        self.parent = f"projects/{self.project_id}/locations/global"
    
    async def detect_language(self, text: str) -> str:
        """Detect language of input text."""
        try:
            # Use Google Cloud Translation for detection
            response = self.client.detect_language(
                parent=self.parent,
                content=text,
                mime_type="text/plain"
            )
            
            if response.languages:
                detected = response.languages[0].language_code
                # Map to our supported languages
                for code in self.LANGUAGE_CODES:
                    if detected.startswith(code):
                        return code
            
            return "en"  # Default to English
        except Exception as e:
            logger.error(f"Error detecting language: {str(e)}")
            return "en"
    
    async def translate_text(self, text: str, target_language: str, source_language: str = None) -> str:
        """Translate text to target language."""
        try:
            if not source_language:
                source_language = await self.detect_language(text)
            
            # If source and target are the same, no translation needed
            if source_language == target_language:
                return text
            
            response = self.client.translate_text(
                parent=self.parent,
                contents=[text],
                mime_type="text/plain",
                source_language_code=source_language,
                target_language_code=target_language
            )
            
            if response.translations:
                return response.translations[0].translated_text
            
            return text
        except Exception as e:
            logger.error(f"Error translating text: {str(e)}")
            return text
    
    async def translate_to_english(self, text: str) -> tuple:
        """Translate text to English and return (english_text, detected_language)."""
        detected_lang = await self.detect_language(text)
        if detected_lang == "en":
            return text, "en"
        
        english_text = await self.translate_text(text, "en", detected_lang)
        return english_text, detected_lang
