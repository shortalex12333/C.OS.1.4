// Comprehensive Error Handling System
// Production-grade error management with user-friendly feedback

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'auth' | 'validation' | 'system' | 'user';
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
}

export class ErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 1000;

  // Error type definitions with user-friendly messages
  private static errorTypes = {
    // Network Errors
    NETWORK_TIMEOUT: {
      code: 'NETWORK_TIMEOUT',
      message: 'Request timed out',
      userMessage: 'The request took too long. Please check your internet connection and try again.',
      severity: 'medium' as const,
      category: 'network' as const
    },
    NETWORK_OFFLINE: {
      code: 'NETWORK_OFFLINE',
      message: 'No internet connection',
      userMessage: 'You appear to be offline. Please check your internet connection.',
      severity: 'high' as const,
      category: 'network' as const
    },
    API_ERROR: {
      code: 'API_ERROR',
      message: 'API request failed',
      userMessage: 'Server is temporarily unavailable. Please try again in a few moments.',
      severity: 'medium' as const,
      category: 'network' as const
    },

    // Authentication Errors
    AUTH_EXPIRED: {
      code: 'AUTH_EXPIRED',
      message: 'Authentication token expired',
      userMessage: 'Your session has expired. Please sign in again.',
      severity: 'medium' as const,
      category: 'auth' as const
    },
    AUTH_INVALID: {
      code: 'AUTH_INVALID',
      message: 'Invalid authentication',
      userMessage: 'Authentication failed. Please try signing in again.',
      severity: 'medium' as const,
      category: 'auth' as const
    },
    OAUTH_CALLBACK_ERROR: {
      code: 'OAUTH_CALLBACK_ERROR',
      message: 'OAuth callback failed',
      userMessage: 'Email connection failed. Please try connecting your email again.',
      severity: 'high' as const,
      category: 'auth' as const
    },

    // Validation Errors
    INVALID_INPUT: {
      code: 'INVALID_INPUT',
      message: 'Invalid user input',
      userMessage: 'Please check your input and try again.',
      severity: 'low' as const,
      category: 'validation' as const
    },
    MISSING_REQUIRED: {
      code: 'MISSING_REQUIRED',
      message: 'Required field missing',
      userMessage: 'Please fill in all required fields.',
      severity: 'low' as const,
      category: 'validation' as const
    },

    // System Errors
    SYSTEM_ERROR: {
      code: 'SYSTEM_ERROR',
      message: 'Unexpected system error',
      userMessage: 'Something went wrong. Our team has been notified.',
      severity: 'critical' as const,
      category: 'system' as const
    },
    CONFIG_ERROR: {
      code: 'CONFIG_ERROR',
      message: 'Configuration error',
      userMessage: 'Service is temporarily unavailable. Please try again later.',
      severity: 'critical' as const,
      category: 'system' as const
    }
  };

  public static createError(
    errorType: keyof typeof ErrorHandler.errorTypes,
    context?: Record<string, any>,
    originalError?: Error
  ): AppError {
    const baseError = this.errorTypes[errorType];
    
    const appError: AppError = {
      ...baseError,
      timestamp: new Date().toISOString(),
      context: context || {},
      stack: originalError?.stack
    };

    this.logError(appError);
    return appError;
  }

  public static handleNetworkError(error: any, context?: Record<string, any>): AppError {
    // Network-specific error handling
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return this.createError('NETWORK_OFFLINE', context, error);
    }
    
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return this.createError('NETWORK_TIMEOUT', context, error);
    }
    
    return this.createError('API_ERROR', context, error);
  }

  public static handleAuthError(error: any, context?: Record<string, any>): AppError {
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      return this.createError('AUTH_EXPIRED', context, error);
    }
    
    if (error.status === 403 || error.message?.includes('Forbidden')) {
      return this.createError('AUTH_INVALID', context, error);
    }
    
    return this.createError('OAUTH_CALLBACK_ERROR', context, error);
  }

  private static logError(error: AppError): void {
    // Add to in-memory log
    this.errorLog.unshift(error);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging based on severity
    const logMethod = error.severity === 'critical' ? 'error' : 
                     error.severity === 'high' ? 'warn' : 'info';
    
    console[logMethod](`[${error.code}] ${error.message}`, {
      severity: error.severity,
      category: error.category,
      context: error.context,
      timestamp: error.timestamp
    });

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  private static sendToMonitoring(error: AppError): void {
    // Integration with monitoring services (Sentry, LogRocket, etc.)
    try {
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(error.message), {
          tags: {
            code: error.code,
            severity: error.severity,
            category: error.category
          },
          extra: error.context
        });
      }
    } catch (monitoringError) {
      console.warn('Failed to send error to monitoring service:', monitoringError);
    }
  }

  public static getErrorHistory(): AppError[] {
    return [...this.errorLog];
  }

  public static clearErrorHistory(): void {
    this.errorLog = [];
  }

  public static getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recent: AppError[];
  } {
    const bySeverity = this.errorLog.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.errorLog.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errorLog.length,
      bySeverity,
      byCategory,
      recent: this.errorLog.slice(0, 10)
    };
  }
}

// React Hook for error handling
export const useErrorHandler = () => {
  const [currentError, setCurrentError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((
    errorType: keyof typeof ErrorHandler['errorTypes'] | Error,
    context?: Record<string, any>
  ) => {
    let appError: AppError;
    
    if (typeof errorType === 'string') {
      appError = ErrorHandler.createError(errorType, context);
    } else {
      // Handle raw JavaScript errors
      appError = ErrorHandler.createError('SYSTEM_ERROR', context, errorType);
    }
    
    setCurrentError(appError);
    return appError;
  }, []);

  const clearError = React.useCallback(() => {
    setCurrentError(null);
  }, []);

  return {
    currentError,
    handleError,
    clearError,
    errorHistory: ErrorHandler.getErrorHistory(),
    errorStats: ErrorHandler.getErrorStats()
  };
};

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.createError('SYSTEM_ERROR', {
      componentStack: true
    }, error);

    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorHandler.createError('SYSTEM_ERROR', {
      componentStack: errorInfo.componentStack
    }, error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-medium text-gray-900 text-center mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 text-center mb-4">
              {this.state.error.userMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;