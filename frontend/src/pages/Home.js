import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Mic, Shield, Users, Scale, Home as HomeIcon, Briefcase, MapPin, AlertCircle, LogOut } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import DarkModeToggle from '../components/DarkModeToggle';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, isAuthenticated, logout } = useAppStore();

  const categories = [
    { key: 'employment', icon: Briefcase, color: '#FF6B00', gradient: 'from-[#FF6B00] to-[#FF8A33]' },
    { key: 'consumer_rights', icon: Shield, color: '#00E676', gradient: 'from-[#00E676] to-[#00BFA5]' },
    { key: 'landlord_dispute', icon: HomeIcon, color: '#D500F9', gradient: 'from-[#D500F9] to-[#AA00FF]' },
    { key: 'women_rights', icon: Users, color: '#FF4081', gradient: 'from-[#FF4081] to-[#F50057]' },
    { key: 'police_matter', icon: AlertCircle, color: '#FF6B00', gradient: 'from-[#FF6B00] to-[#FF8A33]' },
    { key: 'property', icon: MapPin, color: '#00E676', gradient: 'from-[#00E676] to-[#00BFA5]' },
    { key: 'family_law', icon: Users, color: '#D500F9', gradient: 'from-[#D500F9] to-[#AA00FF]' },
    { key: 'sc_st_rights', icon: Scale, color: '#FF4081', gradient: 'from-[#FF4081] to-[#F50057]' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={'min-h-screen bg-[#0A0D29] text-white'} data-testid={'home-page'}>
      {/* Emergency Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={'fixed top-4 right-4 btn-emergency z-50'}
        onClick={() => navigate('/emergency')}
        data-testid={'emergency-btn'}
      >
        {t('emergency')}
      </motion.button>

      {/* Language Selector & Dark Mode */}
      <div className={'fixed top-4 left-4 z-50 flex gap-2'}>
        <LanguageSelector />
      </div>
      
      <DarkModeToggle />

      {/* Hero Section */}
      <div className={'relative overflow-hidden'}>
        <div className={'absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 via-transparent to-[#D500F9]/10 pointer-events-none'}></div>
        
        <div className={'container mx-auto px-4 py-12 md:py-20 relative'}>
          {isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={'flex justify-end mb-4'}
            >
              <button
                onClick={handleLogout}
                className={'glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all'}
                data-testid={'logout-btn'}
              >
                <LogOut className={'w-4 h-4'} />
                Logout
              </button>
            </motion.div>
          )}

          <motion.div 
            className={'text-center mb-12'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={'text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none mb-4'} data-testid={'app-title'}>
              <span className={'bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] bg-clip-text text-transparent font-bold'}>
                {t('appName')}
              </span>
            </h1>
            <p className={'text-2xl sm:text-3xl font-semibold text-white/80'}>
              {t('tagline')}
            </p>
          </motion.div>

          {/* Main Voice Button */}
          <div className={'flex flex-col items-center mb-16'}>
            <motion.p 
              className={'text-2xl sm:text-3xl font-bold mb-8 text-center'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('speakYourProblem')}
            </motion.p>
            
            <motion.button
              onClick={() => navigate('/query')}
              className={'relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8A33] flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.5)] hover:shadow-[0_0_60px_rgba(255,107,0,0.7)] transition-all duration-300 group'}
              data-testid={'main-voice-btn'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className={'w-12 h-12 md:w-14 md:h-14 text-white'} strokeWidth={3} />
              
              <motion.div
                className={'absolute inset-0 rounded-full border-4 border-[#FF6B00]'}
                animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className={'absolute inset-0 rounded-full border-4 border-[#FF6B00]'}
                animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              />
            </motion.button>
            
            <motion.p 
              className={'text-lg font-medium leading-relaxed mt-6 text-center max-w-md text-white/80'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t('tapMicAndSpeak')}
            </motion.p>
          </div>

          {/* Categories Grid */}
          <div className={'mb-16'}>
            <motion.h2 
              className={'text-2xl sm:text-3xl font-bold tracking-tight text-center mb-8'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className={'neon-text-green'}>{t('categories.employment')}</span>
              {' • '}
              <span className={'neon-text-purple'}>{t('categories.consumer_rights')}</span>
              {' • '}
              <span className={'neon-text-pink'}>{t('categories.women_rights')}</span>
            </motion.h2>
            
            <div className={'grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto'}>
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.key}
                    onClick={() => navigate('/query', { state: { category: cat.key } })}
                    className={'card group cursor-pointer min-h-[140px] flex flex-col items-center justify-center gap-4 hover:scale-105'}
                    data-testid={`category-${cat.key}-btn`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    whileHover={{ y: -8 }}
                  >
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className={'w-8 h-8 text-white'} strokeWidth={2.5} />
                    </motion.div>
                    <span className={'text-base md:text-lg font-bold tracking-wide text-center'}>
                      {t(`categories.${cat.key}`)}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* How It Works */}
          <motion.div 
            className={'mb-16 glass-card p-8 md:p-12 rounded-2xl max-w-5xl mx-auto'}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={'text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12'}>
              {t('howItWorks')}
            </h2>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-8'}>
              {[
                { num: 1, title: t('step1Title'), desc: t('step1Desc'), color: '#FF6B00' },
                { num: 2, title: t('step2Title'), desc: t('step2Desc'), color: '#00E676' },
                { num: 3, title: t('step3Title'), desc: t('step3Desc'), color: '#D500F9' }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className={'text-center'}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <motion.div 
                    className={'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-lg'}
                    style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}60` }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.num}
                  </motion.div>
                  <h3 className={'text-xl sm:text-2xl font-bold mb-2'}>{step.title}</h3>
                  <p className={'text-lg font-medium leading-relaxed text-white/70'}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            className={'text-center'}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => navigate('/query')}
              className={'btn-primary text-xl md:text-2xl px-8 py-4 md:px-12 md:py-6'}
              data-testid={'start-btn'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('findMyRights')}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;