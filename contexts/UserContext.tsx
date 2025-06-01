// contexts/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSessionContext } from "./SessionContext"; // Your existing custom SessionContext
import { UserProfile, UserContextType } from "@/types/user"; // Ensure UserContextType from types/user.ts includes wishlist parts
import { WishlistItem } from "@/types/wishlist"; // From types/wishlist.ts
import { Types } from "mongoose";

// Import Server Actions from the root 'actions' folder
import { getMyDetailedProfile } from "@/actions/userProfileActions";
import { addItemToDbWishlistAction, removeItemFromDbWishlistAction } from "@/actions/wishlistActions"; // Ensure these actions are in actions/wishlistActions.ts

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { session, status: authStatus } = useSessionContext();

  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Wishlist State (client-side representation with string IDs)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const clearUserData = useCallback(() => {
    setProfile(null);
    setWishlist([]); // Clear wishlist as well
    setProfileError(null);
    setWishlistError(null);
  }, []);

  const fetchInitialUserData = useCallback(async () => {
    if (authStatus === "authenticated" && session?.user?.id) {
      setIsLoadingProfile(true);
      setProfileError(null);
      setWishlistError(null); // Clear wishlist errors on new fetch
      try {
        const result = await getMyDetailedProfile(session.user.id);

        if (result.success && result.data) {
          setProfile(result.data); // Set the UserProfile object
          // Transform the ObjectId array from profile.wishlist into WishlistItem[]
          if (result.data.wishlist && Array.isArray(result.data.wishlist)) {
            const clientWishlist: WishlistItem[] = result.data.wishlist.map((objectId: Types.ObjectId) => ({
              id: objectId.toString(),
            }));
            setWishlist(clientWishlist);
          } else {
            setWishlist([]); // No wishlist items or unexpected format
          }
        } else {
          setProfileError(result.message || "Failed to fetch user data.");
          clearUserData();
        }
      } catch (error) {
        console.error("Error calling fetchInitialUserData action:", error);
        setProfileError(error instanceof Error ? error.message : "An unexpected error occurred.");
        clearUserData();
      } finally {
        setIsLoadingProfile(false);
      }
    } else if (authStatus === "unauthenticated") {
      clearUserData();
      setIsLoadingProfile(false);
    } else if (authStatus === "loading") {
      setIsLoadingProfile(true); // Auth is loading, so user data might be coming
    }
  }, [authStatus, session?.user?.id, clearUserData]);

  useEffect(() => {
    fetchInitialUserData();
  }, [fetchInitialUserData]);

  const addItemToWishlist = async (itemId: string) => {
    if (authStatus !== "authenticated" || !profile) {
      setWishlistError("Please log in to add items to your wishlist.");
      // Optionally, trigger a login modal or redirect.
      return;
    }
    setIsLoadingWishlist(true);
    setWishlistError(null);

    const newItem: WishlistItem = { id: itemId };
    const alreadyInList = wishlist.some((item) => item.id === itemId);

    // Optimistic Update: Add to local state immediately if not already there
    if (!alreadyInList) {
      setWishlist((prevWishlist) => [...prevWishlist, newItem]);
    }

    const result = await addItemToDbWishlistAction(itemId);

    if (!result.success) {
      setWishlistError(result.message);
      // Revert optimistic update if it was a new addition and server failed
      if (!alreadyInList) {
        setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== itemId));
      }
    } else {
      // If server says it was already there (result.wasModified === false)
      // but client state didn't have it (alreadyInList === false), ensure it's added client-side.
      if (result.wasModified === false && !alreadyInList) {
        setWishlist((prevWishlist) => {
          if (!prevWishlist.find((item) => item.id === itemId)) {
            return [...prevWishlist, newItem];
          }
          return prevWishlist;
        });
      }
      setWishlistError(null); // Clear any previous error on success
    }
    setIsLoadingWishlist(false);
  };

  const removeItemFromWishlist = async (itemId: string) => {
    if (authStatus !== "authenticated" || !profile) {
      setWishlistError("Please log in to manage your wishlist.");
      return;
    }
    setIsLoadingWishlist(true);
    setWishlistError(null);

    const originalWishlist = [...wishlist]; // Store for potential revert
    // Optimistic Update: Remove from local state immediately
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== itemId));

    const result = await removeItemFromDbWishlistAction(itemId);

    if (!result.success) {
      setWishlistError(result.message);
      setWishlist(originalWishlist); // Revert optimistic update
    } else {
      setWishlistError(null); // Clear any previous error on success
    }
    setIsLoadingWishlist(false);
  };

  const isInWishlist = (itemId: string): boolean => {
    return wishlist.some((item) => item.id === itemId);
  };

  const contextValue: UserContextType = {
    profile,
    isLoadingProfile,
    profileError,
    wishlist,
    isLoadingWishlist,
    wishlistError,
    fetchInitialUserData, // Renamed from fetchUserProfile
    clearUserData, // Renamed from clearUserProfile
    addItemToWishlist,
    removeItemFromWishlist,
    isInWishlist,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// Custom Hook to easily consume the Context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
