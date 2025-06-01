// contexts/UserContext.tsx
'use client'; // This will be a client-side context

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSessionContext } from './SessionContext'; // Your existing SessionContext
import { UserProfile, UserContextType } from '@/types/user'; // Adjust path as needed

// Server Action to fetch user data (we'll define this in a moment)
// For now, let's assume it exists and what it returns.
// It should take a userId and return { success: boolean, data: UserProfile | null, message?: string }
import { getMyDetailedProfile } from '@/actions/userProfileActions'; // Placeholder name

// 1. Create the Context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// 2. Create the Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { session, status: authStatus } = useSessionContext(); // Use your existing SessionContext

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Start as true
  const [profileError, setProfileError] = useState<string | null>(null);

  const clearUserProfile = useCallback(() => {
    setProfile(null);
    // We won't clear wishlist here yet, that will be part of a combined state later or its own state
    setProfileError(null);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    // Only fetch if authenticated and session has a user ID
    if (authStatus === 'authenticated' && session?.user?.id) {
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        // Call your server action to get detailed profile
        const result = await getMyDetailedProfile(session.user.id); // Pass the user ID

        if (result.success && result.data) {
          setProfile(result.data);
        } else {
          setProfileError(result.message || 'Failed to fetch user profile.');
          setProfile(null); // Clear profile on error
        }
      } catch (error) {
        console.error("Error calling fetchUserProfile action:", error);
        setProfileError(error instanceof Error ? error.message : 'An unexpected error occurred.');
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    } else if (authStatus === 'unauthenticated') {
      clearUserProfile(); // Clear data if user logs out
      setIsLoadingProfile(false); // Not loading if unauthenticated
    } else if (authStatus === 'loading') {
      setIsLoadingProfile(true); // Auth is loading, so user data might be coming
    }
  }, [authStatus, session?.user?.id, clearUserProfile]); // Dependencies for useCallback

  // Effect to fetch data when authentication status changes
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // fetchUserProfile is memoized by useCallback

  const contextValue: UserContextType = {
    profile,
    isLoadingProfile,
    profileError,
    fetchUserProfile,
    clearUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Create a Custom Hook to easily consume the Context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
