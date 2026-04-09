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

  toggleBookmark: async (queryId) => {
    const response = await axios.post(`${API}/query/${queryId}/bookmark`);
    return response.data;
  },

  // Legal Notice APIs
  generateLegalNotice: async (data) => {
    const response = await axios.post(`${API}/legal-notice/generate`, data);
    return response.data;
  },

  getLegalNotice: async (noticeId) => {
    const response = await axios.get(`${API}/legal-notice/${noticeId}`);
    return response.data;
  },

  downloadNoticePdf: async (noticeId) => {
    const response = await axios.get(`${API}/legal-notice/${noticeId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getUserNotices: async (userId) => {
    const response = await axios.get(`${API}/legal-notices`, {
      params: { user_id: userId }
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

  // Translation API
  translate: async (text, targetLanguage, sourceLanguage = null) => {
    const response = await axios.post(`${API}/translate`, null, {
      params: { text, target_language: targetLanguage, source_language: sourceLanguage }
    });
    return response.data;
  },

  // Emergency APIs
  getEmergencyHelplines: async () => {
    const response = await axios.get(`${API}/emergency/helplines`);
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
  },

  createCommunityQuestion: async (data) => {
    const response = await axios.post(`${API}/community/questions`, data);
    return response.data;
  },

  upvoteQuestion: async (questionId) => {
    const response = await axios.post(`${API}/community/questions/${questionId}/upvote`);
    return response.data;
  },

  answerQuestion: async (questionId, data) => {
    const response = await axios.post(`${API}/community/questions/${questionId}/answer`, data);
    return response.data;
  },

  // Profile APIs
  getProfile: async (userId) => {
    const response = await axios.get(`${API}/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await axios.put(`${API}/profile/${userId}`, data);
    return response.data;
  },
};
