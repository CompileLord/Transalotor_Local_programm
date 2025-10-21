
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TranslatorPage from './pages/TranslatorPage';
import HistoryPage from './pages/HistoryPage';
import Header from './components/Header';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <HashRouter>
          <div className="min-h-screen bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark font-sans transition-colors duration-300">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<TranslatorPage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
