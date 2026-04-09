import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Globe, MapPin, Clock, FileText, LogOut, Save, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' }, { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' }, { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }, { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' }, { code: 'en', name: 'English' },
];

const STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Bihar', 'Kerala', 'Telangana', 'Madhya Pradesh', 'Andhra Pradesh'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, language, setLanguage } = useAppStore();
  const [profile, setProfile] = useState({
    full_name: '', preferred_language: language, state: '', district: '', phone: '',
  });
  const [stats, setStats] = useState({ queries: 0, notices: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile(user.id);
      setProfile({
        full_name: data.full_name || user.email?.split('@')[0] || '',
        preferred_language: data.preferred_language || language,
        state: data.state || '',
        district: data.district || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const loadStats = async () => {
    try {
      const [qData, nData] = await Promise.all([
        api.getUserQueries(user.id, 100),
        api.getUserNotices(user.id).catch(() => ({ notices: [] })),
      ]);
      setStats({ queries: qData.total || 0, notices: nData.total || 0 });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(user.id, profile);
      if (profile.preferred_language !== language) {
        setLanguage(profile.preferred_language);
      }
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8A33] flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.4)]"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold">{profile.full_name || 'Your Profile'}</h1>
          <p className="text-white/60 text-sm">{user?.email || 'Demo User'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            className="bg-[#111742] border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#FF6B00]/30 transition-all"
            onClick={() => navigate('/history')}
            whileTap={{ scale: 0.98 }}
            data-testid="stats-queries"
          >
            <Clock className="w-6 h-6 text-[#FF6B00] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#FF6B00]">{stats.queries}</div>
            <div className="text-sm text-white/60">Queries</div>
          </motion.div>
          <motion.div
            className="bg-[#111742] border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#00E676]/30 transition-all"
            onClick={() => navigate('/notice/generate')}
            whileTap={{ scale: 0.98 }}
            data-testid="stats-notices"
          >
            <FileText className="w-6 h-6 text-[#00E676] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#00E676]">{stats.notices}</div>
            <div className="text-sm text-white/60">Notices</div>
          </motion.div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/70">Full Name</label>
            <input
              value={profile.full_name}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
              placeholder="Your name"
              data-testid="profile-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white/70">Preferred Language</label>
            <select
              value={profile.preferred_language}
              onChange={(e) => setProfile({...profile, preferred_language: e.target.value})}
              className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] transition-all"
              data-testid="profile-language-select"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white/70">State</label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({...profile, state: e.target.value})}
              className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] transition-all"
              data-testid="profile-state-select"
            >
              <option value="">Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white/70">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] transition-all"
              placeholder="+91 XXXXXXXXXX"
              data-testid="profile-phone-input"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary"
            data-testid="save-profile-btn"
          >
            <Save className="w-5 h-5 mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 mb-8">
          {[
            { label: 'Query History', icon: Clock, path: '/history', color: '#FF6B00' },
            { label: 'NGO Directory', icon: MapPin, path: '/ngo-finder', color: '#00E676' },
            { label: 'Emergency Helplines', icon: Globe, path: '/emergency', color: '#FF4081' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 bg-[#111742] border border-white/10 rounded-xl hover:border-white/20 transition-all"
                data-testid={`link-${item.path.slice(1)}`}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-[#FF4081]/30 text-[#FF4081] rounded-xl font-semibold hover:bg-[#FF4081]/10 transition-all"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
