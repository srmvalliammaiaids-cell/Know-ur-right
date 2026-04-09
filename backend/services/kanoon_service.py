import os
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class KanoonService:
    """Service for searching Indian case law using Indian Kanoon API."""
    
    BASE_URL = "https://api.indiankanoon.org"
    
    def __init__(self):
        self.api_token = os.getenv('INDIAN_KANOON_API_TOKEN')
        if not self.api_token:
            raise ValueError("INDIAN_KANOON_API_TOKEN not found in environment")
    
    async def search_cases(self, keywords: list, max_results: int = 5) -> list:
        """Search for relevant case law based on keywords."""
        try:
            # Join keywords for search
            query = " ".join(keywords)
            
            url = f"{self.BASE_URL}/search/"
            params = {
                "formInput": query,
                "pagenum": 0
            }
            headers = {
                "Authorization": f"Token {self.api_token}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, headers=headers, timeout=10.0)
                response.raise_for_status()
                data = response.json()
            
            # Extract relevant cases
            cases = []
            results = data.get('docs', [])[:max_results]
            
            for doc in results:
                cases.append({
                    "title": doc.get('title', 'N/A'),
                    "excerpt": doc.get('headline', 'N/A'),
                    "citation": doc.get('cite', 'N/A'),
                    "doc_id": doc.get('tid', 'N/A')
                })
            
            return cases
        except Exception as e:
            logger.error(f"Error searching Indian Kanoon: {str(e)}")
            return []
