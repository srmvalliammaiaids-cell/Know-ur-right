import React from 'react';
import { Scale } from 'lucide-react';

const LoadingScales = ({ message = 'विश्लेषण हो रहा है...' }) => {
  return (
    <div className="fixed inset-0 bg-[#0A0D29] z-50 flex items-center justify-center" data-testid="loading-scales">
      <div className="text-center">
        <div className="relative mb-8">
          <Scale 
            className="w-24 h-24 text-[#FF6B00] animate-balance mx-auto"
            strokeWidth={2}
          />
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6B00]/20 to-[#D500F9]/20 blur-xl rounded-full animate-pulse"></div>
        </div>
        <p className="text-2xl font-bold text-white">{message}</p>
        <div className="mt-4 flex gap-2 justify-center">
          <div className="w-3 h-3 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-[#00E676] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-[#D500F9] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScales;
