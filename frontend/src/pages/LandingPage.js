import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Shield, Users, Zap, Globe, Phone, ChevronRight, Play } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import DarkModeToggle from '../components/DarkModeToggle';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Mic, title: 'Voice-First', desc: 'Speak in your language', color: '#FF6B00' },
    { icon: Globe, title: '8 Languages', desc: 'All Indian languages', color: '#00E676' },
    { icon: Shield, title: 'Know Rights', desc: 'AI-powered guidance', color: '#D500F9' },
    { icon: Zap, title: 'Free & Fast', desc: 'No lawyers needed', color: '#FF4081' }
  ];

  const stats = [
    { number: '40M+', label: 'Pending Cases', color: '#FF6B00' },
    { number: '1.4B', label: 'Citizens', color: '#00E676' },
    { number: '8', label: 'Languages', color: '#D500F9' },
    { number: 'Free', label: 'Always', color: '#FF4081' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white overflow-hidden" data-testid="landing-page">
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] bg-clip-text text-transparent">
              Nyaya Setu
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button onClick={() => navigate('/login')} className="btn-primary" data-testid="nav-login-btn">
              <Phone className="w-5 h-5 mr-2" />
              Login
            </button>
          </div>
        </div>
      </nav>

      <DarkModeToggle />

      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/380a6a0a-286a-4c76-af77-426c9b8f98f0/images/5ae71b180ddecf7034e18257bed30fc4a4be27b0e76597e10b63da58bcd86ffb.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none mb-6">
              <span className="neon-text-green">Bridge to</span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] bg-clip-text text-transparent">Justice</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              AI-powered legal rights decoder for every Indian citizen. Get instant legal guidance in your language.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/login')} className="btn-primary text-xl px-8" data-testid="hero-get-started-btn">
                Get Started Free
                <ChevronRight className="w-6 h-6 ml-2" />
              </button>
              <button className="min-h-[48px] px-8 rounded-xl font-semibold text-lg border-2 border-[#D500F9] text-[#D500F9] hover:bg-[#D500F9]/10 transition-all flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="relative card p-8 shadow-[0_0_60px_rgba(255,107,0,0.3)]">
              <div className="aspect-video bg-[#0A0D29] rounded-xl flex items-center justify-center border-2 border-[#FF6B00]/30">
                <div className="text-center">
                  <Mic className="w-20 h-20 text-[#FF6B00] mx-auto mb-4 animate-pulse-glow" />
                  <p className="text-lg font-semibold">Demo Video</p>
                  <p className="text-sm text-white/60">Coming Soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#111742]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: stat.color }}>{stat.number}</div>
              <div className="text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">Why Nyaya Setu?</h2>
            <p className="text-xl text-white/70">Making legal rights accessible to everyone</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card group cursor-pointer" whileHover={{ y: -8 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ backgroundColor: `${feature.color}20`, boxShadow: `0 0 20px ${feature.color}40` }}>
                    <Icon className="w-8 h-8" style={{ color: feature.color }} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-[#FF6B00]/20 to-[#D500F9]/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl md:text-5xl mb-6">Ready to Find Your Rights?</h2>
            <p className="text-xl text-white/80 mb-8">Join thousands of Indians getting instant legal guidance</p>
            <button onClick={() => navigate('/login')} className="btn-primary text-xl px-12 py-6" data-testid="cta-start-btn">
              Start Now - It's Free
              <ChevronRight className="w-6 h-6 ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/60">
          <p className="mb-4">© 2026 Nyaya Setu. Bridge to Justice for Every Citizen.</p>
          <p className="text-sm">This is general legal information. For specific cases, consult a qualified lawyer.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
