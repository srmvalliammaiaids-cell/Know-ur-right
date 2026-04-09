import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // Query APIs
  submitQuery: async (data) => {
    const response = await axios.post(`${API}/query`, data);
    return response.data;
  },
  
  getQuery: async (queryId) => {
    const response = await axios.get(`${API}/query/${queryId}`);
    return response.data;
  },
  
  getUserQueries: async (userId, limit = 20) => {
    const response = await axios.get(`${API}/queries`, {
      params: { user_id: userId, limit }
    });
    return response.data;
  },
  
  // Voice APIs
  transcribeAudio: async (audioBlob, languageCode) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('language_code', languageCode);
    
    const response = await axios.post(`${API}/voice/transcribe`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  synthesizeSpeech: async (text, languageCode, speakingRate = 0.75) => {
    const response = await axios.post(`${API}/voice/synthesize`, {
      text,
      language_code: languageCode,
      speaking_rate: speakingRate
    }, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Translation API
  translate: async (text, targetLanguage, sourceLanguage = null) => {
    const response = await axios.post(`${API}/translate`, null, {
      params: { text, target_language: targetLanguage, source_language: sourceLanguage }
    });
    return response.data;
  },
  
  // NGO APIs
  getNGOs: async (state = null, district = null, specialization = null) => {
    const response = await axios.get(`${API}/ngos`, {
      params: { state, district, specialization }
    });
    return response.data;
  },
  
  // Community APIs
  getCommunityQuestions: async (language = null, category = null, limit = 50) => {
    const response = await axios.get(`${API}/community/questions`, {
      params: { language, category, limit }
    });
    return response.data;
  }
};
