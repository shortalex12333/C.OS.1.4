import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with auto-refresh and persistence
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'celesteos-supabase-auth',
    flowType: 'pkce'
  }
});

// Auth service class for comprehensive authentication management
class SupabaseAuthService {
  private sessionRefreshTimer: NodeJS.Timeout | null = null;
  private authStateCallbacks: ((user: User | null) => void)[] = [];

  constructor() {
    // Set up auth state listener
    this.initializeAuthListener();
  }

  /**
   * Initialize auth state change listener
   */
  private initializeAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email);
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          this.handleSignIn(session);
          break;
        case 'SIGNED_OUT':
          this.handleSignOut();
          break;
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed successfully');
          break;
        case 'USER_UPDATED':
          this.handleUserUpdate(session);
          break;
      }

      // Notify all callbacks
      this.authStateCallbacks.forEach(callback => {
        callback(session?.user || null);
      });
    });
  }

  /**
   * Handle successful sign in
   */
  private handleSignIn(session: Session | null) {
    if (session) {
      console.log('✅ User signed in:', session.user.email);
      this.startSessionRefreshTimer(session);
      
      // Store additional user data for app use
      localStorage.setItem('celesteos_user', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
        createdAt: session.user.created_at
      }));
    }
  }

  /**
   * Handle sign out
   */
  private handleSignOut() {
    console.log('👋 User signed out');
    this.stopSessionRefreshTimer();
    
    // Clear all local storage items
    localStorage.removeItem('celesteos_user');
    localStorage.removeItem('celesteos_access_token');
    localStorage.removeItem('celesteos_refresh_token');
    localStorage.removeItem('currentSearchType');
    localStorage.removeItem('hasSeenIntro');
    localStorage.removeItem('hasCompletedTutorial');
  }

  /**
   * Handle user update
   */
  private handleUserUpdate(session: Session | null) {
    if (session) {
      console.log('📝 User updated:', session.user.email);
      // Update stored user data
      localStorage.setItem('celesteos_user', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
        createdAt: session.user.created_at
      }));
    }
  }

  /**
   * Start session refresh timer
   */
  private startSessionRefreshTimer(session: Session) {
    this.stopSessionRefreshTimer();
    
    // Refresh session 5 minutes before expiry
    const expiresIn = session.expires_in || 3600;
    const refreshIn = (expiresIn - 300) * 1000; // Convert to milliseconds
    
    this.sessionRefreshTimer = setTimeout(async () => {
      console.log('🔄 Auto-refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Session refresh failed:', error);
      } else {
        console.log('✅ Session refreshed');
        if (data.session) {
          this.startSessionRefreshTimer(data.session);
        }
      }
    }, refreshIn);
  }

  /**
   * Stop session refresh timer
   */
  private stopSessionRefreshTimer() {
    if (this.sessionRefreshTimer) {
      clearTimeout(this.sessionRefreshTimer);
      this.sessionRefreshTimer = null;
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, displayName: string) {
    try {
      console.log('📝 Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            display_name: displayName,
            created_via: 'celesteos_v1.4'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        return {
          success: false,
          error: error.message,
          needsEmailVerification: false
        };
      }

      if (data.user && !data.session) {
        // User needs to verify email
        console.log('📧 Email verification required for:', email);
        return {
          success: true,
          error: null,
          needsEmailVerification: true,
          user: data.user
        };
      }

      return {
        success: true,
        error: null,
        needsEmailVerification: false,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      console.error('❌ Signup exception:', error);
      return {
        success: false,
        error: error.message || 'Signup failed',
        needsEmailVerification: false
      };
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string) {
    try {
      console.log('🔐 Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('❌ SignIn error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null,
        user: data.user,
        session: data.session
      };
    } catch (error: any) {
      console.error('❌ SignIn exception:', error);
      return {
        success: false,
        error: error.message || 'Sign in failed'
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      console.log('👋 Signing out user...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ SignOut error:', error);
        return false;
      }

      // Clear all app data
      this.handleSignOut();
      return true;
    } catch (error: any) {
      console.error('❌ SignOut exception:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Get session error:', error);
        return null;
      }

      return data.session;
    } catch (error: any) {
      console.error('❌ Get session exception:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Get user error:', error);
        return null;
      }

      return user;
    } catch (error: any) {
      console.error('❌ Get user exception:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { display_name?: string; [key: string]: any }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('❌ Update profile error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null,
        user: data.user
      };
    } catch (error: any) {
      console.error('❌ Update profile exception:', error);
      return {
        success: false,
        error: error.message || 'Update failed'
      };
    }
  }

  /**
   * Reset password request
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error: any) {
      console.error('❌ Reset password exception:', error);
      return {
        success: false,
        error: error.message || 'Reset failed'
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Update password error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null,
        user: data.user
      };
    } catch (error: any) {
      console.error('❌ Update password exception:', error);
      return {
        success: false,
        error: error.message || 'Update failed'
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateCallbacks = this.authStateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token || null;
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();

// Export for backward compatibility with webhook service
export default supabase;