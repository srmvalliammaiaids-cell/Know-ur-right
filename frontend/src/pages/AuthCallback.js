import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/supabase';
import { useAppStore } from '../store/appStore';
import LoadingScales from '../components/LoadingScales';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, language } = useAppStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session after magic link click
        const session = await authService.getSession();
        
        if (session && session.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
            language: language
          };
          
          setUser(userData);
          toast.success('Login successful!');
          navigate('/home');
        } else {
          throw new Error('No session found');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        toast.error('Verification failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, setUser, language]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0D29] flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FF4081] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✗</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <p className="text-sm text-white/50">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingScales message="Verifying your link..." />;
};

export default AuthCallback;
