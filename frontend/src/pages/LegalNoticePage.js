import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const LegalNoticePage = () => {
  const navigate = useNavigate();
  const { queryId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAppStore();

  const [step, setStep] = useState('form'); // form | generating | result
  const [query, setQuery] = useState(null);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({
    sender_name: '',
    sender_address: '',
    recipient_name: '',
    recipient_address: '',
    additional_details: '',
  });

  useEffect(() => {
    if (queryId) loadQuery();
  }, [queryId]);

  const loadQuery = async () => {
    try {
      const data = await api.getQuery(queryId);
      setQuery(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!form.sender_name || !form.recipient_name) {
      toast.error('Please fill sender and recipient names');
      return;
    }

    setStep('generating');
    try {
      const result = await api.generateLegalNotice({
        query_id: queryId || null,
        query_text: query?.original_text || searchParams.get('text') || form.additional_details,
        category: query?.category || 'other',
        recipient_name: form.recipient_name,
        sender_name: form.sender_name,
        sender_address: form.sender_address,
        recipient_address: form.recipient_address,
        additional_details: form.additional_details,
        user_id: user?.id || null,
      });
      setNotice(result);
      setStep('result');
      toast.success('Legal notice generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate notice. Try again.');
      setStep('form');
    }
  };

  const handleDownloadPdf = async () => {
    if (!notice?.id) return;
    try {
      const blob = await api.downloadNoticePdf(notice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_notice_${notice.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleShare = async () => {
    if (!notice) return;
    const text = `Legal Notice\n\n${notice.notice_title}\n\n${notice.notice_body}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: notice.notice_title, text });
      } catch (e) { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Notice copied to clipboard!');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-[#0A0D29] flex items-center justify-center" data-testid="notice-generating">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#FF6B00] animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-white">Generating Legal Notice...</p>
          <p className="text-white/60 mt-2">Our AI is drafting your notice</p>
        </div>
      </div>
    );
  }

  if (step === 'result' && notice) {
    return (
      <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="notice-result">
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <button onClick={() => setStep('form')} className="text-white/60 hover:text-white mb-6 text-sm font-medium">
            &larr; Generate Another
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-[#00E676]" />
              <h1 className="text-2xl font-bold">Notice Generated</h1>
            </div>

            <div className="bg-[#111742] border border-white/10 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-[#FF6B00] mb-4">{notice.notice_title}</h2>
              <div className="text-sm text-white/60 mb-4">
                <p>From: <span className="text-white">{notice.sender_name}</span></p>
                <p>To: <span className="text-white">{notice.recipient_name}</span></p>
                <p>Date: <span className="text-white">{notice.created_at?.slice(0, 10)}</span></p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm">{notice.notice_body}</p>
              </div>
              {notice.applicable_laws?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="font-semibold text-sm text-white/70 mb-2">Applicable Laws:</p>
                  {notice.applicable_laws.map((law, i) => (
                    <span key={i} className="inline-block mr-2 mb-2 px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-xs font-medium">{law}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/60">
                Response deadline: <strong className="text-white">{notice.deadline_days} days</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleDownloadPdf} className="flex-1 btn-primary" data-testid="download-pdf-btn">
                <Download className="w-5 h-5 mr-2" /> Download PDF
              </button>
              <button onClick={handleShare} className="flex-1 min-h-[48px] px-6 rounded-xl font-semibold text-lg border-2 border-[#00E676] text-[#00E676] hover:bg-[#00E676]/10 transition-all flex items-center justify-center" data-testid="share-notice-btn">
                <Share2 className="w-5 h-5 mr-2" /> Share
              </button>
            </div>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="legal-notice-page">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white mb-6 text-sm font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-[#FF6B00]" />
            <h1 className="text-2xl sm:text-3xl font-bold">Generate Legal Notice</h1>
          </div>
          <p className="text-white/60 mb-8">AI-powered legal notice drafting</p>

          {query && (
            <div className="p-4 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl mb-6">
              <p className="text-sm text-white/70 mb-1">Based on your query:</p>
              <p className="font-medium text-white">{query.original_text}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Your Name (Sender) *</label>
              <input
                value={form.sender_name}
                onChange={(e) => setForm({...form, sender_name: e.target.value})}
                className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                placeholder="Enter your full name"
                data-testid="sender-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Your Address</label>
              <input
                value={form.sender_address}
                onChange={(e) => setForm({...form, sender_address: e.target.value})}
                className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                placeholder="Your full address"
                data-testid="sender-address-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Recipient Name *</label>
              <input
                value={form.recipient_name}
                onChange={(e) => setForm({...form, recipient_name: e.target.value})}
                className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                placeholder="Name of the person/company"
                data-testid="recipient-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Recipient Address</label>
              <input
                value={form.recipient_address}
                onChange={(e) => setForm({...form, recipient_address: e.target.value})}
                className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                placeholder="Recipient's address"
                data-testid="recipient-address-input"
              />
            </div>

            {!query && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Describe Your Issue *</label>
                <textarea
                  value={form.additional_details}
                  onChange={(e) => setForm({...form, additional_details: e.target.value})}
                  className="w-full bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all min-h-[120px]"
                  placeholder="Describe the issue in detail..."
                  data-testid="issue-details-input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-white/80">Additional Details</label>
              <textarea
                value={query ? form.additional_details : undefined}
                onChange={query ? (e) => setForm({...form, additional_details: e.target.value}) : undefined}
                className="w-full bg-[#111742] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all min-h-[80px]"
                placeholder="Any additional details for the notice..."
                data-testid="additional-details-input"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full btn-primary text-xl py-4"
              data-testid="generate-notice-btn"
            >
              <FileText className="w-6 h-6 mr-2" /> Generate Legal Notice
            </button>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default LegalNoticePage;
