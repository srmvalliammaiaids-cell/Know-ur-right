"""
Nyaya Setu API Backend Tests
Tests for: Health, Emergency Helplines, NGOs, Community Q&A, Profile, Legal Notice, Query
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Health check and basic API tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Nyaya Setu" in data["message"]
        print(f"✓ API root working: {data['message']}")
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "supported_languages" in data
        assert len(data["supported_languages"]) == 8
        print(f"✓ Health check passed: {data['status']}")


class TestEmergencyHelplines:
    """Emergency helplines API tests"""
    
    def test_get_emergency_helplines(self):
        """Test GET /api/emergency/helplines"""
        response = requests.get(f"{BASE_URL}/api/emergency/helplines")
        assert response.status_code == 200
        data = response.json()
        assert "helplines" in data
        assert len(data["helplines"]) > 0
        
        # Verify helpline structure
        helpline = data["helplines"][0]
        assert "name" in helpline
        assert "number" in helpline
        assert "category" in helpline
        assert "description" in helpline
        
        # Check for key helplines
        names = [h["name"] for h in data["helplines"]]
        assert "Police" in names
        assert "Women Helpline" in names
        print(f"✓ Emergency helplines: {len(data['helplines'])} helplines returned")


class TestNGODirectory:
    """NGO Directory API tests"""
    
    def test_get_ngos_all(self):
        """Test GET /api/ngos without filters"""
        response = requests.get(f"{BASE_URL}/api/ngos")
        assert response.status_code == 200
        data = response.json()
        assert "ngos" in data
        assert "total" in data
        assert len(data["ngos"]) > 0
        
        # Verify NGO structure
        ngo = data["ngos"][0]
        assert "name" in ngo
        assert "state" in ngo
        assert "specializations" in ngo
        print(f"✓ NGOs returned: {data['total']} NGOs")
    
    def test_get_ngos_with_state_filter(self):
        """Test GET /api/ngos with state filter"""
        response = requests.get(f"{BASE_URL}/api/ngos", params={"state": "Delhi"})
        assert response.status_code == 200
        data = response.json()
        assert "ngos" in data
        # All returned NGOs should be from Delhi
        for ngo in data["ngos"]:
            assert "delhi" in ngo.get("state", "").lower()
        print(f"✓ NGOs filtered by state: {len(data['ngos'])} Delhi NGOs")
    
    def test_get_ngos_with_specialization_filter(self):
        """Test GET /api/ngos with specialization filter"""
        response = requests.get(f"{BASE_URL}/api/ngos", params={"specialization": "legal_aid"})
        assert response.status_code == 200
        data = response.json()
        assert "ngos" in data
        print(f"✓ NGOs filtered by specialization: {len(data['ngos'])} legal_aid NGOs")


class TestCommunityQA:
    """Community Q&A API tests"""
    
    def test_get_community_questions(self):
        """Test GET /api/community/questions"""
        response = requests.get(f"{BASE_URL}/api/community/questions")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert "total" in data
        
        # Verify question structure (sample questions returned if DB empty)
        if len(data["questions"]) > 0:
            q = data["questions"][0]
            assert "id" in q
            assert "title" in q
            assert "category" in q
            assert "upvotes" in q or q.get("upvotes") == 0
        print(f"✓ Community questions: {data['total']} questions")
    
    def test_create_community_question(self):
        """Test POST /api/community/questions"""
        payload = {
            "title": "TEST_Can employer fire without notice?",
            "description": "My employer wants to fire me without any notice period.",
            "category": "employment",
            "language": "en",
            "user_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/community/questions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == payload["title"]
        assert data["category"] == payload["category"]
        print(f"✓ Created community question: {data['id']}")
        return data["id"]
    
    def test_upvote_question(self):
        """Test POST /api/community/questions/{id}/upvote"""
        # First create a question
        payload = {
            "title": "TEST_Upvote test question",
            "description": "Testing upvote functionality",
            "category": "other",
            "language": "en"
        }
        create_resp = requests.post(f"{BASE_URL}/api/community/questions", json=payload)
        assert create_resp.status_code == 200
        question_id = create_resp.json()["id"]
        
        # Upvote it
        response = requests.post(f"{BASE_URL}/api/community/questions/{question_id}/upvote")
        assert response.status_code == 200
        data = response.json()
        assert "upvotes" in data
        assert data["upvotes"] >= 1
        print(f"✓ Upvoted question: {question_id}, upvotes: {data['upvotes']}")
    
    def test_answer_question(self):
        """Test POST /api/community/questions/{id}/answer"""
        # First create a question
        payload = {
            "title": "TEST_Answer test question",
            "description": "Testing answer functionality",
            "category": "other",
            "language": "en"
        }
        create_resp = requests.post(f"{BASE_URL}/api/community/questions", json=payload)
        assert create_resp.status_code == 200
        question_id = create_resp.json()["id"]
        
        # Answer it
        answer_payload = {
            "text": "This is a test answer to the question.",
            "user_name": "Test Answerer"
        }
        response = requests.post(f"{BASE_URL}/api/community/questions/{question_id}/answer", json=answer_payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "answer" in data
        assert data["answer"]["text"] == answer_payload["text"]
        print(f"✓ Answered question: {question_id}")


class TestProfile:
    """Profile API tests"""
    
    def test_get_profile_new_user(self):
        """Test GET /api/profile/{user_id} for new user"""
        test_user_id = "test-user-" + str(int(time.time()))
        response = requests.get(f"{BASE_URL}/api/profile/{test_user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == test_user_id
        assert "preferred_language" in data
        print(f"✓ Got profile for new user: {test_user_id}")
    
    def test_update_profile(self):
        """Test PUT /api/profile/{user_id}"""
        test_user_id = "test-user-profile-" + str(int(time.time()))
        
        # Update profile
        update_payload = {
            "full_name": "Test User Name",
            "preferred_language": "en",
            "state": "Maharashtra",
            "phone": "+91 9876543210"
        }
        response = requests.put(f"{BASE_URL}/api/profile/{test_user_id}", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == update_payload["full_name"]
        assert data["state"] == update_payload["state"]
        
        # Verify by GET
        get_resp = requests.get(f"{BASE_URL}/api/profile/{test_user_id}")
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert get_data["full_name"] == update_payload["full_name"]
        print(f"✓ Updated and verified profile: {test_user_id}")


class TestLegalNotice:
    """Legal Notice API tests"""
    
    def test_generate_legal_notice(self):
        """Test POST /api/legal-notice/generate - takes 10-20s due to AI"""
        payload = {
            "query_text": "My employer has not paid my salary for 3 months",
            "category": "employment",
            "recipient_name": "ABC Company Ltd",
            "sender_name": "Test Employee",
            "sender_address": "123 Test Street, Mumbai",
            "recipient_address": "456 Corporate Park, Mumbai",
            "additional_details": "I have worked for 2 years and salary is pending since October 2025"
        }
        response = requests.post(f"{BASE_URL}/api/legal-notice/generate", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "notice_title" in data
        assert "notice_body" in data
        assert "applicable_laws" in data
        assert data["sender_name"] == payload["sender_name"]
        assert data["recipient_name"] == payload["recipient_name"]
        print(f"✓ Generated legal notice: {data['id']}")
        return data["id"]
    
    def test_get_legal_notice(self):
        """Test GET /api/legal-notice/{id}"""
        # First generate a notice
        payload = {
            "query_text": "Landlord not returning security deposit",
            "category": "landlord_dispute",
            "recipient_name": "Mr. Landlord",
            "sender_name": "Test Tenant"
        }
        gen_resp = requests.post(f"{BASE_URL}/api/legal-notice/generate", json=payload, timeout=60)
        assert gen_resp.status_code == 200
        notice_id = gen_resp.json()["id"]
        
        # Get the notice
        response = requests.get(f"{BASE_URL}/api/legal-notice/{notice_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == notice_id
        assert "notice_body" in data
        print(f"✓ Retrieved legal notice: {notice_id}")
    
    def test_download_legal_notice_pdf(self):
        """Test GET /api/legal-notice/{id}/pdf"""
        # First generate a notice
        payload = {
            "query_text": "Consumer product defect complaint",
            "category": "consumer_rights",
            "recipient_name": "XYZ Electronics",
            "sender_name": "Test Consumer"
        }
        gen_resp = requests.post(f"{BASE_URL}/api/legal-notice/generate", json=payload, timeout=60)
        assert gen_resp.status_code == 200
        notice_id = gen_resp.json()["id"]
        
        # Download PDF
        response = requests.get(f"{BASE_URL}/api/legal-notice/{notice_id}/pdf")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/pdf"
        assert len(response.content) > 0
        print(f"✓ Downloaded PDF for notice: {notice_id}, size: {len(response.content)} bytes")
    
    def test_get_legal_notice_not_found(self):
        """Test GET /api/legal-notice/{id} with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/legal-notice/invalid-notice-id-12345")
        assert response.status_code == 404
        print("✓ Legal notice not found returns 404")


class TestQuerySubmission:
    """Query submission API tests - AI processing takes 15-30s"""
    
    def test_submit_query(self):
        """Test POST /api/query - takes 15-30s due to AI processing"""
        payload = {
            "text": "My employer has not paid my salary for 2 months. What are my rights?",
            "language_code": "en",
            "state": "Maharashtra",
            "user_id": "test-user-query"
        }
        response = requests.post(f"{BASE_URL}/api/query", json=payload, timeout=90)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "original_text" in data
        assert "category" in data
        assert "severity" in data
        assert "ai_response" in data
        assert "acts_cited" in data
        assert "sections_cited" in data
        
        # Verify AI response structure
        ai = data["ai_response"]
        assert "summary" in ai or ai.get("summary") is not None
        
        print(f"✓ Query submitted: {data['id']}, category: {data['category']}, severity: {data['severity']}")
        return data["id"]
    
    def test_get_query(self):
        """Test GET /api/query/{id}"""
        # First submit a query
        payload = {
            "text": "Police is not registering my FIR",
            "language_code": "en"
        }
        submit_resp = requests.post(f"{BASE_URL}/api/query", json=payload, timeout=90)
        assert submit_resp.status_code == 200
        query_id = submit_resp.json()["id"]
        
        # Get the query
        response = requests.get(f"{BASE_URL}/api/query/{query_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == query_id
        assert "ai_response" in data
        print(f"✓ Retrieved query: {query_id}")
    
    def test_get_query_not_found(self):
        """Test GET /api/query/{id} with invalid ID"""
        response = requests.get(f"{BASE_URL}/api/query/invalid-query-id-12345")
        assert response.status_code == 404
        print("✓ Query not found returns 404")
    
    def test_get_user_queries(self):
        """Test GET /api/queries with user_id"""
        test_user_id = "test-user-queries-" + str(int(time.time()))
        
        # Submit a query for this user
        payload = {
            "text": "Consumer complaint about defective product",
            "language_code": "en",
            "user_id": test_user_id
        }
        submit_resp = requests.post(f"{BASE_URL}/api/query", json=payload, timeout=90)
        assert submit_resp.status_code == 200
        
        # Get user queries
        response = requests.get(f"{BASE_URL}/api/queries", params={"user_id": test_user_id})
        assert response.status_code == 200
        data = response.json()
        assert "queries" in data
        assert "total" in data
        assert data["total"] >= 1
        print(f"✓ User queries: {data['total']} queries for user {test_user_id}")
    
    def test_toggle_bookmark(self):
        """Test POST /api/query/{id}/bookmark"""
        # First submit a query
        payload = {
            "text": "Women harassment at workplace",
            "language_code": "en"
        }
        submit_resp = requests.post(f"{BASE_URL}/api/query", json=payload, timeout=90)
        assert submit_resp.status_code == 200
        query_id = submit_resp.json()["id"]
        
        # Toggle bookmark
        response = requests.post(f"{BASE_URL}/api/query/{query_id}/bookmark")
        assert response.status_code == 200
        data = response.json()
        assert "is_bookmarked" in data
        assert data["is_bookmarked"] == True
        
        # Toggle again
        response2 = requests.post(f"{BASE_URL}/api/query/{query_id}/bookmark")
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["is_bookmarked"] == False
        print(f"✓ Bookmark toggled for query: {query_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
