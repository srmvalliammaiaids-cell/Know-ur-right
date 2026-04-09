import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Volume2, FileText, Share2, Bookmark, Loader2, AlertCircle, Scale, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const ResultPage = () => {
  const { queryId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadQuery();
  }, [queryId]);

  const loadQuery = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuery(queryId);
      setQuery(data);
      setIsBookmarked(data.is_bookmarked || false);
    } catch (error) {
      console.error('Error loading query:', error);
      toast.error('Could not load query results');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = (query?.detected_language || 'en') + '-IN';
    utterance.rate = 0.75;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleBookmark = async () => {
    try {
      const result = await api.toggleBookmark(queryId);
      setIsBookmarked(result.is_bookmarked);
      toast.success(result.is_bookmarked ? 'Saved!' : 'Removed');
    } catch (error) {
      toast.error('Failed to bookmark');
    }
  };

  const handleShare = () => {
    const ai = query?.ai_response || {};
    const text = `Nyaya Setu Analysis\n\n${ai.summary}\n\nRights:\n${(ai.rights || []).join('\n')}\n\nSteps:\n${(ai.steps || []).map(s => `${s.step}. ${s.title}`).join('\n')}`;
    if (navigator.share) {
      navigator.share({ title: 'Nyaya Setu - Legal Rights', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D29] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-[#0A0D29] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#FF4081] mx-auto mb-4" />
          <p className="text-2xl font-bold text-white">Query not found</p>
          <button onClick={() => navigate('/query')} className="btn-primary mt-4">Ask a New Question</button>
        </div>
      </div>
    );
  }

  const ai = query.ai_response || {};
  const severityColor = query.severity === 'urgent' ? '#FF4081' : query.severity === 'moderate' ? '#FF6B00' : '#00E676';

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="result-page">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0D29]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => navigate('/home')} className="text-white/60 hover:text-white font-semibold flex items-center gap-1" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" /> {t('appName')}
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all" data-testid="share-btn">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button onClick={handleBookmark} className={`p-2 rounded-lg transition-all ${isBookmarked ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white/10 text-white hover:bg-white/20'}`} data-testid="bookmark-btn">
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Severity + Category */}
        <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="px-4 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: severityColor }} data-testid="severity-badge">
            {query.severity?.toUpperCase()}
          </span>
          <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/10 text-white/80">
            {query.category?.replace(/_/g, ' ').toUpperCase()}
          </span>
        </motion.div>

        {/* Summary */}
        <motion.section className="mb-6 p-5 bg-[#111742] border border-white/10 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} data-testid="situation-section">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-[#FF6B00]">{t('yourSituation')}</h2>
            <button onClick={() => speakText(ai.summary)} className="p-2 rounded-full bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 transition-all" data-testid="speak-summary-btn">
              <Volume2 className="w-5 h-5 text-[#FF6B00]" />
            </button>
          </div>
          <p className="text-white/90 leading-relaxed">{ai.summary}</p>
        </motion.section>

        {/* Rights */}
        <motion.section className="mb-6 p-5 border-2 border-[#FF6B00]/30 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} data-testid="rights-section">
          <h2 className="text-xl font-bold text-[#FF6B00] mb-4">{t('yourRights')}</h2>
          <div className="space-y-3">
            {ai.rights?.map((right, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#FF6B00]/5 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">{i + 1}</div>
                <p className="flex-1 text-white/90">{right}</p>
                <button onClick={() => speakText(right)} className="p-1.5 rounded-full hover:bg-[#FF6B00]/20 transition-colors flex-shrink-0">
                  <Volume2 className="w-4 h-4 text-[#FF6B00]" />
                </button>
              </div>
            )) || <p className="text-white/50">No rights information available</p>}
          </div>
        </motion.section>

        {/* Laws */}
        <motion.section className="mb-6 p-5 bg-[#111742] border border-white/10 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-testid="laws-section">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-6 h-6 text-[#D500F9]" />
            <h2 className="text-xl font-bold">{t('whichLaw')}</h2>
          </div>
          <div className="space-y-2">
            {ai.acts_cited?.map((act, i) => (
              <div key={i} className="p-3 bg-[#D500F9]/10 rounded-lg border-l-3 border-[#D500F9]" style={{ borderLeftWidth: '3px', borderLeftColor: '#D500F9' }}>
                <p className="font-bold text-white">{act}</p>
              </div>
            )) || <p className="text-white/50">No specific acts cited</p>}
          </div>
          {ai.sections_cited?.length > 0 && (
            <div className="mt-3 space-y-1">
              {ai.sections_cited.map((section, i) => (
                <p key={i} className="text-sm text-white/70 pl-3">• {section}</p>
              ))}
            </div>
          )}
        </motion.section>

        {/* Steps */}
        <motion.section className="mb-6 p-5 bg-[#111742] border border-white/10 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} data-testid="steps-section">
          <h2 className="text-xl font-bold mb-4">{t('stepsToTake')}</h2>
          <div className="space-y-4">
            {ai.steps?.map((step, i) => (
              <div key={i} className="p-4 bg-[#0A0D29] rounded-xl border border-[#FF6B00]/20">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-bold">{step.step}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
                    <div className="flex gap-4 mt-2 text-xs font-semibold">
                      <span className="text-[#00E676]">Time: {step.time_estimate}</span>
                      <span className="text-[#FF6B00]">Cost: {step.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) || <p className="text-white/50">No step-by-step guidance available</p>}
          </div>
        </motion.section>

        {/* Urgency */}
        {ai.urgency_note && (
          <motion.section className="mb-6 p-5 bg-[#FF4081]/10 border-2 border-[#FF4081] rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} data-testid="urgency-section">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[#FF4081] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#FF4081] mb-1">URGENT ACTION NEEDED</h3>
                <p className="text-white/90">{ai.urgency_note}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Help Near You */}
        {ai.nearest_help && (
          <motion.section className="mb-6 p-5 bg-[#111742] border border-white/10 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} data-testid="help-section">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-6 h-6 text-[#00E676]" />
              <h2 className="text-xl font-bold">{t('getHelpNear')}</h2>
            </div>
            <p className="text-white/80 mb-3">{ai.nearest_help}</p>
            <button onClick={() => navigate('/ngo-finder')} className="px-5 py-2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 rounded-xl font-semibold hover:bg-[#00E676]/20 transition-all" data-testid="find-ngo-btn">
              Find NGOs Near You
            </button>
          </motion.section>
        )}

        {/* Generate Legal Notice */}
        {ai.legal_notice_recommended && (
          <motion.section className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <button
              onClick={() => navigate(`/notice/generate/${queryId}`)}
              className="w-full p-5 bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] rounded-xl flex items-center justify-center gap-3 font-bold text-xl text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] transition-all"
              data-testid="generate-notice-btn"
            >
              <FileText className="w-6 h-6" /> {t('generateNotice')}
            </button>
            {ai.legal_notice_type && (
              <p className="text-center text-sm text-white/60 mt-2">Recommended: {ai.legal_notice_type}</p>
            )}
          </motion.section>
        )}

        {/* Disclaimer */}
        <section className="p-4 bg-[#111742] border border-white/10 rounded-xl">
          <p className="text-sm text-white/50 text-center">{ai.disclaimer}</p>
        </section>
      </div>
      <BottomNav />
    </div>
  );
};

export default ResultPage;
