import os
import json
import re
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def extract_json(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    for pattern in [r'```json\s*([\s\S]*?)\s*```', r'```\s*([\s\S]*?)\s*```']:
        match = re.search(pattern, text)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                continue

    brace_start = text.find('{')
    brace_end = text.rfind('}')
    if brace_start != -1 and brace_end != -1:
        try:
            return json.loads(text[brace_start:brace_end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from response: {text[:300]}")


class GeminiService:
    """Service for interacting with Gemini AI for legal analysis."""

    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")

    async def classify_query(self, text: str, language: str) -> dict:
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"classify_{hash(text) % 100000}",
                system_message="""You are a legal classification expert for Indian law. 
Classify the legal query into one category and severity level.
Return ONLY valid JSON with this exact structure:
{
    "category": "one of: landlord_dispute|employment|consumer_rights|family_law|police_matter|property|women_rights|sc_st_rights|criminal|other",
    "severity": "one of: urgent|moderate|informational",
    "keywords": ["keyword1", "keyword2"]
}"""
            ).with_model("gemini", "gemini-3-flash-preview")

            response = await chat.send_message(UserMessage(text=f"Classify this legal query: {text}"))
            return extract_json(response)
        except Exception as e:
            logger.error(f"Error classifying query: {e}")
            return {"category": "other", "severity": "moderate", "keywords": text.split()[:5]}

    async def analyze_legal_query(self, text: str, language: str, category: str, kanoon_cases: list, law_sections: list) -> dict:
        try:
            context = "\n\nRELEVANT CASE LAW:\n"
            for i, case in enumerate(kanoon_cases[:5], 1):
                context += f"{i}. {case.get('title', 'N/A')}: {case.get('excerpt', 'N/A')}\n"

            context += "\n\nRELEVANT LAW SECTIONS:\n"
            for i, section in enumerate(law_sections[:6], 1):
                context += f"{i}. {section.get('act_name', 'N/A')} - {section.get('section_title', 'N/A')}: {section.get('content', 'N/A')[:200]}\n"

            lang_name = {"hi": "Hindi", "ta": "Tamil", "te": "Telugu", "kn": "Kannada", "ml": "Malayalam", "bn": "Bengali", "mr": "Marathi", "en": "English"}.get(language, "English")

            system_prompt = f"""You are Nyaya Setu, an AI legal guide for Indian citizens. You explain legal rights in simple, plain language that even a person with 5th grade education can understand. Never use complex legal jargon without immediately explaining it.

ALWAYS respond with valid JSON using this exact schema:
{{
  "summary": "2-3 sentence plain language summary of the situation",
  "rights": ["Right 1 in simple language", "Right 2", "Right 3"],
  "acts_cited": ["Consumer Protection Act 2019", "..."],
  "sections_cited": ["Section 12 - right to file complaint", "..."],
  "steps": [
    {{ "step": 1, "title": "First step title", "description": "What to do", "time_estimate": "1-2 days", "cost": "Free" }}
  ],
  "urgency_note": "If urgent, what to do immediately",
  "nearest_help": "Type of official/office to approach",
  "kanoon_references": ["case name and citation"],
  "legal_notice_recommended": true,
  "legal_notice_type": "Consumer complaint / Labour court notice / etc",
  "disclaimer": "This is general legal information. For your specific case, consult a qualified lawyer."
}}

Respond in {lang_name} language where applicable.
Use the following context to inform your response:
{context}"""

            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"analyze_{hash(text) % 100000}",
                system_message=system_prompt
            ).with_model("gemini", "gemini-3-flash-preview")

            response = await chat.send_message(UserMessage(text=f"Analyze this legal situation and provide guidance: {text}"))
            return extract_json(response)
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return {
                "summary": "Unable to analyze this query at the moment. Please try again.",
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

    async def generate_legal_notice(self, query_text: str, category: str, recipient_name: str, sender_name: str, additional_details: str = "") -> dict:
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"notice_{hash(query_text) % 100000}",
                system_message="""You are an expert Indian legal notice drafter. Generate a formal legal notice in English.
Return ONLY valid JSON with:
{
    "notice_title": "Legal Notice - [type]",
    "notice_body": "The full text of the legal notice with proper legal formatting. Use numbered paragraphs.",
    "applicable_laws": ["Law 1", "Law 2"],
    "deadline_days": 15,
    "notice_type": "Consumer/Employment/Property/etc"
}"""
            ).with_model("gemini", "gemini-3-flash-preview")

            prompt = f"""Draft a formal legal notice for:
Sender: {sender_name}
Recipient: {recipient_name}
Issue: {query_text}
Category: {category}
Additional Details: {additional_details}"""

            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json(response)
        except Exception as e:
            logger.error(f"Error generating legal notice: {e}")
            raise
