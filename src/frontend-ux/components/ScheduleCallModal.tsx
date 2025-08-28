import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Phone, Anchor } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { authService } from '../../services/supabaseClient';
import { ScheduleService } from '../../services/scheduleService';

interface ScheduleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  isMobile?: boolean;
  chatQueriesCount?: number;
  faqQueriesCount?: number;
  topicsAsked?: string[];
}

export function ScheduleCallModal({ 
  isOpen, 
  onClose, 
  isDarkMode,
  isMobile = false,
  chatQueriesCount = 0,
  faqQueriesCount = 0,
  topicsAsked = []
}: ScheduleCallModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [formData, setFormData] = useState({
    phone: '',
    yachtSize: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State for booked slots
  const [bookedTimesForSelectedDate, setBookedTimesForSelectedDate] = useState<string[]>([]);
  const [allBookedSlots, setAllBookedSlots] = useState<Set<string>>(new Set());
  const [loadingBookedSlots, setLoadingBookedSlots] = useState(false);

  // Use explicitly passed isDarkMode prop to prevent modal closing on theme change
  const isCurrentlyDark = isDarkMode || false;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate time slots from 1:00 PM to 6:00 PM (45-minute sessions)
  const timeSlots = [
    '1:00 PM',
    '1:45 PM', 
    '2:30 PM',
    '3:15 PM',
    '4:00 PM',
    '4:45 PM',
    '5:30 PM',
    '6:00 PM'
  ];

  // Fetch booked slots when modal opens or date changes
  useEffect(() => {
    if (!isOpen) return;
    
    // Fetch all booked slots for next 30 days
    const fetchAllBookedSlots = async () => {
      setLoadingBookedSlots(true);
      const { startDate, endDate } = ScheduleService.getDateRange(30);
      const bookedSlots = await ScheduleService.getBookedSlots(startDate, endDate);
      const bookedSet = ScheduleService.createBookedSlotsSet(bookedSlots);
      setAllBookedSlots(bookedSet);
      setLoadingBookedSlots(false);
    };

    fetchAllBookedSlots();

    // Subscribe to real-time changes
    const subscription = ScheduleService.subscribeToScheduleChanges(
      (newBooking) => {
        // Add new booking to the set
        setAllBookedSlots(prev => {
          const newSet = new Set(prev);
          newSet.add(`${newBooking.date}_${newBooking.time}`);
          return newSet;
        });
        
        // Update selected date's booked times if it matches
        if (selectedDate && ScheduleService.formatDateForDB(selectedDate) === newBooking.date) {
          setBookedTimesForSelectedDate(prev => [...prev, newBooking.time]);
        }
      },
      (deletedBooking) => {
        // Remove deleted booking from the set
        setAllBookedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(`${deletedBooking.date}_${deletedBooking.time}`);
          return newSet;
        });
        
        // Update selected date's booked times if it matches
        if (selectedDate && ScheduleService.formatDateForDB(selectedDate) === deletedBooking.date) {
          setBookedTimesForSelectedDate(prev => prev.filter(time => time !== deletedBooking.time));
        }
      }
    );

    return () => {
      ScheduleService.unsubscribe(subscription);
    };
  }, [isOpen]);

  // Fetch booked times when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchBookedTimesForDate = async () => {
      const dateStr = ScheduleService.formatDateForDB(selectedDate);
      const bookedTimes = await ScheduleService.getBookedTimesForDate(dateStr);
      setBookedTimesForSelectedDate(bookedTimes);
    };

    fetchBookedTimesForDate();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Double-check availability before submitting
      const dateStr = ScheduleService.formatDateForDB(selectedDate);
      const isAvailable = await ScheduleService.isSlotAvailable(dateStr, selectedTime);
      
      if (!isAvailable) {
        alert('Sorry, this time slot was just booked by someone else. Please select another time.');
        setIsSubmitting(false);
        // Refresh the booked times for this date
        const bookedTimes = await ScheduleService.getBookedTimesForDate(dateStr);
        setBookedTimesForSelectedDate(bookedTimes);
        return;
      }
      
      // Get current user information
      const currentUser = await authService.getCurrentUser();
      const session = await authService.getSession();
      
      // Prepare display name and extract first/last name
      const displayName = currentUser?.user_metadata?.display_name || 
                         currentUser?.user_metadata?.name || 
                         currentUser?.email?.split('@')[0] || 'User';
      
      // Split display name into first and last
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || displayName;
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare the payload with all user and booking details
      const payload = {
        // User details
        userId: currentUser?.id || null,
        email: currentUser?.email || null,
        userMetadata: currentUser?.user_metadata || {},
        displayName: displayName,
        firstName: firstName,  // For webhook processing
        lastname: lastName,    // For database (lowercase)
        firstname: firstName,  // For database (lowercase)
        lastName: lastName,    // For webhook processing
        
        // Calendar booking details - IMPORTANT: date must be YYYY-MM-DD format
        selectedDate: selectedDate.toISOString(),
        date: dateStr, // This is already in YYYY-MM-DD format from above
        selectedTime: selectedTime,
        time: selectedTime, // Database expects 'time' field
        dateTimeLocal: `${selectedDate.toLocaleDateString()} at ${selectedTime}`,
        
        // Form data
        phone: formData.phone,
        yachtSize: formData.yachtSize,
        yacht_size: formData.yachtSize, // Database field name
        
        // Analytics and tracking data
        chatQueriesCount: chatQueriesCount,
        chat_queries_count: chatQueriesCount, // Database field name
        faqQueriesCount: faqQueriesCount,
        faq_queries_count: faqQueriesCount, // Database field name
        topics: topicsAsked,
        
        // Additional context
        timestamp: new Date().toISOString(),
        sessionId: session?.access_token || null,
        session_id: session?.access_token || null, // Database field name
        source: 'schedule-call-modal',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      console.log('📅 Sending schedule call payload:', payload);

      // Send to webhook endpoint
      const response = await fetch('https://api.celeste7.ai/webhook/schedule-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Schedule call webhook response:', result);

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Close modal after success message
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setFormData({
          phone: '',
          yachtSize: ''
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Schedule call webhook error:', error);
      setIsSubmitting(false);
      
      // Show error state (you might want to add error state management)
      alert('Sorry, there was an error scheduling your call. Please try again or contact support.');
    }
  };

  if (!isOpen) return null;

  // Define styles based on theme
  const themeStyles = {
    overlay: {
      background: isCurrentlyDark ? 'rgba(0, 0, 0, 0.80)' : 'rgba(0, 0, 0, 0.40)',
    },
    modal: {
      background: isCurrentlyDark ? '#1a1a1a' : '#ffffff',
      border: isCurrentlyDark ? '1px solid #333333' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: isCurrentlyDark 
        ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
        : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.08)',
    },
    closeButton: {
      background: isCurrentlyDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      border: isCurrentlyDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
      color: isCurrentlyDark ? '#ffffff' : '#374151',
    },
    text: {
      primary: isCurrentlyDark ? '#ffffff' : '#1f2937',
      secondary: isCurrentlyDark ? '#d1d5db' : '#6b7280',
    },
    glassmorphism: {
      background: isCurrentlyDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.95)',
      border: isCurrentlyDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: isCurrentlyDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.20)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.80)',
    },
    input: {
      background: isCurrentlyDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
      border: isCurrentlyDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      color: isCurrentlyDark ? '#ffffff' : '#1f2937',
    },
    icon: {
      color: isCurrentlyDark ? '#9ca3af' : '#6b7280',
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...themeStyles.overlay,
        backdropFilter: 'blur(12px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '24px',
        fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Content - Removed scroll and made it fit to screen */}
      <div 
        style={{
          ...themeStyles.modal,
          borderRadius: '16px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '520px',
          height: 'fit-content',
          maxHeight: isMobile ? '95vh' : '90vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            ...themeStyles.closeButton,
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isCurrentlyDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isCurrentlyDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Content Container - With invisible scroll functionality */}
        <div 
          className="scroll-invisible"
          style={{ 
            padding: isMobile ? '16px' : '24px',
            overflowY: 'auto',
            maxHeight: isMobile ? '85vh' : '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header - Compact */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* Logo */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <img
                src="/profile-picture.png"
                alt="Profile Picture"
                style={{
                  height: '48px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>

            <h2 
              style={{
                fontSize: isMobile ? '22px' : '26px',
                fontWeight: 400,
                lineHeight: isMobile ? '28px' : '32px',
                color: themeStyles.text.primary,
                marginBottom: '8px',
                fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Schedule a Call with Alex
            </h2>
            
            <p 
              style={{
                fontSize: '15px',
                lineHeight: '22px',
                color: '#00a4ff',
                margin: 0,
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Former Superyacht ETO. Let's discuss how CelesteOS can solve your engineering challenges.
            </p>
          </div>

          {/* Success State */}
          {isSubmitted ? (
            <div 
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                color: themeStyles.text.primary,
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#0070ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '24px',
                  color: '#ffffff'
                }}
              >
                ✓
              </div>
              
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Call Scheduled!
              </h3>
              
              <p 
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: themeStyles.text.secondary,
                  margin: 0,
                  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                We will send confirmation of invite shortly.
              </p>
            </div>
          ) : (
            /* Main Content - Compact layout */
            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Step 1: Date Selection */}
              <div>
                <h3 
                  style={{
                    fontSize: '16px',
                    fontWeight: 400,
                    color: themeStyles.text.primary,
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  Select a Date
                </h3>
                
                {/* Glassmorphism Calendar Container */}
                <div 
                  style={{
                    ...themeStyles.glassmorphism,
                    backdropFilter: 'blur(24px) saturate(1.25)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '320px',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ width: '100%', maxWidth: '280px' }}>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                      className="p-3"
                      classNames={{
                        months: "flex flex-col gap-2",
                        month: "flex flex-col gap-4",
                        caption: "flex justify-center pt-1 relative items-center w-full",
                        caption_label: "text-sm font-medium",
                        nav: "flex items-center gap-1",
                        nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border ${isCurrentlyDark ? 'bg-transparent text-white border-white/20 hover:bg-white/10' : 'bg-background text-foreground border-gray-200 hover:bg-gray-50'}`,
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell: `rounded-md w-8 font-normal text-xs ${isCurrentlyDark ? 'text-gray-400' : 'text-gray-600'}`,
                        row: "flex w-full mt-2",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                        day: `h-8 w-8 p-0 font-normal hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm transition-all ${isCurrentlyDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`,
                        day_selected: `${isCurrentlyDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white`,
                        day_today: `${isCurrentlyDark ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'} font-medium`,
                        day_outside: `${isCurrentlyDark ? 'text-gray-600' : 'text-gray-400'} opacity-50`,
                        day_disabled: `${isCurrentlyDark ? 'text-gray-600' : 'text-gray-400'} opacity-50 cursor-not-allowed`,
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Time Selection */}
              {selectedDate && (
                <div>
                  <h3 
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      color: themeStyles.text.primary,
                      marginBottom: '16px',
                      textAlign: 'center',
                      fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Select a Time (45-minute sessions)
                  </h3>
                  
                  {/* Glassmorphism Time Slots Container */}
                  <div 
                    style={{
                      ...themeStyles.glassmorphism,
                      backdropFilter: 'blur(24px) saturate(1.25)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                        gap: '8px'
                      }}
                    >
                      {timeSlots.map((time) => {
                        const isBooked = bookedTimesForSelectedDate.includes(time);
                        
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => !isBooked && setSelectedTime(time)}
                            disabled={isBooked}
                            style={{
                              padding: '8px 12px',
                              background: isBooked
                                ? isCurrentlyDark 
                                  ? 'rgba(255, 255, 255, 0.04)' 
                                  : 'rgba(0, 0, 0, 0.02)'
                                : selectedTime === time 
                                  ? '#0070ff' 
                                  : isCurrentlyDark 
                                    ? 'rgba(255, 255, 255, 0.08)' 
                                    : 'rgba(0, 0, 0, 0.03)',
                              border: isBooked
                                ? isCurrentlyDark
                                  ? '1px solid rgba(255, 255, 255, 0.08)'
                                  : '1px solid rgba(0, 0, 0, 0.05)'
                                : selectedTime === time 
                                  ? '1px solid rgba(0, 112, 255, 0.3)' 
                                  : isCurrentlyDark 
                                    ? '1px solid rgba(255, 255, 255, 0.12)' 
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                              borderRadius: '6px',
                              color: isBooked
                                ? isCurrentlyDark
                                  ? 'rgba(255, 255, 255, 0.3)'
                                  : 'rgba(0, 0, 0, 0.3)'
                                : selectedTime === time 
                                  ? '#ffffff' 
                                  : themeStyles.text.primary,
                              fontSize: '13px',
                              fontWeight: 400,
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              backdropFilter: 'blur(8px) saturate(1.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              opacity: isBooked ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!isBooked && selectedTime !== time) {
                                e.currentTarget.style.background = isCurrentlyDark 
                                  ? 'rgba(255, 255, 255, 0.12)' 
                                  : 'rgba(0, 0, 0, 0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isBooked && selectedTime !== time) {
                                e.currentTarget.style.background = isCurrentlyDark 
                                  ? 'rgba(255, 255, 255, 0.08)' 
                                  : 'rgba(0, 0, 0, 0.03)';
                              }
                            }}
                          >
                            <Clock style={{ width: '12px', height: '12px', marginRight: '6px' }} />
                            {time}
                            {isBooked && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '6px',
                                  height: '6px',
                                  backgroundColor: '#ef4444',
                                  borderRadius: '50%',
                                  boxShadow: '0 0 3px rgba(239, 68, 68, 0.5)'
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Details Form */}
              {selectedTime && (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        color: themeStyles.text.primary,
                        marginBottom: '16px',
                        textAlign: 'center',
                        fontFamily: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    >
                      Contact Details
                    </h3>

                    {/* Glassmorphism Form Container */}
                    <div 
                      style={{
                        ...themeStyles.glassmorphism,
                        backdropFilter: 'blur(24px) saturate(1.25)',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Phone Number */}
                        <div>
                          <label 
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              color: themeStyles.text.secondary,
                              marginBottom: '8px',
                              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}
                          >
                            Phone Number *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Phone 
                              style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '14px',
                                height: '14px',
                                color: themeStyles.icon.color
                              }}
                            />
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              style={{
                                width: '100%',
                                padding: '10px 14px 10px 38px',
                                ...themeStyles.input,
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                transition: 'border-color 0.2s ease',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#0070ff';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = themeStyles.input.border.replace('1px solid ', '');
                              }}
                            />
                          </div>
                        </div>

                        {/* Yacht Size */}
                        <div>
                          <label 
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              color: themeStyles.text.secondary,
                              marginBottom: '8px',
                              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }}
                          >
                            Yacht Size (meters) *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Anchor 
                              style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '14px',
                                height: '14px',
                                color: themeStyles.icon.color
                              }}
                            />
                            <input
                              type="number"
                              required
                              value={formData.yachtSize}
                              onChange={(e) => handleInputChange('yachtSize', e.target.value)}
                              placeholder="e.g. 45"
                              min="1"
                              max="200"
                              style={{
                                width: '100%',
                                padding: '10px 14px 10px 38px',
                                ...themeStyles.input,
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                transition: 'border-color 0.2s ease',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#0070ff';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = themeStyles.input.border.replace('1px solid ', '');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize || isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: (!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize || isSubmitting)
                        ? (isCurrentlyDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                        : '#0070ff',
                      border: 'none',
                      borderRadius: '10px',
                      color: (!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize || isSubmitting)
                        ? (isCurrentlyDark ? '#6b7280' : '#9ca3af')
                        : '#ffffff',
                      fontSize: '15px',
                      fontWeight: 500,
                      cursor: (!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize || isSubmitting) 
                        ? 'not-allowed' 
                        : 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      boxShadow: (!selectedDate || !selectedTime || !formData.phone || !formData.yachtSize || isSubmitting)
                        ? 'none'
                        : '0 4px 12px rgba(0, 112, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDate && selectedTime && formData.phone && formData.yachtSize && !isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 112, 255, 0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDate && selectedTime && formData.phone && formData.yachtSize && !isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 255, 0.2)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}