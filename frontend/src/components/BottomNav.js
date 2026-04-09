import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, AlertTriangle, Users, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/query', icon: Search, label: 'Ask' },
    { path: '/emergency', icon: AlertTriangle, label: 'SOS' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0D29]/95 backdrop-blur-xl border-t border-white/10" data-testid="bottom-nav">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isSOS = item.path === '/emergency';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isSOS
                  ? 'text-[#FF4081]'
                  : isActive
                    ? 'text-[#FF6B00]'
                    : 'text-white/50 hover:text-white/80'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon
                className={`w-5 h-5 ${isSOS && !isActive ? 'animate-pulse' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-semibold ${isActive ? 'text-current' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
