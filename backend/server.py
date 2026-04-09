from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import io

from services.legal_analysis_service import LegalAnalysisService
from services.voice_service import VoiceService
from services.translation_service import TranslationService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
legal_service = LegalAnalysisService()
voice_service = VoiceService()
translation_service = TranslationService()

# Create the main app
app = FastAPI(title="Nyaya Setu API")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class QuerySubmit(BaseModel):
    text: str
    language_code: str = "hi"
    state: Optional[str] = None
    district: Optional[str] = None
    user_id: Optional[str] = None

class QueryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    original_text: str
    detected_language: str
    category: str
    severity: str
    ai_response: dict
    acts_cited: List[str]
    sections_cited: List[str]
    created_at: str

class TranscribeRequest(BaseModel):
    language_code: str = "hi"

class SynthesizeRequest(BaseModel):
    text: str
    language_code: str = "hi"
    speaking_rate: float = 0.75

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Nyaya Setu API - Bridge to Justice", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supported_languages": ["hi", "ta", "te", "kn", "ml", "bn", "mr", "en"],
        "services": ["legal_analysis", "voice", "translation"]
    }

# ==================== QUERY ROUTES ====================

@api_router.post("/query", response_model=QueryResponse)
async def submit_query(query: QuerySubmit):
    """Submit a legal query for analysis."""
    try:
        logger.info(f"Received query in {query.language_code}")
        
        # Analyze the query
        analysis = await legal_service.analyze_query(
            original_text=query.text,
            user_language=query.language_code,
            user_state=query.state
        )
        
        # Create query document
        query_id = str(uuid.uuid4())
        query_doc = {
            "id": query_id,
            "user_id": query.user_id,
            "original_text": analysis["original_text"],
            "detected_language": analysis["detected_language"],
            "translated_to_english": analysis["translated_to_english"],
            "category": analysis["category"],
            "severity": analysis["severity"],
            "ai_response": analysis["ai_response"],
            "acts_cited": analysis["acts_cited"],
            "sections_cited": analysis["sections_cited"],
            "kanoon_case_ids": analysis["kanoon_case_ids"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_bookmarked": False,
            "state": query.state,
            "district": query.district
        }
        
        # Save to MongoDB
        await db.queries.insert_one(query_doc)
        
        logger.info(f"Query {query_id} analyzed and saved")
        
        return QueryResponse(
            id=query_id,
            original_text=analysis["original_text"],
            detected_language=analysis["detected_language"],
            category=analysis["category"],
            severity=analysis["severity"],
            ai_response=analysis["ai_response"],
            acts_cited=analysis["acts_cited"],
            sections_cited=analysis["sections_cited"],
            created_at=query_doc["created_at"]
        )
    
    except Exception as e:
        logger.error(f"Error submitting query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/query/{query_id}")
async def get_query(query_id: str):
    """Get a specific query by ID."""
    try:
        query = await db.queries.find_one({"id": query_id}, {"_id": 0})
        
        if not query:
            raise HTTPException(status_code=404, detail="Query not found")
        
        return query
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/queries")
async def get_user_queries(user_id: str, limit: int = 20):
    """Get all queries for a user."""
    try:
        queries = await db.queries.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {"queries": queries, "total": len(queries)}
    
    except Exception as e:
        logger.error(f"Error retrieving queries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VOICE ROUTES ====================

@api_router.post("/voice/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language_code: str = Form("hi")
):
    """Transcribe audio to text."""
    try:
        # Read audio content
        audio_content = await file.read()
        
        # Transcribe
        result = await voice_service.transcribe_audio(audio_content, language_code)
        
        return result
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/voice/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
    """Convert text to speech."""
    try:
        audio_content = await voice_service.synthesize_speech(
            text=request.text,
            language_code=request.language_code,
            speaking_rate=request.speaking_rate
        )
        
        return StreamingResponse(
            io.BytesIO(audio_content),
            media_type="audio/mp3",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    
    except Exception as e:
        logger.error(f"Error synthesizing speech: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== TRANSLATION ROUTES ====================

@api_router.post("/translate")
async def translate_text(text: str, target_language: str, source_language: Optional[str] = None):
    """Translate text to target language."""
    try:
        translated = await translation_service.translate_text(
            text=text,
            target_language=target_language,
            source_language=source_language
        )
        
        return {"translated_text": translated}
    
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== NGO ROUTES ====================

@api_router.get("/ngos")
async def get_ngos(state: Optional[str] = None, district: Optional[str] = None, specialization: Optional[str] = None):
    """Get NGO directory filtered by location and specialization."""
    try:
        query_filter = {}
        if state:
            query_filter["state"] = state
        if district:
            query_filter["district"] = district
        if specialization:
            query_filter["specialization"] = {"$in": [specialization]}
        
        ngos = await db.ngos.find(query_filter, {"_id": 0}).limit(50).to_list(50)
        
        return {"ngos": ngos, "total": len(ngos)}
    
    except Exception as e:
        logger.error(f"Error retrieving NGOs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== COMMUNITY Q&A ROUTES ====================

@api_router.get("/community/questions")
async def get_community_questions(
    language: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    """Get community questions."""
    try:
        query_filter = {}
        if language:
            query_filter["language"] = language
        if category:
            query_filter["category"] = category
        
        questions = await db.community_questions.find(
            query_filter,
            {"_id": 0}
        ).sort("upvotes", -1).limit(limit).to_list(limit)
        
        return {"questions": questions, "total": len(questions)}
    
    except Exception as e:
        logger.error(f"Error retrieving community questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
