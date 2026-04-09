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

// Protected Route wrapper
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
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
