// Performance Optimizations & Caching System
// Enterprise-grade performance enhancements

import React, { useMemo, useCallback, lazy, Suspense } from 'react';

// Cache Management System
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 500; // Maximum cache entries

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 min TTL
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    Array.from(this.cache.keys()).forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }
}

// Global cache instance
export const cache = new CacheManager();

// API Response Caching Hook
export const useCachedApi = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      // Try cache first
      const cached = cache.get<T>(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetcher();
        
        if (!isCancelled) {
          cache.set(key, result, ttlMs);
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [key, fetcher, ttlMs]);

  const refresh = useCallback(async () => {
    cache.invalidate(key);
    setLoading(true);
    try {
      const result = await fetcher();
      cache.set(key, result, ttlMs);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttlMs]);

  return { data, loading, error, refresh };
};

// Debounce Hook for Performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle Hook for Performance
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const [lastCall, setLastCall] = React.useState<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      setLastCall(now);
      return func(...args);
    }
  }, [func, delay, lastCall]) as T;
};

// Memoized Selectors for State Management
export const createMemoizedSelector = <TState, TResult>(
  selector: (state: TState) => TResult
) => {
  let lastState: TState;
  let lastResult: TResult;
  
  return (state: TState): TResult => {
    if (state !== lastState) {
      lastState = state;
      lastResult = selector(state);
    }
    return lastResult;
  };
};

// Virtual Scrolling Hook for Large Lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll
  };
};

// Image Lazy Loading Component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=',
  threshold = 0.1,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, isLoaded, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      {...props}
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0.7,
        ...props.style
      }}
    />
  );
};

// Code Splitting Utilities
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Bundle Analysis Utilities
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  }
  
  return null;
};

// Memory Management
export const useMemoryOptimization = () => {
  const cleanup = useCallback(() => {
    // Clear caches
    cache.clear();
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }, []);

  React.useEffect(() => {
    // Cleanup on component unmount
    return cleanup;
  }, [cleanup]);

  return { cleanup };
};

// Performance Monitoring Integration
export const usePerformanceTracking = (componentName: string) => {
  const startTime = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const mountTime = Date.now() - startTime.current;
    
    // Track component mount time
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_mount', {
        component_name: componentName,
        mount_time: mountTime
      });
    }
  }, [componentName]);

  const trackAction = useCallback((action: string, metadata?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'user_action', {
        component_name: componentName,
        action,
        ...metadata
      });
    }
  }, [componentName]);

  return { trackAction };
};

// Service Worker Integration for Caching
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (window.confirm('New version available. Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Preload Critical Resources
export const preloadCriticalResources = (): void => {
  if (typeof window !== 'undefined') {
    const criticalResources = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-medium.woff2',
      // Add other critical assets
    ];

    criticalResources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
};

// Export all optimizations
export default {
  cache,
  useCachedApi,
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  LazyImage,
  createLazyComponent,
  createMemoizedSelector,
  analyzeBundleSize,
  useMemoryOptimization,
  usePerformanceTracking,
  registerServiceWorker,
  preloadCriticalResources
};