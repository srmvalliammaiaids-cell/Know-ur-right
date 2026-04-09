import logging
from typing import Dict, List
from .gemini_service import GeminiService
from .translation_service import TranslationService
from .kanoon_service import KanoonService

logger = logging.getLogger(__name__)

class LegalAnalysisService:
    """Main service that orchestrates legal query analysis."""
    
    def __init__(self):
        self.gemini = GeminiService()
        self.translator = TranslationService()
        self.kanoon = KanoonService()
    
    async def analyze_query(self, original_text: str, user_language: str, user_state: str = None) -> Dict:
        """
        Full pipeline for analyzing a legal query:
        1. Detect language and translate to English
        2. Classify category and severity
        3. Search for relevant case law
        4. Generate AI analysis
        5. Translate response back to user's language
        """
        try:
            # Step 1: Language detection and translation
            english_text, detected_language = await self.translator.translate_to_english(original_text)
            
            logger.info(f"Detected language: {detected_language}, User language: {user_language}")
            
            # Step 2: Classify query
            classification = await self.gemini.classify_query(english_text, "en")
            category = classification.get("category", "other")
            severity = classification.get("severity", "moderate")
            keywords = classification.get("keywords", [])
            
            logger.info(f"Classification: {category}, Severity: {severity}")
            
            # Step 3: Search Indian Kanoon for relevant cases
            kanoon_cases = await self.kanoon.search_cases(keywords, max_results=5)
            
            # Step 4: Get relevant law sections (mock for now, would use vector DB in production)
            law_sections = self._get_law_sections(category)
            
            # Step 5: Generate AI analysis using Gemini
            ai_response = await self.gemini.analyze_legal_query(
                english_text,
                user_language,
                category,
                kanoon_cases,
                law_sections
            )
            
            # Step 6: Extract data for storage
            acts_cited = ai_response.get("acts_cited", [])
            sections_cited = ai_response.get("sections_cited", [])
            kanoon_case_ids = [case.get("doc_id") for case in kanoon_cases]
            
            # Return complete analysis
            return {
                "original_text": original_text,
                "detected_language": detected_language,
                "translated_to_english": english_text,
                "category": category,
                "severity": severity,
                "ai_response": ai_response,
                "acts_cited": acts_cited,
                "sections_cited": sections_cited,
                "kanoon_case_ids": kanoon_case_ids,
                "kanoon_cases": kanoon_cases,
                "law_sections": law_sections
            }
        
        except Exception as e:
            logger.error(f"Error in legal analysis: {str(e)}")
            raise
    
    def _get_law_sections(self, category: str) -> List[Dict]:
        """Get relevant law sections based on category. Mock data for MVP."""
        law_data = {
            "employment": [
                {
                    "act_name": "Payment of Wages Act 1936",
                    "section_number": "15",
                    "section_title": "Right to recover wages",
                    "content": "Any employee can file a complaint to recover unpaid wages within 3 years from the date wages were due."
                },
                {
                    "act_name": "Industrial Disputes Act 1947",
                    "section_number": "25F",
                    "section_title": "Conditions for retrenchment",
                    "content": "No workman shall be retrenched unless: (a) workman given one month notice, (b) paid retrenchment compensation, (c) notice served to government."
                }
            ],
            "consumer_rights": [
                {
                    "act_name": "Consumer Protection Act 2019",
                    "section_number": "35",
                    "section_title": "Filing consumer complaint",
                    "content": "A consumer can file a complaint for deficiency in service or defect in goods within 2 years from the date of purchase."
                }
            ],
            "landlord_dispute": [
                {
                    "act_name": "Rent Control Act",
                    "section_number": "General",
                    "section_title": "Security deposit return",
                    "content": "Landlord must return security deposit within 60 days of tenant vacating the premises after deducting legitimate dues."
                }
            ],
            "women_rights": [
                {
                    "act_name": "Protection of Women from Domestic Violence Act 2005",
                    "section_number": "12",
                    "section_title": "Application for protection order",
                    "content": "Any woman facing domestic violence can approach a Magistrate for a protection order without needing a police complaint first."
                },
                {
                    "act_name": "Sexual Harassment of Women at Workplace Act 2013",
                    "section_number": "9",
                    "section_title": "Internal Complaints Committee",
                    "content": "Every workplace with 10+ employees must have an Internal Complaints Committee to address sexual harassment complaints."
                }
            ],
            "police_matter": [
                {
                    "act_name": "Code of Criminal Procedure 1973",
                    "section_number": "154",
                    "section_title": "FIR registration",
                    "content": "Police cannot refuse to register an FIR for a cognizable offense. If refused, complaint can be made to SP/DGP."
                }
            ]
        }
        
        return law_data.get(category, [])
