import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-brand-card border border-brand-border rounded-2xl">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-brand-white italic uppercase mb-2">
          VORTEX <span className="text-brand-accent">LOGIN</span>
        </h1>
        <p className="text-brand-secondary text-sm uppercase tracking-widest">
          Access Your Account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
            <User size={12} /> Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none"
            placeholder="your.email@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
            <Lock size={12} /> Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-accent hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(210,248,2,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : (
            <>
              <LogIn size={18} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-brand-secondary text-sm">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-brand-accent hover:text-white transition-colors font-bold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
