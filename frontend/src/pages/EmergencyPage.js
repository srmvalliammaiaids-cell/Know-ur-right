import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, Shield, Heart, Scale, Users, Monitor, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const categoryIcons = {
  emergency: AlertTriangle,
  women: Heart,
  children: Users,
  legal: Scale,
  senior: Users,
  cyber: Monitor,
  consumer: Briefcase,
  employment: Briefcase,
  rights: Shield,
  corruption: Scale,
};

const categoryColors = {
  emergency: '#FF4081',
  women: '#D500F9',
  children: '#00E676',
  legal: '#FF6B00',
  senior: '#00BCD4',
  cyber: '#FF9800',
  consumer: '#4CAF50',
  employment: '#2196F3',
  rights: '#FF6B00',
  corruption: '#F44336',
};

const EmergencyPage = () => {
  const navigate = useNavigate();
  const [helplines, setHelplines] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadHelplines();
  }, []);

  const loadHelplines = async () => {
    try {
      const data = await api.getEmergencyHelplines();
      setHelplines(data.helplines || []);
    } catch (error) {
      toast.error('Failed to load helplines');
    }
  };

  const categories = ['all', ...new Set(helplines.map(h => h.category))];
  const filtered = activeFilter === 'all' ? helplines : helplines.filter(h => h.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="emergency-page">
      {/* Panic Header */}
      <div className="bg-gradient-to-b from-[#FF4081]/20 to-transparent">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-8">
          <button onClick={() => navigate('/home')} className="text-white/60 hover:text-white mb-4 text-sm font-medium">
            &larr; Back to Home
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FF4081] flex items-center justify-center shadow-[0_0_40px_rgba(255,64,129,0.5)] animate-pulse-glow">
              <AlertTriangle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Emergency Help</h1>
            <p className="text-white/70 text-lg">Tap any number to call immediately</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Top emergency numbers */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { name: 'Police', number: '100', color: '#FF4081' },
            { name: 'Women', number: '181', color: '#D500F9' },
            { name: 'Ambulance', number: '108', color: '#00E676' },
          ].map((item, i) => (
            <motion.a
              key={i}
              href={`tel:${item.number}`}
              className="p-4 rounded-2xl text-center font-bold"
              style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`sos-${item.name.toLowerCase()}`}
            >
              <Phone className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
              <div className="text-2xl" style={{ color: item.color }}>{item.number}</div>
              <div className="text-sm text-white/70 mt-1">{item.name}</div>
            </motion.a>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Helpline Cards */}
        <div className="space-y-3">
          {filtered.map((helpline, index) => {
            const Icon = categoryIcons[helpline.category] || Phone;
            const color = categoryColors[helpline.category] || '#FF6B00';

            return (
              <motion.a
                key={index}
                href={`tel:${helpline.number.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#111742] border border-white/10 hover:border-white/20 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`helpline-${index}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{helpline.name}</h3>
                  <p className="text-sm text-white/60 truncate">{helpline.description}</p>
                  <span className="text-xs text-white/40">{helpline.available}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold" style={{ color }}>{helpline.number}</div>
                  <ChevronRight className="w-4 h-4 text-white/40 ml-auto" />
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-[#FF4081]/10 border border-[#FF4081]/30 rounded-xl text-center">
          <p className="text-sm text-white/70">
            If you are in immediate danger, call <strong className="text-[#FF4081]">100 (Police)</strong> or <strong className="text-[#FF4081]">112 (Emergency)</strong> right away.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EmergencyPage;
