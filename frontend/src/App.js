import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import './i18n';

import Home from './pages/Home';
import QueryPage from './pages/QueryPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/result/:queryId" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
