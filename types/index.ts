
export interface Language {
  code: string;
  name: string;
}

export interface Voice {
  id: string;
  name: string;
}

export interface TtsModel {
  id: string;
  name: string;
  voices: Voice[];
}

export interface AvailableLanguages {
  translation: Language[];
  tts: Language[];
}

export interface Settings {
  ttsModel: string;
  voice: string;
  speed: number;
  volume: number;
}

export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  audioUrl: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
}
