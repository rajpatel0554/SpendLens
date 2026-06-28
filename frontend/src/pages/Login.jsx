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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-[#031427] text-on-surface grid grid-cols-1 md:grid-cols-2 overflow-hidden" style={{ width: '100%', minHeight: '100vh' }}>
      {/* Left side (Hero Image Showcase) - 50% width on desktop */}
      <div className="relative hidden md:block h-full w-full overflow-hidden">
        <img 
          src="/login_hero.png" 
          alt="Wealth Management Visualization" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side (Form) - 50% width on desktop */}
      <div className="flex flex-col items-center justify-center p-xl relative min-h-screen z-10">
        {/* Background Decorative Blur */}
        <div className="fixed top-0 right-0 w-[400px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none -z-10"></div>

        <main className="w-full max-w-[480px] z-10 flex flex-col gap-lg">
          {/* Brand Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-sm mb-xs">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
              <h1 className="font-display-lg text-[32px] font-bold tracking-tight text-on-surface">SpendLens</h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Organized Wealth Management</p>
          </div>

          {/* Glass Panel Form Container */}
          <div 
            className="rounded-3xl p-xl shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {error && (
              <div className="bg-error-container/20 border border-error/40 text-error rounded-xl p-md text-label-md flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
              {isSignUp && (
                <div className="flex flex-col gap-xs text-left w-full">
                  <label className="font-label-md text-on-surface-variant px-1" htmlFor="name">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant/70">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-[48px] pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-xs text-left w-full">
                <label className="font-label-md text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-[48px] pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs text-left w-full">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-label-sm text-primary hover:text-primary-fixed-dim transition-colors text-xs" href="#">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-[48px] pr-12 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/70 hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg shadow-primary/25 font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>

            </form>

            <p className="mt-6 text-center font-body-md text-on-surface-variant text-sm">
              {isSignUp ? 'Already have an account? ' : 'New to SpendLens? '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-primary font-bold hover:underline ml-1"
              >
                {isSignUp ? 'Sign In' : 'Create an account'}
              </button>
            </p>
          </div>

          {/* Bottom security badges */}
          <div className="mt-8 flex items-center justify-center gap-4 opacity-40 text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="font-label-sm uppercase tracking-widest text-[10px]">Bank-Level Security</span>
            </div>
            <div className="w-1 h-1 bg-outline rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              <span className="font-label-sm uppercase tracking-widest text-[10px]">256-bit AES</span>
            </div>
          </div>
        </main>

        {/* Bottom links */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 text-on-surface-variant/40 font-label-sm text-xs transition-opacity hover:opacity-100">
          <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-on-surface transition-colors" href="#">Help Center</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
