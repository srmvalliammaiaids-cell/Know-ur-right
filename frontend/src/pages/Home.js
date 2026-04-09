import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { Mic, Globe, MapPin, Shield, Users, Scale, Home as HomeIcon, Briefcase } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppStore();

  const categories = [
    { key: 'employment', icon: Briefcase, color: '#FF6B00' },
    { key: 'consumer_rights', icon: Shield, color: '#1A237E' },
    { key: 'landlord_dispute', icon: HomeIcon, color: '#FF6B00' },
    { key: 'women_rights', icon: Users, color: '#1A237E' },
    { key: 'police_matter', icon: Shield, color: '#FF6B00' },
    { key: 'property', icon: MapPin, color: '#1A237E' },
    { key: 'family_law', icon: Users, color: '#FF6B00' },
    { key: 'sc_st_rights', icon: Scale, color: '#1A237E' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="home-page">
      {/* Emergency Button - Fixed */}
      <button
        className="fixed top-4 right-4 bg-[#D32F2F] text-white font-black text-sm px-4 py-2 md:px-6 md:py-4 md:text-xl rounded-xl shadow-lg border-2 border-[#D32F2F] uppercase tracking-wider z-50"
        onClick={() => navigate('/emergency')}
        data-testid="emergency-btn"
      >
        {t('emergency')}
      </button>

      {/* Language Selector */}
      <div className="fixed top-4 left-4 z-50">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-[#1A237E] mb-4" data-testid="app-title">
            {t('appName')}
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-[#283593]">
            {t('tagline')}
          </p>
        </div>

        {/* Main Voice Button */}
        <div className="flex flex-col items-center mb-16">
          <p className="text-2xl sm:text-3xl font-bold text-[#1A237E] mb-8 text-center">
            {t('speakYourProblem')}
          </p>
          
          <button
            onClick={() => navigate('/query')}
            className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-[#FF6B00] text-[#1A237E] flex items-center justify-center shadow-[0_8px_16px_rgba(255,107,0,0.3)] hover:shadow-[0_12px_24px_rgba(255,107,0,0.4)] transition-all duration-300 hover:scale-110"
            data-testid="main-voice-btn"
          >
            <Mic className="w-10 h-10 md:w-12 md:h-12" strokeWidth={3} />
          </button>
          
          <p className="text-lg font-medium leading-relaxed text-[#1A237E] mt-4 text-center max-w-md">
            {t('tapMicAndSpeak')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A237E] text-center mb-8">
            {t('categories.employment')} • {t('categories.consumer_rights')} • {t('categories.women_rights')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => navigate('/query', { state: { category: cat.key } })}
                  className="p-6 md:p-8 rounded-xl border-2 border-[#1A237E]/20 hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-all duration-300 flex flex-col items-center gap-3"
                  style={{ minHeight: '120px' }}
                  data-testid={`category-${cat.key}-btn`}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={3} style={{ color: cat.color }} />
                  <span className="text-lg font-bold tracking-wide text-[#1A237E] text-center">
                    {t(`categories.${cat.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16 bg-[#F8F9FA] p-8 md:p-12 rounded-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A237E] text-center mb-12">
            {t('howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                1
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A237E] mb-2">
                {t('step1Title')}
              </h3>
              <p className="text-lg font-medium leading-relaxed text-[#1A237E]">
                {t('step1Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A237E] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                2
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A237E] mb-2">
                {t('step2Title')}
              </h3>
              <p className="text-lg font-medium leading-relaxed text-[#1A237E]">
                {t('step2Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                3
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1A237E] mb-2">
                {t('step3Title')}
              </h3>
              <p className="text-lg font-medium leading-relaxed text-[#1A237E]">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/query')}
            className="bg-[#FF6B00] text-[#1A237E] px-8 py-4 md:px-12 md:py-6 rounded-xl text-xl md:text-2xl font-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            data-testid="start-btn"
          >
            {t('findMyRights')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
