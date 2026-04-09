import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Mic, Shield, Users, Scale, Home as HomeIcon, Briefcase, MapPin, AlertCircle, FileText, MessageSquare, Clock } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppStore();

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

  const quickActions = [
    { icon: FileText, label: 'Legal Notice', desc: 'Generate a legal notice', path: '/notice/generate', color: '#FF6B00' },
    { icon: MapPin, label: 'Find NGOs', desc: 'Legal aid near you', path: '/ngo-finder', color: '#00E676' },
    { icon: MessageSquare, label: 'Community', desc: 'Ask the community', path: '/community', color: '#D500F9' },
    { icon: Clock, label: 'History', desc: 'Past queries', path: '/history', color: '#FF4081' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="home-page">
      {/* Emergency Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed top-4 right-4 btn-emergency z-50 text-sm px-4 py-2"
        onClick={() => navigate('/emergency')}
        data-testid="emergency-btn"
      >
        <AlertCircle className="w-4 h-4 mr-1" /> SOS
      </motion.button>

      <div className="fixed top-4 left-4 z-50">
        <LanguageSelector />
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 via-transparent to-[#D500F9]/10 pointer-events-none" />

        <div className="container mx-auto px-4 pt-20 pb-8 relative">
          {/* Hero */}
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl tracking-tight leading-none mb-3" data-testid="app-title">
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] bg-clip-text text-transparent font-bold">{t('appName')}</span>
            </h1>
            <p className="text-xl text-white/70">{t('tagline')}</p>
          </motion.div>

          {/* Main Voice Button */}
          <div className="flex flex-col items-center mb-12">
            <motion.p className="text-xl font-bold mb-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {t('speakYourProblem')}
            </motion.p>

            <motion.button
              onClick={() => navigate('/query')}
              className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8A33] flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.5)] hover:shadow-[0_0_60px_rgba(255,107,0,0.7)] transition-all duration-300"
              data-testid="main-voice-btn"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-12 h-12 text-white" strokeWidth={3} />
              <motion.div className="absolute inset-0 rounded-full border-4 border-[#FF6B00]" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.button>

            <motion.p className="text-sm text-white/60 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {t('tapMicAndSpeak')}
            </motion.p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="bg-[#111742] border border-white/10 rounded-xl p-4 text-left hover:border-white/20 transition-all"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  data-testid={`quick-${action.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <Icon className="w-6 h-6 mb-2" style={{ color: action.color }} />
                  <div className="font-bold text-sm text-white">{action.label}</div>
                  <div className="text-xs text-white/50 mt-0.5">{action.desc}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-white/80">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={cat.key}
                    onClick={() => navigate('/query', { state: { category: cat.key } })}
                    className="bg-[#111742] border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-white/20 transition-all"
                    data-testid={`category-${cat.key}-btn`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.04 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-semibold text-center">{t(`categories.${cat.key}`)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <h2 className="text-lg font-bold text-center mb-6">{t('howItWorks')}</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: 1, title: t('step1Title'), desc: t('step1Desc'), color: '#FF6B00' },
                { num: 2, title: t('step2Title'), desc: t('step2Desc'), color: '#00E676' },
                { num: 3, title: t('step3Title'), desc: t('step3Desc'), color: '#D500F9' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-black text-white" style={{ backgroundColor: step.color }}>
                    {step.num}
                  </div>
                  <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                  <p className="text-xs text-white/60">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
