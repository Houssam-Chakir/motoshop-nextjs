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
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        (() => {
          throw new Error("GOOGLE_CLEINT_ID is not defined");
        })(),
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        (() => {
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
    async signIn({ profile }: { profile?: { email?: string; name?: string; picture?: string } }) {
      const { email, name, picture } = profile || {};
      if (!email || !name) throw new Error("Something went wrong signing in");

      // Establish database connection
      await connectDB();
      // Check for existing user in database using profile email
      const isUserExists = await User.findOne({ email: email });
      // Create new user if no existing record found
      if (!isUserExists) {
        const newUser = {
          email: email,
          name: name.replace(/\s+/g, "").toLowerCase(), // Replace ALL spaces
          image: picture,
          role: 'customer'
        };

        try {
          await User.create(newUser);
          console.log("New user created:", newUser);
        } catch (error) {
          console.error("Error creating user:", error);
          return false; // Return false to deny sign-in if user creation fails
        }
      }
      return true;
    },
    async session({ session }: {session: Session}) {
      // 1. Get user from database
      if (!session.user || !session.user.email) {
        throw new Error("Session user or email is undefined");
      }
      const user = await User.findOne({ email: session.user.email });
      // 2. Assign the user id to the session
      session.user.id = user._id.toString();
      // 3. return session
      return session;
    },
  },
  // pages: {
  //   signIn: '/auth/signin', // Or your custom path, e.g., '/login'
  //   error: '/auth/error', // Good to also have a custom error page
  // },
};

export default authOptions;
