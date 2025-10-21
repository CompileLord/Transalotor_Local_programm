
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { TtsModel, Voice } from '../types';
import { XIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for TTS models and voices
const MOCK_TTS_MODELS: TtsModel[] = [
  { id: 'Kokoro TTS', name: 'Kokoro TTS', voices: [{ id: 'kokoro-male', name: 'Male' }, { id: 'kokoro-female', name: 'Female' }] },
  { id: 'Coqui TTS', name: 'Coqui TTS', voices: [{ id: 'coqui-neutral', name: 'Neutral' }] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;
  
  const currentModel = MOCK_TTS_MODELS.find(m => m.id === settings.ttsModel) || MOCK_TTS_MODELS[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Close settings">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="tts-model" className="block text-sm font-medium mb-1">TTS Model</label>
            <select id="tts-model" value={settings.ttsModel} onChange={(e) => updateSettings({ ttsModel: e.target.value })} className="w-full p-2 border rounded-md bg-surface-light dark:bg-surface-dark dark:border-gray-600">
              {MOCK_TTS_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="tts-voice" className="block text-sm font-medium mb-1">Voice</label>
            <select id="tts-voice" value={settings.voice} onChange={(e) => updateSettings({ voice: e.target.value })} className="w-full p-2 border rounded-md bg-surface-light dark:bg-surface-dark dark:border-gray-600">
              {currentModel.voices.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="speed" className="block text-sm font-medium mb-1">Speed ({settings.speed.toFixed(2)}x)</label>
            <input id="speed" type="range" min="0.5" max="2" step="0.05" value={settings.speed} onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          </div>

          <div>
            <label htmlFor="volume" className="block text-sm font-medium mb-1">Volume ({(settings.volume * 100).toFixed(0)}%)</label>
            <input id="volume" type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
