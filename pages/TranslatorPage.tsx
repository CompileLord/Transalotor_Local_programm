
import React, { useState, useEffect, useCallback } from 'react';
import LanguageSelector from '../components/LanguageSelector';
import AudioPlayer from '../components/AudioPlayer';
import Loader from '../components/Loader';
import SettingsModal from '../components/SettingsModal';
import ErrorModal from '../components/ErrorModal';
import { SettingsIcon, XIcon, SwapIcon } from '../components/Icons';
import * as api from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import type { Language, AvailableLanguages } from '../types';

const TranslatorPage: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ru');
  const [languages, setLanguages] = useState<AvailableLanguages>({ translation: [], tts: [] });
  const [audioUrl, setAudioUrl] = useState('');
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState('');

  const { settings } = useSettings();

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await api.getLanguages();
        setLanguages(data);
      } catch (e) {
        setError('Failed to load available languages.');
      }
    };
    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setAudioUrl('');
    setTranslatedText('');
    setError('');
    try {
      const { translation } = await api.translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(translation);
      await api.addHistoryItem({ sourceText, translatedText: translation, sourceLang, targetLang });
    } catch (e) {
      setError('An error occurred during translation.');
    } finally {
      setIsTranslating(false);
    }
  };
  
  const handleSpeak = useCallback(async () => {
    if (!translatedText) return;
    setIsSpeaking(true);
    setError('');
    try {
      const { audioUrl: newAudioUrl } = await api.synthesizeSpeech(translatedText, targetLang, { speed: settings.speed, volume: settings.volume });
      setAudioUrl(newAudioUrl);
    } catch (e: any) {
      setError(e.message || 'An error occurred during speech synthesis.');
    } finally {
      setIsSpeaking(false);
    }
  }, [translatedText, targetLang, settings]);

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setAudioUrl('');
  };
  
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text Area */}
        <div className="flex flex-col gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <LanguageSelector id="source-lang" label="From" languages={languages.translation} value={sourceLang} onChange={e => setSourceLang(e.target.value)} />
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Translated Text Area */}
        <div className="flex flex-col gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                <LanguageSelector id="target-lang" label="To" languages={languages.translation} value={targetLang} onChange={e => setTargetLang(e.target.value)} />
                <button 
                  onClick={handleSwapLanguages} 
                  title="Swap languages" 
                  className="mt-6 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <SwapIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="relative w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-background-light dark:bg-background-dark">
                {isTranslating ? <div className="absolute inset-0 flex items-center justify-center"><Loader text="Translating..." /></div> : <p className="whitespace-pre-wrap">{translatedText}</p>}
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
            <button
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                className="px-6 py-3 font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
                Translate
            </button>
            <button
                onClick={handleSpeak}
                disabled={!translatedText || isSpeaking || !languages.tts.some(l => l.code === targetLang)}
                className="px-6 py-3 font-semibold text-white bg-secondary rounded-lg shadow-md hover:bg-secondary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
                {isSpeaking ? 'Generating...' : 'Speak'}
            </button>
        </div>
        <div className="flex gap-2">
            <button onClick={handleClear} className="p-3 font-medium flex items-center gap-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Clear text fields">
                <XIcon className="w-5 h-5"/> Clear
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 font-medium flex items-center gap-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Open TTS settings">
                <SettingsIcon className="w-5 h-5" /> Settings
            </button>
        </div>
      </div>
      
      {/* Audio Player and Loader */}
      <div className="mt-6">
        {isSpeaking && <Loader text="Synthesizing audio..." />}
        {audioUrl && !isSpeaking && <AudioPlayer audioUrl={audioUrl} />}
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ErrorModal message={error} onClose={() => setError('')} />
    </div>
  );
};

export default TranslatorPage;
