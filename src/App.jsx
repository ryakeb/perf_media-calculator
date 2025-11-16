import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import KPIReachCalculator from './pages/KPIReachCalculator.jsx';
import Mp4ToGifConverter from './pages/Mp4ToGifConverter.jsx';
import { LocaleProvider } from './i18n.jsx';

export default function App() {
  const [language, setLanguage] = useState('en');

  return (
    <LocaleProvider language={language} setLanguage={setLanguage}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/outils/kpi-reach" element={<KPIReachCalculator />} />
          <Route path="/outils/mp4-vers-gif" element={<Mp4ToGifConverter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
