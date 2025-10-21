
import type { Language, AvailableLanguages, HistoryItem, Settings, ApiError } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPPORTED_LANGUAGES: AvailableLanguages = {
  translation: [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'pt', name: 'Portuguese' },
  ],
  tts: [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'ja', name: 'Japanese' },
  ],
};

let MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    sourceText: 'Hello, world!',
    translatedText: 'Привет, мир!',
    sourceLang: 'en',
    targetLang: 'ru',
    audioUrl: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    sourceText: 'How are you?',
    translatedText: 'Wie geht es Ihnen?',
    sourceLang: 'en',
    targetLang: 'de',
    audioUrl: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

export const getLanguages = async (): Promise<AvailableLanguages> => {
  return SUPPORTED_LANGUAGES;
};

export const translateText = async (
  text: string,
  source_lang: string,
  target_lang: string
): Promise<{ translation: string }> => {
  if (!text) return { translation: '' };

  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/translate`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_lang,
        target_lang,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Translation failed');
    }

    const data = await response.json();
    return { translation: data.translation };
  } catch (error: any) {
    console.error('Translation error:', error);
    throw new Error(error.message || 'Translation failed');
  }
};

export const synthesizeSpeech = async (
  text: string,
  lang: string,
  settings: Omit<Settings, 'ttsModel' | 'voice'>
): Promise<{ audioUrl: string }> => {
  if (!SUPPORTED_LANGUAGES.tts.some(l => l.code === lang)) {
    throw new Error(`TTS for language "${lang}" is not supported.`);
  }

  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/kokoro-tts`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        lang,
        speed: settings.speed,
        volume: settings.volume,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'TTS synthesis failed' }));
      throw new Error(error.error || 'TTS synthesis failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const historyItem = MOCK_HISTORY.find(item => item.translatedText === text);
    if (historyItem) {
      historyItem.audioUrl = audioUrl;
    }

    return { audioUrl };
  } catch (error: any) {
    console.error('TTS error:', error);
    throw new Error(error.message || 'TTS synthesis failed');
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  await simulateNetworkDelay(400);
  return [...MOCK_HISTORY].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const deleteHistoryItem = async (id: string): Promise<{ success: boolean }> => {
  await simulateNetworkDelay(200);
  const initialLength = MOCK_HISTORY.length;
  MOCK_HISTORY = MOCK_HISTORY.filter(item => item.id !== id);
  return { success: MOCK_HISTORY.length < initialLength };
};

export const addHistoryItem = async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'audioUrl'>): Promise<HistoryItem> => {
  await simulateNetworkDelay(100);
  const newItem: HistoryItem = {
    ...item,
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    audioUrl: ''
  };
  MOCK_HISTORY.push(newItem);
  return newItem;
}
