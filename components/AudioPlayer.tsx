
import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, DownloadIcon } from './Icons';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      const audio = audioRef.current;
      
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audioRef.current = null;
      }
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-surface-light dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-600">
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        title={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
      <div className="text-sm font-medium text-subtle-light dark:text-subtle-dark">Playback</div>
      <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        {/* Progress bar could be implemented here by listening to timeupdate event */}
      </div>
      <a
        href={audioUrl}
        download="translation.wav"
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Download audio"
        title="Download audio"
      >
        <DownloadIcon className="w-6 h-6" />
      </a>
    </div>
  );
};

export default AudioPlayer;
