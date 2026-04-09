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
from services.gemini_service import GeminiService

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
gemini_service = GeminiService()

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

class LegalNoticeRequest(BaseModel):
    query_id: Optional[str] = None
    query_text: str
    category: str = "other"
    recipient_name: str
    sender_name: str
    sender_address: str = ""
    recipient_address: str = ""
    additional_details: str = ""
    user_id: Optional[str] = None

class CommunityQuestionCreate(BaseModel):
    title: str
    description: str
    category: str = "other"
    language: str = "en"
    user_id: Optional[str] = None
    user_name: str = "Anonymous"

class CommunityAnswerCreate(BaseModel):
    text: str
    user_id: Optional[str] = None
    user_name: str = "Anonymous"

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None

# ==================== CORE ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Nyaya Setu API - Bridge to Justice", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supported_languages": ["hi", "ta", "te", "kn", "ml", "bn", "mr", "en"],
        "services": ["legal_analysis", "voice", "translation", "legal_notice", "ngo", "community", "emergency"]
    }

# ==================== QUERY ROUTES ====================

@api_router.post("/query", response_model=QueryResponse)
async def submit_query(query: QuerySubmit):
    try:
        logger.info(f"Received query in {query.language_code}")

        analysis = await legal_service.analyze_query(
            original_text=query.text,
            user_language=query.language_code,
            user_state=query.state
        )

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
    try:
        queries = await db.queries.find(
            {"user_id": user_id}, {"_id": 0}
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
    try:
        audio_content = await file.read()
        result = await voice_service.transcribe_audio(audio_content, language_code)
        return result
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/voice/synthesize")
async def synthesize_speech_endpoint(text: str, language_code: str = "hi", speaking_rate: float = 0.75):
    return {"message": "Text-to-speech handled by browser SpeechSynthesis API", "text": text}

# ==================== TRANSLATION ROUTES ====================

@api_router.post("/translate")
async def translate_text(text: str, target_language: str, source_language: Optional[str] = None):
    try:
        translated = await translation_service.translate_text(
            text=text, target_language=target_language, source_language=source_language
        )
        return {"translated_text": translated}
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== LEGAL NOTICE ROUTES ====================

@api_router.post("/legal-notice/generate")
async def generate_legal_notice(request: LegalNoticeRequest):
    try:
        notice_data = await gemini_service.generate_legal_notice(
            query_text=request.query_text,
            category=request.category,
            recipient_name=request.recipient_name,
            sender_name=request.sender_name,
            additional_details=request.additional_details
        )

        notice_id = str(uuid.uuid4())
        notice_doc = {
            "id": notice_id,
            "query_id": request.query_id,
            "user_id": request.user_id,
            "sender_name": request.sender_name,
            "sender_address": request.sender_address,
            "recipient_name": request.recipient_name,
            "recipient_address": request.recipient_address,
            "category": request.category,
            "notice_title": notice_data.get("notice_title", "Legal Notice"),
            "notice_body": notice_data.get("notice_body", ""),
            "applicable_laws": notice_data.get("applicable_laws", []),
            "deadline_days": notice_data.get("deadline_days", 15),
            "notice_type": notice_data.get("notice_type", request.category),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "generated"
        }

        await db.legal_notices.insert_one(notice_doc)
        logger.info(f"Legal notice {notice_id} generated")

        return {k: v for k, v in notice_doc.items() if k != "_id"}

    except Exception as e:
        logger.error(f"Error generating legal notice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/legal-notice/{notice_id}")
async def get_legal_notice(notice_id: str):
    notice = await db.legal_notices.find_one({"id": notice_id}, {"_id": 0})
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return notice

@api_router.get("/legal-notice/{notice_id}/pdf")
async def download_legal_notice_pdf(notice_id: str):
    notice = await db.legal_notices.find_one({"id": notice_id}, {"_id": 0})
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Title
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 12, notice.get("notice_title", "LEGAL NOTICE"), ln=True, align="C")
        pdf.ln(6)

        # Date
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, f"Date: {notice.get('created_at', '')[:10]}", ln=True, align="R")
        pdf.ln(4)

        # Sender/Recipient
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, f"From: {notice.get('sender_name', '')}", ln=True)
        if notice.get("sender_address"):
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 6, notice["sender_address"], ln=True)
        pdf.ln(2)

        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, f"To: {notice.get('recipient_name', '')}", ln=True)
        if notice.get("recipient_address"):
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 6, notice["recipient_address"], ln=True)
        pdf.ln(6)

        # Body
        pdf.set_font("Helvetica", "", 11)
        body = notice.get("notice_body", "")
        for line in body.split("\n"):
            pdf.multi_cell(0, 6, line.strip())
            pdf.ln(1)

        pdf.ln(4)

        # Laws
        laws = notice.get("applicable_laws", [])
        if laws:
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, "Applicable Laws:", ln=True)
            pdf.set_font("Helvetica", "", 10)
            for law in laws:
                pdf.cell(0, 6, f"  - {law}", ln=True)
            pdf.ln(4)

        # Deadline
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, f"Response Required Within: {notice.get('deadline_days', 15)} days", ln=True)
        pdf.ln(8)

        # Signature
        pdf.cell(0, 8, "Yours faithfully,", ln=True)
        pdf.ln(4)
        pdf.cell(0, 8, notice.get("sender_name", ""), ln=True)

        pdf_bytes = pdf.output()
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=legal_notice_{notice_id}.pdf"}
        )

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/legal-notices")
async def get_user_notices(user_id: str, limit: int = 20):
    notices = await db.legal_notices.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return {"notices": notices, "total": len(notices)}

# ==================== EMERGENCY ROUTES ====================

@api_router.get("/emergency/helplines")
async def get_emergency_helplines():
    helplines = [
        {"name": "Police", "number": "100", "category": "emergency", "description": "For any crime or emergency situation", "available": "24/7"},
        {"name": "Women Helpline", "number": "181", "category": "women", "description": "Women in distress - Domestic violence, harassment", "available": "24/7"},
        {"name": "Ambulance", "number": "108", "category": "emergency", "description": "Medical emergency ambulance service", "available": "24/7"},
        {"name": "Child Helpline", "number": "1098", "category": "children", "description": "Children in need of care and protection", "available": "24/7"},
        {"name": "National Commission for Women", "number": "7827-170-170", "category": "women", "description": "Complaints regarding women's rights violations", "available": "Mon-Sat 9AM-5PM"},
        {"name": "Legal Aid (NALSA)", "number": "15100", "category": "legal", "description": "Free legal aid for eligible citizens", "available": "Mon-Sat 9AM-5PM"},
        {"name": "Domestic Violence", "number": "181", "category": "women", "description": "Protection from domestic violence", "available": "24/7"},
        {"name": "Senior Citizen Helpline", "number": "14567", "category": "senior", "description": "Help for senior citizens", "available": "24/7"},
        {"name": "Cyber Crime", "number": "1930", "category": "cyber", "description": "Report online fraud and cyber crimes", "available": "24/7"},
        {"name": "Human Rights Commission", "number": "011-23385368", "category": "rights", "description": "National Human Rights Commission", "available": "Mon-Fri 9AM-5PM"},
        {"name": "SC/ST Commission", "number": "011-23320649", "category": "rights", "description": "National Commission for Scheduled Castes", "available": "Mon-Fri 9AM-5PM"},
        {"name": "Consumer Helpline", "number": "1800-11-4000", "category": "consumer", "description": "National Consumer Helpline - Free", "available": "Mon-Sat 9:30AM-5:30PM"},
        {"name": "Labour Helpline", "number": "14434", "category": "employment", "description": "Shram Suvidha - Labour issues and complaints", "available": "Mon-Sat 9AM-5PM"},
        {"name": "Anti-Corruption", "number": "1800-11-0031", "category": "corruption", "description": "Central Vigilance Commission", "available": "Mon-Fri 9AM-5PM"},
    ]
    return {"helplines": helplines}

# ==================== NGO ROUTES ====================

@api_router.get("/ngos")
async def get_ngos(state: Optional[str] = None, district: Optional[str] = None, specialization: Optional[str] = None):
    try:
        query_filter = {}
        if state:
            query_filter["state"] = {"$regex": state, "$options": "i"}
        if district:
            query_filter["district"] = {"$regex": district, "$options": "i"}
        if specialization:
            query_filter["specializations"] = {"$in": [specialization]}

        ngos = await db.ngos.find(query_filter, {"_id": 0}).limit(50).to_list(50)

        if not ngos:
            ngos = get_default_ngos()
            if state:
                ngos = [n for n in ngos if state.lower() in n.get("state", "").lower()]
            if specialization:
                ngos = [n for n in ngos if specialization in n.get("specializations", [])]

        return {"ngos": ngos, "total": len(ngos)}

    except Exception as e:
        logger.error(f"Error retrieving NGOs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ngos/seed")
async def seed_ngos():
    """Seed NGO directory with sample data."""
    ngos = get_default_ngos()
    for ngo in ngos:
        existing = await db.ngos.find_one({"name": ngo["name"]})
        if not existing:
            await db.ngos.insert_one(ngo)
    return {"message": f"Seeded {len(ngos)} NGOs", "total": len(ngos)}

def get_default_ngos():
    return [
        {"id": str(uuid.uuid4()), "name": "NALSA - National Legal Services Authority", "state": "Delhi", "district": "New Delhi", "specializations": ["legal_aid", "free_legal_help"], "phone": "011-23389680", "email": "nalsa-dla@nic.in", "description": "Free legal aid to weaker sections of society", "website": "https://nalsa.gov.in", "lat": 28.6139, "lng": 77.2090},
        {"id": str(uuid.uuid4()), "name": "Majlis Legal Centre", "state": "Maharashtra", "district": "Mumbai", "specializations": ["women_rights", "family_law", "domestic_violence"], "phone": "022-26661252", "email": "majlislaw@gmail.com", "description": "Legal support for women and marginalized communities", "website": "http://majlislaw.com", "lat": 19.0760, "lng": 72.8777},
        {"id": str(uuid.uuid4()), "name": "Human Rights Law Network", "state": "Delhi", "district": "New Delhi", "specializations": ["human_rights", "sc_st_rights", "legal_aid"], "phone": "011-24316922", "email": "contact@hrln.org", "description": "Legal action for human rights protection", "website": "https://hrln.org", "lat": 28.5355, "lng": 77.2100},
        {"id": str(uuid.uuid4()), "name": "Lawyers Collective", "state": "Maharashtra", "district": "Mumbai", "specializations": ["women_rights", "employment", "consumer_rights"], "phone": "022-24937708", "email": "info@lawyerscollective.org", "description": "Public interest litigation and legal aid", "website": "https://lawyerscollective.org", "lat": 19.0176, "lng": 72.8562},
        {"id": str(uuid.uuid4()), "name": "SLIC - State Legal Aid Centre", "state": "Tamil Nadu", "district": "Chennai", "specializations": ["legal_aid", "free_legal_help", "consumer_rights"], "phone": "044-25340966", "email": "slsachennai@gmail.com", "description": "Free legal services for Tamil Nadu citizens", "website": "", "lat": 13.0827, "lng": 80.2707},
        {"id": str(uuid.uuid4()), "name": "Apne Aap Women Worldwide", "state": "Bihar", "district": "Patna", "specializations": ["women_rights", "trafficking", "children"], "phone": "0612-2230588", "email": "info@apneaap.org", "description": "Fighting sex trafficking and supporting women", "website": "https://apneaap.org", "lat": 25.6093, "lng": 85.1376},
        {"id": str(uuid.uuid4()), "name": "Consumer Voice", "state": "Delhi", "district": "New Delhi", "specializations": ["consumer_rights", "product_safety"], "phone": "011-27552121", "email": "info@consumer-voice.org", "description": "Consumer rights advocacy and complaint resolution", "website": "https://consumer-voice.org", "lat": 28.6448, "lng": 77.2167},
        {"id": str(uuid.uuid4()), "name": "Karnataka State Legal Services Authority", "state": "Karnataka", "district": "Bangalore", "specializations": ["legal_aid", "free_legal_help"], "phone": "080-22115825", "email": "kslsa@nic.in", "description": "Free legal aid services in Karnataka", "website": "", "lat": 12.9716, "lng": 77.5946},
        {"id": str(uuid.uuid4()), "name": "Swayam", "state": "West Bengal", "district": "Kolkata", "specializations": ["women_rights", "domestic_violence", "family_law"], "phone": "033-24863367", "email": "swayam@cal.vsnl.net.in", "description": "Support for women facing violence", "website": "https://swayam.info", "lat": 22.5726, "lng": 88.3639},
        {"id": str(uuid.uuid4()), "name": "Centre for Social Justice", "state": "Gujarat", "district": "Ahmedabad", "specializations": ["sc_st_rights", "legal_aid", "human_rights"], "phone": "079-27437024", "email": "csj@csjgujarat.org", "description": "Justice for Dalits, Adivasis, and marginalized communities", "website": "https://centreforsocialjustice.net", "lat": 23.0225, "lng": 72.5714},
        {"id": str(uuid.uuid4()), "name": "AALI - Association for Advocacy and Legal Initiatives", "state": "Uttar Pradesh", "district": "Lucknow", "specializations": ["women_rights", "legal_aid", "family_law"], "phone": "0522-2351970", "email": "aaborti@gmail.com", "description": "Women's rights advocacy and legal support in UP", "website": "", "lat": 26.8467, "lng": 80.9462},
        {"id": str(uuid.uuid4()), "name": "Prayas - Institute for Juvenile Justice", "state": "Rajasthan", "district": "Jaipur", "specializations": ["children", "legal_aid", "juvenile_justice"], "phone": "0141-2707625", "email": "prayasjaipur@gmail.com", "description": "Child rights and juvenile justice", "website": "", "lat": 26.9124, "lng": 75.7873},
    ]

# ==================== COMMUNITY Q&A ROUTES ====================

@api_router.get("/community/questions")
async def get_community_questions(
    language: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50
):
    try:
        query_filter = {}
        if language:
            query_filter["language"] = language
        if category:
            query_filter["category"] = category

        questions = await db.community_questions.find(
            query_filter, {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)

        if not questions:
            questions = get_sample_community_questions()

        return {"questions": questions, "total": len(questions)}
    except Exception as e:
        logger.error(f"Error retrieving community questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/community/questions")
async def create_community_question(question: CommunityQuestionCreate):
    try:
        question_id = str(uuid.uuid4())
        doc = {
            "id": question_id,
            "title": question.title,
            "description": question.description,
            "category": question.category,
            "language": question.language,
            "user_id": question.user_id,
            "user_name": question.user_name,
            "upvotes": 0,
            "answers": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.community_questions.insert_one(doc)
        return {k: v for k, v in doc.items() if k != "_id"}
    except Exception as e:
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/community/questions/{question_id}/upvote")
async def upvote_question(question_id: str):
    result = await db.community_questions.find_one_and_update(
        {"id": question_id},
        {"$inc": {"upvotes": 1}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"upvotes": result["upvotes"]}

@api_router.post("/community/questions/{question_id}/answer")
async def answer_question(question_id: str, answer: CommunityAnswerCreate):
    answer_doc = {
        "id": str(uuid.uuid4()),
        "text": answer.text,
        "user_id": answer.user_id,
        "user_name": answer.user_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.community_questions.find_one_and_update(
        {"id": question_id},
        {"$push": {"answers": answer_doc}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Answer added", "answer": answer_doc}

def get_sample_community_questions():
    return [
        {"id": "sample-1", "title": "Can employer deduct salary without notice?", "description": "My employer deducted 3 days salary without giving any reason or notice. Is this legal?", "category": "employment", "language": "en", "user_name": "Rahul M.", "upvotes": 24, "answers": [{"id": "a1", "text": "Under the Payment of Wages Act, no deduction can be made without prior notice. You can file a complaint with the Labour Commissioner.", "user_name": "Legal Expert", "created_at": "2026-01-15T10:00:00Z"}], "created_at": "2026-01-14T08:00:00Z"},
        {"id": "sample-2", "title": "Landlord refusing to return security deposit", "description": "I vacated the house 2 months ago but landlord is not returning my security deposit of Rs 50,000.", "category": "landlord_dispute", "language": "en", "user_name": "Priya S.", "upvotes": 18, "answers": [{"id": "a2", "text": "Send a legal notice demanding return within 15 days. If not returned, file a case in civil court.", "user_name": "Advocate Help", "created_at": "2026-01-20T14:00:00Z"}], "created_at": "2026-01-19T12:00:00Z"},
        {"id": "sample-3", "title": "FIR not being registered at police station", "description": "Police is refusing to register my FIR for theft. What can I do?", "category": "police_matter", "language": "en", "user_name": "Amit K.", "upvotes": 32, "answers": [{"id": "a3", "text": "Under Section 154 CrPC, police cannot refuse to register an FIR for cognizable offence. Complain to SP/DGP or file complaint in Magistrate court.", "user_name": "Rights Advisor", "created_at": "2026-02-01T09:00:00Z"}], "created_at": "2026-01-31T16:00:00Z"},
        {"id": "sample-4", "title": "Defective product - company not responding", "description": "Bought a washing machine that stopped working in 1 month. Company is not responding to complaints.", "category": "consumer_rights", "language": "en", "user_name": "Meera D.", "upvotes": 15, "answers": [], "created_at": "2026-02-05T11:00:00Z"},
        {"id": "sample-5", "title": "Harassment at workplace - no ICC formed", "description": "Facing harassment at workplace but company has no Internal Complaints Committee. What are my options?",  "category": "women_rights", "language": "en", "user_name": "Anonymous", "upvotes": 45, "answers": [{"id": "a5", "text": "Under the POSH Act 2013, every organization with 10+ employees must have an ICC. You can complain to the District Officer directly.", "user_name": "Women's Rights NGO", "created_at": "2026-02-08T10:00:00Z"}], "created_at": "2026-02-07T08:00:00Z"},
    ]

# ==================== PROFILE ROUTES ====================

@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        profile = {
            "user_id": user_id,
            "full_name": "",
            "preferred_language": "hi",
            "state": "",
            "district": "",
            "phone": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    return profile

@api_router.put("/profile/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = await db.profiles.find_one_and_update(
        {"user_id": user_id},
        {"$set": update_data, "$setOnInsert": {"user_id": user_id, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
        return_document=True
    )
    return {k: v for k, v in result.items() if k != "_id"}

# ==================== BOOKMARK ROUTES ====================

@api_router.post("/query/{query_id}/bookmark")
async def toggle_bookmark(query_id: str):
    query = await db.queries.find_one({"id": query_id})
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")

    new_status = not query.get("is_bookmarked", False)
    await db.queries.update_one({"id": query_id}, {"$set": {"is_bookmarked": new_status}})
    return {"is_bookmarked": new_status}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Seed NGOs on startup
    count = await db.ngos.count_documents({})
    if count == 0:
        ngos = get_default_ngos()
        await db.ngos.insert_many(ngos)
        logger.info(f"Seeded {len(ngos)} NGOs")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
