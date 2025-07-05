
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  name: string;
  education: string;
  experience: string;
  goals: string;
  skills: string[];
}

// Extend User type to include name and profileCompleted that we use in our UI
interface ExtendedUser extends User {
  name?: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: ExtendedUser | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          if (currentSession?.user) {
            // Extend the user with the metadata we need
            const extendedUser: ExtendedUser = {
              ...currentSession.user,
              name: currentSession.user?.user_metadata?.name,
              profileCompleted: currentSession.user?.user_metadata?.profile_completed,
            };
            setUser(extendedUser);
            
            // Fetch profile if we have a user
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
            }, 0);
          } else {
            setUser(null);
          }
        }
      );

      // THEN check for existing session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        // Extend the user with the metadata we need
        const extendedUser: ExtendedUser = {
          ...data.session.user,
          name: data.session.user?.user_metadata?.name,
          profileCompleted: data.session.user?.user_metadata?.profile_completed,
        };
        setUser(extendedUser);
        await fetchProfile(data.session.user.id);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setProfile({
          name: data.name || '',
          education: data.education || '',
          experience: data.experience || '',
          goals: data.goals || '',
          skills: data.skills || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // We intentionally don't return data here to match our interface
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Registration successful! Please check your email for verification.');
      // We intentionally don't return data here to match our interface
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          education: data.education,
          experience: data.experience,
          goals: data.goals,
          skills: data.skills,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local profile state
      const updatedProfile = { ...profile, ...data } as UserProfile;
      setProfile(updatedProfile);
      
      // Update user metadata in auth.users
      await supabase.auth.updateUser({
        data: {
          profile_completed: true,
          name: data.name,
        }
      });
      
      // Update the extended user
      if (user) {
        const updatedUser: ExtendedUser = {
          ...user,
          name: data.name,
          profileCompleted: true
        };
        setUser(updatedUser);
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        register,
        updateProfile,
        isLoading,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
