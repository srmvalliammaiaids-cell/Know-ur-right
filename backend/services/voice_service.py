import os
import logging
import base64
from google.cloud import speech_v1, texttospeech
from google.cloud.speech_v1.types import RecognitionConfig, RecognitionAudio
from google.cloud.texttospeech_v1.types import SynthesisInput, VoiceSelectionParams, AudioConfig
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class VoiceService:
    """Service for Speech-to-Text and Text-to-Speech using Google Cloud APIs."""
    
    LANGUAGE_CONFIGS = {
        "hi": {"code": "hi-IN", "name": "Hindi"},
        "ta": {"code": "ta-IN", "name": "Tamil"},
        "te": {"code": "te-IN", "name": "Telugu"},
        "kn": {"code": "kn-IN", "name": "Kannada"},
        "ml": {"code": "ml-IN", "name": "Malayalam"},
        "bn": {"code": "bn-IN", "name": "Bengali"},
        "mr": {"code": "mr-IN", "name": "Marathi"},
        "en": {"code": "en-IN", "name": "English (India)"}
    }
    
    TTS_VOICES = {
        "hi": "hi-IN-Standard-A",
        "ta": "ta-IN-Standard-A",
        "te": "te-IN-Standard-A",
        "kn": "kn-IN-Standard-A",
        "ml": "ml-IN-Standard-A",
        "bn": "bn-IN-Standard-A",
        "mr": "mr-IN-Standard-A",
        "en": "en-IN-Standard-A"
    }
    
    def __init__(self):
        self.stt_client = speech_v1.SpeechClient()
        self.tts_client = texttospeech.TextToSpeechClient()
    
    async def transcribe_audio(self, audio_content: bytes, language_code: str) -> dict:
        """Transcribe audio to text."""
        try:
            lang_config = self.LANGUAGE_CONFIGS.get(language_code, self.LANGUAGE_CONFIGS["en"])
            
            config = RecognitionConfig(
                encoding=RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=lang_config["code"],
                enable_automatic_punctuation=True,
                model="latest_long"
            )
            
            audio = RecognitionAudio(content=audio_content)
            response = self.stt_client.recognize(config=config, audio=audio)
            
            transcriptions = []
            confidences = []
            
            for result in response.results:
                if result.alternatives:
                    alternative = result.alternatives[0]
                    transcriptions.append(alternative.transcript)
                    confidences.append(float(alternative.confidence))
            
            full_text = " ".join(transcriptions)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                "text": full_text,
                "language": lang_config["name"],
                "language_code": language_code,
                "confidence": avg_confidence
            }
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise
    
    async def synthesize_speech(self, text: str, language_code: str, speaking_rate: float = 0.75) -> bytes:
        """Convert text to speech."""
        try:
            lang_config = self.LANGUAGE_CONFIGS.get(language_code, self.LANGUAGE_CONFIGS["en"])
            voice_name = self.TTS_VOICES.get(language_code, self.TTS_VOICES["en"])
            
            synthesis_input = SynthesisInput(text=text)
            
            voice = VoiceSelectionParams(
                language_code=lang_config["code"],
                name=voice_name,
                ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
            )
            
            audio_config = AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=0.0
            )
            
            response = self.tts_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return response.audio_content
        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}")
            raise
