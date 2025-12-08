import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-brand-card border border-brand-border rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-black" />
          </div>
          <h2 className="font-display text-3xl text-brand-white italic uppercase mb-2">
            Account Created!
          </h2>
          <p className="text-brand-secondary text-sm">
            You can now sign in to your account.
          </p>
        </div>

        <button
          onClick={onSwitchToLogin}
          className="w-full bg-brand-accent hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-brand-card border border-brand-border rounded-2xl">
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-brand-white italic uppercase mb-2">
          VORTEX <span className="text-brand-accent">SIGNUP</span>
        </h1>
        <p className="text-brand-secondary text-sm uppercase tracking-widest">
          Create Your Account
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
            <User size={12} /> Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
            <Mail size={12} /> Email Address
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
            placeholder="At least 6 characters"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-brand-secondary uppercase flex items-center gap-2">
            <Lock size={12} /> Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none"
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-accent hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(210,248,2,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-brand-secondary text-sm">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-brand-accent hover:text-white transition-colors font-bold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
