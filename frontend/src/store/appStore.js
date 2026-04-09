import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Language state
      language: 'hi',
      setLanguage: (lang) => set({ language: lang }),
      
      // Location state
      state: '',
      district: '',
      setState: (state) => set({ state }),
      setDistrict: (district) => set({ district }),
      
      // User state & Auth
      user: null,
      isAuthenticated: false,
      phoneNumber: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      logout: () => set({ user: null, isAuthenticated: false, phoneNumber: null }),
      
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
      darkMode: true,
      setIsLoading: (loading) => set({ isLoading: loading }),
      setDarkMode: (mode) => set({ darkMode: mode })
    }),
    {
      name: 'nyaya-setu-storage',
      partialize: (state) => ({ 
        language: state.language,
        darkMode: state.darkMode,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
