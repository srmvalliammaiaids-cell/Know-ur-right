import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export const authService = {
  // Send magic link to email
  sendMagicLink: async (email) => {
    try {
      const result = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      // Check for errors before accessing data
      if (result.error) {
        throw result.error;
      }
      
      return result.data;
    } catch (error) {
      console.error('Send magic link error:', error);
      
      // Handle specific error cases
      if (error.status === 422 || error.message?.includes('Email link is invalid')) {
        throw new Error('email_not_configured');
      }
      
      // Generic error
      throw new Error(error.message || 'Failed to send verification link');
    }
  },

  // Verify magic link token (happens automatically when user clicks link)
  exchangeCodeForSession: async (code) => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Exchange code error:', error);
      throw new Error(error.message || 'Failed to verify link');
    }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
