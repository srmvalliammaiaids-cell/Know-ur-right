import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class VoiceService:
    """Voice service - STT/TTS handled by browser Web Speech API."""

    def __init__(self):
        logger.info("VoiceService initialized (browser-based STT/TTS)")

    async def transcribe_audio(self, audio_content: bytes, language_code: str) -> dict:
        return {
            "text": "",
            "language_code": language_code,
            "confidence": 0,
            "message": "Please use browser voice input for speech recognition"
        }

    async def synthesize_speech(self, text: str, language_code: str, speaking_rate: float = 0.75) -> bytes:
        raise NotImplementedError("Text-to-speech is handled by the browser SpeechSynthesis API.")
