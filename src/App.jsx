import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import KPIReachCalculator from './pages/KPIReachCalculator.jsx';
import Mp4ToGifConverter from './pages/Mp4ToGifConverter.jsx';
import SvgToPngConverter from './pages/SvgToPngConverter.jsx';
import BackgroundRemover from './pages/BackgroundRemover.jsx';
import PercentageTools from './pages/PercentageTools.jsx';
import CampaignControlCenter from './pages/CampaignControlCenter.jsx';
import { LocaleProvider } from './i18n.jsx';
import { ThemeProvider } from './theme.jsx';

export default function App() {
  const [language, setLanguage] = useState('en');

  return (
    <ThemeProvider>
      <LocaleProvider language={language} setLanguage={setLanguage}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/outils/kpi-reach" element={<KPIReachCalculator />} />
            <Route path="/outils/pourcentages" element={<PercentageTools />} />
            <Route path="/outils/mp4-vers-gif" element={<Mp4ToGifConverter />} />
            <Route path="/outils/svg-vers-png" element={<SvgToPngConverter />} />
            <Route path="/outils/remove-background" element={<BackgroundRemover />} />
            <Route path="/outils/campaign-control" element={<CampaignControlCenter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  );
}
