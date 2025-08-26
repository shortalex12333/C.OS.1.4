import React, { useState, useEffect } from 'react';
import { BrainLogo } from './BrainLogo';
import { authService } from '../services/supabaseClient';
import { Eye, EyeOff, AlertCircle, Loader2, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onSignUp?: () => void;
  isMobile?: boolean;
}

export function Login({ onLogin, onSignUp, isMobile = false }: LoginProps) {
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
              className="glass-overlay rounded-lg transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(10px) saturate(1.3)',
                border: '1px solid rgba(0, 0, 0, 0.10)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
                padding: isMobile ? '32px 24px' : '40px 32px'
              }}
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <Mail className="w-12 h-12 text-gray-700" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {resetSent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">
                    Password reset link sent! Check your email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to Login
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
            className="glass-overlay rounded-lg transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(10px) saturate(1.3)',
              border: '1px solid rgba(0, 0, 0, 0.10)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
              padding: isMobile ? '32px 24px' : '40px 32px'
            }}
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <BrainLogo className="w-12 h-12 transition-all duration-300" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to CelesteOS
              </h1>
              <p className="text-sm text-gray-600">
                Advanced AI Assistant for Yacht Engineering
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignUp}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create New Account
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                Your data is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}