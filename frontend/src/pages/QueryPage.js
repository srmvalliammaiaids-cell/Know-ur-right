import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { toast } from 'sonner';

const QueryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, state: userState, district } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setIsProcessing(true);
        try {
          const result = await api.transcribeAudio(audioBlob, language);
          setTranscript(result.text);
          setTextInput(result.text);
          toast.success('Voice recorded successfully!');
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Could not transcribe audio. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Microphone access error:', error);
      toast.error('Please allow microphone access');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
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
        user_id: null // Will be set after auth implementation
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

  return (
    <div className="min-h-screen bg-white p-4 md:p-8" data-testid="query-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-[#1A237E] font-bold text-lg hover:text-[#FF6B00]"
          >
            ← {t('appName')}
          </button>
          <LanguageSelector />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A237E] mb-8 text-center">
          {t('speakYourProblem')}
        </h1>

        {/* Voice Button */}
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={isListening ? stopVoiceRecording : startVoiceRecording}
            disabled={isProcessing}
            className={`w-[80px] h-[80px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-[#D32F2F] text-white pulse-animate'
                : 'bg-[#FF6B00] text-[#1A237E] hover:scale-110'
            }`}
            data-testid="voice-record-btn"
          >
            {isListening ? (
              <MicOff className="w-10 h-10" strokeWidth={3} />
            ) : (
              <Mic className="w-10 h-10" strokeWidth={3} />
            )}
          </button>

          {isListening && (
            <div className="mt-4 flex gap-2 items-center">
              <div className="wave-bar w-2 h-8 bg-[#FF6B00] rounded-full"></div>
              <div className="wave-bar w-2 h-12 bg-[#FF6B00] rounded-full"></div>
              <div className="wave-bar w-2 h-16 bg-[#FF6B00] rounded-full"></div>
              <div className="wave-bar w-2 h-12 bg-[#FF6B00] rounded-full"></div>
              <div className="wave-bar w-2 h-8 bg-[#FF6B00] rounded-full"></div>
            </div>
          )}

          <p className="text-lg font-medium text-[#1A237E] mt-4">
            {isListening ? t('listening') : t('tapMicAndSpeak')}
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-6 p-6 bg-[#F8F9FA] rounded-xl border-2 border-[#1A237E]/20">
            <p className="text-lg font-medium text-[#1A237E]">{transcript}</p>
          </div>
        )}

        {/* Or Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[2px] bg-[#C5CAE9]"></div>
          <span className="text-lg font-bold text-[#283593]">{t('orTypeHere')}</span>
          <div className="flex-1 h-[2px] bg-[#C5CAE9]"></div>
        </div>

        {/* Text Input */}
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('speakYourProblem')}
          className="w-full p-6 text-lg border-2 border-[#1A237E]/20 rounded-xl focus:border-[#FF6B00] focus:outline-none min-h-[150px] font-medium"
          data-testid="query-text-input"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || (!textInput.trim() && !transcript)}
          className="w-full mt-6 bg-[#FF6B00] text-[#1A237E] px-8 py-6 rounded-xl text-2xl font-black shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          data-testid="submit-query-btn"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              {t('processing')}
            </>
          ) : (
            t('findMyRights')
          )}
        </button>
      </div>
    </div>
  );
};

export default QueryPage;
