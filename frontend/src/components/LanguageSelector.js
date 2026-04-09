import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const languages = [
  { code: 'hi', name: 'हिंदी', nativeName: 'Hindi' },
  { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' },
  { code: 'te', name: 'తెలుగు', nativeName: 'Telugu' },
  { code: 'kn', name: 'ಕನ್ನಡ', nativeName: 'Kannada' },
  { code: 'ml', name: 'മലയാളം', nativeName: 'Malayalam' },
  { code: 'bn', name: 'বাংলা', nativeName: 'Bengali' },
  { code: 'mr', name: 'मराठी', nativeName: 'Marathi' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setLanguage(code);
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-3 glass-card rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-all duration-300"
          data-testid="language-selector-btn"
        >
          <Globe className="w-6 h-6 text-[#FF6B00]" strokeWidth={3} />
          <span className="text-white">{currentLang.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#111742] border-2 border-white/20 p-2 min-w-[200px]" data-testid="language-dropdown">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-4 py-3 text-lg font-bold cursor-pointer rounded-lg transition-all ${
              language === lang.code 
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] text-white' 
                : 'text-white/80 hover:bg-white/10'
            }`}
            data-testid={`lang-option-${lang.code}`}
          >
            {lang.name} ({lang.nativeName})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
