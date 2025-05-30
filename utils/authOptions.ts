import connectDB from "@/config/database";
import User from "@/models/User";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions, Session } from "next-auth";

/**
 * Configuration options for authentication, including providers and callbacks.
 *
 * @property providers - An array of authentication providers. Currently includes:
 *   - GoogleProvider: Configured with client ID, client secret, and authorization parameters.
 *     - `clientId`: The Google OAuth client ID, retrieved from environment variables.
 *     - `clientSecret`: The Google OAuth client secret, retrieved from environment variables.
 *     - `authorization.params`: Additional parameters for the authorization request, such as prompt, access type, and response type.
 *
 * @property callbacks - An object containing callback functions for handling authentication events.
 *   - `signIn`: Handles the sign-in process for a user.
 *     - Connects to the database and checks if a user with the given email already exists.
 *     - Creates a new user in the database if no existing record is found.
 *     - Throws an error if the database connection or user creation fails.
 *   - `session`: Modifies the session object to include the user's ID.
 *     - Retrieves the user from the database based on the email in the session.
 *     - Assigns the user's ID from the database to the session's user object.
 *     - Returns the modified session object.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || (() => {
        throw new Error("GOOGLE_CLIENT_ID is not defined");
        })(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => {
          throw new Error("GOOGLE_CLIENT_SECRET is not defined");
        })(),
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    /**
     * Handles the sign-in process for a user.
     *
     * @param profile - The user's profile information, typically obtained from an OAuth provider.
     * @returns A promise that resolves when the sign-in process is complete.
     *
     * @remarks
     * - Logs the user's profile information to the console for debugging purposes.
     * - Connects to the database and checks if a user with the given email already exists.
     * - If the user does not exist, creates a new user with the provided email, name, and profile picture.
     *
     * @throws Will throw an error if the database connection or user creation fails.
     */
    async signIn({ profile }) {
      const { email, name, picture } = profile || {};
      if (!email || !name) throw new Error("Something went wrong signing in");

      try {
      await connectDB();
        const isUserExists = await User.findOne({ email });

      if (!isUserExists) {
        const newUser = {
            email,
            name: name.replace(/\s+/g, "").toLowerCase(),
          image: picture,
          role: 'customer'
        };

          await User.create(newUser);
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session }) {
      if (!session.user?.email) {
        throw new Error("Session user or email is undefined");
      }

      try {
      const user = await User.findOne({ email: session.user.email });
        if (!user) {
          throw new Error("User not found in database");
        }

      session.user.id = user._id.toString();
      return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        throw error;
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default authOptions;
