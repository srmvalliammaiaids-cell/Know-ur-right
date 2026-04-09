# Nyaya Setu - AI Legal Rights Platform for Indian Citizens

## Problem Statement
Build a complete, production-ready full-stack web application that makes Indian law accessible to citizens through voice, text, and multilingual interfaces. Features include AI Legal Analysis via Gemini API + Indian Kanoon API, multilingual translation (8 languages), Web Speech API for voice, Demo Mode Auth, Legal Notice Generation (PDF), NGO Directory, Community Q&A, Emergency Helplines, and rural-accessible UI.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Zustand, react-i18next, Framer Motion, Shadcn UI, Web Speech API
- **Backend**: FastAPI (Python), Motor (MongoDB async driver)
- **Database**: MongoDB
- **AI**: Gemini via Emergent Integrations (classification, analysis, translation, notice generation)
- **Auth**: Supabase Email Magic Link + Demo Mode bypass
- **PDF**: fpdf2

## Architecture
```
/app/
├── backend/
│   ├── server.py (FastAPI - all routes)
│   └── services/
│       ├── gemini_service.py (AI analysis, classification, notice generation)
│       ├── kanoon_service.py (Indian Kanoon case search)
│       ├── legal_analysis_service.py (orchestrates pipeline)
│       ├── translation_service.py (Gemini-based translation)
│       └── voice_service.py (browser-based STT/TTS)
└── frontend/
    └── src/
        ├── App.js (routes)
        ├── components/ (BottomNav, LanguageSelector, DarkModeToggle, LoadingScales)
        ├── pages/ (LandingPage, LoginPage, Home, QueryPage, ResultPage, LegalNoticePage, NGODirectoryPage, EmergencyPage, CommunityPage, HistoryPage, ProfilePage)
        ├── services/ (api.js, supabase.js)
        └── store/ (appStore.js - Zustand)
```

## What's Been Implemented (Feb 9, 2026)

### Core Features - ALL COMPLETE
- [x] Landing Page with hero, features, stats
- [x] Login with Email Magic Link + Demo Mode
- [x] Home Page with Quick Actions, Categories, How It Works, Bottom Nav
- [x] Query Page with Voice Input (Web Speech API) + Text Input
- [x] AI Legal Analysis Engine (Gemini classification + analysis + Kanoon case search)
- [x] Result Page with Summary, Rights, Laws, Steps, Urgency, Bookmark, Share, TTS
- [x] Legal Notice Generator (AI-drafted, PDF download, share)
- [x] NGO Directory (12 seeded NGOs, state/specialization filters, search)
- [x] Emergency Helplines (14 helplines, category filters, tap-to-call)
- [x] Community Q&A (post questions, upvote, answer)
- [x] Query History (all/bookmarked filter)
- [x] User Profile (name, language, state, phone)
- [x] Bottom Navigation (Home, Ask, SOS, Community, Profile)
- [x] Multilingual Support (8 Indian languages via i18next)
- [x] Dark Mode UI

### API Endpoints
- POST /api/query - Submit legal query for AI analysis
- GET /api/query/{id} - Get analyzed query
- GET /api/queries - Get user's query history
- POST /api/query/{id}/bookmark - Toggle bookmark
- POST /api/legal-notice/generate - Generate AI legal notice
- GET /api/legal-notice/{id} - Get notice
- GET /api/legal-notice/{id}/pdf - Download PDF
- GET /api/emergency/helplines - Get 14 helplines
- GET /api/ngos - Get NGO directory with filters
- GET/POST /api/community/questions - Community Q&A CRUD
- POST /api/community/questions/{id}/upvote - Upvote
- POST /api/community/questions/{id}/answer - Add answer
- GET/PUT /api/profile/{user_id} - User profile

## Testing Status
- Backend: 21/21 tests passed (100%)
- Frontend: All UI flows working (100%)
- Test report: /app/test_reports/iteration_1.json

## Remaining/Future Tasks (P2-P3)
- [ ] Offline Mode (IndexedDB / Workbox) & Low Bandwidth Mode
- [ ] Jargon Buster interactions (tooltip explanations)
- [ ] Supabase Database Schema & RLS policies migration
- [ ] WhatsApp share for legal notices
- [ ] Google Maps integration for NGO locations
- [ ] Real-time community notifications
- [ ] Admin dashboard for content moderation
