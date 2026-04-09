import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import DarkModeToggle from '../components/DarkModeToggle';
import LoadingScales from '../components/LoadingScales';
import { toast } from 'sonner';

const QueryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, state: userState, district, user } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = getLanguageCode(language);

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);
        setTextInput(currentText);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript) {
          toast.success('Voice recorded successfully!');
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Please allow microphone access in your browser');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice recognition error. Please try typing instead.');
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [language, transcript]);

  const getLanguageCode = (lang) => {
    const langCodes = {
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'en': 'en-IN'
    };
    return langCodes[lang] || 'hi-IN';
  };

  const startVoiceRecording = () => {
    if (!recognition) {
      toast.error('Voice recognition not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setTranscript('');
      setTextInput('');
      recognition.lang = getLanguageCode(language);
      recognition.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    } catch (error) {
      console.error('Start recording error:', error);
      toast.error('Could not start voice recording. Please try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    const queryText = textInput.trim();
    if (!queryText) {
      toast.error('Please enter or speak your problem');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await api.submitQuery({
        text: queryText,
        language_code: language,
        state: userState,
        district: district,
        user_id: user?.id || null
      });

      toast.success('Query analyzed successfully!');
      navigate(`/result/${result.id}`);
    } catch (error) {
      console.error('Query submission error:', error);
      toast.error('Error analyzing your query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <LoadingScales message={t('processing')} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white p-4 md:p-8" data-testid="query-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/home')}
            className="text-white/60 hover:text-white font-bold text-lg transition-colors"
          >
            ← {t('appName')}
          </button>
          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>

        <DarkModeToggle />

        {/* Title */}
        <motion.h1 
          className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('speakYourProblem')}
        </motion.h1>

        {/* Voice Button */}
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={isListening ? stopVoiceRecording : startVoiceRecording}
            disabled={isProcessing}
            className={`w-[100px] h-[100px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-[#D32F2F] animate-pulse-glow'
                : 'bg-gradient-to-br from-[#FF6B00] to-[#FF8A33] hover:scale-110'
            }`}
            data-testid="voice-record-btn"
            whileHover={{ scale: isListening ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" strokeWidth={3} />
            ) : (
              <Mic className="w-12 h-12 text-white" strokeWidth={3} />
            )}
          </motion.button>

          {isListening && (
            <motion.div 
              className="mt-4 flex gap-2 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="wave-bar w-2 h-8 bg-[#FF6B00] rounded-full"></div>
              <div className="wave-bar w-2 h-12 bg-[#00E676] rounded-full"></div>
              <div className="wave-bar w-2 h-16 bg-[#D500F9] rounded-full"></div>
              <div className="wave-bar w-2 h-12 bg-[#FF4081] rounded-full"></div>
              <div className="wave-bar w-2 h-8 bg-[#FF6B00] rounded-full"></div>
            </motion.div>
          )}

          <p className="text-lg font-medium mt-4 text-center">
            {isListening ? t('listening') : t('tapMicAndSpeak')}
          </p>
        </motion.div>

        {/* Transcript Display */}
        {transcript && (
          <motion.div 
            className="mb-6 p-6 glass-card rounded-xl border border-[#00E676]/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-lg font-medium text-white">{transcript}</p>
          </motion.div>
        )}

        {/* Or Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[2px] bg-white/20"></div>
          <span className="text-lg font-bold text-white/60">{t('orTypeHere')}</span>
          <div className="flex-1 h-[2px] bg-white/20"></div>
        </div>

        {/* Text Input */}
        <motion.textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('speakYourProblem')}
          className="w-full p-6 text-lg bg-[#111742] border-2 border-white/20 rounded-xl focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] min-h-[150px] font-medium text-white placeholder-white/40 transition-all"
          data-testid="query-text-input"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={isProcessing || (!textInput.trim() && !transcript)}
          className="w-full mt-6 btn-primary text-2xl px-8 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="submit-query-btn"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin inline mr-3" />
              {t('processing')}
            </>
          ) : (
            <>
              {t('findMyRights')}
              <Send className="w-6 h-6 inline ml-3" />
            </>
          )}
        </motion.button>

        {/* Help Text */}
        <motion.div 
          className="mt-8 p-4 glass-card rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-white/70 text-center">
            Speak clearly or type your legal problem. Our AI will analyze it and provide you with your rights and next steps.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QueryPage;
