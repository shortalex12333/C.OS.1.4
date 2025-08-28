import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/supabaseClient';

interface SignUpProps {
  onSignUp?: (firstName: string, lastName: string, email: string, password: string) => void;
  onBack: () => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
}

export function SignUp({ onSignUp, onBack, isMobile = false, isDarkMode = false }: SignUpProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Minimalist password requirements
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Update password checks
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordChecks({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value)
    });
  };

  const isPasswordValid = () => {
    return passwordChecks.length && 
           passwordChecks.uppercase && 
           passwordChecks.lowercase && 
           passwordChecks.number;
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

    if (!isPasswordValid()) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      // Use Supabase auth service
      const result = await authService.signUp(email.trim(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`
      });

      if (result.success) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        
        // Clear form after 3 seconds and go back to login
        setTimeout(() => {
          onBack();
        }, 3000);
      } else {
        // Handle specific error messages
        if (result.error?.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (result.error?.includes('weak password')) {
          setError('Please choose a stronger password.');
        } else if (result.error?.includes('rate limit')) {
          setError('Too many attempts. Please try again later.');
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
    <div className="min-h-screen w-full flex items-center justify-center relative">
      <div className="w-full flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'max-w-[340px] mx-4' : 'max-w-[400px] mx-6'}`}>
          <div 
            className="glass-container radius-tight transition-all duration-300"
            style={{
              padding: isMobile ? '32px 24px' : '40px 32px'
            }}
          >
            {/* Back Button */}
            <button
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center gap-2 font-eloquia-text mb-6"
              style={{
                color: '#95979E',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                fontSize: '14px',
                transition: 'color 200ms'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = '#374151')}
              onMouseLeave={(e) => e.currentTarget.style.color = '#95979E'}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 
                className="font-eloquia-display mb-3"
                style={{
                  fontSize: isMobile ? '24px' : '28px',
                  lineHeight: '1.2',
                  letterSpacing: '0.38px',
                  color: '#181818'
                }}
              >
                Create your <span 
                  style={{ 
                    background: 'linear-gradient(115deg, #43a6d8 0%, #81c8e4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block'
                  }}
                >OS</span> account
              </h1>
              
              <p 
                className="font-eloquia-text"
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  letterSpacing: '-0.32px',
                  color: '#95979E'
                }}
              >
                Get started in seconds
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div 
                className="radius-tight flex items-start gap-2 mb-6"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '12px'
                }}
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                <p className="font-eloquia-text" style={{ color: '#059669', fontSize: '14px' }}>{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div 
                className="radius-tight flex items-start gap-2 mb-6"
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields - Side by Side on Desktop, Stacked on Mobile */}
              <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-4'}`}>
                {/* First Name Field */}
                <div>
                  <label 
                    htmlFor="firstName" 
                    className="font-eloquia-text block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="glass-input radius-tight w-full font-eloquia-text"
                    style={{
                      padding: '12px 16px',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                    placeholder="First name"
                    disabled={isLoading}
                    autoComplete="given-name"
                    required
                  />
                </div>

                {/* Last Name Field */}
                <div>
                  <label 
                    htmlFor="lastName" 
                    className="font-eloquia-text block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="glass-input radius-tight w-full font-eloquia-text"
                    style={{
                      padding: '12px 16px',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                    placeholder="Last name"
                    disabled={isLoading}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
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

              {/* Password Field */}
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
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="glass-input radius-tight w-full pr-12 font-eloquia-text"
                    style={{
                      padding: '12px 16px',
                      paddingRight: '48px',
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    autoComplete="new-password"
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

                {/* Minimalist Password Requirements */}
                {(passwordFocused || password) && (
                  <div 
                    className="mt-3 space-y-1"
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: passwordChecks.length ? '#10b981' : '#95979E'
                        }}
                      />
                      <span 
                        className="font-eloquia-text"
                        style={{
                          fontSize: '12px',
                          color: passwordChecks.length ? '#10b981' : '#95979E'
                        }}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: passwordChecks.uppercase && passwordChecks.lowercase ? '#10b981' : '#95979E'
                        }}
                      />
                      <span 
                        className="font-eloquia-text"
                        style={{
                          fontSize: '12px',
                          color: passwordChecks.uppercase && passwordChecks.lowercase ? '#10b981' : '#95979E'
                        }}
                      >
                        Mixed case letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: passwordChecks.number ? '#10b981' : '#95979E'
                        }}
                      />
                      <span 
                        className="font-eloquia-text"
                        style={{
                          fontSize: '12px',
                          color: passwordChecks.number ? '#10b981' : '#95979E'
                        }}
                      >
                        Include numbers
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !isPasswordValid()}
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
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Terms Notice - Implicit */}
              <p 
                className="font-eloquia-text text-center"
                style={{
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#95979E'
                }}
              >
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p 
                className="font-eloquia-text"
                style={{
                  fontSize: '13px',
                  lineHeight: '18px',
                  color: '#95979E'
                }}
              >
                Already have an account?{' '}
                <button
                  onClick={onBack}
                  disabled={isLoading}
                  className="font-eloquia-text"
                  style={{
                    color: '#43a6d8',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'color 200ms'
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = '#5299c4')}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#43a6d8'}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;