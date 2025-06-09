// contexts/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";
import { useSessionContext } from "./SessionContext"; // Your existing custom SessionContext
import { UserProfile, UserContextType } from "@/types/user"; // Ensure UserContextType from types/user.ts includes wishlist parts
import { WishlistItem } from "@/types/wishlist"; // From types/wishlist.ts
import { Types } from "mongoose";

// Import Server Actions from the root 'actions' folder
import { getMyDetailedProfile } from "@/actions/userProfileActions";
import { addItemToDbWishlistAction, removeItemFromDbWishlistAction } from "@/actions/wishlistActions"; // Server actions
import { clearGuestWishlist } from "@/lib/guestWishlistStore"; // Client-side local storage actions

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
      // Clear guest wishlist from localStorage on login
      if (typeof window !== "undefined" && typeof clearGuestWishlist === "function") {
        console.log("[UserContext] User authenticated, clearing guest wishlist from local storage.");
        clearGuestWishlist();
      } else if (typeof clearGuestWishlist !== "function") {
        console.warn("[UserContext] clearGuestWishlist function is not available. Guest wishlist may persist after login.");
      }

      setIsLoadingProfile(true);
      setProfileError(null);
      setWishlistError(null); // Clear wishlist errors on new fetch
      try {
        const result = await getMyDetailedProfile(session.user.id);

        if (result.success && result.data) {
          setProfile(result.data); // Set the UserProfile object
          // result.data.wishlist is already WishlistItem[] | null from getMyDetailedProfile
          if (result.data.wishlist && Array.isArray(result.data.wishlist)) {
            setWishlist(result.data.wishlist);
          } else {
            setWishlist([]); // No wishlist items or it's null
          }
        } else {
          setProfileError(result.message || "Failed to fetch user data.");
          clearUserData(); // Clears context state, not local storage for guest
        }
      } catch (error) {
        console.error("Error calling fetchInitialUserData action:", error);
        setProfileError(error instanceof Error ? error.message : "An unexpected error occurred.");
        clearUserData(); // Clears context state
      } finally {
        setIsLoadingProfile(false);
      }
    } else if (authStatus === "unauthenticated") {
      clearUserData(); // Clears React context state for profile/wishlist

      // Clear guest wishlist from localStorage on logout or if initially unauthenticated
      if (typeof window !== "undefined" && typeof clearGuestWishlist === "function") {
        console.log("[UserContext] User unauthenticated, clearing guest wishlist from local storage.");
        clearGuestWishlist();
      } else if (typeof clearGuestWishlist !== "function") {
        console.warn("[UserContext] clearGuestWishlist function is not available. Guest wishlist may persist.");
      }
      setIsLoadingProfile(false);
    } else if (authStatus === "loading") {
      setIsLoadingProfile(true); // Auth is loading, so user data might be coming
    }
  }, [authStatus, session?.user?.id, clearUserData]); // Assuming clearGuestWishlist is a stable import from a module

  useEffect(() => {
    fetchInitialUserData();
  }, [fetchInitialUserData]);

  const addItemToWishlist = useCallback(
    async (item: WishlistItem) => {
      console.log("[UserContext] addItemToWishlist called with item:", item);
      console.log("[UserContext] Current authStatus:", authStatus);
      console.log("[UserContext] Current profile:", profile ? profile.id : "No profile");

      if (authStatus !== "authenticated" || !profile) {
        const errorMsg = "User not authenticated. Please log in to add items to your wishlist.";
        console.error("[UserContext]", errorMsg);
        setWishlistError(errorMsg); // Ensure wishlistError state is set
        return;
      }

      setIsLoadingWishlist(true);
      setWishlistError(null);

      // The 'item' parameter is now the full WishlistItem object
      const alreadyInList = wishlist.some((i) => i.id === item.id);

      // Optimistic Update
      if (!alreadyInList) {
        console.log("[UserContext] Optimistically adding to client state:", item);
        setWishlist((prevWishlist) => [...prevWishlist, item]);
      } else {
        console.log("[UserContext] Item already in client wishlist state:", item.id);
      }

      console.log("[UserContext] Calling server action addItemToDbWishlistAction for itemId:", item.id);
      const result = await addItemToDbWishlistAction(item.id);
      console.log("[UserContext] Result from addItemToDbWishlistAction:", result);

      if (!result.success) {
        console.error("[UserContext] Server action failed:", result.message);
        setWishlistError(result.message);
        // Revert optimistic update if it was a new addition and server failed
        if (!alreadyInList) {
          console.log("[UserContext] Reverting optimistic add for:", item.id);
          setWishlist((prevWishlist) => prevWishlist.filter((i) => i.id !== item.id));
        }
      } else {
        console.log("[UserContext] Server action successful:", result.message);
        if (result.wasModified === false && !alreadyInList) {
          console.log("[UserContext] Server reported item already existed, client state was stale. Ensuring item is in list.");
          setWishlist((prevWishlist) => {
            if (!prevWishlist.find((i) => i.id === item.id)) {
              return [...prevWishlist, item]; // Use the full item passed to the function
            }
            return prevWishlist;
          });
        }
        setWishlistError(null); // Clear any previous error on success
      }
      setIsLoadingWishlist(false);
    },
    [authStatus, profile, wishlist]
  );

  const removeItemFromWishlist = useCallback(
    async (itemId: string) => {
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
    },
    [authStatus, profile, wishlist]
  );

  const isInWishlist = useCallback(
    (itemId: string): boolean => {
      return wishlist.some((item) => item.id === itemId);
    },
    [wishlist]
  );

  const contextValue = useMemo(
    () => ({
      profile,
      isLoadingProfile,
      profileError,
      wishlist,
      isLoadingWishlist,
      wishlistError,
      fetchInitialUserData,
      clearUserData,
      addItemToWishlist,
      removeItemFromWishlist,
      isInWishlist,
    }),
    [
      profile,
      isLoadingProfile,
      profileError,
      wishlist,
      isLoadingWishlist,
      wishlistError,
      fetchInitialUserData,
      clearUserData,
      addItemToWishlist,
      removeItemFromWishlist,
      isInWishlist,
    ]
  );

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
