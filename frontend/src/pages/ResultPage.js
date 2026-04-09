import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Volume2, FileText, Share2, Bookmark, Loader2, AlertCircle, Scale, MapPin } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { toast } from 'sonner';

const ResultPage = () => {
  const { queryId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  const loadQuery = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuery(queryId);
      setQuery(data);
    } catch (error) {
      console.error('Error loading query:', error);
      toast.error('Could not load query results');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = query.detected_language + '-IN';
      utterance.rate = 0.75;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#D32F2F] mx-auto mb-4" />
          <p className="text-2xl font-bold text-[#1A237E]">Query not found</p>
        </div>
      </div>
    );
  }

  const aiResponse = query.ai_response || {};
  const severityColor = query.severity === 'urgent' ? '#D32F2F' : query.severity === 'moderate' ? '#FF6B00' : '#1A237E';

  return (
    <div className="min-h-screen bg-white" data-testid="result-page">
      {/* Header */}
      <div className="bg-[#F8F9FA] border-b-2 border-[#1A237E]/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#1A237E] font-bold text-lg hover:text-[#FF6B00]"
          >
            ← {t('appName')}
          </button>
          <LanguageSelector />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Severity Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div
            className="px-6 py-3 rounded-xl font-bold text-lg text-white"
            style={{ backgroundColor: severityColor }}
            data-testid="severity-badge"
          >
            {query.severity.toUpperCase()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.success('Share feature coming soon')}
              className="p-3 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20"
              data-testid="share-btn"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => toast.success('Saved!')}
              className="p-3 rounded-xl bg-[#1A237E]/10 text-[#1A237E] hover:bg-[#1A237E]/20"
              data-testid="bookmark-btn"
            >
              <Bookmark className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Your Situation */}
        <section className="mb-8 p-6 md:p-8 bg-[#F8F9FA] rounded-xl border-2 border-[#1A237E]/20" data-testid="situation-section">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E]">{t('yourSituation')}</h2>
            <button
              onClick={() => speakText(aiResponse.summary)}
              className="p-3 rounded-full bg-[#FF6B00] text-[#1A237E] hover:scale-110 transition-transform"
              data-testid="speak-summary-btn"
            >
              <Volume2 className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
          <p className="text-lg font-medium leading-relaxed text-[#1A237E]">
            {aiResponse.summary}
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-8 p-6 md:p-8 border-2 border-[#FF6B00] rounded-xl" data-testid="rights-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E] mb-6">{t('yourRights')}</h2>
          <div className="space-y-4">
            {aiResponse.rights?.map((right, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-[#FF6B00]/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-black">
                  {index + 1}
                </div>
                <p className="text-lg font-medium leading-relaxed text-[#1A237E] flex-1">{right}</p>
                <button
                  onClick={() => speakText(right)}
                  className="p-2 rounded-full hover:bg-[#FF6B00]/20 transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-[#FF6B00]" />
                </button>
              </div>
            )) || <p className="text-lg text-[#1A237E]/70">No rights information available</p>}
          </div>
        </section>

        {/* Which Law Protects You */}
        <section className="mb-8 p-6 md:p-8 bg-white border-2 border-[#1A237E]/20 rounded-xl" data-testid="laws-section">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-[#1A237E]" strokeWidth={3} />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E]">{t('whichLaw')}</h2>
          </div>
          <div className="space-y-3">
            {aiResponse.acts_cited?.map((act, index) => (
              <div key={index} className="p-4 bg-[#1A237E]/5 rounded-lg border-l-4 border-[#1A237E]">
                <p className="text-lg font-bold text-[#1A237E]">{act}</p>
              </div>
            )) || <p className="text-lg text-[#1A237E]/70">No specific acts cited</p>}
          </div>
          <div className="mt-4 space-y-2">
            {aiResponse.sections_cited?.map((section, index) => (
              <p key={index} className="text-lg font-medium text-[#283593] pl-4">
                • {section}
              </p>
            )) || null}
          </div>
        </section>

        {/* Steps to Take */}
        <section className="mb-8 p-6 md:p-8 bg-[#F8F9FA] rounded-xl border-2 border-[#1A237E]/20" data-testid="steps-section">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E] mb-6">{t('stepsToTake')}</h2>
          <div className="space-y-6">
            {aiResponse.steps?.map((step, index) => (
              <div key={index} className="p-6 bg-white rounded-xl border-2 border-[#FF6B00]/30">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-black text-xl">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A237E] mb-2">{step.title}</h3>
                    <p className="text-lg font-medium leading-relaxed text-[#1A237E] mb-3">{step.description}</p>
                    <div className="flex gap-4 text-base font-bold">
                      <span className="text-[#283593]">⏱️ {step.time_estimate}</span>
                      <span className="text-[#FF6B00]">💰 {step.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) || <p className="text-lg text-[#1A237E]/70">No step-by-step guidance available</p>}
          </div>
        </section>

        {/* Urgency Note */}
        {aiResponse.urgency_note && (
          <section className="mb-8 p-6 md:p-8 bg-[#D32F2F]/10 border-2 border-[#D32F2F] rounded-xl" data-testid="urgency-section">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 text-[#D32F2F] flex-shrink-0 mt-1" strokeWidth={3} />
              <div>
                <h3 className="text-xl font-bold text-[#D32F2F] mb-2">URGENT</h3>
                <p className="text-lg font-medium text-[#1A237E]">{aiResponse.urgency_note}</p>
              </div>
            </div>
          </section>
        )}

        {/* Get Help Near You */}
        {aiResponse.nearest_help && (
          <section className="mb-8 p-6 md:p-8 bg-white border-2 border-[#1A237E]/20 rounded-xl" data-testid="help-section">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-[#FF6B00]" strokeWidth={3} />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A237E]">{t('getHelpNear')}</h2>
            </div>
            <p className="text-lg font-medium text-[#1A237E]">{aiResponse.nearest_help}</p>
            <button
              onClick={() => navigate('/ngo-finder')}
              className="mt-4 px-6 py-3 bg-[#FF6B00] text-[#1A237E] rounded-xl font-bold text-lg hover:shadow-lg transition-shadow"
              data-testid="find-ngo-btn"
            >
              Find NGOs Near You
            </button>
          </section>
        )}

        {/* Generate Legal Notice */}
        {aiResponse.legal_notice_recommended && (
          <section className="mb-8">
            <button
              onClick={() => navigate(`/notice/generate/${queryId}`)}
              className="w-full p-6 md:p-8 bg-[#FF6B00] text-[#1A237E] rounded-xl flex items-center justify-center gap-3 font-black text-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="generate-notice-btn"
            >
              <FileText className="w-8 h-8" strokeWidth={3} />
              {t('generateNotice')}
            </button>
            <p className="text-center text-lg font-medium text-[#283593] mt-3">
              {aiResponse.legal_notice_type}
            </p>
          </section>
        )}

        {/* Disclaimer */}
        <section className="p-6 bg-[#F8F9FA] border-2 border-[#1A237E]/20 rounded-xl">
          <p className="text-base font-medium text-[#1A237E]/80 text-center">
            {aiResponse.disclaimer}
          </p>
        </section>
      </div>
    </div>
  );
};

export default ResultPage;
