import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { authService } from '../../services/supabaseClient';

interface SignUpProps {
  onBack: () => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export function SignUp({ onBack, isMobile = false, isDarkMode = false }: SignUpProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    score: 0, 
    message: '', 
    color: '#e5e7eb' 
  });

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    let message = '';
    let color = '#e5e7eb';

    if (!password) {
      return { score: 0, message: '', color };
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Set message and color based on score
    if (score <= 2) {
      message = 'Weak';
      color = '#ef4444';
    } else if (score <= 4) {
      message = 'Fair';
      color = '#f59e0b';
    } else if (score <= 5) {
      message = 'Good';
      color = '#10b981';
    } else {
      message = 'Strong';
      color = '#059669';
    }

    return { score, message, color };
  };

  // Update password strength when password changes
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      
      console.log('🚀 Creating account via Supabase...');
      const result = await authService.signUp(email.trim(), password, displayName);
      
      if (result.success) {
        if (result.needsEmailVerification) {
          setSuccess('Account created! Please check your email to verify your account.');
          // Clear form
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setAgreedToTerms(false);
          
          // Redirect to login after delay
          setTimeout(() => {
            onBack();
          }, 5000);
        } else {
          setSuccess('Account created successfully! Signing you in...');
          // Auto-login successful
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        // Handle specific error messages
        if (result.error?.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (result.error?.includes('rate limit')) {
          setError('Too many signup attempts. Please try again later.');
        } else if (result.error?.includes('invalid email')) {
          setError('Please enter a valid email address.');
        } else if (result.error?.includes('weak password')) {
          setError('Password is too weak. Please use a stronger password.');
        } else {
          setError(result.error || 'Failed to create account. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="absolute top-4 left-4 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: isDarkMode ? '#a0a0a0' : '#6b7280',
          background: 'transparent',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          borderRadius: '6px'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#374151';
            e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isDarkMode ? '#a0a0a0' : '#6b7280';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <ArrowLeft size={18} />
        Back to Sign In
      </button>

      {/* Sign up form */}
      <div className="w-full flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'max-w-[340px] mx-4' : 'max-w-[480px] mx-6'}`}>
          <div 
            className="glass-overlay rounded-lg transition-all duration-300"
            style={{
              background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(10px) saturate(1.3)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(0, 0, 0, 0.10)',
              boxShadow: isDarkMode 
                ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)'
                : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
              padding: isMobile ? '32px 24px' : '40px 32px'
            }}
          >
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create Your Account
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Join CelesteOS for advanced yacht engineering assistance
              </p>
            </div>

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label 
                    htmlFor="firstName" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="John"
                    disabled={isLoading}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div>
                  <label 
                    htmlFor="lastName" 
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Doe"
                    disabled={isLoading}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="john.doe@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label 
                  htmlFor="password" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } focus:outline-none`}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Password strength:
                      </span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.message}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          backgroundColor: passwordStrength.color 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } focus:outline-none`}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                  <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label 
                  htmlFor="terms" 
                  className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
                >
                  I agree to the{' '}
                  <span className="text-blue-600 hover:text-blue-700">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-blue-600 hover:text-blue-700">Privacy Policy</span>
                </label>
              </div>

              {/* Password requirements info */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'} border ${isDarkMode ? 'border-gray-700' : 'border-blue-200'}`}>
                <div className="flex items-start gap-2">
                  <Info className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} flex-shrink-0 mt-0.5`} />
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-700'}`}>
                    <p className="font-medium mb-1">Password Requirements:</p>
                    <ul className="space-y-0.5">
                      <li>• At least 6 characters long</li>
                      <li>• Stronger passwords include uppercase, numbers, and symbols</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Sign in link */}
              <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}