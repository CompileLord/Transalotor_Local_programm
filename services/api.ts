
import type { Language, AvailableLanguages, HistoryItem, Settings, ApiError } from '../types';

// --- MOCK DATA ---
const MOCK_LANGUAGES: AvailableLanguages = {
  translation: [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
  ],
  tts: [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
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

// --- MOCK API FUNCTIONS ---

const simulateNetworkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getLanguages = async (): Promise<AvailableLanguages> => {
  await simulateNetworkDelay(300);
  return MOCK_LANGUAGES;
};

export const translateText = async (
  text: string,
  source_lang: string,
  target_lang: string
): Promise<{ translation: string }> => {
  await simulateNetworkDelay(800);
  if (!text) return { translation: '' };
  const translation = `[${target_lang}] Mock translation for: "${text}"`;
  return { translation };
};

// Generates a silent WAV file as a Blob URL for placeholder audio
const generateSilentWav = (duration: number = 2): string => {
  const sampleRate = 44100;
  const numChannels = 1;
  const numFrames = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numFrames * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numFrames * 2, true);
  writeString(view, 8, 'WAVE');
  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numFrames * 2, true);

  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


export const synthesizeSpeech = async (
  text: string,
  lang: string,
  settings: Omit<Settings, 'ttsModel' | 'voice'> // Assuming backend handles model/voice selection based on settings
): Promise<{ audioUrl: string }> => {
  await simulateNetworkDelay(1500);
  if (!MOCK_LANGUAGES.tts.some(l => l.code === lang)) {
      throw new Error(`TTS for language "${lang}" is not supported.`);
  }
  const audioUrl = generateSilentWav(text.length / 10); // Duration based on text length
  
  // Find and update history item
  const historyItem = MOCK_HISTORY.find(item => item.translatedText === text);
  if(historyItem) {
    historyItem.audioUrl = audioUrl;
  }
  
  return { audioUrl };
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
