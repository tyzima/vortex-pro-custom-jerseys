import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="fixed inset-0 bg-brand-black z-[100] overflow-y-auto pt-20 pb-12 animate-fade-in">
      {onBack && (
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="text-brand-secondary hover:text-brand-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      )}

      <div className="container mx-auto px-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
};
