import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface HelpContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
}

export function HelpContactModal({ isOpen, onClose, activeSection = 'help-contact' }: HelpContactModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setEmail('');
        setSubject('');
        setMessage('');
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = email.trim() && subject.trim() && message.trim() && !emailError;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(13, 14, 17, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: 'fadeIn 600ms cubic-bezier(0.22, 0.61, 0.36, 1)'
      }}
    >
      <div 
        className="flex h-[600px] w-[900px] overflow-hidden"
        style={{
          background: '#161922',
          border: '1px solid rgba(71, 85, 116, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
          animation: 'slideInModal 700ms cubic-bezier(0.22, 0.61, 0.36, 1)'
        }}
        role="dialog"
        aria-labelledby="contact-support"
        aria-modal="true"
      >
        {/* Left Navigation */}
        <div 
          className="w-[240px] flex-shrink-0"
          style={{
            background: '#12141a',
            borderRight: '1px solid rgba(71, 85, 116, 0.2)'
          }}
        >
          <div className="p-6">
            <h3 
              className="mb-6"
              style={{
                fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '18px',
                lineHeight: '26px',
                fontWeight: '500',
                color: '#f0f2f5'
              }}
            >
              Settings
            </h3>
            
            <nav className="space-y-1">
              <div className="relative">
                {activeSection === 'help-contact' && (
                  <div 
                    className="absolute left-0 top-0 w-0.5 h-full"
                    style={{
                      background: '#818cf8',
                      animation: 'slideInIndicator 240ms cubic-bezier(0.22, 0.61, 0.36, 1)'
                    }}
                  />
                )}
                <button
                  className="w-full text-left px-3 py-3 rounded-md transition-all duration-240"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '500',
                    color: activeSection === 'help-contact' ? '#f0f2f5' : '#8892a0',
                    background: activeSection === 'help-contact' ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                  }}
                >
                  Help & Contact
                </button>
              </div>
              
              <button
                className="w-full text-left px-3 py-3 rounded-md transition-all duration-240 hover:bg-[rgba(71,85,116,0.1)]"
                style={{
                  fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: '500',
                  color: '#8892a0'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'account') {
                    e.currentTarget.style.color = '#e4e6eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'account') {
                    e.currentTarget.style.color = '#8892a0';
                  }
                }}
              >
                Account
              </button>
              
              <button
                className="w-full text-left px-3 py-3 rounded-md transition-all duration-240 hover:bg-[rgba(71,85,116,0.1)]"
                style={{
                  fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: '500',
                  color: '#8892a0'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'preferences') {
                    e.currentTarget.style.color = '#e4e6eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'preferences') {
                    e.currentTarget.style.color = '#8892a0';
                  }
                }}
              >
                Preferences
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-180 hover:bg-[rgba(71,85,116,0.1)]"
            style={{
              color: '#8892a0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e4e6eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8892a0';
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="p-8 h-full overflow-y-auto">
            <h2 
              id="contact-support"
              className="mb-8"
              style={{
                fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: '24px',
                lineHeight: '32px',
                fontWeight: '500',
                color: '#f0f2f5'
              }}
            >
              Contact Support
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="support-email"
                  className="block mb-2"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '500',
                    color: '#b8bec9'
                  }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="support-email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    aria-label="Email Address"
                    className="w-full px-4 py-3 rounded-md border transition-all duration-240 focus:outline-none"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      background: emailError ? '#1a1d26' : '#1a1d26',
                      border: emailError ? '1px solid #ef4444' : '1px solid rgba(71, 85, 116, 0.3)',
                      color: '#e4e6eb'
                    }}
                    onFocus={(e) => {
                      if (!emailError) {
                        e.target.style.background = '#242837';
                        e.target.style.border = '2px solid rgba(99, 110, 255, 0.5)';
                        e.target.style.color = '#f0f2f5';
                      }
                    }}
                    onBlur={(e) => {
                      if (!emailError) {
                        e.target.style.background = '#1a1d26';
                        e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                        e.target.style.color = '#e4e6eb';
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (!emailError && document.activeElement !== e.target) {
                        e.target.style.background = '#1f2330';
                        e.target.style.border = '1px solid rgba(71, 85, 116, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!emailError && document.activeElement !== e.target) {
                        e.target.style.background = '#1a1d26';
                        e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                      }
                    }}
                    placeholder="chief.engineer@yacht.com"
                  />
                  {emailError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertTriangle size={16} color="#ef4444" />
                    </div>
                  )}
                </div>
                {emailError && (
                  <p 
                    role="alert"
                    className="mt-2 flex items-center gap-2"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#ef4444'
                    }}
                  >
                    <AlertTriangle size={14} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label 
                  htmlFor="support-subject"
                  className="block mb-2"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '500',
                    color: '#b8bec9'
                  }}
                >
                  Subject
                </label>
                <input
                  id="support-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Subject"
                  className="w-full px-4 py-3 rounded-md border transition-all duration-240 focus:outline-none"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    background: '#1a1d26',
                    border: '1px solid rgba(71, 85, 116, 0.3)',
                    color: '#e4e6eb'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#242837';
                    e.target.style.border = '2px solid rgba(99, 110, 255, 0.5)';
                    e.target.style.color = '#f0f2f5';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#1a1d26';
                    e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                    e.target.style.color = '#e4e6eb';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.background = '#1f2330';
                      e.target.style.border = '1px solid rgba(71, 85, 116, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.background = '#1a1d26';
                      e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                    }
                  }}
                  placeholder="Generator restart issue"
                />
              </div>

              {/* Message Field */}
              <div>
                <label 
                  htmlFor="support-message"
                  className="block mb-2"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '500',
                    color: '#b8bec9'
                  }}
                >
                  Message
                </label>
                <textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-label="Message"
                  className="w-full px-4 py-3 rounded-md border transition-all duration-240 focus:outline-none resize-y"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segue UI", sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    background: '#1a1d26',
                    border: '1px solid rgba(71, 85, 116, 0.3)',
                    color: '#e4e6eb',
                    minHeight: '140px'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#242837';
                    e.target.style.border = '2px solid rgba(99, 110, 255, 0.5)';
                    e.target.style.color = '#f0f2f5';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#1a1d26';
                    e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                    e.target.style.color = '#e4e6eb';
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.background = '#1f2330';
                      e.target.style.border = '1px solid rgba(71, 85, 116, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.background = '#1a1d26';
                      e.target.style.border = '1px solid rgba(71, 85, 116, 0.3)';
                    }
                  }}
                  placeholder="Engine E-047: starter not engaging after reset"
                />
                <p 
                  className="mt-2"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#b8bec9'
                  }}
                >
                  Describe the fault clearly. Attach part numbers if known.
                </p>
              </div>

              {/* Helper Text */}
              <p 
                style={{
                  fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#b8bec9'
                }}
              >
                Replies usually within 24h. Urgent?{' '}
                <a 
                  href="mailto:support@celesteos.io"
                  style={{ color: '#6366f1', textDecoration: 'none' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  support@celesteos.io
                </a>
              </p>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-md"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle size={16} color="#10b981" />
                  <span 
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#10b981'
                    }}
                  >
                    Message sent. A confirmation has been emailed.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-md"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                  role="alert"
                >
                  <AlertTriangle size={16} color="#ef4444" />
                  <span 
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#ef4444'
                    }}
                  >
                    Failed to send message. Please try again.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <div className="relative">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    aria-disabled={!isFormValid || isSubmitting}
                    className="px-6 py-3 rounded-md font-medium transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161922] focus:ring-[#6366f1] disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '500',
                      background: isFormValid && !isSubmitting 
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : '#252832',
                      border: isFormValid && !isSubmitting 
                        ? 'none'
                        : '1px solid rgba(71, 85, 116, 0.3)',
                      color: isFormValid && !isSubmitting ? '#ffffff' : '#8892a0',
                      boxShadow: isFormValid && !isSubmitting 
                        ? '0 4px 14px rgba(99, 102, 241, 0.3)'
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (isFormValid && !isSubmitting) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #7c7ff3 0%, #9d71f8 100%)';
                        e.currentTarget.style.transform = 'scale(1.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isFormValid && !isSubmitting) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                        e.currentTarget.style.transform = 'scale(1.0)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isSubmitting ? 'Sending...' : 'Send Email'}
                    </div>
                  </button>
                  
                  {/* Tooltip for disabled state */}
                  {!isFormValid && !isSubmitting && (
                    <div 
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-md opacity-0 pointer-events-none transition-opacity duration-200 whitespace-nowrap"
                      style={{
                        background: '#12141a',
                        border: '1px solid rgba(71, 85, 116, 0.3)',
                        color: '#b8bec9',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      Enter a message to enable send.
                      <div 
                        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: '4px solid transparent',
                          borderRight: '4px solid transparent',
                          borderTop: '4px solid rgba(71, 85, 116, 0.3)'
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-md font-medium transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161922] focus:ring-[#8892a0]"
                  style={{
                    fontFamily: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '500',
                    background: '#252832',
                    color: '#e4e6eb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2d3142';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#252832';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInModal {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes slideInIndicator {
          from { 
            transform: translateY(-100%); 
          }
          to { 
            transform: translateY(0); 
          }
        }

        input::placeholder,
        textarea::placeholder {
          color: #8892a0;
        }

        input:focus::placeholder,
        textarea:focus::placeholder {
          color: rgba(136, 146, 160, 0.7);
        }

        /* Tooltip hover effect */
        button:disabled:hover + div {
          opacity: 1 !important;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          button {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}