
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { HistoryItem } from '../types';
import Loader from '../components/Loader';
import AudioPlayer from '../components/AudioPlayer';
import { TrashIcon, PlayIcon, DownloadIcon } from '../components/Icons';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (e) {
      setError('Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    const originalHistory = [...history];
    setHistory(history.filter(item => item.id !== id));
    try {
      const result = await api.deleteHistoryItem(id);
      if (!result.success) {
        setHistory(originalHistory);
        setError('Failed to delete item.');
      }
    } catch (e) {
      setHistory(originalHistory);
      setError('Failed to delete item.');
    }
  };
  
  const handleListen = async (item: HistoryItem) => {
    if(item.audioUrl) {
      setPlayingAudioId(item.id);
    } else {
      // Synthesize if not already available
      try {
        const { audioUrl } = await api.synthesizeSpeech(item.translatedText, item.targetLang, { speed: 1.0, volume: 1.0 });
        const updatedHistory = history.map(h => h.id === item.id ? { ...h, audioUrl } : h);
        setHistory(updatedHistory);
        setPlayingAudioId(item.id);
      } catch (e) {
        setError("Could not generate audio for this item.");
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center mt-10"><Loader text="Loading history..." /></div>;
  }
  
  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Translation History</h2>
      {history.length === 0 ? (
        <p className="text-center text-subtle-light dark:text-subtle-dark">No history yet.</p>
      ) : (
        <div className="overflow-x-auto bg-surface-light dark:bg-surface-dark rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Translation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Languages</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item) => (
                <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={item.sourceText}>{item.sourceText}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm max-w-xs truncate" title={item.translatedText}>{item.translatedText}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-subtle-light dark:text-subtle-dark">{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleListen(item)} title="Listen" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><PlayIcon className="w-5 h-5 text-green-600"/></button>
                      <a href={item.audioUrl} download={`${item.translatedText.substring(0,20)}.wav`} className={`${!item.audioUrl && 'pointer-events-none opacity-50'} p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700`} title="Download"><DownloadIcon className="w-5 h-5 text-blue-600"/></a>
                      <button onClick={() => handleDelete(item.id)} title="Delete" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><TrashIcon className="w-5 h-5 text-red-600"/></button>
                    </div>
                  </td>
                </tr>
                {playingAudioId === item.id && item.audioUrl && (
                  <tr>
                    <td colSpan={5} className="p-2 bg-gray-100 dark:bg-gray-800">
                      <AudioPlayer audioUrl={item.audioUrl} />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
