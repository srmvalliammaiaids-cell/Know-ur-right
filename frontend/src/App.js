import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import './i18n';
import { useAppStore } from './store/appStore';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import QueryPage from './pages/QueryPage';
import ResultPage from './pages/ResultPage';
import LegalNoticePage from './pages/LegalNoticePage';
import NGODirectoryPage from './pages/NGODirectoryPage';
import EmergencyPage from './pages/EmergencyPage';
import CommunityPage from './pages/CommunityPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { darkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/query" element={<ProtectedRoute><QueryPage /></ProtectedRoute>} />
          <Route path="/result/:queryId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/notice/generate/:queryId?" element={<ProtectedRoute><LegalNoticePage /></ProtectedRoute>} />
          <Route path="/ngo-finder" element={<ProtectedRoute><NGODirectoryPage /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
