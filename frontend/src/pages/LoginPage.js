import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Shield, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import LoadingScales from '../components/LoadingScales';
import { authService } from '../services/supabase';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.sendMagicLink(email);
      setLinkSent(true);
      toast.success('Verification link sent! Check your email.');
    } catch (err) {
      console.error('Magic link send error:', err);
      setError(err.message || 'Failed to send verification link. Please try again.');
      toast.error(err.message || 'Failed to send link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.sendMagicLink(email);
      toast.success('Verification link resent!');
    } catch (err) {
      toast.error('Failed to resend link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScales message="Sending verification link..." />;
  }

  return (
    <div className="min-h-screen bg-[#0A0D29] flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="text-white/60 hover:text-white mb-8 flex items-center gap-2 transition-colors"
        >
          ← Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B00] to-[#FF8A33] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,107,0,0.4)]">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Nyaya Setu</h1>
            <p className="text-white/70">Your bridge to justice</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-[#FF4081]/10 border border-[#FF4081]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF4081] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90">{error}</p>
            </div>
          )}

          {!linkSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  placeholder="your@email.com"
                  className="w-full min-h-[48px] bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-lg"
                  data-testid="email-input"
                  autoFocus
                />
                <p className="text-sm text-white/50 mt-2">
                  We'll send you a secure verification link
                </p>
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
                data-testid="send-link-btn"
                disabled={!email}
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Verification Link
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <div className="flex items-center gap-3 p-4 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl">
                <Check className="w-5 h-5 text-[#00E676] flex-shrink-0" />
                <p className="text-sm text-white/80">
                  No password needed. Just click the link in your email to login.
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-6 h-6 text-[#00E676] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
                    <p className="text-white/80 mb-3">
                      We've sent a verification link to:
                    </p>
                    <p className="text-[#00E676] font-bold text-lg break-all">{email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 glass-card rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <p className="text-white/80">Open your email inbox</p>
                </div>

                <div className="flex items-start gap-3 p-4 glass-card rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <p className="text-white/80">Look for email from Nyaya Setu</p>
                </div>

                <div className="flex items-start gap-3 p-4 glass-card rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-white/80 mb-2">Click the verification link</p>
                    <p className="text-xs text-white/50">Link expires in 1 hour</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResend}
                  className="w-full btn-primary"
                  data-testid="resend-link-btn"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Resend Link
                </button>

                <button
                  onClick={() => { setLinkSent(false); setEmail(''); }}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Use different email
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#D500F9]/10 border border-[#D500F9]/30 rounded-xl">
                <Info className="w-5 h-5 text-[#D500F9] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white/70">
                  Didn't receive the email? Check your spam folder or make sure you entered the correct email address.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-[#00E676] mb-1">8</div>
            <div className="text-sm text-white/60">Languages</div>
          </div>
          <div className="p-4 glass-card rounded-xl">
            <div className="text-2xl font-bold text-[#D500F9] mb-1">Free</div>
            <div className="text-sm text-white/60">Always</div>
          </div>
        </div>

        <div className="mt-6 p-4 glass-card rounded-xl">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-[#00E676] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Passwordless & Secure</p>
              <p className="text-xs text-white/60">
                Magic links are more secure than passwords. No need to remember anything - just click the link in your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
