import os
import json
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI for legal analysis."""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    async def classify_query(self, text: str, language: str) -> dict:
        """Classify legal query into category and severity."""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"classify_{id(text)}",
                system_message="""You are a legal classification expert for Indian law. 
                Classify the legal query into one category and severity level.
                Return ONLY valid JSON with this exact structure:
                {
                    "category": "one of: landlord_dispute|employment|consumer_rights|family_law|police_matter|property|women_rights|sc_st_rights|criminal|other",
                    "severity": "one of: urgent|moderate|informational",
                    "keywords": ["keyword1", "keyword2"]
                }
                """
            ).with_model("gemini", "gemini-3-flash-preview")
            
            user_message = UserMessage(text=f"Classify this legal query: {text}")
            response = await chat.send_message(user_message)
            
            # Parse JSON from response
            result = json.loads(response)
            return result
        except Exception as e:
            logger.error(f"Error classifying query: {str(e)}")
            return {
                "category": "other",
                "severity": "moderate",
                "keywords": []
            }
    
    async def analyze_legal_query(self, text: str, language: str, category: str, kanoon_cases: list, law_sections: list) -> dict:
        """Generate comprehensive legal analysis using Gemini."""
        try:
            # Build context from kanoon cases and law sections
            context = "\n\nRELEVANT CASE LAW:\n"
            for i, case in enumerate(kanoon_cases[:5], 1):
                context += f"{i}. {case.get('title', 'N/A')}: {case.get('excerpt', 'N/A')}\n"
            
            context += "\n\nRELEVANT LAW SECTIONS:\n"
            for i, section in enumerate(law_sections[:6], 1):
                context += f"{i}. {section.get('act_name', 'N/A')} - {section.get('section_title', 'N/A')}: {section.get('content', 'N/A')[:200]}\n"
            
            system_prompt = f"""You are Nyaya Setu, an AI legal guide for Indian citizens. You explain legal rights in simple, plain language that even a person with 5th grade education can understand. Never use complex legal jargon without immediately explaining it in simple words.

ALWAYS structure your response as valid JSON with this exact schema:
{{
  "summary": "2-3 sentence plain language summary of what this person's problem is",
  "rights": ["Right 1 in simple language", "Right 2", ...],
  "acts_cited": ["Consumer Protection Act 2019", ...],
  "sections_cited": ["Section 12 - right to file complaint", ...],
  "steps": [
    {{ "step": 1, "title": "First do this", "description": "...", "time_estimate": "1-2 days", "cost": "Free" }},
    ...
  ],
  "urgency_note": "If urgent, what to do immediately",
  "nearest_help": "Type of official/office to approach",
  "kanoon_references": ["case name and citation"],
  "legal_notice_recommended": true/false,
  "legal_notice_type": "Consumer complaint / Labour court notice / etc",
  "disclaimer": "This is general legal information. For your specific case, consult a qualified lawyer."
}}
Respond in the user's language: {language}

Use the following context to inform your response:
{context}
"""
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"analyze_{id(text)}",
                system_message=system_prompt
            ).with_model("gemini", "gemini-3-flash-preview")
            
            user_message = UserMessage(text=f"Analyze this legal situation: {text}")
            response = await chat.send_message(user_message)
            
            # Parse JSON from response
            result = json.loads(response)
            return result
        except Exception as e:
            logger.error(f"Error analyzing query: {str(e)}")
            return {
                "summary": "Unable to analyze this query at the moment.",
                "rights": [],
                "acts_cited": [],
                "sections_cited": [],
                "steps": [],
                "urgency_note": "",
                "nearest_help": "",
                "kanoon_references": [],
                "legal_notice_recommended": False,
                "legal_notice_type": "",
                "disclaimer": "This is general legal information. For your specific case, consult a qualified lawyer."
            }
