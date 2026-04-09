import os
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class TranslationService:
    """Translation service using Gemini via Emergent Integrations."""

    LANGUAGE_NAMES = {
        "hi": "Hindi", "ta": "Tamil", "te": "Telugu", "kn": "Kannada",
        "ml": "Malayalam", "bn": "Bengali", "mr": "Marathi", "en": "English"
    }

    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")

    async def detect_language(self, text: str) -> str:
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"detect_{hash(text) % 100000}",
                system_message="Detect the language of the given text. Return ONLY the ISO 639-1 two-letter code (hi, ta, te, kn, ml, bn, mr, or en). Nothing else, just the 2-letter code."
            ).with_model("gemini", "gemini-3-flash-preview")

            response = await chat.send_message(UserMessage(text=f"Detect language: {text[:500]}"))
            detected = response.strip().lower()[:2]

            if detected in self.LANGUAGE_NAMES:
                return detected
            return "en"
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            return "en"

    async def translate_text(self, text: str, target_language: str, source_language: str = None) -> str:
        try:
            if source_language and source_language == target_language:
                return text

            target_name = self.LANGUAGE_NAMES.get(target_language, "English")

            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"tr_{hash(text) % 100000}",
                system_message=f"Translate the given text to {target_name}. Return ONLY the translated text. No quotes, no explanations, no prefix."
            ).with_model("gemini", "gemini-3-flash-preview")

            response = await chat.send_message(UserMessage(text=text))
            return response.strip()
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text

    async def translate_to_english(self, text: str) -> tuple:
        detected_lang = await self.detect_language(text)
        if detected_lang == "en":
            return text, "en"

        english_text = await self.translate_text(text, "en", detected_lang)
        return english_text, detected_lang
