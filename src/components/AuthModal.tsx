import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { PRESET_USERS } from '../data/initialData';
import { supabaseSignIn, supabaseSignUp } from '../utils/supabaseData';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccessLogin: (email: string, name?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccessLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const getFriendlyError = (message: string): string => {
    if (message?.includes('email rate limit') || message?.includes('rate limit')) {
      return 'Too many sign-up attempts. Please wait a few minutes and try again, or use a demo account below.';
    }
    if (message?.includes('Invalid login credentials')) {
      return 'Incorrect email or password. Please check your credentials and try again.';
    }
    if (message?.includes('User already registered')) {
      return 'An account with this email already exists. Please log in instead.';
    }
    if (message?.includes('Email not confirmed')) {
      return 'Please check your inbox and confirm your email before logging in.';
    }
    return message || 'Authentication failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid student email.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        if (mode === 'signup') {
          await supabaseSignUp(email.trim(), password || 'Student123!', name.trim());
          await supabaseSignIn(email.trim(), password || 'Student123!');
        } else {
          // Login mode: only attempt sign-in, never auto-create an account
          await supabaseSignIn(email.trim(), password || 'Student123!');
        }
      }
      onSuccessLogin(email.trim(), name.trim() || undefined);
      onClose();
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      setError(getFriendlyError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoUserSelect = async (demoEmail: string, demoName: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (isSupabaseConfigured()) {
        // Demo accounts: only attempt sign-in, do NOT call signUp (avoids email rate limit)
        try {
          await supabaseSignIn(demoEmail, 'Student123!');
        } catch (e: any) {
          // Demo user doesn't exist in Supabase yet — fall through to local mode gracefully
          console.warn('Demo sign-in failed, proceeding in local mode:', e.message);
        }
      }
      onSuccessLogin(demoEmail, demoName);
      onClose();
    } catch (err: any) {
      console.error('Demo login error:', err);
      onSuccessLogin(demoEmail, demoName);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#c7c4d8]/40 shadow-2xl overflow-hidden font-['Inter']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-[#f9f9ff] text-[#505f76] hover:bg-[#dee8ff] hover:text-[#111c2d] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <BrandLogo size="md" />
          </div>
          <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-[#505f76] mt-1">
            {isSupabaseConfigured()
              ? 'Authenticated securely with Supabase Auth'
              : 'Sign in to access your user-specific tasks and workspace'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 mb-4 bg-[#f9f9ff] rounded-2xl border border-[#c7c4d8]/30">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#505f76] hover:text-[#111c2d]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#3525cd] shadow-xs'
                : 'text-[#505f76] hover:text-[#111c2d]'
            }`}
          >
            Get Started
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#505f76] mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] placeholder-[#777587]/60 focus:border-[#3525cd] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#505f76] mb-1">Student Email</label>
            <input
              type="email"
              placeholder="alex@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] placeholder-[#777587]/60 focus:border-[#3525cd] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#505f76] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3.5 pr-10 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#505f76] hover:text-[#111c2d]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#3525cd] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#2b1eb3] shadow-[0_4px_20px_0_rgba(53,37,205,0.25)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Log In with Supabase' : 'Create Supabase Account'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e7eeff]" />
          </div>
          <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-wider">
            <span className="bg-white px-2 text-[#777587]">1-Click Demo Accounts</span>
          </div>
        </div>

        {/* 1-Click Multi-User Quick Logins */}
        <div className="space-y-2">
          {PRESET_USERS.map((presetUser) => (
            <button
              key={presetUser.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemoUserSelect(presetUser.email, presetUser.name)}
              className="w-full p-2.5 rounded-xl border border-[#c7c4d8]/40 bg-[#f9f9ff] hover:bg-[#dee8ff]/50 transition-all flex items-center justify-between cursor-pointer group text-left disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={presetUser.avatarUrl}
                  alt={presetUser.name}
                  className="w-7 h-7 rounded-full shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111c2d] group-hover:text-[#3525cd] truncate">
                    {presetUser.name}
                  </p>
                  <p className="text-[10px] text-[#505f76] truncate">
                    CGPA: {presetUser.cgpa} • Target: {presetUser.dailyStudyTargetHours}h/day
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#3525cd] bg-[#dee8ff] px-2 py-0.5 rounded-md shrink-0">
                Log In &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
