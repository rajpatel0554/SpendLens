import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-surface grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - Hero Image (desktop only) */}
      <div className="relative hidden md:block h-full w-full overflow-hidden">
        <img 
          alt="Wealth Management Visualization" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="/screen.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 pointer-events-none"></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col items-center justify-center p-xl relative min-h-screen">
        {/* Background Decorative Blurs */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div 
          className="glass-surface-elevated rounded-3xl p-lg z-10 flex flex-col gap-lg"
          style={{ width: '90vw', maxWidth: '440px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center text-on-primary-container mb-4">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-black text-primary">SpendLens</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase mt-1">
              Personal Finance Intelligence
            </p>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {isSignUp ? 'Get started on your wealth management journey' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {isSignUp && (
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface w-full transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface w-full transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface w-full transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary py-3.5 px-4 rounded-xl text-on-primary font-bold text-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {isSignUp ? 'person_add' : 'login'}
                  </span>
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center">
            <p className="font-label-md text-on-surface-variant">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-primary hover:underline font-bold focus:outline-none"
              >
                {isSignUp ? 'Sign In' : 'Create One'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
