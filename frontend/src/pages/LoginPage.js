import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Shield, Check, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import LoadingScales from '../components/LoadingScales';
import { authService } from '../services/supabase';
import { toast } from 'sonner';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setPhoneNumber, language } = useAppStore();
  
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDemoMode, setUseDemoMode] = useState(false);

  const DEMO_OTP = '123456';

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Try real Supabase OTP first
      await authService.sendOtp(phone);
      setStep('otp');
      setUseDemoMode(false);
      toast.success(`OTP sent to +91 ${phone}`);
    } catch (err) {
      console.error('OTP send error:', err);
      
      // Check if phone provider is disabled
      if (err.message?.includes('phone_provider_disabled') || err.message?.includes('Unsupported phone provider')) {
        setUseDemoMode(true);
        setStep('otp');
        toast.info(`Demo Mode: Use OTP ${DEMO_OTP} to login`, { duration: 5000 });
        setError('');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
        toast.error(err.message || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      if (useDemoMode) {
        // Demo mode verification
        if (otpValue === DEMO_OTP) {
          const userData = {
            id: 'demo-user-' + phone,
            phone: `+91${phone}`,
            email: null,
            language: language
          };
          
          setUser(userData);
          setPhoneNumber(`+91${phone}`);
          toast.success('Login successful! (Demo Mode)');
          navigate('/home');
        } else {
          throw new Error(`Invalid OTP. Use ${DEMO_OTP} for demo mode.`);
        }
      } else {
        // Real Supabase verification
        const { session, user } = await authService.verifyOtp(phone, otpValue);
        
        if (session && user) {
          const userData = {
            id: user.id,
            phone: user.phone || `+91${phone}`,
            email: user.email,
            language: language
          };
          
          setUser(userData);
          setPhoneNumber(user.phone || `+91${phone}`);
          toast.success('Login successful!');
          navigate('/home');
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      toast.error(err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (useDemoMode) {
      toast.info(`Demo Mode: Use OTP ${DEMO_OTP}`, { duration: 5000 });
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendOtp(phone);
      toast.success('OTP resent successfully');
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScales message={step === 'phone' ? 'Sending OTP...' : 'Verifying...'} />;
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

          {useDemoMode && step === 'otp' && (
            <div className="mb-4 p-4 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-[#00E676] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/90 font-semibold mb-1">Demo Mode Active</p>
                <p className="text-sm text-white/70">Use OTP: <span className="font-bold text-[#00E676]">{DEMO_OTP}</span></p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-[#FF4081]/10 border border-[#FF4081]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF4081] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3">
                  Phone Number
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-3 text-white/60 font-semibold">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 min-h-[48px] bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-lg"
                    data-testid="phone-input"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-white/50 mt-2">
                  We will send you a 6-digit OTP via SMS
                </p>
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
                data-testid="send-otp-btn"
                disabled={phone.length !== 10}
              >
                <Phone className="w-5 h-5 mr-2" />
                Send OTP
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <div className="flex items-center gap-3 p-4 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl">
                <Check className="w-5 h-5 text-[#00E676] flex-shrink-0" />
                <p className="text-sm text-white/80">
                  No email required. Login with just your phone number.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3">
                  Enter OTP
                </label>
                <p className="text-white/70 mb-4">
                  Sent to +91 {phone}
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setUseDemoMode(false); }}
                    className="text-[#FF6B00] ml-2 hover:underline"
                  >
                    Change
                  </button>
                </p>
                
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 bg-[#0A0D29] border-2 border-white/20 rounded-xl text-center text-2xl font-bold text-white focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                      maxLength={1}
                      data-testid={`otp-input-${index}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-sm text-white/50 mt-3 text-center">
                  {useDemoMode ? `Demo OTP: ${DEMO_OTP}` : 'Enter the 6-digit code within 60 seconds'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
                data-testid="verify-otp-btn"
                disabled={otp.join('').length !== 6}
              >
                Verify & Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#FF6B00] hover:underline"
                  data-testid="resend-otp-btn"
                >
                  Resend OTP
                </button>
              </div>
            </form>
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
          <p className="text-xs text-white/60 text-center mb-2">
            <strong className="text-[#FF6B00]">Setup Real SMS OTP:</strong>
          </p>
          <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
            <li>Go to Supabase Dashboard → Authentication → Providers</li>
            <li>Enable Phone auth & configure Twilio (Account SID, Auth Token, Verify Service SID)</li>
            <li>Save settings and OTPs will be sent via SMS automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
