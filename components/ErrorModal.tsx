
import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl p-6 w-full max-w-sm m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
             <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Error</h3>
            <p className="text-sm text-text-light dark:text-text-dark mt-1">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
