import React, { useState, useEffect } from 'react';
import { BrainLogo } from './BrainLogo';
import { authService } from '../../services/supabaseClient';
import { Eye, EyeOff, AlertCircle, Loader2, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onSignUp?: () => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export function Login({ onLogin, onSignUp, isMobile = false, isDarkMode = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Check for saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('celesteos_saved_email');
    if (savedEmail && rememberMe) {
      setEmail(savedEmail);
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use Supabase authentication
      const result = await authService.signIn(email.trim(), password);
      
      if (result.success) {
        console.log('✅ Login successful');
        
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('celesteos_saved_email', email.trim());
        } else {
          localStorage.removeItem('celesteos_saved_email');
        }
        
        // Call the onLogin callback for app-level handling
        onLogin(email.trim(), password);
      } else {
        // Handle specific error messages
        if (result.error?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (result.error?.includes('Email not confirmed')) {
          setError('Please verify your email before logging in.');
        } else if (result.error?.includes('too many requests')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authService.resetPassword(resetEmail.trim());
      
      if (result.success) {
        setResetSent(true);
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetSent(false);
          setResetEmail('');
        }, 5000);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div className="w-full flex items-center justify-center">
          <div className={`w-full ${isMobile ? 'max-w-[340px] mx-4' : 'max-w-[400px] mx-6'}`}>
            <div 
              className="glass-container radius-tight transition-all duration-300"
              style={{
                padding: isMobile ? '32px 24px' : '40px 32px'
              }}
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <Mail className="w-12 h-12" style={{ color: '#374151' }} />
                </div>
                <h2 
                  className="font-eloquia-display"
                  style={{
                    fontSize: isMobile ? '24px' : '28px',
                    lineHeight: '1.2',
                    letterSpacing: '0.38px',
                    color: '#181818',
                    marginBottom: '12px'
                  }}
                >
                  Reset Password
                </h2>
                <p 
                  className="font-eloquia-text"
                  style={{
                    fontSize: '14px',
                    color: '#95979E',
                    letterSpacing: '-0.32px'
                  }}
                >
                  Enter your email to receive a password reset link
                </p>
              </div>

              {resetSent ? (
                <div 
                  className="radius-tight"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '16px',
                    marginBottom: '16px'
                  }}
                >
                  <p className="font-eloquia-text" style={{ color: '#059669', fontSize: '14px' }}>
                    Password reset link sent! Check your email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  {error && (
                    <div 
                      className="radius-tight flex items-start gap-2"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '12px'
                      }}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                      <p className="font-eloquia-text" style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                    </div>
                  )}

                  <div>
                    <label 
                      className="font-eloquia-text block mb-2"
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="glass-input radius-tight w-full font-eloquia-text"
                      style={{
                        padding: '12px 16px',
                        fontSize: '16px',
                        lineHeight: '24px'
                      }}
                      placeholder="Enter your email"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-gradient-primary radius-tight w-full font-eloquia-text"
                    style={{
                      padding: '14px 24px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setResetEmail('');
                    }}
                    className="w-full font-eloquia-text"
                    style={{
                      padding: '8px',
                      color: '#95979E',
                      fontSize: '14px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 200ms'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#95979E'}
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      <div className="w-full flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'max-w-[340px] mx-4' : 'max-w-[400px] mx-6'}`}>
          <div 
            className="glass-container radius-tight transition-all duration-300"
            style={{
              padding: isMobile ? '32px 24px' : '40px 32px'
            }}
          >
            {/* Header with Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img 
                  src="/black-brain-logo.png" 
                  alt="CelesteOS Logo" 
                  width={56} 
                  height={56}
                  className="transition-all duration-300"
                />
              </div>
              
              <h1 
                className="font-eloquia-display mb-3"
                style={{
                  fontSize: isMobile ? '24px' : '28px',
                  lineHeight: '1.2',
                  letterSpacing: '0.38px',
                  color: '#181818',
                  fontWeight: '600'
                }}
              >
                <span style={{ color: '#181818', fontWeight: '600' }}>
                  Celeste
                </span>
                <span 
                  style={{ 
                    background: 'linear-gradient(-40deg, #4184A7 0%, #80C5DF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    fontWeight: '600'
                  }}
                >
                  OS
                </span>
              </h1>
              
              <p 
                className="font-eloquia-text"
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  letterSpacing: '-0.32px',
                  color: '#95979E'
                }}
              >
                Engineering Intelligence. Always On.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div 
                  className="radius-tight flex items-start gap-2"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '12px'
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <p className="font-eloquia-text" style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                </div>
              )}

              <div>
                <label 
                  htmlFor="email" 
                  className="font-eloquia-text block mb-2"
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input radius-tight w-full font-eloquia-text"
                  style={{
                    padding: '12px 16px',
                    fontSize: '16px',
                    lineHeight: '24px'
                  }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="font-eloquia-text block mb-2"
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input radius-tight w-full pr-12 font-eloquia-text"
                    style={{
                      padding: '12px 16px',
                      paddingRight: '48px',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{
                      color: '#95979E',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'color 200ms'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#95979E'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 w-4 h-4 radius-tight"
                    style={{
                      accentColor: '#43a6d8'
                    }}
                  />
                  <span className="font-eloquia-text" style={{ fontSize: '14px', color: '#374151' }}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-eloquia-text"
                  style={{
                    fontSize: '14px',
                    color: '#43a6d8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 200ms'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5299c4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#43a6d8'}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="btn-gradient-primary radius-tight w-full font-eloquia-text disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p 
                className="font-eloquia-text"
                style={{
                  fontSize: '13px',
                  lineHeight: '18px',
                  color: '#95979E',
                  marginBottom: '8px'
                }}
              >
                Don't have an account?{' '}
                {onSignUp && (
                  <button
                    onClick={onSignUp}
                    className="font-eloquia-text"
                    style={{
                      color: '#1a1a1a',
                      background: '#F8F8F0',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      transition: 'all 200ms',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F8F0';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Sign up
                  </button>
                )}
              </p>
              <p 
                className="font-eloquia-text"
                style={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#95979E'
                }}
              >
                The only AI trained on your manuals, systems, and history — ready whenever you are.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;