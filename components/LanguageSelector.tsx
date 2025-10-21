
import React from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  id: string;
  label: string;
  languages: Language[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ id, label, languages, value, onChange, disabled = false }) => {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
