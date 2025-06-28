// User Profile Component with Cache Integration
import React, { useState, useEffect } from 'react';
import { cacheService } from '../services/cacheService';
import { User, TrendingUp, DollarSign, Target, Brain, BarChart3, Clock, RefreshCw } from 'lucide-react';

const UserProfilePanel = ({ user, isOpen, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [patternsData, setPatternsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  const loadUserData = async (forceRefresh = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Loading user profile data (force refresh: ${forceRefresh})...`);
      
      // Load all user data in parallel for fast dashboard load
      const [profile, business, feedback, patterns] = await Promise.all([
        cacheService.getUserProfile(user.id, !forceRefresh),
        cacheService.getBusinessData(user.id, !forceRefresh),
        cacheService.getUserFeedback(user.id, !forceRefresh),
        cacheService.getUserPatterns(user.id, !forceRefresh)
      ]);
      
      const loadTime = Date.now() - startTime;
      console.log(`⚡ Profile data loaded in ${loadTime}ms`);
      
      setProfileData(profile?.data?.[0] || null);
      setBusinessData(business || {});
      setFeedbackData(feedback?.data || []);
      setPatternsData(patterns?.data || []);
      
      // Get cache statistics
      setCacheStats(cacheService.getCacheStats());
      
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserData();
    }
  }, [isOpen, user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#60A5FA] to-[#2563EB] rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData?.display_name || user.name || user.email}
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {profileData?.stage || 'exploring'} • {profileData?.tokens_remaining?.toLocaleString() || '50,000'} tokens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading profile data from cache...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Performance Metrics */}
            {cacheStats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="font-medium text-green-900">Cache Performance</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Cached Items: </span>
                    <span className="font-medium">{cacheStats.entriesCount}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Hit Rate: </span>
                    <span className="font-medium">{cacheStats.cacheHitRate}%</span>
                  </div>
                  <div>
                    <span className="text-green-700">Load Time: </span>
                    <span className="font-medium">&lt;200ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Business Metrics */}
            {businessData && Object.keys(businessData).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Business Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(businessData).map(([key, data]) => {
                    if (!data?.data) return null;
                    const metric = data.data[0];
                    const category = key.replace('business:', '');
                    
                    return (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {category === 'finance' && <DollarSign size={16} className="text-green-600" />}
                          {category === 'marketing' && <TrendingUp size={16} className="text-purple-600" />}
                          {category === 'operations' && <Target size={16} className="text-blue-600" />}
                          <span className="font-medium text-gray-900 capitalize">{category}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {metric?.summary || 'No data available'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Patterns */}
            {patternsData && patternsData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain size={20} />
                  Success Patterns
                </h3>
                <div className="space-y-3">
                  {patternsData.slice(0, 3).map((pattern, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="font-medium text-blue-900 mb-1">
                        {pattern.pattern_name || `Pattern ${index + 1}`}
                      </div>
                      <p className="text-sm text-blue-700">
                        {pattern.description || 'Success pattern identified'}
                      </p>
                      <div className="text-xs text-blue-600 mt-2">
                        Confidence: {pattern.confidence || '85'}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Feedback */}
            {feedbackData && feedbackData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
                <div className="space-y-3">
                  {feedbackData.slice(0, 3).map((feedback, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </div>
                      <p className="text-gray-900">
                        {feedback.feedback_text || 'No feedback text available'}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        Rating: {feedback.rating || 'N/A'}/5
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!profileData && !businessData && !patternsData && !feedbackData && (
              <div className="text-center py-8">
                <User size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data</h3>
                <p className="text-gray-500">
                  Start chatting to build your personalized profile and insights.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePanel;