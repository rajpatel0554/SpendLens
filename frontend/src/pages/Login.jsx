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
    <div className="min-h-screen bg-background text-on-background lg:grid lg:grid-cols-12 relative overflow-hidden" style={{ width: '100%', minHeight: '100vh' }}>
      {/* Left side (Form) - 5 cols on desktop */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-lg relative min-h-screen z-10">
        {/* Background Decorative Blurs for mobile */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none lg:hidden"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none lg:hidden"></div>

        <div 
          className="glass-surface-elevated rounded-3xl p-lg flex flex-col gap-lg relative"
          style={{ width: '90vw', maxWidth: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center text-on-primary-container mb-4">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-black text-primary">SpendLens</h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Wealth Management</p>
          </div>

          <div className="flex flex-col text-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {isSignUp ? 'Sign up to start tracking your wealth' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {isSignUp && (
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none w-full transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface-variant">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none w-full transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface-variant">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none w-full transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary font-bold py-3.5 px-4 rounded-xl text-label-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
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

          <div className="text-center mt-2">
            <p className="font-body-md text-on-surface-variant">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-primary font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side (Hero Image Showcase) - 7 cols on desktop */}
      <div className="hidden lg:block lg:col-span-7 relative h-screen overflow-hidden">
        <img 
          src="/login_hero.png" 
          alt="Wealth Intelligence" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Glass Overlay with Branding Text */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-background via-background/60 to-transparent p-xl z-10" 
          style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxSizing: 'border-box' }}
        >
          <div 
            className="glass-surface p-lg rounded-3xl border border-white/10 backdrop-blur-md mb-8"
            style={{ width: '90%', maxWidth: '448px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}
          >
            <span className="font-label-md px-sm py-xs bg-primary-container/20 text-primary rounded-lg uppercase tracking-wider">
              AI Wealth Management
            </span>
            <h1 className="font-display-lg text-[36px] font-black text-on-surface mt-4 leading-tight">
              Personal Finance Intelligence
            </h1>
            <p className="font-body-md text-on-surface-variant mt-2 text-lg">
              Analyze bank statements, track category budgets, and detect transaction anomalies in real-time with state-of-the-art ML modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
