import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Language state
  language: 'hi',
  setLanguage: (lang) => set({ language: lang }),
  
  // Location state
  state: '',
  district: '',
  setState: (state) => set({ state }),
  setDistrict: (district) => set({ district }),
  
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Query state
  currentQuery: null,
  queryHistory: [],
  setCurrentQuery: (query) => set({ currentQuery: query }),
  addToHistory: (query) => set((state) => ({ 
    queryHistory: [query, ...state.queryHistory] 
  })),
  
  // Voice state
  isListening: false,
  voiceTranscript: '',
  setIsListening: (listening) => set({ isListening: listening }),
  setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),
  
  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading })
}));
