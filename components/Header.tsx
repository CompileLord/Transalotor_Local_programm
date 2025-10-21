
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, TranslateIcon, HistoryIcon } from './Icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-primary-light text-primary-dark dark:bg-primary-dark dark:text-white'
        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <header className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary dark:text-primary-light">Local Translator</h1>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            <TranslateIcon className="w-5 h-5" />
            <span>Translator</span>
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            <HistoryIcon className="w-5 h-5" />
            <span>History</span>
          </NavLink>
        </nav>
      </div>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>
    </header>
  );
};

export default Header;
