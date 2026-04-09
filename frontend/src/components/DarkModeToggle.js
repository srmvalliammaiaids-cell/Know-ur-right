import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const DarkModeToggle = () => {
  const { darkMode, setDarkMode } = useAppStore();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', !darkMode ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-20 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all"
      data-testid="dark-mode-toggle"
    >
      {darkMode ? (
        <Sun className="w-6 h-6 text-[#FF6B00]" strokeWidth={2.5} />
      ) : (
        <Moon className="w-6 h-6 text-[#FF6B00]" strokeWidth={2.5} />
      )}
    </button>
  );
};

export default DarkModeToggle;
