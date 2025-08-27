import React, { useState, useEffect } from 'react';
import { Zap, AlertCircle, TrendingUp } from 'lucide-react';
import tokenService from '../../services/tokenService';

interface TokenDisplayProps {
  isDarkMode?: boolean;
  isCompact?: boolean;
  className?: string;
}

export function TokenDisplay({ isDarkMode = false, isCompact = false, className = '' }: TokenDisplayProps) {
  const [metrics, setMetrics] = useState(tokenService.getMetrics());
  const [warningLevel, setWarningLevel] = useState(tokenService.getWarningLevel());

  useEffect(() => {
    // Update metrics every 10 seconds
    const interval = setInterval(() => {
      setMetrics(tokenService.getMetrics());
      setWarningLevel(tokenService.getWarningLevel());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getColorByLevel = () => {
    switch (warningLevel) {
      case 'critical': return '#ef4444'; // red
      case 'warning': return '#f59e0b'; // amber
      default: return isDarkMode ? '#10b981' : '#059669'; // green
    }
  };

  const getIconByLevel = () => {
    switch (warningLevel) {
      case 'critical': return AlertCircle;
      case 'warning': return TrendingUp;
      default: return Zap;
    }
  };

  const Icon = getIconByLevel();
  const color = getColorByLevel();

  if (isCompact) {
    return (
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${className}`}
        style={{
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}
      >
        <Icon size={14} style={{ color }} />
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
        }}>
          {tokenService.formatTokenCount(metrics.daily.remaining)} tokens
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`token-display ${className}`}
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} style={{ color }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDarkMode ? '#ffffff' : '#111827'
          }}>
            Token Usage
          </span>
        </div>
        <span style={{
          fontSize: '12px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        }}>
          Daily
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '6px',
        borderRadius: '3px',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '8px'
      }}>
        <div style={{
          height: '100%',
          width: `${metrics.daily.percentage}%`,
          backgroundColor: color,
          transition: 'width 0.3s ease',
          borderRadius: '3px'
        }} />
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        <span style={{
          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
        }}>
          {tokenService.formatTokenCount(metrics.daily.used)} used
        </span>
        <span style={{
          fontWeight: 600,
          color
        }}>
          {tokenService.formatTokenCount(metrics.daily.remaining)} remaining
        </span>
      </div>

      {/* Warning Message */}
      {warningLevel !== 'normal' && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: warningLevel === 'critical' 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${color}`,
          fontSize: '11px',
          color
        }}>
          {warningLevel === 'critical' 
            ? '⚠️ Running low on tokens. Usage will reset at midnight.'
            : '📊 High token usage detected. Consider optimizing queries.'}
        </div>
      )}

      {/* Monthly Usage (Optional Extended View) */}
      <details style={{ marginTop: '12px' }}>
        <summary style={{
          fontSize: '11px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          cursor: 'pointer'
        }}>
          Monthly Stats
        </summary>
        <div style={{
          marginTop: '8px',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
          fontSize: '11px',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
        }}>
          <div>Monthly: {tokenService.formatTokenCount(metrics.monthly.used)} / {tokenService.formatTokenCount(metrics.monthly.limit)}</div>
          <div>Queries: {metrics.queries}</div>
          <div>Avg/Query: {metrics.averageTokensPerQuery} tokens</div>
        </div>
      </details>
    </div>
  );
}

export default TokenDisplay;