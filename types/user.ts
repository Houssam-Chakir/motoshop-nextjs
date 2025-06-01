import mongoose from "mongoose";

export interface UserProfile {
  id: string; // This will come from session.user.id
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  orders?: mongoose.Types.ObjectId[] | null;
  wishlist?: mongoose.Types.ObjectId[] | null;
  cart?: mongoose.Types.ObjectId[] | null;
}

// This will be the shape of the data provided by our UserContext
export interface UserContextType {
  profile: UserProfile | null; // Holds the detailed user profile
  isLoadingProfile: boolean; // True while fetching profile data
  profileError: string | null; // Holds any error message during fetch
  fetchUserProfile: () => Promise<void>; // Function to trigger fetching/re-fetching
  clearUserProfile: () => void; // Function to clear user data (e.g., on logout)
}
